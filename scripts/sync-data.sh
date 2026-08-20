#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."

mkdir -p dart/assets/data
cp data/*.json dart/assets/data/

echo "Synced $(ls data/*.json | wc -l) files to dart/assets/data/"
