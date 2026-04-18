#!/usr/bin/env python3
import json
import os
import re
from pathlib import Path
from datetime import date

ROOT = Path(__file__).resolve().parents[1]
INBOX = ROOT / 'artifacts' / 'inbox'
IMAGES = ROOT / 'artifacts' / 'images'
DATA = ROOT / 'data' / 'artifacts-index.json'

IMAGE_EXTS = {'.png', '.jpg', '.jpeg', '.webp', '.gif'}
SLIDE_EXTS = {'.ppt', '.pptx'}
DOC_EXTS = {'.pdf', '.doc', '.docx', '.md', '.txt'}


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return re.sub(r'-+', '-', text).strip('-')


def title_from_filename(path: Path) -> str:
    stem = path.stem.replace('_', ' ').replace('-', ' ')
    stem = re.sub(r'\s+', ' ', stem).strip()
    return stem.title()


def infer_artifact_type(path: Path) -> str:
    ext = path.suffix.lower()
    if ext in IMAGE_EXTS:
        return 'diagram'
    if ext in SLIDE_EXTS:
        return 'slide'
    if ext in DOC_EXTS:
        return 'document'
    return 'artifact'


def infer_topics(title: str):
    keywords = []
    lower = title.lower()
    mapping = {
        'path': 'PATH',
        'control plane': 'Control Plane',
        'agent': 'Agents',
        'automation': 'Automation',
        'bpa': 'BPA',
        'rpa': 'RPA',
        'human': 'Human-in-the-Loop',
        'governance': 'Governance',
        'ea': 'Enterprise Architecture',
        'architecture': 'Architecture',
        'pptx': 'PPTX',
    }
    for k, v in mapping.items():
        if k in lower and v not in keywords:
            keywords.append(v)
    return keywords or ['Enterprise Architecture']


def load_index():
    if not DATA.exists():
        return []
    return json.loads(DATA.read_text(encoding='utf-8'))


def save_index(items):
    DATA.parent.mkdir(parents=True, exist_ok=True)
    DATA.write_text(json.dumps(items, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')


def render_detail_page(item):
    title = item['title']
    summary = item['summary']
    topics = ' · '.join(item['topics'])
    page = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<style>
body{{background:#07090F;color:#F0F4FA;font-family:Arial,sans-serif;padding:28px;max-width:1100px;margin:0 auto;}}
a{{color:#00C8C8;text-decoration:none}} a:hover{{text-decoration:underline}}
.eyebrow{{font-size:12px;color:#A0B3C2;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px}}
h1{{margin:0 0 12px;font-size:38px}}
.meta{{color:#B0BFCF;margin-bottom:18px}}
.card{{border:1px solid rgba(255,255,255,.12);padding:18px;background:#0D1117;margin-top:18px}}
img{{max-width:100%;height:auto;border:1px solid rgba(255,255,255,.12)}}
.tag{{display:inline-block;border:1px solid rgba(0,200,200,.35);color:#00C8C8;padding:4px 8px;margin:4px 6px 0 0;font-size:12px}}
</style>
</head>
<body>
<div class="eyebrow">EA Artifact</div>
<h1>{title}</h1>
<div class="meta">{item['artifact_type'].title()} · {item['date']} · {item['status'].title()}</div>
<p>{summary}</p>
<div class="card"><img src="{item['source_file']}" alt="{title}"></div>
<div class="card"><strong>Topics</strong><br>{''.join(f'<span class="tag">{t}</span>' for t in item['topics'])}</div>
<div class="card"><strong>Related</strong><br>{''.join(f'<span class="tag">{t}</span>' for t in item['related'])}</div>
<div class="card"><a href="artifacts.html">← Back to artifacts</a></div>
</body>
</html>
'''
    return page


def next_id(existing):
    nums = []
    for item in existing:
        m = re.match(r'ea-artifact-(\d+)$', item.get('id', ''))
        if m:
            nums.append(int(m.group(1)))
    return f"ea-artifact-{(max(nums) + 1) if nums else 1:03d}"


def main():
    INBOX.mkdir(parents=True, exist_ok=True)
    IMAGES.mkdir(parents=True, exist_ok=True)

    items = load_index()
    indexed_files = {item.get('source_file', '') for item in items}
    processed = []

    for path in sorted(INBOX.iterdir()):
        if not path.is_file():
            continue
        ext = path.suffix.lower()
        if ext not in IMAGE_EXTS | SLIDE_EXTS | DOC_EXTS:
            continue

        slug = slugify(path.stem)
        dest_rel = f'artifacts/images/{slug}{ext}' if ext in IMAGE_EXTS else f'artifacts/inbox/{path.name}'
        dest = ROOT / dest_rel

        if str(dest_rel) in indexed_files:
            continue

        if ext in IMAGE_EXTS and path.resolve() != dest.resolve():
            dest.write_bytes(path.read_bytes())

        title = title_from_filename(path)
        topics = infer_topics(title)
        related = [t for t in ['PATH', 'Control Plane', 'Agentic Tooling'] if t in topics or t in title]
        if not related:
            related = ['Enterprise Architecture']

        item = {
            'id': next_id(items),
            'title': title,
            'date': str(date.today()),
            'artifact_type': infer_artifact_type(path),
            'domain': ['Enterprise Architecture', 'AI'],
            'topics': topics,
            'summary': f'Auto-ingested artifact generated from uploaded file: {path.name}. Review and refine metadata as needed.',
            'keywords': sorted(set([slug] + [t.lower() for t in topics] + ['artifact', 'ea'])),
            'source_file': dest_rel,
            'detail_page': f'artifact-{slug}.html',
            'status': 'draft',
            'related': related,
        }
        items.append(item)
        indexed_files.add(dest_rel)
        (ROOT / item['detail_page']).write_text(render_detail_page(item), encoding='utf-8')
        processed.append(path.name)

    items.sort(key=lambda x: x.get('date', ''), reverse=True)
    save_index(items)
    print(json.dumps({'processed': processed, 'count': len(processed)}, indent=2))


if __name__ == '__main__':
    main()
