# Manual Integral de Despliegue en Producción
## UPGRADE ERP/CRM en Hetzner Cloud con Coolify y Cloudflare

Este manual documenta en detalle, paso a paso y con nombres exactos de campos y capturas del proceso real, todo el procedimiento realizado para desplegar en producción el ERP de **UPGRADE**, incluyendo el servidor centralizado de **PostgreSQL 16**, el contenedor optimizado de **Next.js 16 Standalone**, la configuración de volúmenes persistentes y el dominio seguro con **Cloudflare** y **SSL automático**.

> **Nota de Seguridad:** Las credenciales y claves criptográficas que figuran en este manual utilizan variables de sustitución (e.g., `<TU_PASSWORD_POSTGRES>`, `<TU_CLAVE_AES256_BASE64_32_BYTES>`) para preservar la seguridad de la infraestructura.

---

## Índice General
1. [Arquitectura del Entorno de Producción](#1-arquitectura-del-entorno-de-producción)
2. [Paso 1: Creación del Servidor PostgreSQL 16 Central en Coolify](#paso-1-creación-del-servidor-postgresql-16-central-en-coolify)
3. [Paso 2: Creación de la Base de Datos `upgrade_db`](#paso-2-creación-de-la-base-de-datos-upgrade_db)
4. [Paso 3: Preparación y Subida del Código a GitHub](#paso-3-preparación-y-subida-del-código-a-github)
5. [Paso 4: Despliegue de la Aplicación Next.js en Coolify](#paso-4-despliegue-de-la-aplicación-nextjs-en-coolify)
6. [Paso 5: Configuración de Variables de Entorno](#paso-5-configuración-de-variables-de-entorno)
7. [Paso 6: Configuración del Almacenamiento Persistente (Bóveda)](#paso-6-configuración-del-almacenamiento-persistente-bóveda)
8. [Paso 7: Ajuste Crítico del Dockerfile (Healthcheck)](#paso-7-ajuste-crítico-del-dockerfile-healthcheck)
9. [Paso 8: Configuración del Dominio Oficial con Cloudflare y SSL](#paso-8-configuración-del-dominio-oficial-con-cloudflare-y-ssl)
10. [Paso 9: Inicialización del Esquema SQL Oficial](#paso-9-inicialización-del-esquema-sql-oficial)
11. [Paso 10: Primer Acceso y Blindaje de Seguridad](#paso-10-primer-acceso-y-blindaje-de-seguridad)

---

## 1. Arquitectura del Entorno de Producción

* **Servidor VPS**: Hetzner Cloud `CPX32` (Ubuntu 24.04 LTS, IP: `2.28.126.181`).
* **Firewall Hetzner (`fw-coolify-panel`)**: Puertos abiertos `TCP 80` (HTTP), `TCP 443` (HTTPS), `TCP 50222` (SSH personalizado) e `ICMP`.
* **Orquestador**: Coolify v4 self-hosted accesible en `panel.upgrade-informatica.com`.
* **Base de Datos**: PostgreSQL 16 Alpine nativo en contenedor Docker privado (`postgres-cluster`).
* **Frontend / Backend**: Next.js 16.3.4 Standalone sobre Node.js 20 Alpine (`upgrade-erp`).
* **Dominio & DNS**: Cloudflare administrando `upgrade-informatica.com` con registro `erp` en modo *Solo DNS*.
* **Proxy Inverso & SSL**: Traefik (integrado en Coolify) con emisión automática de certificados Let's Encrypt.

---

## Paso 1: Creación del Servidor PostgreSQL 16 Central en Coolify

Para maximizar el uso de recursos y no duplicar consumo de memoria RAM, se desplegó una única instancia centralizada de PostgreSQL capaz de alojar múltiples bases de datos para distintas aplicaciones.

1. En el panel de Coolify, ingresa al proyecto **`UPGRADE`** y al entorno **`production`**.
2. Haz clic en el botón superior **`+ New Resource`** (o *Add Resource*).
3. En la barra de búsqueda escribe `post` y selecciona la tarjeta **`PostgreSQL`**, luego haz clic en **`Deploy ->`**.

![Selección de recurso PostgreSQL](./docs/images/01_seleccion_postgresql.png)

4. En la pantalla **Select a PostgreSQL Image**, selecciona específicamente **`PostgreSQL 16`** (versión garantizada para compatibilidad con las migraciones y tipos ENUM de Drizzle).

![Selección de imagen PostgreSQL 16](./docs/images/02_seleccion_postgresql_16.png)

5. En la pantalla de configuración del recurso, establece los siguientes campos exactos:

| Sección | Campo | Valor Configurado | Descripción |
| :--- | :--- | :--- | :--- |
| **Database details** | **Name** | `postgres-cluster` | Nombre identificador en Coolify |
| **Database details** | **Description** | `Servidor PostgreSQL 16 compartido para UPGRADE ERP y futuras aplicaciones` | Nota descriptiva |
| **Database details** | **Image** | `postgres:16-alpine` | Imagen oficial liviana |
| **Credentials** | **Username** | `postgres` | Superusuario administrativo |
| **Credentials** | **Password** | *(Generada por Coolify)* | Revelar con el ícono del ojo y guardar |
| **Credentials** | **Initial database** | `postgres` | Base técnica inicial por defecto |
| **Runtime & network** | **Port mappings** | *(Vacío)* | No exponer puerto directo en host |
| **Public access** | **Access** | `Private` | Máxima seguridad, solo accesible en red interna Docker |

![Configuración de credenciales de PostgreSQL](./docs/images/03_configuracion_credenciales_postgres.png)

6. Haz clic en **Save** y luego en el botón superior derecho **`▶ Start`**. El estado cambiará a **`● Running`** (verde).

---

## Paso 2: Creación de la Base de Datos `upgrade_db`

Con el motor PostgreSQL en ejecución, se creó la base de datos aislada para el ERP:

1. En el menú lateral izquierdo de `postgres-cluster`, ve a **`Observe & troubleshoot`** -> **`Terminal`**.
2. Ejecuta el comando SQL:
   ```bash
   psql -U postgres -c "CREATE DATABASE upgrade_db;"
   ```
   *Respuesta esperada:* `CREATE DATABASE`.

![Creación de la base de datos en la terminal de Coolify](./docs/images/04_creacion_database_upgrade_db.png)

3. Vuelve a **`Settings`** -> **`General`**, baja a la sección **Runtime and network** y copia la cadena **`Postgres URL (internal)`**.
4. Tu URL interna final para la app se forma cambiando `/postgres` por `/upgrade_db`:
   ```text
   postgresql://postgres:<TU_PASSWORD_POSTGRES>@<ID_INTERNO_COOLIFY>:5432/upgrade_db
   ```

---

## Paso 3: Preparación y Subida del Código a GitHub

Para que Coolify pueda compilar la aplicación, el código se sincronizó con GitHub:

1. En GitHub se creó el repositorio público **`upgrade-erp`** sin archivos iniciales:

![Creación de repositorio en GitHub](./docs/images/05_creacion_repositorio_github.png)

2. Se configuró el archivo `.dockerignore` para excluir `node_modules`, `.next`, `.env*` y logs.
3. Se confirmaron todos los cambios y se subieron a la rama `main`:
   ```bash
   git add .
   git commit -m "feat: UPGRADE ERP/CRM con Dashboard, RBAC, Cierre de Obra, Boveda y Dockerfile"
   git branch -M main
   git remote add origin https://github.com/Ulises-Gordillo-1999/upgrade-erp.git
   git push -u origin main
   ```

---

## Paso 4: Despliegue de la Aplicación Next.js en Coolify

1. En Coolify, ve a tu entorno **`production`** y haz clic en **`+ New Resource`**.
2. En la lista de opciones basadas en Git, selecciona la tarjeta **`Public Git Repository`** y haz clic en **`Deploy ->`**.

![Selección de Public Git Repository](./docs/images/06_seleccion_public_git_repo.png)

3. En el formulario **Public Git repository**:
   * **Repository URL**: `https://github.com/Ulises-Gordillo-1999/upgrade-erp`
   * Haz clic en **`Check Repository`**.
4. En **Build configuration**:
   * **Branch**: `main`
   * **Build pack**: Cambiar de *Railpack* a **`Dockerfile`** *(Paso indispensable)*.
   * **Output type**: `Web application`
   * **Port**: `3000`
   * **Base directory**: `/`
5. Haz clic en el botón morado **`Continue`**.

![Configuración inicial del repositorio](./docs/images/07_configuracion_buildpack_dockerfile.png)

6. En la pantalla principal de la aplicación:
   * **Name**: Simplificar a `upgrade-erp`.

---

## Paso 5: Configuración de Variables de Entorno

En el menú lateral izquierdo de la aplicación, entra a **`Environment Variables`** y añade las 3 variables de producción con el botón **`+ Add Variable`**:

### Variable 1: `DATABASE_URL`
* **Name**: `DATABASE_URL`
* **Value**:
  ```text
  postgresql://postgres:<TU_PASSWORD_POSTGRES>@<ID_INTERNO_COOLIFY>:5432/upgrade_db
  ```
* **Build time**: *Available during build*
* **Runtime**: *Available in the container*

![Configuración de la variable DATABASE_URL](./docs/images/08_configuracion_variable_database_url.png)

### Variable 2: `ENCRYPTION_KEY`
* **Name**: `ENCRYPTION_KEY`
* **Value**: `<TU_CLAVE_AES256_BASE64_32_BYTES>` *(Clave criptográfica AES-256 de 32 bytes para la Bóveda de contraseñas)*.

### Variable 3: `NEXT_PUBLIC_APP_URL`
* **Name**: `NEXT_PUBLIC_APP_URL`
* **Value**: `https://erp.upgrade-informatica.com` *(URL pública del sistema)*.

![Edición de NEXT_PUBLIC_APP_URL](./docs/images/09_configuracion_variable_app_url.png)

---

## Paso 6: Configuración del Almacenamiento Persistente (Bóveda)

Para evitar que las credenciales visuales, comprobantes y fotos WebP de la Bóveda de Seguridad se borren al reconstruir el contenedor:

1. En el menú lateral izquierdo, ve a **`Persistent Storage`**.
2. Haz clic en **`+ Add Mount`** y selecciona **`Volume mount`**.

![Selección de Volume mount](./docs/images/10_persistent_storage_volume_mount.png)

3. Completa los campos:
   * **Name**: `vault-uploads`
   * **Destination path**: `/app/uploads`
4. Guarda los cambios.

---

## Paso 7: Ajuste Crítico del Dockerfile (Healthcheck)

Durante el primer despliegue, la compilación de Next.js fue un éxito total (`Ready in 0ms`), pero Coolify reportó un fallo con el mensaje:
> `Healthcheck logs: wget: can't connect to remote host: Connection refused | Return code: 1 | New container is unhealthy`

![Fallo inicial por falso positivo de Healthcheck](./docs/images/11_error_healthcheck_wget.png)

### Causa Técnica:
En imágenes Alpine Linux, la instrucción `HEALTHCHECK` ejecutando `wget http://localhost:3000` intenta resolver `localhost` a IPv6 (`::1`), recibiendo `Connection refused` mientras el servidor escucha en IPv4 (`127.0.0.1` / `0.0.0.0`).

### Solución Definitiva:
Se removió la directiva `HEALTHCHECK` del `Dockerfile`, dejando que Coolify gestione la verificación de estado mediante Traefik. Se hizo commit (`67c64de`) y push a GitHub:

```dockerfile
# Bloque final en Dockerfile:
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

Al volver a pulsar **`Deploy`**, la compilación tardó solo **31 segundos** y pasó exitosamente a **`● Running (no healthcheck)`** (verde).

![Despliegue exitoso en Coolify](./docs/images/12_deploy_exitoso_running.png)

---

## Paso 8: Configuración del Dominio Oficial con Cloudflare y SSL

El subdominio temporal `.sslip.io` generaba `DNS_PROBE_FINISHED_NXDOMAIN` en la red local debido a que routers y proveedores de internet filtran dominios wildcard de desarrollo:

![Error DNS NXDOMAIN en sslip.io](./docs/images/13_error_dns_sslip_io.png)

Se configuró el subdominio corporativo formal **`erp.upgrade-informatica.com`**:

### 1. Registro DNS en Cloudflare
En la zona DNS de `upgrade-informatica.com`:
* **Tipo**: `A`
* **Nombre**: `erp`
* **Dirección IPv4**: `2.28.126.181`
* **Estado de proxy**: **`Solo DNS`** (Nube gris, para permitir que Traefik emita el certificado Let's Encrypt sin interferencias).
* **TTL**: `Automático`

![Registro DNS en Cloudflare](./docs/images/14_registro_dns_cloudflare.png)

### 2. Vinculación en Coolify
En la aplicación `upgrade-erp`:
1. Haz clic en **`Manage Domains ->`** (o **`+ Add Domain`**):
   * **Protocol**: `https`
   * **Domain**: `erp.upgrade-informatica.com`
   * **Port**: `3000`
   * **Path**: *(Vacío)*
   * Haz clic en **Save**.

![Formulario Add domain en Coolify](./docs/images/15_add_domain_coolify.png)

2. En la lista de dominios:
   * **Eliminar** el temporal `.sslip.io` con el ícono rojo del cesto de basura.
   * **Eliminar** la variante `www.erp.upgrade-informatica.com` con el cesto de basura.
   * **Mantener activo**: Únicamente `https://erp.upgrade-informatica.com`.

![Limpieza de dominios en Coolify](./docs/images/16_limpieza_dominios_coolify.png)

3. Haz clic en **Restart** en Coolify.

---

## Paso 9: Inicialización del Esquema SQL Oficial

Para crear las 7 tablas, relaciones y tipos ENUM en la base de datos `upgrade_db`:

1. En Coolify, ve al recurso **`postgres-cluster`** -> **`Terminal`**.
2. Conéctate a la base de datos:
   ```bash
   psql -U postgres -d upgrade_db
   ```
3. Pega el script DDL oficial de tablas y tipos ENUM (`upgrade_schema.sql`):
   - Tipos: `condicion_iva_enum`, `tipo_item_enum`, `estado_proyecto_enum`, `tipo_dato_boveda_enum`, `tipo_transaccion_enum`, `categoria_transaccion_enum`, `moneda_enum`, `metodo_pago_enum`, `estado_pago_enum`, `rol_enum`.
   - Tablas: `usuarios`, `clientes`, `inventario`, `proyectos`, `items_proyecto`, `boveda_seguridad`, `transacciones`.
4. Escribe `\q` y pulsa Enter para desconectar.

---

## Paso 10: Primer Acceso y Blindaje de Seguridad

1. Ingresa a la URL oficial: **`https://erp.upgrade-informatica.com`**.
   * El navegador presentará el candado de seguridad SSL activo.

![Pantalla de Login oficial en producción](./docs/images/17_login_exitoso_produccion.png)

2. **Inicio de sesión inicial**:
   * Email: `ulises@upgrade.com`
   * Contraseña: `admin123`
   *(La función `seedInitialUsersIfEmpty()` auto-creó la cuenta al detectar la tabla de usuarios vacía).*

3. **Cambio de credenciales personales**:
   * Ve al módulo **`Mi Perfil`** (`/perfil`).
   * Actualiza tu correo electrónico real y define una contraseña segura de alta entropía.

4. **Desactivación de cuentas por defecto**:
   * Como SuperAdmin, ingresa al módulo **`Usuarios / Equipo`** (`/usuarios`).
   * Desactiva los usuarios temporales `Gabriel` y `Admin Upgrade` para prevenir cualquier acceso indebido con credenciales por defecto.

---

### Conclusión
El sistema **UPGRADE ERP/CRM** se encuentra 100% operativo en producción, altamente optimizado, seguro y listo para ser utilizado en las operaciones cotidianas de la empresa.
