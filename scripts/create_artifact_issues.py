#!/usr/bin/env python3
"""
Create or backfill GitHub issues for artifact entries.

Behavior:
- Reads data/artifacts-index.json
- For each artifact missing issue_number, creates a GitHub issue
- Writes the new issue_number back into the artifact index
- Safe to re-run (idempotent for artifacts already linked)
- Automatically derives GitHub labels from artifact metadata

Requires:
- GITHUB_TOKEN
- GITHUB_REPOSITORY (defaults to jjuniper-dev/status-site)

Optional:
- DRY_RUN=1 to preview issue creation without writing changes
"""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
INDEX_PATH = ROOT / "data" / "artifacts-index.json"
GITHUB_API = "https://api.github.com"
REPOSITORY = os.environ.get("GITHUB_REPOSITORY", "jjuniper-dev/status-site")
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
DRY_RUN = os.environ.get("DRY_RUN", "").strip().lower() in {"1", "true", "yes"}


LABEL_LIMIT = 20


def load_artifacts() -> list[dict[str, Any]]:
    if not INDEX_PATH.exists():
        raise FileNotFoundError(f"Artifact index not found: {INDEX_PATH}")
    return json.loads(INDEX_PATH.read_text(encoding="utf-8"))


def save_artifacts(items: list[dict[str, Any]]) -> None:
    INDEX_PATH.write_text(
        json.dumps(items, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def build_issue_title(artifact: dict[str, Any]) -> str:
    return f"Artifact: {artifact.get('title', 'Untitled Artifact')}"


def as_csv(value: Any) -> str:
    if isinstance(value, list):
        return ", ".join(str(v) for v in value)
    if value is None:
        return "None"
    return str(value)


def slug_label(value: str) -> str:
    text = value.strip().lower()
    text = text.replace("&", " and ")
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"-+", "-", text).strip("-")
    return text[:50] if text else ""


def dedupe_keep_order(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        if not value or value in seen:
            continue
        seen.add(value)
        result.append(value)
    return result


def build_labels(artifact: dict[str, Any]) -> list[str]:
    labels: list[str] = ["artifact"]

    artifact_type = slug_label(str(artifact.get("artifact_type", "artifact")))
    if artifact_type:
        labels.append(artifact_type)

    status = slug_label(str(artifact.get("status", "draft")))
    if status:
        labels.append(f"status-{status}")

    if artifact.get("demo_ready") is True:
        labels.append("demo-ready")

    for topic in artifact.get("topics", []) or []:
        topic_slug = slug_label(str(topic))
        if topic_slug:
            labels.append(topic_slug)

    for related in artifact.get("related", []) or []:
        related_slug = slug_label(str(related))
        if related_slug:
            labels.append(related_slug)

    for decision in artifact.get("decisions", []) or []:
        decision_slug = slug_label(str(decision))
        if decision_slug:
            labels.append(f"decision-{decision_slug}")

    for scenario in artifact.get("scenarios", []) or []:
        scenario_slug = slug_label(str(scenario))
        if scenario_slug:
            labels.append(f"scenario-{scenario_slug}")

    return dedupe_keep_order(labels)[:LABEL_LIMIT]


def build_issue_body(artifact: dict[str, Any]) -> str:
    artifact_id = artifact.get("id", "unknown-artifact")
    artifact_type = artifact.get("artifact_type", "artifact")
    artifact_date = artifact.get("date", "unknown-date")
    status = artifact.get("status", "draft")
    summary = artifact.get("summary", "No summary provided.")
    topics = as_csv(artifact.get("topics", []))
    detail_page = artifact.get("detail_page", "artifacts.html")
    source_file = artifact.get("source_file", "")
    decisions = as_csv(artifact.get("decisions", []))
    scenarios = as_csv(artifact.get("scenarios", []))
    demo_ready = artifact.get("demo_ready", False)
    version = artifact.get("version", "")
    last_updated = artifact.get("last_updated", artifact.get("date", ""))

    return f"""## Artifact work item

**Artifact ID:** `{artifact_id}`
**Type:** {artifact_type}
**Date:** {artifact_date}
**Status:** {status}

### Summary
{summary}

### Topics
{topics}

### Links
- Detail page: `{detail_page}`
- Source file: `{source_file}`

### Context
- Decisions: {decisions}
- Scenarios: {scenarios}
- Demo ready: {str(demo_ready).lower()}
- Version: {version}
- Last updated: {last_updated}

### Work to do
- [ ] Review metadata quality
- [ ] Confirm title and summary
- [ ] Assess whether artifact is decision-ready
- [ ] Link to related architecture/scenario pages
- [ ] Mark status progression
"""


def github_request(method: str, url: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
    if not GITHUB_TOKEN and not DRY_RUN:
        raise RuntimeError("GITHUB_TOKEN is required unless DRY_RUN=1")

    data = None
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")

    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "artifact-issue-bot",
    }
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"

    request = urllib.request.Request(url, data=data, headers=headers, method=method)

    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"GitHub API error {exc.code}: {body}") from exc


def create_issue(artifact: dict[str, Any]) -> int:
    title = build_issue_title(artifact)
    body = build_issue_body(artifact)
    labels = build_labels(artifact)

    if DRY_RUN:
        print(f"[DRY RUN] Would create issue: {title}")
        print(f"[DRY RUN] Labels: {labels}")
        return -1

    payload = {
        "title": title,
        "body": body,
        "labels": labels,
    }
    url = f"{GITHUB_API}/repos/{REPOSITORY}/issues"
    response = github_request("POST", url, payload)
    return int(response["number"])


def main() -> int:
    artifacts = load_artifacts()
    updated = 0

    for artifact in artifacts:
        artifact_id = artifact.get("id", "unknown-artifact")
        issue_number = artifact.get("issue_number")
        if issue_number:
            print(f"[SKIP] {artifact_id} already linked to issue #{issue_number}")
            continue

        try:
            new_issue_number = create_issue(artifact)
        except Exception as exc:  # noqa: BLE001
            print(f"[ERROR] Failed for {artifact_id}: {exc}")
            return 1

        if new_issue_number != -1:
            artifact["issue_number"] = new_issue_number
            updated += 1
            print(f"[CREATE] {artifact_id} -> issue #{new_issue_number}")

    if updated and not DRY_RUN:
        save_artifacts(artifacts)
        print(f"[SAVE] Updated {updated} artifact(s) in {INDEX_PATH}")
    elif DRY_RUN:
        print("[DONE] Dry run complete")
    else:
        print("[DONE] No new issues required")

    return 0


if __name__ == "__main__":
    sys.exit(main())
