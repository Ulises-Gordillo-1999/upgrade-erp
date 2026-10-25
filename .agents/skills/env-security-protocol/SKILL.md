---
name: env-security-protocol
description: >-
  Protocolo estricto de seguridad para la gestión de variables de entorno, secretos y credenciales de producción en UPGRADE ERP.
  Garantiza que contraseñas, URLs de bases de datos de producción (PostgreSQL), claves simétricas de la bóveda (AES-256),
  tokens JWT, API keys y correos reales jamás queden expuestos en código fuente, README, documentación, scripts de seed ni en el historial de Git.
  Define el uso obligatorio de placeholders genéricos en el repositorio, sanitización antes de commits, auditoría preventiva con ripgrep/git status,
  configuración segura en paneles de despliegue (Coolify/Docker/VCS), y procedimientos de remediación si un secreto es introducido.
---

# Protocolo de Seguridad para Variables de Entorno y Secretos (UPGRADE ERP)

Este protocolo establece las reglas mandatorias e inquebrantables para la gestión de variables de entorno, credenciales y secretos de producción en el ecosistema **UPGRADE ERP / CRM** (Soporte Técnico, Infraestructura IT, Ciberseguridad y Bóveda Criptográfica).

---

## 🛡️ Principio Fundamental: Zero Secrets in Git

> [!CAUTION]
> **LOS DATOS REALES DE PRODUCCIÓN JAMÁS DEBEN QUEDAR EXPUESTOS EN REPOSITORIOS DE CÓDIGO NI EN EL HISTORIAL DE GIT.**
> Ninguna contraseña, hash de usuario, URL de base de datos con contraseñas de producción (`DATABASE_URL`), clave criptográfica de la bóveda (`ENCRYPTION_KEY`), secreto JWT, correo privado de clientes/administradores ni credencial de infraestructura (MikroTik, AnyDesk, VPNs, switches) puede commitearse bajo ninguna circunstancia.

---

## 🔑 Secretos Críticos en UPGRADE ERP

| Variable / Secreto | Nivel de Riesgo | Impacto de Fuga | Dónde se Configura |
| :--- | :--- | :--- | :--- |
| `ENCRYPTION_KEY` | **EXTREMO** 🚨 | Permite descifrar todas las credenciales de clientes en la Bóveda de Seguridad (AES-256) | Exclusivamente en **Coolify Environment Variables** (o `.env.local` en dev) |
| `DATABASE_URL` | **CRÍTICO** 🚨 | Acceso directo de lectura y escritura a la base PostgreSQL de producción | Exclusivamente en **Coolify Environment Variables** |
| `POSTGRES_PASSWORD` | **CRÍTICO** 🚨 | Credencial de administración del contenedor PostgreSQL | Exclusivamente en **Coolify Environment Variables** |
| `JWT_SECRET` | **ALTO** ⚠️ | Permite falsificar tokens de sesión y elevar privilegios a `SuperAdmin` | Exclusivamente en **Coolify Environment Variables** |
| `SEED_*_PASSWORD` | **ALTO** ⚠️ | Contraseña por defecto de administradores y técnicos | Exclusivamente en **Coolify Environment Variables** o `.env.local` |

---

## 🗂️ Matriz de Archivos de Entorno

| Archivo | Estado en Git | Propósito | Contenido Permitido |
| :--- | :--- | :--- | :--- |
| `.env.local` | **IGNORADO** (`.gitignore`) | Entorno local del desarrollador en su máquina | Credenciales del contenedor Docker local (`localhost:5432`) |
| `.env.example` | **PÚBLICO** (rastreado) | Plantilla modelo para onboarding de desarrolladores | Claves vacías o **placeholders genéricos ficticios** |
| `.env.production` | **IGNORADO** (`.gitignore`) | Variables de compilación local de prod | No debe existir en el repositorio |
| `README.md` / `*.md` | **PÚBLICO** (rastreado) | Documentación técnica del proyecto | **Exclusivamente ejemplos falsos y genéricos** |

---

## 🚫 Prohibiciones Estrictas (Código y Documentación)

1. **Prohibido colocar contraseñas reales en `README.md` o documentación Markdown:**
   - ❌ **INCORRECTO**:
     ```markdown
     ENCRYPTION_KEY=MiClaveRealDeProduccionDeUpgrade2026!
     DATABASE_URL=postgresql://upgrade_admin:PasswordReal123@188.245.x.x:5432/upgrade_prod_db
     ```
   - ✅ **CORRECTO**:
     ```markdown
     ENCRYPTION_KEY=clave_criptografica_aes256_super_segura_minimo_32_bytes_xyz123!
     DATABASE_URL=postgresql://upgrade_admin:<tu-password-segura>@postgres:5432/upgrade_prod_db
     ```

2. **Prohibido colocar correos reales de producción en ejemplos o documentación:**
   - ❌ **INCORRECTO**: `SEED_ADMIN_EMAIL=ulises.gordillo@gmail.com`
   - ✅ **CORRECTO**: `SEED_ADMIN_EMAIL=admin@upgrade-informatica.com`

3. **Prohibido hardcodear secretos como valores por defecto (fallbacks) en código:**
   - ❌ **INCORRECTO**:
     ```typescript
     const secret = process.env.ENCRYPTION_KEY || "MiClaveRealDeProduccion!";
     ```
   - ✅ **CORRECTO**:
     ```typescript
     const secret = process.env.ENCRYPTION_KEY;
     if (!secret) {
       throw new Error("ENCRYPTION_KEY no está configurada en las variables de entorno.");
     }
     ```

4. **Prohibido exponer variables con secretos en el cliente (`'use client'`):**
   - Jamás prefijar credenciales, llaves de encriptación o strings de conexión con `NEXT_PUBLIC_`.
   - Únicamente variables públicas inocuas como `NEXT_PUBLIC_APP_URL` pueden llevar ese prefijo, ya que Next.js incrusta el valor directamente en el bundle JavaScript descargable por cualquier usuario en su navegador.

5. **Prohibido incluir credenciales de clientes reales en scripts de test o seed:**
   - Las credenciales que se carguen en pruebas de la Bóveda deben ser ficticias (*ej. router MikroTik con IP `192.168.88.1`, usuario `demo_admin`, contraseña `EjemploTest123!`*).

---

## 🔐 Dónde y Cómo se Configuran los Datos Reales en UPGRADE

Los datos reales de producción solo existen en **entornos de ejecución protegidos y aislados**:

1. **Panel de Coolify v4 (Producción en Hetzner Cloud):**
   - Ruta: `Coolify` $\rightarrow$ `Project` $\rightarrow$ `upgrade-erp` $\rightarrow$ `Environment Variables`.
   - Se cargan de forma privada y encriptada en la base de datos interna de Coolify.
   - Se inyectan automáticamente en tiempo de ejecución al contenedor Docker de la aplicación.
2. **PostgreSQL de Producción (Contenedor de Base de Datos en Coolify):**
   - Las credenciales de `upgrade_db` se administran dentro de la configuración aislada del contenedor de base de datos.
3. **Almacenamiento Persistente de Bóveda:**
   - La carpeta de comprobantes y credenciales procesadas a WebP (`uploads/vault/`) se monta como un volumen persistente de Coolify, protegido contra descargas directas sin sesión de usuario.

---

## 📋 Checklist Preventivo antes de cada `git commit` y `git push`

Antes de ejecutar `git commit` o `git push`, verifica rigurosamente:

- [ ] ¿Ejecutaste `git status` para confirmar que ningún archivo `.env`, `.env.local` o `.env.production` esté en estado staged?
- [ ] ¿Revisaste `git diff` buscando si accidentalmente copiaste una clave real, URL con password o correo privado en archivos `.ts`, `.tsx`, `.sql` o `.md`?
- [ ] ¿El archivo `.gitignore` contiene las siguientes reglas mínimas?
  ```gitignore
  .env*
  !.env.example
  *.pem
  *.key
  uploads/
  ```
- [ ] ¿El archivo `.dockerignore` excluye `.env*` para evitar que las variables locales se empaqueten dentro de la imagen de producción?

---

## 🚨 Protocolo de Remediación ante Fuga Accidental de Secretos

Si por error se commiteó un dato sensible:

### Escenario A: El commit es local (NO se ha hecho `git push`):
1. Sanitizar el archivo reemplazando el secreto por un placeholder genérico.
2. Enmendar el commit en el historial:
   ```bash
   git add .
   git commit --amend --no-edit
   ```

### Escenario B: El commit ya fue subido a GitHub (`git push` reciente):
1. Sanitizar inmediatamente los archivos afectados en el código local.
2. Enmendar el commit en el historial local:
   ```bash
   git add .
   git commit --amend -m "chore: sanitizar credenciales y variables de entorno"
   ```
3. Forzar la actualización en GitHub para sobreescribir el commit comprometido:
   ```bash
   git push --force origin <rama>
   ```
4. **Rotación Obligatoria de Credenciales**:
   - **`ENCRYPTION_KEY`**: Si la clave de la bóveda se expuso, se debe reencriptar los registros de `boveda_seguridad` con una nueva clave y actualizar la variable en Coolify.
   - **`DATABASE_URL`**: Cambiar la contraseña del usuario `upgrade_admin` en PostgreSQL y actualizar `DATABASE_URL` en Coolify.
   - **`JWT_SECRET`**: Generar un nuevo secreto en Coolify (esto invalidará sesiones activas obligando a los técnicos a iniciar sesión nuevamente).
   - *Regla de oro*: Una vez que un secreto tocó un repositorio público o remoto, **debe considerarse comprometido de inmediato**.
