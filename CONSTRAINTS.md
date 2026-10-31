# UPGRADE ERP - Project Quality Constraints & Standards

Este documento define la barra de calidad, restricciones técnicas y umbrales innegociables del proyecto **UPGRADE ERP**, gobernados por la skill `constraint-driven-development`.

---

## 1. Stack Tecnológico Base
- **Frontend / Backend**: Next.js 15+ (App Router, Server Actions, Server Components, standalone output).
- **Lenguaje**: TypeScript en modo estricto (`tsconfig.json`).
- **Base de Datos**: PostgreSQL 16 nativo en contenedor Docker (`upgrade_postgres`).
- **ORM & Migraciones**: Drizzle ORM con tipado estricto (`src/db/schema.ts`).
- **Estilos**: Tailwind CSS v4, Lucide Icons.
- **Autenticación & Autorización**: JWT propio (`jose`), hash `bcryptjs`, cookies HttpOnly seguras y RBAC (`SuperAdmin`, `Admin`, `Tecnico`).

---

## 2. Restricciones Técnicas Innegociables (Floor Bar)

### TypeScript & Linter
- **Cero errores de compilación**: Todo cambio debe compilar limpiamente (`npm run build`).
- **Prohibición de supresiones silenciosas**: Prohibido usar `@ts-ignore`, `@ts-nocheck` o `eslint-disable` sin una justificación técnica documentada en un comentario adyacente.
- **Tipado estricto**: No usar `any` cuando el tipo pueda inferirse o definirse mediante interfaces / types de TypeScript o Drizzle.

### Seguridad y Secretos (`env-security-protocol`)
- **Tolerancia cero a credenciales expuestas**: Jamás commitear secretos, tokens JWT, contraseñas de PostgreSQL de producción, ni claves simétricas AES-256 en el repositorio.
- **Bóveda Criptográfica**: Todo dato confidencial de clientes debe encriptarse con AES-256 antes de insertarse en la base de datos (`src/lib/encryption.ts`).
- **RBAC Estricto**: Toda Server Action o endpoint que modifique datos sensibles o del sistema debe validar la sesión y el rol del usuario antes de ejecutar la mutación.

### Estándares de UI / UX
- **Estética Enterprise Dark**: Fondo principal oscuro (`#0a0f1d`), glassmorphism, bordes sutiles y acentos cromáticos profesionales.
- **Modales Desacoplados (React Portals)**: Todo modal o diálogo emergente DEBE renderizarse desacoplado del DOM mediante `createPortal(children, document.body)` para evitar clipping visual por `backdrop-filter` u `overflow: hidden`.
- **Diseño Responsivo**: Todas las vistas deben ser legibles y operables tanto en pantallas de escritorio como en dispositivos móviles.

### Reglas de Negocio Críticas
- **El Problema del Cable e Inventario**: Al liquidar un proyecto (`Finalizado`), el stock solo se descuenta de ítems físicos y consumibles una sola vez, protegido por el flag booleano `stock_descontado` en la tabla `proyectos`.
- **Finanzas**: Soporte multidivisa explícito (`ARS` y `USDT`). Los balances mensuales del dashboard principal computan exclusivamente pesos argentinos (**solo ARS**).

---

## 3. Versionado y Control de Cambios
- **Commits atómicos y descriptivos**: Siguiendo el estándar de Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, etc.).
- **SemVer estricto**: Cada incremento de versión debe auditarse y ejecutarse con las herramientas oficiales (`npm run version:patch / minor / major`).
- **Definition of Done**: Todo entregable debe superar los criterios de aceptación y el checklist en `.agents/references/definition-of-done.md`.

