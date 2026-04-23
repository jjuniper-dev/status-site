#!/bin/bash

echo "=== Cross-Link Validation ==="
echo ""

# Check that all pages referenced in demo-guide.html exist
echo "✓ Checking demo page references..."
grep -o 'href="[^"]*\.html' demo-guide.html | cut -d'"' -f2 | sort -u | while read page; do
  if [ -f "$page" ]; then
    echo "  ✓ $page exists"
  else
    echo "  ✗ MISSING: $page"
  fi
done

echo ""
echo "✓ Checking decision data..."
grep -c '"id"' data/decisions.json && echo "  Decisions found"

echo ""
echo "✓ Checking scenario data..."
grep -c '"id"' data/scenarios.json && echo "  Scenarios found"

echo ""
echo "✓ Checking artifact data..."
grep -c '"id"' data/artifacts-index.json && echo "  Artifacts found"

echo ""
echo "✓ Checking assessment data..."
ls -1 data/assessments/*.json | wc -l | xargs -I {} echo "  Assessment files found: {}"

echo ""
echo "=== Demo Files Summary ==="
echo "Demo Guide: $([ -f demo-guide.html ] && echo '✓ exists' || echo '✗ missing')"
echo "Demo Script: $([ -f DEMO_SCRIPT.md ] && echo '✓ exists' || echo '✗ missing')"
echo "Navigation Updated: $(grep -q 'demo-guide' components/nav.html && echo '✓ done' || echo '✗ not updated')"

