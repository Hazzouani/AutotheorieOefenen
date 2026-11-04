#!/usr/bin/env python3
"""Schrijft docs/VOLLEDIGE-CODE.md: alle tekstbestanden van het project in één leesbaar Markdown-bestand.

Gebruik, vanuit de projectmap:  python3 tools/code-bundle.py

Het bundelbestand is een momentopname om te lezen of te delen; de losse bestanden blijven de
bewerkbare versie. Foto's, video's, het archief en de losse oefentoets (met ingebedde
afbeeldingen) worden niet opgenomen. Alleen standaard-Python; geen extra pakketten nodig.
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join('docs', 'VOLLEDIGE-CODE.md')
FIRST = ['index.html', 'style.css', 'script.js', 'questions.js', 'questions-extra.js', 'questions-nutheorie.js', 'videos.js',
         'README.md', 'package.json', '.gitignore', '.gitattributes', 'traffic-images.js']
FOLDERS = ['tools', 'tests', 'illustrations', 'images']
TEXT = re.compile(r'\.(html|css|js|cjs|mjs|json|md|py|svg|txt)$', re.I)


def files():
    seen = []
    for name in FIRST:
        if os.path.isfile(os.path.join(ROOT, name)):
            seen.append(name)
    for folder in FOLDERS:
        for base, dirs, names in os.walk(os.path.join(ROOT, folder)):
            dirs[:] = sorted(d for d in dirs if not d.startswith('.'))
            for name in sorted(names):
                rel = os.path.relpath(os.path.join(base, name), ROOT).replace(os.sep, '/')
                if TEXT.search(name) and not name.startswith('.') and rel not in seen:
                    seen.append(rel)
    return seen


def main():
    parts = ['# TheorieTrainer — volledige broncode\n',
             'Automatisch samengestelde momentopname van de projectbestanden, gemaakt met `python3 tools/code-bundle.py`. '
             'De losse bronbestanden in de map blijven de bewerkbare projectversie. Niet opgenomen: foto\'s (JPG/PNG), '
             'de video\'s in `Nutheorie_Videos/`, `extra/auto-theorie-oefentoets.html` (bevat ingebedde afbeeldingen) en de mappen '
             '`_archief/` en `dist/`.\n']
    listed = files()
    for rel in listed:
        with open(os.path.join(ROOT, rel), encoding='utf-8') as handle:
            content = handle.read()
        longest = max((len(m) for m in re.findall(r'`{3,}', content)), default=0)
        fence = '`' * max(3, longest + 1)
        parts.append(f'## {rel}\n\n{fence}\n{content.rstrip()}\n{fence}\n')
    os.makedirs(os.path.join(ROOT, 'docs'), exist_ok=True)
    with open(os.path.join(ROOT, OUT), 'w', encoding='utf-8') as handle:
        handle.write('\n'.join(parts))
    size = os.path.getsize(os.path.join(ROOT, OUT))
    print(f'{OUT} geschreven: {len(listed)} bestanden, {size / 1024 / 1024:.1f} MB.')


if __name__ == '__main__':
    main()
