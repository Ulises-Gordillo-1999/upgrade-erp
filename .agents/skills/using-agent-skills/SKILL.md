---
name: using-agent-skills
description: Descubre, selecciona y orquesta las habilidades de ingeniería (Agent Skills). Utilízala al iniciar cualquier sesión o tarea para determinar qué flujo de trabajo, estándar o proceso aplica a la fase actual del ciclo de vida del software. Esta es la meta-skill central que rige la activación de todas las demás.
---

# Orquestación Central: Agent Skills Framework

## Visión General

**Agent Skills** es un ecosistema integral de habilidades de ingeniería de software organizadas por fases del ciclo de vida del desarrollo. Cada skill codifica un proceso riguroso y sistemático seguido por ingenieros senior. Esta meta-skill te guía para identificar y aplicar la habilidad adecuada ante cada requerimiento del usuario.

---

## 🗺️ Mapa de Descubrimiento de Habilidades

Cuando llegue una solicitud o tarea, identifica la fase y aplica la skill correspondiente:

```
Requerimiento / Tarea
    │
    ├── ¿Requerimiento ambiguo o vago? ─────────────────→ interview-me
    ├── ¿Idea conceptual que necesita variantes/stress? ─→ idea-refine
    ├── ¿Nueva funcionalidad, módulo o cambio grande? ──→ spec-driven-development
    ├── ¿Sin estándares de calidad definidos? ───────────→ constraint-driven-development
    ├── ¿Nueva aplicación web desde cero (Hetzner)? ────→ new-app-scaffolding
    ├── ¿Existe especificación y se requieren tareas? ──→ planning-and-task-breakdown
    ├── ¿Implementando código? ──────────────────────────→ incremental-implementation
    │   ├── ¿Interfaz de usuario (UI / UX)? ─────────────→ frontend-ui-engineering
    │   ├── ¿Diseño responsivo / Mobile-First / Drawer? → responsive-design
    │   ├── ¿Soporte PWA / Web App Manifest / Offline? ─→ pwa-web-app-manifest
    │   ├── ¿Temas Claro / Oscuro / Sistema? ───────────→ theme-mode-system
    │   ├── ¿Diseño de APIs, tipos o Server Actions? ────→ api-and-interface-design
    │   ├── ¿Optimizar contexto y tokens? ───────────────→ context-engineering
    │   ├── ¿Verificar contra documentación oficial? ────→ source-driven-development
    │   └── ¿Decisión crítica o arquitectura de riesgo? ─→ doubt-driven-development
    ├── ¿Escribiendo o ejecutando pruebas? ──────────────→ test-driven-development
    │   └── ¿Pruebas en runtime de navegador (DOM/Red)? → browser-testing-with-devtools
    ├── ¿Algo falló o hay un bug en producción? ─────────→ debugging-and-error-recovery
    ├── ¿Revisión de código antes de merge? ─────────────→ code-review-and-quality
    │   ├── ¿Código sobrecomplicado? ───────────────────→ code-simplification
    │   ├── ¿Vulnerabilidades o permisos? ──────────────→ security-and-hardening
    │   ├── ¿Variables de entorno y secretos? ──────────→ env-security-protocol
    │   └── ¿Lentitud, queries SQL o bundle pesado? ─────→ performance-optimization
    ├── ¿Commits, ramas o releases? ─────────────────────→ git-workflow-and-versioning
    │   └── ¿Incremento de versión SemVer? ──────────────→ semver-version-control
    ├── ¿Pipeline de CI/CD, Docker o Coolify? ───────────→ ci-cd-and-automation
    ├── ¿Retiro de código viejo o migración de BD? ──────→ deprecation-and-migration
    ├── ¿Documentar decisiones técnicas (ADRs)? ─────────→ documentation-and-adrs
    ├── ¿Logs estructurados, métricas o telemetría? ────→ observability-and-instrumentation
    └── ¿Despliegue a producción y contingencia? ────────→ shipping-and-launch
```

---

## ⚡ Comportamientos Fundamentales Innegociables

Estos principios aplican en todo momento y bajo cualquier circunstancia:

### 1. Hacer Explícitas las Asunciones
Antes de programar cualquier solución no trivial, declara formalmente tus asunciones:
```
ASUNCIONES ASUMIDAS:
1. [Asunción sobre requerimientos]
2. [Asunción sobre arquitectura o compatibilidad]
3. [Asunción sobre alcance y límites]
→ Corrige estas asunciones ahora o procederé con base en ellas.
```
Nunca asumas requerimientos ambiguos en silencio. Aclarar dudas al inicio cuesta minutos; corregir código mal asumido cuesta horas.

### 2. Gestionar la Confusión Activamente
Si encuentras discrepancias entre especificaciones, código previo o dependencias:
1. **DETENTE.** No sigas programando por intuición.
2. Nombra con precisión la incongruencia técnica.
3. Plantea las alternativas o preguntas concretas.
4. Espera confirmación antes de modificar el código.

### 3. Defender la Simplicidad
La tendencia natural es sobrecomplicar. Resístela activamente:
- ¿Se puede resolver esto con menos código y menos dependencias?
- ¿Estas abstracciones realmente aportan valor o son complejidad prematura?
- Prefiere la solución directa, legible y mantenible sobre el truco ingenioso.

### 4. Disciplina Quirúrgica de Alcance
Toca **únicamente** los archivos y líneas pertinentes al requerimiento encomendado:
- Prohibido borrar comentarios o documentación técnica sin justificación.
- Prohibido hacer refactorizaciones masivas no solicitadas.
- Prohibido alterar estilos o módulos adyacentes fuera del alcance.

### 5. Verificación Obligatoria (Definition of Done)
Ninguna tarea se considera finalizada sin evidencia de verificación:
- Compilación de TypeScript limpia (`tsc --noEmit`).
- Pruebas o diagnósticos de runtime sin errores.
- Verificación visual y funcional en el entorno correspondiente.

---

## 🔄 Secuencia Típica del Ciclo de Vida

Para construir una nueva característica completa, la secuencia recomendada es:

1. **`interview-me`** → Extraer los requerimientos reales del usuario pregunta a pregunta.
2. **`idea-refine`** → Refinar la idea mediante pensamiento divergente y convergente.
3. **`spec-driven-development`** → Redactar la especificación y criterios de aceptación.
4. **`planning-and-task-breakdown`** → Descomponer en tareas pequeñas y ordenadas.
5. **`context-engineering`** → Cargar únicamente los archivos necesarios.
6. **`source-driven-development`** → Contrastar APIs contra documentación oficial.
7. **`incremental-implementation`** → Desarrollar en rebanadas verticales delgadas.
   - Complementar con `responsive-design`, `pwa-web-app-manifest` o `frontend-ui-engineering` según aplique.
8. **`doubt-driven-development`** → Someter decisiones críticas a revisión adversarial.
9. **`test-driven-development`** / **`browser-testing-with-devtools`** → Probar y validar funcionamiento.
10. **`code-review-and-quality`** → Revisión multifactorial previa al merge.
11. **`code-simplification`** → Reducir código redundante sin romper comportamiento.
12. **`git-workflow-and-versioning`** & **`semver-version-control`** → Commits atómicos y versión SemVer.
13. **`shipping-and-launch`** → Checklist previa a despliegue en Hetzner / Coolify.

---

## 📚 Catálogo Rápido de Skills

| Fase | Skill | Propósito Central |
| :--- | :--- | :--- |
| **Definir** | `interview-me` | Entrevistar al usuario pregunta por pregunta ante ideas no maduras |
| **Definir** | `idea-refine` | Explorar variantes y convergencia conceptual de una idea |
| **Definir** | `spec-driven-development` | Criterios de aceptación y especificaciones formales previas a programar |
| **Definir** | `constraint-driven-development` | Establecer y blindar umbrales de calidad innegociables (`CONSTRAINTS.md`) |
| **Planificar** | `planning-and-task-breakdown` | Descomponer épicas o tareas complejas en pasos pequeños y verificables |
| **Planificar** | `new-app-scaffolding` | Arquitectura y protocolo de arranque para apps en Hetzner + Coolify |
| **Construir** | `incremental-implementation` | Entrega en rebanadas delgadas verificando cada paso antes del siguiente |
| **Construir** | `source-driven-development` | Código respaldado en fuentes oficiales sin patrones obsoletos |
| **Construir** | `context-engineering` | Optimizar ventana de contexto cargando solo información de alto valor |
| **Construir** | `frontend-ui-engineering` | Interfaces web accesibles, Enterprise Dark y con animaciones fluidas |
| **Construir** | `responsive-design` | Estándar Mobile-First, vistas híbridas tarjetas/tablas y ergonomía táctil |
| **Construir** | `theme-mode-system` | Soporte de temas Claro, Oscuro y Sistema sin destello inicial (anti-flicker) |
| **Construir** | `pwa-web-app-manifest` | Transformación en PWA instalable en móvil/escritorio con Service Worker |
| **Construir** | `api-and-interface-design` | Contratos de tipos y límites estables entre frontend y backend |
| **Construir** | `doubt-driven-development` | Revisión adversarial rigurosa ante decisiones de alto riesgo |
| **Verificar** | `test-driven-development` | Ciclo red-green-refactor para garantizar corrección |
| **Verificar** | `browser-testing-with-devtools` | Automatización e inspección en navegadores reales vía DevTools MCP |
| **Verificar** | `debugging-and-error-recovery` | Diagnóstico metódico de causa raíz (reproducir, aislar, corregir, blindar) |
| **Revisar** | `code-review-and-quality` | Auditoría multifactorial de calidad antes de fusionar cambios |
| **Revisar** | `code-simplification` | Reducción de complejidad y anidación sin alterar funcionalidad |
| **Seguridad** | `security-and-hardening` | Mitigación OWASP, validación estricta y menor privilegio |
| **Seguridad** | `env-security-protocol` | Tolerancia cero a credenciales o secretos en código o commits Git |
| **Rendimiento**| `performance-optimization` | Optimización de consultas SQL Drizzle, carga de bundle y Core Web Vitals |
| **Entrega** | `git-workflow-and-versioning` | Flujo Git profesional con Conventional Commits y ramas limpias |
| **Entrega** | `semver-version-control` | Auditoría, cálculo y actualización automática de versiones SemVer |
| **Entrega** | `ci-cd-and-automation` | Configuración de calidad automatizada en pipelines y contenedores |
| **Entrega** | `deprecation-and-migration` | Sunset ordenado de funciones y migraciones de esquema sin downtime |
| **Entrega** | `documentation-and-adrs` | Registro de decisiones arquitectónicas y documentación duradera |
| **Operaciones**| `observability-and-instrumentation` | Instrumentación de métricas RED, logs estructurados y alertas |
| **Operaciones**| `shipping-and-launch` | Checklist pre-despliegue en VPS Hetzner y plan de contingencia |
