#!/bin/sh
set -e

DB_PATH="${DB_PATH:-data/db.sqlite}"

if [ ! -f "$DB_PATH" ]; then
  echo "No database found at $DB_PATH — skipping backup."
  exit 0
fi

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="${DB_PATH}.${TIMESTAMP}.bak"

cp "$DB_PATH" "$BACKUP_PATH"
echo "Database backed up to $BACKUP_PATH"
