"""Extract only reviewed artwork members; never execute archive contents."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.import-cache'
sys.path.insert(0, str(CACHE / 'tools'))
import rarfile

rarfile.UNRAR_TOOL = 'C:/Program Files/WinRAR/UnRAR.exe'
file_id = '12K5oUd5_neAV4qJzY1GqrJdnx0bBGAYZ'
archive = rarfile.RarFile(CACHE / f'{file_id}.rar')
members = [entry for entry in archive.infolist()
           if (entry.filename.startswith('GIF/') and entry.filename.endswith('.gif'))
           or entry.filename == '2026-0718a+bgmON.mp4'
           or (entry.filename.endswith('.png') and '/2026-0718a-Good night ojosama-' in entry.filename)]
assert len(members) == 7
records = []
for i, entry in enumerate(members, 1):
    ext = Path(entry.filename).suffix.lower()
    source = f'{file_id}-extracted-{i:02d}{ext}'
    # The destination is generated locally, never taken from an archive path.
    (CACHE / source).write_bytes(archive.read(entry))
    records.append({'source': source, 'name': f'投稿作品_晚安大小姐(沈澈+沈樂)_3年D班羅瑟安李安瑟羅Zelo_壓縮檔{i:02d}{ext}'})
(CACHE / f'{file_id}-media.json').write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'Extracted {len(records)} artwork files.')
