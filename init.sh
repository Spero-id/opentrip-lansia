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

echo "=== Verification Complete ==="
echo ""
echo "Next steps:"
echo "1. Read feature_list.json to see current feature state"
echo "2. Pick ONE unfinished feature to work on"
echo "3. Implement only that feature"
echo "4. Re-run verification before claiming done"
