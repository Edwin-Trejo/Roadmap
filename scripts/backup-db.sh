#!/usr/bin/env bash
# Dumps the Postgres database from the running "postgres" container to a gzip
# file and prunes backups older than RETENTION_DAYS. Meant to run via cron on
# the deployment host (see scripts/README.md).
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

BACKUP_DIR="${BACKUP_DIR:-/root/backups/roadmap}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"

POSTGRES_USER="${POSTGRES_USER:-roadmap}"
POSTGRES_DB="${POSTGRES_DB:-roadmap}"

mkdir -p "$BACKUP_DIR"

OUT_FILE="$BACKUP_DIR/roadmap_${TIMESTAMP}.sql.gz"
docker compose exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$OUT_FILE"

echo "Backup written to $OUT_FILE"

find "$BACKUP_DIR" -name 'roadmap_*.sql.gz' -mtime "+$RETENTION_DAYS" -delete
