# Guía de Despliegue en Producción: UPGRADE ERP/CRM
### Infraestructura Hetzner Cloud + Coolify (Self-Hosted)

Esta guía detalla el paso a paso para desplegar el ERP/CRM de **UPGRADE** en un servidor VPS de **Hetzner Cloud** administrado con **Coolify**, garantizando alta disponibilidad, seguridad con SSL automático, persistencia de datos y backups diarios automatizados.

---

## 1. Requisitos de Infraestructura (Hetzner Cloud)

1. **Servidor VPS Recomendado**:
   - **Proveedor**: Hetzner Cloud.
   - **Ubicación**: Falkenstein / Núremberg (o Ashburn si prefieres cercanía a América).
   - **Tipo de Instancia**: `CPX21` (3 vCPU AMD, 4 GB RAM, 80 GB NVMe SSD) o `CX22` (2 vCPU, 4 GB RAM).
   - **Sistema Operativo**: Ubuntu 24.04 LTS.
2. **Hetzner Firewall (Reglas de red)**:
   - `TCP 22` (SSH - restringido a tu IP si es posible).
   - `TCP 80` (HTTP - Redirección Let's Encrypt).
   - `TCP 443` (HTTPS - Tráfico seguro de la aplicación).
   - `TCP 8000` (Panel Coolify - opcionalmente restringido).
3. **DNS del Dominio**:
   - Registro `A` apuntando a la IP pública del servidor VPS (ej: `erp.upgrade.com.ar` -> `IP_HETZNER`).

---

## 2. Instalación de Coolify en el Servidor (Una sola vez)

Conéctate por SSH a tu servidor Hetzner:

```bash
ssh root@<IP_DEL_VPS>
```

Ejecuta el script oficial de instalación de Coolify:

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Una vez completada la instalación, ingresa a `http://<IP_DEL_VPS>:8000` desde tu navegador para crear la cuenta de administrador de Coolify.

---

## 3. Despliegue en Coolify con Docker Compose (Método Recomendado)

Este método levanta en un solo stack sincronizado:
1. **Next.js 16 Standalone** (`upgrade_app_prod`).
2. **PostgreSQL 16 Alpine** (`upgrade_postgres_prod`).
3. **Backups Diarios con Rotación** (`upgrade_backup_cron`).

### Pasos en la interfaz de Coolify:
1. En el panel de Coolify, entra a tu **Project** -> **Environment** (ej: `production`).
2. Haz clic en **+ New** -> **Docker Compose**.
3. Selecciona tu proveedor Git (GitHub o GitLab) y vincula este repositorio, o elige **Empty Service** y pega el contenido de [`docker-compose.prod.yml`](./docker-compose.prod.yml).
4. Configura las **Variables de Entorno** en la pestaña *Environment Variables*:

```ini
POSTGRES_USER=upgrade_admin
POSTGRES_PASSWORD=genera_una_clave_segura_de_32_caracteres
POSTGRES_DB=upgrade_prod_db
ENCRYPTION_KEY=clave_criptografica_aes256_super_segura_minimo_32_bytes_xyz123!
NEXT_PUBLIC_APP_URL=https://erp.upgrade.com.ar
```

> **Generar Claves Seguras**:
> En tu terminal puedes generar cadenas criptográficas seguras ejecutando:
> `openssl rand -base64 32`

5. En la configuración del servicio `app`, establece el dominio público en **Domains**:
   `https://erp.upgrade.com.ar`
   *(Coolify y Traefik generarán automáticamente los certificados SSL de Let's Encrypt)*.
6. Haz clic en **Deploy**.

---

## 4. Persistencia de Datos y Volúmenes Críticos

El stack cuenta con 3 volúmenes Docker nombrados que **nunca se pierden** al actualizar o reiniciar los contenedores:

| Volumen | Destino en Contenedor | Propósito |
| :--- | :--- | :--- |
| `upgrade_prod_pgdata` | `/var/lib/postgresql/data` | Todas las tablas y registros de PostgreSQL 16 |
| `upgrade_prod_uploads` | `/app/uploads` | Imágenes y certificados WebP de la Bóveda de Seguridad |
| `upgrade_prod_backups` | `/backups` | Copias de seguridad diarias comprimidas en `.sql.gz` |

---

## 5. Inicialización de la Base de Datos en Producción

Una vez que los contenedores estén activos, sincroniza el esquema de PostgreSQL ejecutando las migraciones Drizzle desde el contenedor o mediante SSH:

```bash
# Opción 1: Desde la consola integrada de Coolify en el contenedor 'app'
npm run db:push

# Opción 2: Desde la terminal SSH del host
docker exec -it upgrade_app_prod npm run db:push
```

---

## 6. Estrategia de Backups y Recuperación de Desastres

### A. Backups Automáticos
El servicio `postgres-backup` corre todos los días a medianoche (`@daily`), genera un archivo `upgrade_backup_YYYYMMDD_HHMMSS.sql.gz` y aplica la siguiente política de rotación:
- Conserva los últimos **7 backups diarios**.
- Conserva los últimos **4 backups semanales**.
- Conserva los últimos **6 backups mensuales**.

### B. Backup Manual Inmediato
Antes de realizar cualquier actualización mayor, puedes tomar una instantánea ejecutando:

```bash
./scripts/backup.sh
```
El archivo comprimido se guardará en `./backups/upgrade_backup_*.sql.gz`.

### C. Restauración ante Contingencias
Para restaurar una copia previa en caso de falla humana o corrupción de datos:

```bash
./scripts/restore.sh ./backups/upgrade_backup_20261011_120000.sql.gz
```

---

## 7. Checklist de Seguridad Pre-Lanzamiento

- [ ] `ENCRYPTION_KEY` tiene al menos 32 caracteres y no es la clave de ejemplo.
- [ ] La contraseña del usuario `POSTGRES_PASSWORD` es fuerte y aleatoria.
- [ ] El dominio `https://erp.upgrade.com.ar` responde con candado SSL válido.
- [ ] Los usuarios iniciales (Ulises y Gabriel) cambiaron su contraseña desde `/perfil`.
- [ ] Se probó subir una credencial a la Bóveda de Seguridad y verificar su visualización WebP.
- [ ] Se ejecutó un backup de prueba con `./scripts/backup.sh`.
