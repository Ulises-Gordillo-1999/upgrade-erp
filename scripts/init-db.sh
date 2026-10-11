#!/usr/bin/env bash
# ==============================================================================
# UPGRADE ERP/CRM - Script de Inicialización de Esquema de Base de Datos
# ==============================================================================

set -e

echo "==> [UPGRADE] Aplicando esquema de base de datos con Drizzle ORM..."

# Si se ejecuta dentro del contenedor de la aplicación o en el host con Node.js
if command -v npm &> /dev/null; then
  npm run db:push
else
  npx drizzle-kit push
fi

echo "==> [UPGRADE] Base de datos sincronizada con éxito."
