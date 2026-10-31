#!/usr/bin/env bash
set -euo pipefail
cd /workspace/henglong-textile-website
OWNER="williege0731"
REPO="henglong-textile-website"

gh auth status
# Create public repo if missing
if gh repo view "$OWNER/$REPO" >/dev/null 2>&1; then
  echo "Repo exists: $OWNER/$REPO"
else
  gh repo create "$REPO" --public --description "南通开发区恒隆纺织有限公司 · 色织图鉴 lookbook site" --disable-wiki --disable-issues
fi

# Ensure remote
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$OWNER/$REPO.git"
git push -u origin main

# Enable Pages via Actions (workflow already in repo)
# Prefer Actions build_type; fall back to branch source
gh api -X POST "repos/$OWNER/$REPO/pages" \
  -f build_type=workflow \
  || gh api -X POST "repos/$OWNER/$REPO/pages" \
  -f "source[branch]=main" -f "source[path]=/" \
  || gh api -X PUT "repos/$OWNER/$REPO/pages" \
  -f build_type=workflow \
  || true

# Trigger workflow
gh workflow run pages.yml -R "$OWNER/$REPO" || true

PAGES_URL="https://$OWNER.github.io/$REPO/"
echo "Waiting for $PAGES_URL ..."
for i in $(seq 1 60); do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$PAGES_URL" || true)
  echo "try $i: HTTP $code"
  if [ "$code" = "200" ]; then
    echo "LIVE $PAGES_URL"
    echo "REPO https://github.com/$OWNER/$REPO"
    exit 0
  fi
  sleep 10
done
echo "TIMEOUT — last status $code"
echo "REPO https://github.com/$OWNER/$REPO"
echo "EXPECTED_PAGES $PAGES_URL"
exit 1
