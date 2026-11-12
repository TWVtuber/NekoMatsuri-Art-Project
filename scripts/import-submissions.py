"""Build the public submission manifest from the read-only form snapshot.

Requires Pillow/numpy. Place downloaded originals by Drive ID in .import-cache,
and connector metadata in .import-cache/metadata.json. No emails or original
upload filenames are copied to the public manifest. Run with --partial for an
audit while downloads are in progress; a full import requires every attachment.
"""
import hashlib
import json
import re
import shutil
import sys
import subprocess
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / '.import-cache/tools'))
from PIL import Image, ImageOps
import numpy as np
import imageio_ffmpeg

CACHE = ROOT / '.import-cache'
ROWS = json.loads((ROOT / 'data/submissions-source.json').read_text(encoding='utf-8'))
META = json.loads((CACHE / 'metadata.json').read_text(encoding='utf-8'))
CONFIG = json.loads((ROOT / 'data/work-gallery.json').read_text(encoding='utf-8'))
PARTIAL = '--partial' in sys.argv
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
fingerprint_path = CACHE / 'fingerprints.json'
fingerprints = json.loads(fingerprint_path.read_text(encoding='utf-8')) if fingerprint_path.exists() else {}


def fingerprint(path):
    stat = path.stat()
    key = str(path)
    stamp = [stat.st_size, stat.st_mtime_ns]
    if key not in fingerprints or fingerprints[key]['stamp'] != stamp:
        fingerprints[key] = {'stamp': stamp}
    return fingerprints[key]


def has_audio(source):
    info = subprocess.run([FFMPEG, '-hide_banner', '-i', str(source)], capture_output=True).stderr
    return b'Audio:' in info


def digest(path):
    cached = fingerprint(path)
    if 'sha256' in cached:
        return cached['sha256']
    with path.open('rb') as stream:
        cached['sha256'] = hashlib.file_digest(stream, 'sha256').hexdigest()
        return cached['sha256']


def norm(value):
    return re.sub(r'[^\w]', '', unicodedata.normalize('NFKC', value).lower())


def safe(value):
    return re.sub(r'[<>:"/\\|?*\x00-\x1f]', '', value).strip().rstrip('.')


def picture(path):
    cached = fingerprint(path)
    if 'picture' in cached:
        exact, small, size = cached['picture']
        return exact, np.array(small, dtype=np.float32), size
    with Image.open(path) as im:
        im = ImageOps.exif_transpose(im).convert('RGBA')
        exact = hashlib.sha256(str(im.size).encode() + im.tobytes()).hexdigest()
        white = Image.new('RGBA', im.size, 'white')
        white.alpha_composite(im)
        small = np.array(white.convert('RGB').resize((32, 32)), dtype=np.float32)
        cached['picture'] = [exact, small.tolist(), im.size]
        return exact, small, im.size


def catalog():
    works = []
    for group in CONFIG['groups']:
        base = Path('imgs/works') / group['directory']
        for name in group['files']:
            works.append({'name': name, 'media': [(base / name).as_posix()], 'groupTitle': group['title']})
        for folder in group.get('folders', []):
            if 'sequence' in folder:
                seq = folder['sequence']
                for i in range(1, seq['count'] + 1):
                    works.append({'name': folder['name'], 'media': [(base / folder['name'] / f"{i}{seq['extension']}").as_posix()], 'groupTitle': group['title']})
            elif 'entries' in folder:
                for entry in folder['entries']:
                    direct = len(entry['files']) == 1 and Path(entry['files'][0]).stem == entry['name']
                    folderbase = base / folder['name'] if direct else base / folder['name'] / entry['name']
                    works.append({**entry, 'media': [(folderbase / name).as_posix() for name in entry['files']], 'groupTitle': group['title']})
            else:
                works.append({'name': folder['name'], 'media': [(base / folder['name'] / name).as_posix() for name in folder['files']], 'groupTitle': group['title']})
    return works


WINNERS = catalog()
WIN_PATHS = sorted({path for work in WINNERS for path in work['media']})
hashes, pixels, pictures = {}, {}, {}
for path in WIN_PATHS:
    local = ROOT / path
    hashes.setdefault(digest(local), []).append(path)
    if local.suffix.lower() in {'.jpg', '.jpeg', '.png', '.webp', '.gif'}:
        exact, small, size = picture(local)
        pixels.setdefault(exact, []).append(path)
        pictures[path] = (small, size)

file_matches, file_duplicates, candidate_report, missing = {}, {}, [], []
for file_id, meta in META.items():
    source = CACHE / (file_id + Path(meta['title']).suffix)
    if not source.exists() or source.stat().st_size != int(meta['size']):
        missing.append(file_id)
        continue
    matches = hashes.get(digest(source), [])
    duplicate = list(matches)
    if not matches and meta['mime_type'].startswith('image/'):
        with Image.open(source) as animation:
            animated = getattr(animation, 'is_animated', False)
        if animated:
            file_matches[file_id] = []
            file_duplicates[file_id] = []
            continue
        exact, small, size = picture(source)
        matches = pixels.get(exact, [])
        duplicate = list(matches)
        if not matches:
            nearest = sorted((float(np.mean(np.abs(small - other))), path) for path, (other, other_size) in pictures.items()
                             if abs(size[0] / size[1] - other_size[0] / other_size[1]) < .015)
            if nearest and nearest[0][0] < 3:
                # Only extremely close image content is automatically reused.
                matches = [path for distance, path in nearest if distance < 3]
            elif nearest and nearest[0][0] < 18:
                candidate_report.append({'id': file_id, 'candidates': nearest[:3]})
    file_matches[file_id] = matches
    file_duplicates[file_id] = duplicate

audit = {'downloaded': len(file_matches), 'missing': missing, 'matchedFiles': sum(bool(x) for x in file_matches.values()), 'candidates': candidate_report}
fingerprint_path.write_text(json.dumps(fingerprints), encoding='utf-8')
(CACHE / 'match-audit.json').write_text(json.dumps(audit, ensure_ascii=False, indent=2), encoding='utf-8')
if PARTIAL:
    print(json.dumps({'downloaded': len(file_matches), 'missing': len(missing), 'matchedFiles': audit['matchedFiles'], 'candidates': candidate_report}, ensure_ascii=False))
    sys.exit()
if missing:
    raise SystemExit(f'{len(missing)} attachments still missing; no manifest written.')

submissions, reused, imported = [], 0, 0
for index, row in enumerate(ROWS, 2):
    artist, title, meaning, urls = (row + [''] * 4)[:4]
    ids = re.findall(r'[?&]id=([\w-]+)', urls or '')
    matched = sorted({path for file_id in ids for path in file_matches[file_id]})
    awards = []
    for work in WINNERS:
        if set(work['media']) & set(matched) and not any(a['name'] == work['name'] for a in awards):
            awards.append({k: v for k, v in work.items() if k in {'name', 'groupTitle', 'media', 'typeLabel', 'pixelArt'}})
    destination = Path('imgs/works') / ('12_未得獎' if not awards else '13_得獎補充')
    # The row suffix prevents same-title submissions from overwriting each other.
    stem = safe(f"{'投稿作品' if not awards else '得獎補充'}_{title}_{artist}")
    folder = destination / f'{stem}_投稿{index:03d}'
    media, sources, tags = [], [], set()
    for number, file_id in enumerate(ids, 1):
        meta = META[file_id]
        ext = Path(meta['title']).suffix.lower()
        source = CACHE / (file_id + Path(meta['title']).suffix)
        same = file_duplicates[file_id]
        if ext == '.rar':
            archive_manifest = CACHE / f'{file_id}-media.json'
            if not archive_manifest.exists():
                raise SystemExit('Archive has not been inspected and extracted.')
            extracted = []
            for entry in json.loads(archive_manifest.read_text(encoding='utf-8')):
                target = folder / safe(entry['name'])
                (ROOT / target).parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(CACHE / entry['source'], ROOT / target)
                extracted.append(target.as_posix())
            sources.append({'id': file_id, 'path': extracted[0], 'archiveMedia': extracted, 'matched': []})
            media.extend(extracted)
            imported += len(extracted)
            tags.update(['插圖', '動畫', '有聲動畫'])
            continue
        if same:
            path = same[0]
            reused += 1
        else:
            path = (folder / f'{stem}_{number:02d}{ext}').as_posix()
            (ROOT / path).parent.mkdir(parents=True, exist_ok=True)
            if not (ROOT / path).exists():
                shutil.copy2(source, ROOT / path)
            imported += 1
        sources.append({'id': file_id, 'path': path, 'matched': same})
        media.append(path)
        if ext in {'.mp4', '.mov', '.webm'}:
            tags.add('有聲動畫' if has_audio(source) else '動畫')
        elif ext == '.gif':
            tags.add('動畫')
        elif ext == '.webp':
            with Image.open(source) as im:
                tags.add('動畫' if getattr(im, 'is_animated', False) else '插圖')
        else:
            tags.add('插圖')
    text = f'{title} {meaning or ""}'
    if '像素' in text or 'pixel' in artist.lower() or any('像素' in a['name'] for a in awards):
        tags = {('像素動畫' if t in {'動畫', '有聲動畫'} else '像素插畫') for t in tags}
    if '漫畫' in text or any(a.get('typeLabel') == '漫畫' or '衝刺_nozzz' in a['name'] or '玫紅色青春' in a['name'] for a in awards):
        tags.discard('插圖'); tags.add('漫畫')
    if title == '繪肝史':
        tags.discard('有聲動畫'); tags.add('動畫')
    if title == '貓祭班導&3年C班日常':
        tags.discard('有聲動畫'); tags.add('動畫')
    order = ['插圖', '漫畫', '動畫', '有聲動畫', '像素插畫', '像素動畫']
    submissions.append({'id': f'submission-{index:03d}', 'sourceRow': index, 'title': title, 'artist': artist,
                        'meaning': meaning or '', 'media': list(dict.fromkeys(media)), 'tags': sorted(tags, key=order.index),
                        'awards': awards, 'matchedMedia': matched, 'sources': sources})

unmatched_winners = [path for path in WIN_PATHS if not any(path in s['matchedMedia'] for s in submissions)]
result = {'source': 'https://docs.google.com/spreadsheets/d/1aPKwkZ9EYhdfVgExnTbGUPkrQLM3rFlZgvC2FQ_-GYw/edit',
          'submissions': submissions}
(ROOT / 'data/submissions.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
import runpy
runpy.run_path(str(ROOT / 'scripts/deduplicate-submissions.py'))['apply'](delete_unused=True)
audit.update({'reused': reused, 'imported': imported, 'unmatchedWinners': unmatched_winners,
              'winningRows': sum(bool(s['awards']) for s in submissions), 'totalRows': len(submissions)})
(CACHE / 'match-audit.json').write_text(json.dumps(audit, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({k: v for k, v in audit.items() if k != 'candidates'}, ensure_ascii=False))
