#!/bin/bash
# Usage: ./release.sh 1.2.3

set -e
VERSION=$1

if [[ -z "$VERSION" ]]; then
  echo "❌ Error: No version number supplied."
  echo "👉 Usage: ./release.sh 1.2.3"
  exit 1
fi

TAG="v$VERSION"

echo "📦 Preparing release: $TAG"
grep "$VERSION" pyproject.toml || {
  echo "❌ Version $VERSION not found in pyproject.toml. Did you forget to bump it?"
  exit 1
}

git add -A
git commit -m "Release $TAG"
git tag "$TAG"
git push origin main
git push origin "$TAG"

echo "✅ Release $TAG pushed! GitHub Actions will handle the rest."
