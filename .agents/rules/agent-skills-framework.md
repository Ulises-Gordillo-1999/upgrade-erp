# Protocolo y Marco de Trabajo con Agent Skills (UPGRADE ERP & Template Coolify)

El proyecto cuenta con un ecosistema integral de **Agent Skills** instalado en `.agents/skills/` y respaldado por referencias técnicas en `.agents/references/`. Todas las tareas de desarrollo, refactorización, revisión y mantenimiento deben regirse bajo los lineamientos de estas habilidades de ingeniería.

---

## 1. Meta-Skill Central: `using-agent-skills`
Ante cualquier requerimiento, se debe consultar primero la meta-skill [using-agent-skills](file:///.agents/skills/using-agent-skills/SKILL.md) para identificar la fase del ciclo de vida del software y ejecutar las skills correspondientes:

1. **Definición y Clarificación**:
   - `interview-me`: Entrevistar al usuario pregunta a pregunta cuando un requerimiento sea ambiguo antes de escribir código.
   - `idea-refine`: Refinar ideas divergentes y convergentes antes de comprometer una solución técnica.
   - `spec-driven-development`: Redactar especificaciones y criterios de aceptación antes de programar features complejas.
   - `constraint-driven-development`: Asegurar que se respetan los límites de calidad y umbrales definidos en `CONSTRAINTS.md`.

2. **Planificación y Arquitectura**:
   - `planning-and-task-breakdown`: Descomponer tareas grandes en rebanadas pequeñas, ordenadas y verificables.
   - `new-app-scaffolding`: Estructura base, blueprint y dependencias recomendadas para aplicaciones en Hetzner VPS con Coolify.
   - `context-engineering`: Seleccionar y cargar el contexto mínimo indispensable para cada tarea sin saturar la ventana de contexto.
   - `api-and-interface-design`: Diseñar contratos de tipos (`TypeScript`), Server Actions y endpoints limpios y estables.

3. **Construcción e Implementación**:
   - `incremental-implementation`: Desarrollar en rebanadas verticales delgadas, verificando cada paso antes del siguiente.
   - `source-driven-development`: Validar sintaxis y prácticas contra la documentación oficial (Next.js 15+ App Router, React 19, Drizzle ORM, Tailwind 4).
   - `frontend-ui-engineering`: Construir interfaces Enterprise Dark accesibles, responsivas, con microinteracciones y modales desacoplados vía React Portals (`createPortal(..., document.body)`).
   - `responsive-design`: Estándar Mobile-First, vistas híbridas tarjeta-a-tabla (`md:`), touch targets $\ge 44\text{px}$, prevención de auto-zoom en iOS (inputs $\ge 16\text{px}$) y cajones deslizantes (Drawers).
   - `theme-mode-system`: Arquitectura de temas Claro, Oscuro y Sistema sin parpadeo (script síncrono anti-flicker en `<head>`) con persistencia en `localStorage`.
   - `pwa-web-app-manifest`: Configuración nativa de PWA (Web App Manifest en `src/app/manifest.ts`, Service Worker resiliente en `public/sw.js`, instalación condicional y modo standalone).
   - `doubt-driven-development`: Someter decisiones críticas o de alto riesgo (ej. autenticación, cifrado AES-256 en bóveda, liquidación de stock) a revisión adversarial.

4. **Verificación y Calidad**:
   - `test-driven-development`: Ciclo red-green-refactor cuando aplique.
   - `browser-testing-with-devtools`: Pruebas y diagnósticos de runtime en el navegador (DOM, consola, red).
   - `debugging-and-error-recovery`: Diagnóstico metódico de causa raíz (Reproducir -> Aislar -> Corregir -> Proteger).
   - `code-review-and-quality`: Revisión multifactorial previa al merge.
   - `code-simplification`: Reducir complejidad innecesaria sin alterar la funcionalidad.
   - `performance-optimization`: Optimizar consultas SQL Drizzle, bundle size, compresión WebP y tiempos de carga.

5. **Seguridad y Bóveda (Crítico)**:
   - `security-and-hardening`: Prevención OWASP, validación de inputs, autorización RBAC (`SuperAdmin`, `Admin`, `Tecnico`).
   - `env-security-protocol`: **Tolerancia cero** a exposición de variables de entorno de producción, claves de cifrado simétrico AES-256 o secretos en commits y código fuente.

6. **Entrega, Versionado y Operaciones**:
   - `git-workflow-and-versioning`: Commits atómicos con Conventional Commits (`feat:`, `fix:`, `chore:`, etc.).
   - `semver-version-control`: Auditoría y cálculo de incremento de versión SemVer (`npm run version:patch / minor / major`).
   - `ci-cd-and-automation`: Pipelines de integración y despliegue continuo con Coolify / Docker.
   - `deprecation-and-migration`: Retiro ordenado de código viejo y migraciones de esquemas SQL sin downtime.
   - `documentation-and-adrs`: Documentar decisiones de arquitectura y cambios relevantes.
   - `observability-and-instrumentation`: Registro de logs estructurados y métricas de auditoría.
   - `shipping-and-launch`: Checklist previa a despliegue en VPS Hetzner / Coolify y plan de contingencia.

---

## 2. Comportamientos Fundamentales Innegociables
- **Hacer explícitas las asunciones**: Comunicar cualquier suposición previa sobre requerimientos o arquitectura.
- **Gestionar activamente la confusión**: Detenerse y consultar ante inconsistencias en vez de asumir en silencio.
- **Defender la simplicidad**: Priorizar soluciones directas, legibles y mantenibles sobre abstracciones prematuras.
- **Disciplina de alcance**: Tocar únicamente los archivos y módulos vinculados a la tarea encomendada.
- **Verificación obligatoria (Definition of Done)**: Ninguna tarea se considera terminada sin superar el estándar del proyecto (`.agents/references/definition-of-done.md`).
