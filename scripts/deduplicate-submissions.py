"""Apply reviewed display groups, keeping later form rows authoritative.

The original form snapshot remains unchanged. --delete-unused removes only
previously indexed media/thumbnails no longer referenced by any display/award.
"""
import copy
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def deduplicate(submissions, groups):
    by_row = {s['sourceRow']: s for s in submissions}
    replacements, hidden = {}, set()
    for group in groups:
        rows = sorted(group['rows'])
        members = [by_row[r] for r in rows if r in by_row]
        if not members:
            continue
        latest = by_row[rows[-1]]
        if len(members) == 1 and latest.get('sourceRows') == rows:
            continue
        merged = copy.deepcopy(latest)
        merged['sourceRows'] = rows
        merged['titleAliases'] = list(dict.fromkeys(
            title for s in members for title in [s['title'], *s.get('titleAliases', [])]))
        ordered = sorted(members, key=lambda s: s['sourceRow'], reverse=True)
        media_members = ordered if group['keepEarlierMedia'] else [latest]
        merged['media'] = list(dict.fromkeys(p for s in media_members for p in s['media']))
        merged['matchedMedia'] = list(dict.fromkeys(p for s in ordered for p in s['matchedMedia']))
        merged['tags'] = list(dict.fromkeys(t for s in media_members for t in s['tags']))
        merged['awards'] = list({a['name']: a for s in reversed(ordered) for a in s['awards']}.values())
        merged['sources'] = list({a['id']: a for s in reversed(media_members) for a in s['sources']}.values())
        replacements[rows[-1]] = merged
        hidden.update(rows[:-1])
    return [replacements.get(s['sourceRow'], s) for s in submissions if s['sourceRow'] not in hidden]


def apply(delete_unused=False):
    path = ROOT / 'data/submissions.json'
    data = json.loads(path.read_text(encoding='utf-8'))
    before = data['submissions']
    groups = json.loads((ROOT / 'data/submission-deduplication.json').read_text(encoding='utf-8'))['groups']
    after = deduplicate(before, groups)
    duplicate_groups = json.loads((ROOT / 'data/submission-media-duplicates.json').read_text(encoding='utf-8'))['groups']
    for group in duplicate_groups:
        submission = next(s for s in after if s['sourceRow'] == group['sourceRow'])
        aliases = {group['keep'], *group['duplicates']}
        submission['media'] = list(dict.fromkeys(
            group['keep'] if p in aliases else p for p in submission['media']))
        # Retain original sources and link aliases for per-image award lookup.
        for source in submission['sources']:
            if source['path'] in aliases:
                source['matched'] = list(dict.fromkeys([*source.get('matched', []), group['keep']]))
    # Review every attachment, including supplemental images after the artwork.
    media_review = json.loads((ROOT / 'data/submission-media-exclusions.json').read_text(encoding='utf-8'))
    exclusions = media_review['exclusions']
    excluded_ids = {entry['sourceId'] for entry in exclusions}
    for submission in after:
        excluded_paths = {source['path'] for source in submission['sources']
                          if source['id'] in excluded_ids}
        submission['media'] = [p for p in submission['media'] if p not in excluded_paths]
        tags = media_review.get('tagOverrides', {}).get(str(submission['sourceRow']))
        if tags is not None:
            submission['tags'] = tags.copy()
        if not submission['media']:
            raise ValueError(f"No artwork remains for row {submission['sourceRow']}")
    def references(rows):
        return {p for s in rows for p in [*s['media'], *s['matchedMedia'],
            *(p for a in s['awards'] for p in a['media']),
            *(a['path'] for a in s['sources']),
            *(p for a in s['sources'] for p in a.get('archiveMedia', []))]}
    unused = references(before) - references(after)
    candidates = set()
    for p in unused:
        target = (ROOT / p).resolve()
        if not target.is_relative_to((ROOT / 'imgs/works').resolve()):
            raise ValueError(f'Unsafe deletion target: {target}')
        candidates.add(target)
        thumbnail = ROOT / p.replace('imgs/works/', 'imgs/work-thumbs/')
        if thumbnail.suffix.lower() in {'.png', '.jpg', '.jpeg', '.gif', '.webp'}:
            thumbnail = thumbnail.with_suffix('.webp')
        if not thumbnail.resolve().is_relative_to((ROOT / 'imgs/work-thumbs').resolve()):
            raise ValueError(f'Unsafe thumbnail target: {thumbnail}')
        candidates.add(thumbnail)
    # Validate all surviving references before making the new index authoritative.
    for p in references(after):
        if not (ROOT / p).is_file():
            raise ValueError(f'Missing retained media: {p}')
    data['submissions'] = after
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    removed = []
    if delete_unused:
        for target in sorted(candidates):
            if target.is_file():
                target.unlink()
                removed.append(target.relative_to(ROOT).as_posix())
    report = {'before': len(before), 'after': len(after), 'removed': removed}
    print(json.dumps(report, ensure_ascii=False))
    return report


if __name__ == '__main__':
    apply('--delete-unused' in sys.argv)
