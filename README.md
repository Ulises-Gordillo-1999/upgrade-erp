# UPGRADE ERP/CRM 🚀

Sistema integral de gestión empresarial y operativa desarrollado a medida para **UPGRADE**, empresa proveedora de servicios IT, soporte técnico, ciberseguridad e infraestructura de redes.

[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45.4-C5F74F?style=for-the-badge&logo=drizzle)](https://orm.drizzle.team/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Standalone_Container-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

---

## 📌 Tabla de Contenidos

1. [Descripción General](#-descripción-general)
2. [Módulos Principales](#-módulos-principales)
3. [Stack Tecnológico](#-stack-tecnológico)
4. [Estructura del Proyecto](#-estructura-del-proyecto)
5. [Requisitos Previos](#-requisitos-previos)
6. [Instalación y Puesta en Marcha Local](#-instalación-y-puesta-en-marcha-local)
7. [Variables de Entorno](#-variables-de-entorno)
8. [Scripts Disponibles](#-scripts-disponibles)
9. [Despliegue en Producción](#-despliegue-en-producción)
10. [Seguridad y Privacidad](#-seguridad-y-privacidad)

---

## 📖 Descripción General

El ERP/CRM de **UPGRADE** centraliza todo el flujo operativo de la empresa: desde la prospección y presupuestación de obras de redes y soporte, hasta la liquidación final de insumos consumidos en campo, custodia de credenciales críticas bajo cifrado AES-256 y control financiero en moneda nacional y criptoactivos.

El sistema fue diseñado con una interfaz moderna y futurista (*Enterprise Dark Mode*, *Glassmorphism* y microanimaciones suaves) que garantiza rendimiento de alta velocidad mediante el **App Router de Next.js**, **Server Components**, **Server Actions** y un esquema fuertemente tipado en **TypeScript** con **Drizzle ORM**.

---

## 🧩 Módulos Principales

### 1. 📊 Dashboard Ejecutivo (`/`)
* **KPIs Financieros del Mes**: Ingresos, Egresos y Balance Neto en pesos argentinos (ARS).
* **Estado de Obras**: Contadores en vivo de proyectos en estado `Borrador_Bot`, `En_Ejecucion` y `Finalizado`.
* **Monitor de Stock Crítico**: Alertas dinámicas automáticas de insumos y consumibles físicos cuando `stock_actual <= stock_minimo`.
* **Accesos Directos y Feed de Actividad**: Últimos movimientos y transacciones registradas.

### 2. 👥 Gestión de Clientes (`/clientes`)
* Registro, edición y eliminación de clientes corporativos y particulares.
* Control de CUIT/CUIL, teléfono, domicilio, condición tributaria frente al IVA e historial de proyectos asociados.

### 3. 📦 Inventario & Catálogo IT (`/inventario`)
* Categorización de ítems en tres familias:
  * **Fijo**: Equipamiento de infraestructura (Routers MikroTik, Switches, NVR, Access Points).
  * **Consumible**: Insumos métricos o por unidad (Cables UTP Cat5e/Cat6, fichas RJ45, patch cords, precintos).
  * **Servicio**: Mano de obra técnica, configuración de enlace o abonos mensuales de soporte.
* Precios unitarios de referencia y monitoreo de niveles de stock.

### 4. 🛠️ Proyectos y "El Problema del Cable" (`/proyectos`)
* **Congelamiento de Precios**: Los ítems agregados a una cotización congelan su precio unitario al momento del presupuesto para proteger ante fluctuaciones de costos.
* **Estimado vs. Real**: Manejo dual de `cantidad_estimada` (para cotización al cliente) y `cantidad_real` (medida físicamente en obra).
* **Cierre de Obra Automatizado**: Al finalizar el proyecto, el sistema descuenta del inventario únicamente los consumibles físicos reales utilizados, marca el flag `stock_descontado = true` para evitar dobles deducciones y recalcula el `total_final`.

### 5. 📄 Generador de Presupuestos Oficiales en PDF
* Generación de presupuestos corporativos con diseño de alta fidelidad desde el navegador (`jspdf` + `jspdf-autotable`).
* Incluye código de cotización (`COT-XXXXXX`), validez de la oferta, datos fiscales del cliente, desglose de materiales vs. mano de obra, términos de garantía y bloques de firma de conformidad.

### 6. 🔐 Bóveda de Seguridad Criptográfica (`/boveda`)
* Almacén de alta seguridad para credenciales de acceso a infraestructura de clientes (`Password`, `IP_Publica`, `AnyDesk_ID`, `Config_Router`, `Otro`).
* **Cifrado Simétrico AES-256**: Los secretos se cifran en la capa de servidor antes de almacenarse en la base de datos PostgreSQL.
* Visualización segura de contraseñas bajo demanda con máscara oculta y comprobantes fotográficos optimizados a formato WebP mediante `sharp`.

### 7. 💵 Finanzas Multidivisa (`/finanzas`)
* Control de transacciones con clasificación por categoría (`Hardware`, `Cloud`, `Movilidad`, `Honorarios`, `Abono`, `Otros`).
* Soporte para múltiples divisas (`ARS` y `USDT`), métodos de pago (`Efectivo`, `Transferencia`, `Tarjeta Virtual/Crypto`) y estados de cobro (`Pagado`, `Pendiente`).

### 8. 🛡️ Usuarios, Control de Acceso (RBAC) y Mi Perfil (`/usuarios` y `/perfil`)
* Autenticación con tokens JWT cifrados (`jose`), cookies `HttpOnly` y middleware de protección de rutas.
* Tres niveles de privilegios:
  * **SuperAdmin**: Control total, gestión de usuarios, reseteo de claves y ajustes del sistema.
  * **Admin**: Gestión operativa de clientes, proyectos, inventario y finanzas.
  * **Tecnico**: Visualización de proyectos asignados, carga de notas y consulta de inventario.
* Autoservicio en `/perfil` para actualización de datos personales y cambio seguro de contraseña.

---

## 💻 Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Framework Full Stack** | [Next.js 16 (App Router)](https://nextjs.org/) con React 19 y Turbopack |
| **Lenguaje** | [TypeScript 5](https://www.typescriptlang.org/) (Tipado estricto end-to-end) |
| **Base de Datos** | [PostgreSQL 16](https://www.postgresql.org/) en contenedor Docker |
| **ORM & Migraciones** | [Drizzle ORM](https://orm.drizzle.team/) & Drizzle Kit |
| **Estilos & UI** | [Tailwind CSS v4](https://tailwindcss.com/) + Lucide Icons + React Portals |
| **Autenticación** | JWT con [jose](https://github.com/panva/jose) + Hashing con [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| **Criptografía** | AES-256 nativo de Node.js `crypto` |
| **PDF Engine** | [jsPDF](https://github.com/parallax/jsPDF) & [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) |
| **Procesamiento de Imágenes** | [sharp](https://sharp.pixelplumbing.com/) (Compresión y conversión WebP) |
| **Contenerización** | Dockerfile multi-stage con output `standalone` de Next.js |
| **Despliegue & Orquestación** | Coolify v4 + Traefik en VPS Hetzner Cloud con Cloudflare DNS |

---

## 📁 Estructura del Proyecto

```text
upgrade-erp/
├── docs/                        # Manuales y documentación local (excluidos de git por seguridad)
├── public/                      # Assets estáticos y carpeta de uploads para la bóveda
│   └── uploads/
├── src/
│   ├── app/                     # Rutas y páginas de Next.js App Router
│   │   ├── actions/             # Server Actions (clientes, inventario, proyectos, finanzas, bóveda, usuarios)
│   │   ├── api/                 # Endpoints API (servido seguro de imágenes de la bóveda)
│   │   ├── boveda/              # Módulo de Bóveda de contraseñas y credenciales
│   │   ├── clientes/            # Módulo de Clientes
│   │   ├── finanzas/            # Módulo de Finanzas y balances
│   │   ├── inventario/          # Módulo de Inventario y catálogo
│   │   ├── login/               # Portal de autenticación
│   │   ├── perfil/              # Autoservicio de perfil de usuario
│   │   ├── proyectos/           # Módulo de Proyectos, Obras y Presupuestos
│   │   ├── usuarios/            # Administración RBAC de usuarios
│   │   ├── layout.tsx           # Layout principal y envoltorios de interfaz
│   │   └── page.tsx             # Dashboard principal con métricas en tiempo real
│   ├── components/              # Componentes de interfaz reutilizables
│   │   ├── boveda/
│   │   ├── clientes/
│   │   ├── finanzas/
│   │   ├── inventario/
│   │   ├── proyectos/
│   │   ├── ui/
│   │   └── usuarios/
│   ├── db/                      # Configuración de base de datos y esquema
│   │   ├── index.ts             # Cliente de conexión PostgreSQL con Drizzle
│   │   └── schema.ts            # Esquema formal DDL (tablas, relaciones y ENUMs)
│   ├── lib/                     # Utilidades del servidor (auth, tokens, cifrado AES-256)
│   │   ├── auth.ts
│   │   ├── encryption.ts
│   │   └── utils.ts
│   ├── middleware.ts            # Middleware de validación de sesión y control de acceso
│   └── types/                   # Definiciones globales de tipos TypeScript
├── .dockerignore
├── .env.example                 # Plantilla de variables de entorno seguras
├── .gitignore
├── Dockerfile                   # Dockerfile optimizado multi-stage para producción
├── drizzle.config.ts            # Configuración de Drizzle Kit
├── next.config.ts               # Configuración de Next.js (output standalone)
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚙️ Requisitos Previos

* **Node.js**: Versión `20.x` o superior.
* **npm**: Versión `10.x` o superior.
* **Docker & Docker Compose**: Para ejecutar el contenedor de PostgreSQL 16 local o en producción.

---

## 🚀 Instalación y Puesta en Marcha Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/Ulises-Gordillo-1999/upgrade-erp.git
cd upgrade-erp
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar PostgreSQL 16 con Docker
Si no tienes una base de datos local instalada, puedes levantar una con Docker:
```bash
docker run -d \
  --name upgrade_postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=upgrade_db \
  -p 5432:5432 \
  postgres:16-alpine
```

### 4. Configurar variables de entorno
Crea tu archivo `.env.local` a partir de `.env.example`:
```bash
cp .env.example .env.local
```

### 5. Sincronizar el esquema de la base de datos
Aplica el esquema y los tipos ENUM en PostgreSQL mediante Drizzle Kit:
```bash
npm run db:push
```

### 6. Ejecutar en modo desarrollo
```bash
npm run dev
```

Abre tu navegador en [http://localhost:3000](http://localhost:3000). Al ingresar por primera vez, el sistema inicializa automáticamente las credenciales de administrador por defecto si la base está vacía.

---

## 🔑 Variables de Entorno

Configura las siguientes variables en `.env.local` (desarrollo) o en tu panel de despliegue (producción):

| Variable | Descripción | Ejemplo / Formato |
| :--- | :--- | :--- |
| `DATABASE_URL` | Cadena de conexión interna a PostgreSQL 16 | `postgresql://usuario:password@host:5432/upgrade_db` |
| `ENCRYPTION_KEY` | Clave simétrica de 32 bytes (base64) para AES-256 | Generar con `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | URL base accesible por el cliente | `http://localhost:3000` o `https://erp.tu-dominio.com` |

> ⚠️ **Importante**: Nunca agregues credenciales de producción ni claves privadas a archivos rastreados por Git. Utiliza siempre `.env.local` o el administrador de secretos de tu orquestador.

---

## 🛠️ Scripts Disponibles

* `npm run dev`: Inicia el servidor de desarrollo local con Turbopack.
* `npm run build`: Compila la aplicación para producción en modo standalone.
* `npm run start`: Inicia el servidor Node.js de producción optimizado.
* `npm run lint`: Ejecuta el linter ESLint para análisis estático del código.
* `npm run db:push`: Aplica cambios del esquema TypeScript (`src/db/schema.ts`) directamente a PostgreSQL.
* `npm run db:studio`: Abre la interfaz gráfica web de Drizzle Studio para explorar la base de datos.

---

## 🚢 Despliegue en Producción

El proyecto incluye un [Dockerfile](file:///c:/Users/Ulises/Documents/PROYECTOS/UPGRADE/Dockerfile) multi-stage optimizado para generar imágenes ultralivianas basadas en **Alpine Linux**, diseñado especialmente para plataformas como **Coolify**, **Docker Compose** o entornos VPS en **Hetzner Cloud**:

1. **Standalone Output**: Next.js genera un bundle autónomo con únicamente las dependencias necesarias en `/app/.next/standalone`.
2. **Volumen Persistente de Bóveda**: Debe mapearse un volumen para `/app/uploads` para preservar comprobantes e imágenes entre reconstrucciones de contenedores.
3. **Proxy Inverso & SSL**: Compatible con Traefik, Nginx o Caddy para terminación TLS/SSL automática.

---

## 🔒 Seguridad y Privacidad

* **Protección de Datos en Reposo**: Todos los secretos de clientes se cifran antes de ingresar a la base de datos con AES-256-CBC/GCM.
* **Sesiones Seguras**: Cookies HTTP-only con banderas `SameSite` y validación estricta de tokens firmados.
* **Aislamiento de Modales**: Todos los modales del sistema se montan vía React Portals en `document.body` evitando problemas de visualización y filtración de estilos.
* **Archivos Sensibles Protegidos**: Manuales de infraestructura con contraseñas operativas y capturas de panel están protegidos y excluidos del repositorio público.

---

<p align="center">
  Desarrollado con dedicación para <b>UPGRADE Soluciones IT</b> 🇦🇷
</p>
