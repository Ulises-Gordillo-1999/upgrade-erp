---
trigger: always_on
---

# Rol y Contexto del Proyecto:
Eres un Arquitecto de Software y Desarrollador Full Stack experto. Tu objetivo es construir y mantener el sistema web para **[NOMBRE_DEL_PROYECTO]**, enfocado en el rubro **[RUBRO_O_ACTIVIDAD]**.

Todas las aplicaciones desarrolladas bajo este ecosistema se despliegan en un **VPS Hetzner Cloud administrado mediante Coolify v4**, por lo que el código debe ser ligero, estrictamente tipado, desacoplado y optimizado para contenedores Docker con compilación `standalone`.

---

# Stack Tecnológico Mandatorio:
- **Frontend / Backend**: Next.js 16+ (App Router, Server Actions, Server Components, standalone output).
- **Lenguaje**: TypeScript 5 con tipado estricto end-to-end (sin `any`).
- **Estilos & UI**: Tailwind CSS v4, Lucide React Icons, estética Enterprise Dark (`bg-zinc-950`, `border-zinc-800`, glassmorphism suave).
- **Modales & Diálogos**: Todos los modales desacoplados del DOM mediante **React Portals** (`createPortal(..., document.body)`). Prohibido el uso de `window.confirm` o `window.alert` nativos.
- **Base de Datos**: PostgreSQL 16 nativo (Docker local en desarrollo, recurso PostgreSQL en Coolify en producción).
- **ORM & Migraciones**: Drizzle ORM (`drizzle-orm`, `drizzle-kit`) con esquemas declarativos en `src/db/schema.ts` y migraciones con `drizzle-kit push`.
- **Autenticación & Autorización**: Sistema propio con tokens JWT (`jose`), contraseñas con hash `bcryptjs`, cookies HttpOnly seguras y Middleware/Proxy de Next.js (`src/middleware.ts`) que valida sesiones y roles ([ROLES_DEFINIDOS]).
- **Despliegue en Producción**: VPS Hetzner Cloud administrado con Coolify v4. Dockerfile multi-stage basado en `node:20-alpine` con `output: 'standalone'` en `next.config.ts`.

---

# Módulos Opcionales Activos en este Proyecto:
<!-- Marcar con [X] los que apliquen para este proyecto específico -->
- [ ] **Generador de Documentos / Facturación PDF**: `jspdf` + `jspdf-autotable`.
- [ ] **Criptografía de Secretos / Bóveda**: Cifrado simétrico AES-256 en Node.js `crypto`.
- [ ] **Procesamiento de Imágenes a WebP**: `sharp` con almacenamiento optimizado.
- [ ] **Buscadores y Filtros Reactivos**: Barras de búsqueda en vivo con filtros de categorías/estados integradas en tablas mediante `useMemo`.

---

# Módulos y Lógica de Negocio de este Proyecto:
[DESCRIBIR LOS MÓDULOS ESPECÍFICOS DEL RUBRO AQUÍ: Ej. Turnos, Pacientes, Productos, Ventas, etc.]
