#!/usr/bin/env bash
# ==============================================================================
# UPGRADE ERP/CRM - Script de Backup Manual de Base de Datos PostgreSQL
# Uso: ./scripts/backup.sh
# ==============================================================================

set -e

BACKUP_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="$BACKUP_DIR/upgrade_backup_$TIMESTAMP.sql.gz"

CONTAINER_NAME="${DB_CONTAINER:-upgrade_postgres_prod}"
DB_USER="${POSTGRES_USER:-upgrade_admin}"
DB_NAME="${POSTGRES_DB:-upgrade_prod_db}"

# Fallback para entorno local en Docker si no se especifica el de prod
if ! docker ps --format '{{.Names}}' | grep -q "^$CONTAINER_NAME$"; then
  if docker ps --format '{{.Names}}' | grep -q "^upgrade_postgres$"; then
    CONTAINER_NAME="upgrade_postgres"
    DB_USER="postgres"
    DB_NAME="upgrade_db"
  fi
fi

echo "==> [UPGRADE] Generando backup de la base de datos '$DB_NAME' desde el contenedor '$CONTAINER_NAME'..."

docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" | gzip > "$FILENAME"

SIZE=$(du -h "$FILENAME" | cut -f1)
echo "==> [UPGRADE] Backup completado exitosamente: $FILENAME ($SIZE)"
