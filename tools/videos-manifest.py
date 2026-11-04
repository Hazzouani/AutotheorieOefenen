#!/usr/bin/env python3
"""Bouwt videos.js: de lijst met NuTheorie-video's voor de pagina 'Video's'.

Gebruik, vanuit de projectmap:  python3 tools/videos-manifest.py

- Leest de map Nutheorie_Videos/HoofdstukN/NN_Titel.mp4 (.m4v en .webm mogen ook).
- Sorteert op hoofdstuknummer en daarna op lesnummer (numeriek, dus 2 vóór 10).
- Legt de speelduur vast als ffprobe beschikbaar is (anders toont de site '—').
- Gebruikt een voorbeeldplaatje images/videos/hN-NN.jpg als dat bestaat. Ontbreekt het
  plaatje en is ffmpeg beschikbaar, dan wordt het automatisch gemaakt.
Alleen standaard-Python; geen extra pakketten nodig.
"""
import json
import os
import re
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FOLDER = 'Nutheorie_Videos'
POSTERS = os.path.join('images', 'videos')
CHAPTER_RE = re.compile(r'^hoofdstuk\s*_?(\d+)$', re.I)
VIDEO_RE = re.compile(r'^(\d+)[ _-]+(.+)\.(mp4|m4v|webm)$', re.I)

# Nettere titels dan de bestandsnaam alleen kan geven (sleutel = bestandsnaam zonder nummer en extensie).
TITLES = {
    'Risicos_ivm_aanwezigheid_en_gedrag_verkeer': "Risico's i.v.m. aanwezigheid en gedrag verkeer",
    'Stop_en_volgafstand': 'Stop- en volgafstand',
    'Weg_zicht_en_weersomstandigheden': 'Weg, zicht en weersomstandigheden',
    'Uitrit_onverharde_weg_of_wegversmalling': 'Uitrit, onverharde weg of wegversmalling',
    'Tram_militaire_colonne_rouwstoet': 'Tram, militaire colonne en rouwstoet',
}


def nice_title(stem):
    if stem in TITLES:
        return TITLES[stem]
    title = re.sub(r'[_]+', ' ', stem).strip()
    title = re.sub(r'\bSamenvatting Hoofdstuk\b', 'Samenvatting hoofdstuk', title)
    return title[:1].upper() + title[1:]


def duration_of(path):
    if not shutil.which('ffprobe'):
        return None
    result = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path],
                            capture_output=True, text=True)
    try:
        return round(float(result.stdout.strip()), 2)
    except ValueError:
        return None


def poster_for(video_path, poster_rel, duration):
    poster_abs = os.path.join(ROOT, poster_rel)
    if os.path.exists(poster_abs):
        return poster_rel.replace(os.sep, '/')
    if not shutil.which('ffmpeg'):
        return None
    os.makedirs(os.path.dirname(poster_abs), exist_ok=True)
    moment = min(max((duration or 60) * 0.15, 8), max((duration or 60) - 5, 0))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{moment:.2f}', '-i', video_path, '-frames:v', '1',
                    '-vf', 'scale=640:360', '-q:v', '4', poster_abs], check=False)
    return poster_rel.replace(os.sep, '/') if os.path.exists(poster_abs) else None


def main():
    base = os.path.join(ROOT, FOLDER)
    if not os.path.isdir(base):
        sys.exit(f'Map niet gevonden: {base}')
    chapters, skipped = [], []
    for entry in os.listdir(base):
        match = CHAPTER_RE.match(entry)
        if not match or not os.path.isdir(os.path.join(base, entry)):
            if not entry.startswith('.'):
                skipped.append(entry)
            continue
        number = int(match.group(1))
        videos = []
        for name in os.listdir(os.path.join(base, entry)):
            video_match = VIDEO_RE.match(name)
            if not video_match:
                if not name.startswith('.'):
                    skipped.append(f'{entry}/{name}')
                continue
            lesson = int(video_match.group(1))
            stem = video_match.group(2)
            rel = f'{FOLDER}/{entry}/{name}'
            duration = duration_of(os.path.join(base, entry, name))
            video_id = f'h{number}-{lesson:02d}'
            videos.append({
                'id': video_id,
                'number': lesson,
                'title': nice_title(stem),
                'file': rel,
                'duration': duration,
                'poster': poster_for(os.path.join(base, entry, name), os.path.join(POSTERS, f'{video_id}.jpg'), duration),
                'summary': stem.lower().startswith('samenvatting'),
            })
        videos.sort(key=lambda v: (v['number'], v['file']))
        ids = [v['id'] for v in videos]
        if len(ids) != len(set(ids)):
            sys.exit(f'{entry}: twee video\'s hebben hetzelfde lesnummer. Hernoem er één.')
        if videos:
            chapters.append({'number': number, 'title': f'Hoofdstuk {number}', 'videos': videos})
    chapters.sort(key=lambda c: c['number'])
    if len({c['number'] for c in chapters}) != len(chapters):
        sys.exit('Twee mappen hebben hetzelfde hoofdstuknummer.')
    data = {'folder': FOLDER, 'chapters': chapters}
    out = ('/* NuTheorie-videolessen, op volgorde van hoofdstuk en les.\n'
           '   Gegenereerd met: python3 tools/videos-manifest.py — niet handmatig bewerken. */\n'
           'window.NUTHEORIE_VIDEOS = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n')
    with open(os.path.join(ROOT, 'videos.js'), 'w', encoding='utf-8') as handle:
        handle.write(out)
    total = sum(len(c['videos']) for c in chapters)
    print(f'videos.js geschreven: {total} video\'s in {len(chapters)} hoofdstukken.')
    for c in chapters:
        print(f"  Hoofdstuk {c['number']}: " + ', '.join(f"{v['number']}. {v['title']}" for v in c['videos']))
    if skipped:
        print('Overgeslagen (geen hoofdstukmap of geen ondersteund videobestand): ' + ', '.join(sorted(skipped)))


if __name__ == '__main__':
    main()
