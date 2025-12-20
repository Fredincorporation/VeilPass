#!/usr/bin/env bash
set -euo pipefail

# apply-migration.sh
# Applies DATABASE_MIGRATIONS_ADD_PAYMENT_FALLBACK.sql to the configured database.
# Supports two modes:
# 1) Use SUPABASE_DB_URL (psql) if set
# 2) Use supabase CLI to push migrations if SUPABASE_CLI_MIGRATIONS_DIR is set

SQL_FILE="$(dirname "$0")/../DATABASE_MIGRATIONS_ADD_PAYMENT_FALLBACK.sql"

if [[ ! -f "$SQL_FILE" ]]; then
  echo "Migration file not found: $SQL_FILE"
  exit 2
fi

# Option 1: psql
if [[ -n "${SUPABASE_DB_URL:-}" ]]; then
  echo "Applying migration via psql to SUPABASE_DB_URL..."
  echo "Running: psql \"$SUPABASE_DB_URL\" -f $SQL_FILE"
  psql "$SUPABASE_DB_URL" -f "$SQL_FILE"
  echo "Migration applied via psql."
  exit 0
fi

# Option 2: supabase CLI
if [[ -n "${SUPABASE_CLI_MIGRATIONS_DIR:-}" ]]; then
  if ! command -v supabase >/dev/null 2>&1; then
    echo "supabase CLI not found. Install from https://supabase.com/docs/guides/cli"
    exit 3
  fi
  echo "Copying migration into migrations dir and running supabase db push..."
  cp "$SQL_FILE" "$SUPABASE_CLI_MIGRATIONS_DIR/$(basename "$SQL_FILE")"
  pushd "$SUPABASE_CLI_MIGRATIONS_DIR" >/dev/null
  supabase db push
  popd >/dev/null
  echo "Migration pushed via supabase CLI."
  exit 0
fi

cat <<EOF
No SUPABASE_DB_URL or SUPABASE_CLI_MIGRATIONS_DIR configured.

Set one of the environment variables before running:
  - SUPABASE_DB_URL: A psql connection string (postgresql://user:pass@host:port/dbname)
  - SUPABASE_CLI_MIGRATIONS_DIR: Path to your supabase migrations directory

Example (psql):
  SUPABASE_DB_URL="postgresql://service_role:...@db.supabase.co:5432/postgres" \ 
  bash ./scripts/apply-migration.sh

Example (supabase CLI):
  SUPABASE_CLI_MIGRATIONS_DIR="./supabase/migrations" bash ./scripts/apply-migration.sh
EOF

exit 1
