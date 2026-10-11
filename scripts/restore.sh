#!/usr/bin/env bash
# ==============================================================================
# UPGRADE ERP/CRM - Script de Restauración de Base de Datos PostgreSQL
# Uso: ./scripts/restore.sh ./backups/upgrade_backup_YYYYMMDD_HHMMSS.sql.gz
# ==============================================================================

set -e

BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Debes proporcionar la ruta a un archivo de backup .sql o .sql.gz válido."
  echo "Ejemplo: ./scripts/restore.sh ./backups/upgrade_backup_20261011_120000.sql.gz"
  exit 1
fi

CONTAINER_NAME="${DB_CONTAINER:-upgrade_postgres_prod}"
DB_USER="${POSTGRES_USER:-upgrade_admin}"
DB_NAME="${POSTGRES_DB:-upgrade_prod_db}"

if ! docker ps --format '{{.Names}}' | grep -q "^$CONTAINER_NAME$"; then
  if docker ps --format '{{.Names}}' | grep -q "^upgrade_postgres$"; then
    CONTAINER_NAME="upgrade_postgres"
    DB_USER="postgres"
    DB_NAME="upgrade_db"
  fi
fi

read -p "ADVERTENCIA: Se sobreescribirán los datos en '$DB_NAME'. ¿Continuar? (s/N): " CONFIRM
if [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "S" ]; then
  echo "Operación cancelada."
  exit 0
fi

echo "==> [UPGRADE] Restaurando backup '$BACKUP_FILE' en '$CONTAINER_NAME'..."

if [[ "$BACKUP_FILE" == *.gz ]]; then
  gunzip -c "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"
else
  cat "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"
fi

echo "==> [UPGRADE] Restauración completada con éxito."
