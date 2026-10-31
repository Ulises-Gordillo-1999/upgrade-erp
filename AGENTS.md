<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# UPGRADE ERP - Agent Framework & Engineering Skills

Este proyecto cuenta con un ecosistema completo de **Agent Skills** ubicado en `.agents/skills/` y respaldado por referencias técnicas en `.agents/references/`.

- **Contexto y Dominio**: Consulta `.agents/rules/upgrade-contexto-prompt-maestro.md` para reglas de negocio (PostgreSQL 16, Drizzle, Next.js 15, RBAC, Bóveda AES-256, El Problema del Cable, Finanzas ARS/USDT).
- **Flujo de Trabajo y Habilidades**: Consulta `.agents/rules/agent-skills-framework.md` y la meta-skill `.agents/skills/using-agent-skills/SKILL.md` para orquestar cada tarea según su fase (definición, arquitectura, implementación incremental, pruebas, revisión de código, seguridad y despliegue).
- **PWA & Manifest**: Consulta `.agents/skills/pwa-web-app-manifest/SKILL.md` para arquitectura Progressive Web App instalable.
- **Diseño Responsivo**: Consulta `.agents/skills/responsive-design/SKILL.md` para diseño mobile-first y ergonomía táctil.
- **Sistema de Temas**: Consulta `.agents/skills/theme-mode-system/SKILL.md` para Claro/Oscuro/Sistema sin parpadeo.
- **Seguridad**: Respetar estrictamente `.agents/skills/env-security-protocol/SKILL.md` (cero credenciales o secretos en código).
- **Versionado**: Seguir SemVer con `.agents/skills/semver-version-control/SKILL.md` y scripts `npm run version:*`.


