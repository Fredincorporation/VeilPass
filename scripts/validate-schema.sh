#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(dirname "$0")/..
MIG_DIR="$ROOT_DIR/supabase/migrations"

echo "Checking migrations in: $MIG_DIR"

if [ ! -d "$MIG_DIR" ]; then
  echo "Migrations directory not found: $MIG_DIR" >&2
  exit 2
fi

missing=0
for f in $(ls "$MIG_DIR"/*.sql 2>/dev/null || true); do
  if [ ! -s "$f" ]; then
    echo "Empty migration file: $f" >&2
    missing=1
  fi
done

count=$(ls "$MIG_DIR"/*.sql 2>/dev/null | wc -l || true)
if [ "$count" -eq 0 ]; then
  echo "No migration files found in $MIG_DIR" >&2
  exit 2
fi

if [ "$missing" -ne 0 ]; then
  echo "One or more migration files are empty" >&2
  exit 3
fi

echo "Migration folder validation passed. Found $count migration(s)."
