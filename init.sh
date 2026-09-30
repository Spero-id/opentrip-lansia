#!/bin/bash
set -e

echo "=== Harness Initialization ==="
echo "Directory: $(pwd)"
echo ""

echo "=== Installing dependencies ==="
npm install --no-audit --no-fund
echo ""

echo "=== Running lint ==="
npm run lint
echo ""

echo "=== Type check ==="
npx tsc --noEmit -p tsconfig.json
echo ""

echo "=== Running tests ==="
npx jest --passWithNoTests
echo ""

echo "=== Structure checks ==="
npm run check:structure
npm run check:schema-drift
if [ -f .next/app-path-routes-manifest.json ]; then
  npm run check:routes
else
  echo "check:routes: skipped (no build manifest; run npm run build first)"
fi
echo ""

echo "=== Verification Complete ==="
echo ""
echo "Next steps:"
echo "1. Read feature_list.json to see current feature state"
echo "2. Pick ONE unfinished feature to work on"
echo "3. Implement only that feature"
echo "4. Re-run verification before claiming done"
