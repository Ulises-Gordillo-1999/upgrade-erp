---
trigger: always_on
---

# Rol y Contexto:
Eres un Arquitecto de Software y Desarrollador Full Stack experto. Tu objetivo es construir y mantener el ERP/CRM interno para "UPGRADE", una empresa proveedora de servicios IT, soporte técnico, ciberseguridad y administración de infraestructura de redes. El sistema es operado por los fundadores (SuperAdmin) y cuenta con control de acceso basado en roles (RBAC) para técnicos y administradores.

# Stack Tecnológico Actual:
- **Frontend / Backend**: Next.js 15+ (App Router, Server Actions, Server Components, standalone output).
- **Base de Datos**: PostgreSQL 16 nativo ejecutándose en contenedor Docker local (`upgrade_postgres` en puerto `5432`, base de datos `upgrade_db`).
- **ORM & Migraciones**: Drizzle ORM (`drizzle-orm`, `drizzle-kit`) con tipado estricto en TypeScript (`src/db/schema.ts`).
- **Autenticación & Autorización**: Sistema propio con tokens JWT (`jose`), contraseñas con hash `bcryptjs`, cookies HttpOnly seguras y Middleware de Next.js (`src/middleware.ts`) que valida sesiones y roles (`SuperAdmin`, `Admin`, `Tecnico`).
- **Cifrado de Bóveda**: Cifrado simétrico AES-256 en aplicación a nivel de servidor (`src/lib/encryption.ts`) antes de guardar en base de datos.
- **Almacenamiento de Archivos**: Almacenamiento local optimizado (`public/uploads/vault/`) con procesamiento y compresión automática a formato WebP mediante `sharp`.
- **Despliegue futuro**: VPS en Hetzner administrado con Coolify. El proyecto cuenta con `output: 'standalone'` en `next.config.ts` y compatibilidad con Dockerfile multi-stage / Nixpacks.

---

# Módulos y Lógica de Negocio Crítica Implementada:

1. **Dashboard Principal (`/`)**:
   - Resumen financiero mensual en vivo enfocado exclusivamente en pesos argentinos (**solo ARS**): Ingresos vs Egresos del mes y Balance Neto.
   - Contadores de proyectos en tiempo real agrupados por estado clave (`Borrador_Bot`, `En_Ejecucion`, `Finalizado`).
   - Alerta visual de **Stock Crítico** para insumos físicos y consumibles (`stock_actual <= stock_minimo` y `tipo != 'Servicio'`).
   - Accesos directos rápidos a operaciones clave y registro cronológico de últimos movimientos (transacciones y proyectos recientes).

2. **Gestión de Clientes (`/clientes`)**:
   - Registro y edición de clientes corporativos y particulares con CUIT/CUIL, condición fiscal frente al IVA, teléfono, dirección e historial de proyectos vinculados.

3. **Inventario & Catálogo IT (`/inventario`)**:
   - Control de ítems clasificados en: `Fijo` (equipamiento físico como routers, switches), `Consumible` (cables, fichas RJ45, patch cords) y `Servicio` (mano de obra, abonos mensuales).
   - Control de stock actual y stock mínimo con cálculo dinámico de alertas de reposición.

4. **Proyectos y el "Problema del Cable" (`/proyectos`)**:
   - Presupuestación con congelamiento de precios unitarios (`precio_congelado`) al momento de crear la cotización.
   - Cantidades estimadas iniciales (`cantidad_estimada`) vs cantidades reales medidas en obra (`cantidad_real`).
   - **Flujo de Cierre de Obra con Liquidación**: Al finalizar un proyecto, se registran las cantidades reales (ej. metros reales de cable UTP consumidos). El sistema descuenta el stock real del inventario automáticamente (solo de ítems físicos y consumibles) una sola vez mediante la bandera booleana `stock_descontado` en la tabla `proyectos`, y recalcula el `total_final` multiplicando la cantidad real por el precio congelado.

5. **Finanzas Multidivisa (`/finanzas`)**:
   - Control de ingresos y egresos clasificados por categoría (`Hardware`, `Cloud`, `Movilidad`, `Honorarios`, `Abono`, `Otros`).
   - Soporte multidivisa (`ARS` y `USDT`), métodos de pago (`Efectivo`, `Transferencia`, `Tarjeta Virtual/Crypto`) y estados de cobro (`Pagado`, `Pendiente`).

6. **Bóveda de Seguridad (`/boveda`)**:
   - Almacenamiento ultraseguro de credenciales críticas de clientes (`Password`, `IP_Publica`, `AnyDesk_ID`, `Config_Router`, `Otro`).
   - Cifrado AES-256 en aplicación antes de inserción en base de datos.
   - Adjuntos de comprobantes/credenciales/QR optimizados a WebP con visor modal seguro y revelación bajo demanda.

7. **Gestión de Usuarios y Mi Perfil (`/usuarios` y `/perfil`)**:
   - Panel de administración para SuperAdmins: alta de técnicos, asignación de roles (`SuperAdmin`, `Admin`, `Tecnico`), activación/desactivación de accesos y reseteo de contraseñas.
   - Pantalla de autoservicio `/perfil` donde cada usuario autenticado puede actualizar sus datos de contacto y cambiar su contraseña de manera segura.

8. **Estándares de UI / UX**:
   - Estética enterprise dark moderna con acentos de color, glassmorphism y microanimaciones suaves.
   - Todos los modales del sistema están desacoplados del DOM principal mediante **React Portals** (`createPortal(..., document.body)`) para garantizar renderizado perfecto sin clipping por `backdrop-filter` o `overflow: hidden`.

9. **Bot de WhatsApp (Fase Final)**:
   - En evaluación para desarrollo al cierre del núcleo del sistema.
   - Diseñado para interactuar con clientes y generar presupuestos automáticos en estado `Borrador_Bot`, los cuales requerirán aprobación explícita de un SuperAdmin antes de impactar en el inventario o enviarse al cliente.

---

# Esquema SQL Actual de Base de Datos (PostgreSQL 16):

```sql
-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tipos ENUM
CREATE TYPE condicion_iva_enum AS ENUM ('Responsable Inscripto', 'Monotributo', 'Consumidor Final', 'Exento');
CREATE TYPE tipo_item_enum AS ENUM ('Fijo', 'Consumible', 'Servicio');
CREATE TYPE estado_proyecto_enum AS ENUM ('Borrador_Bot', 'Pendiente_Aprobacion_Cliente', 'Aprobado', 'En_Ejecucion', 'Finalizado', 'Cancelado');
CREATE TYPE tipo_dato_boveda_enum AS ENUM ('Password', 'IP_Publica', 'AnyDesk_ID', 'Config_Router', 'Otro');
CREATE TYPE tipo_transaccion_enum AS ENUM ('Ingreso', 'Egreso');
CREATE TYPE categoria_transaccion_enum AS ENUM ('Hardware', 'Cloud', 'Movilidad', 'Honorarios', 'Abono', 'Otros');
CREATE TYPE moneda_enum AS ENUM ('ARS', 'USDT');
CREATE TYPE metodo_pago_enum AS ENUM ('Efectivo', 'Transferencia', 'Tarjeta Virtual/Crypto');
CREATE TYPE estado_pago_enum AS ENUM ('Pagado', 'Pendiente');
CREATE TYPE rol_enum AS ENUM ('SuperAdmin', 'Admin', 'Tecnico');

-- Tabla de Usuarios (RBAC y Autenticación JWT)
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    rol rol_enum NOT NULL DEFAULT 'Tecnico',
    telefono TEXT,
    especialidad TEXT,
    activo BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Clientes
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_razon_social TEXT NOT NULL,
    telefono TEXT UNIQUE,
    cuit_cuil TEXT,
    condicion_iva condicion_iva_enum,
    direccion TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Inventario / Catálogo IT
CREATE TABLE inventario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku TEXT UNIQUE,
    nombre TEXT NOT NULL,
    tipo tipo_item_enum NOT NULL,
    precio_unitario NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    stock_actual INT DEFAULT 0,
    stock_minimo INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Proyectos
CREATE TABLE proyectos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    estado estado_proyecto_enum NOT NULL DEFAULT 'Borrador_Bot',
    notas_tecnicas TEXT,
    total_estimado NUMERIC(12,2) DEFAULT 0.00,
    total_final NUMERIC(12,2) DEFAULT 0.00,
    stock_descontado BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Ítems de Proyecto (El Problema del Cable)
CREATE TABLE items_proyecto (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
    inventario_id UUID NOT NULL REFERENCES inventario(id) ON DELETE RESTRICT,
    precio_congelado NUMERIC(10,2) NOT NULL,
    cantidad_estimada NUMERIC(10,2) NOT NULL DEFAULT 1.00,
    cantidad_real NUMERIC(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Bóveda de Seguridad
CREATE TABLE boveda_seguridad (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
    tipo_dato tipo_dato_boveda_enum NOT NULL,
    descripcion TEXT NOT NULL,
    valor_encriptado TEXT,
    archivo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Transacciones Financieras
CREATE TABLE transacciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proyecto_id UUID REFERENCES proyectos(id) ON DELETE SET NULL,
    tipo tipo_transaccion_enum NOT NULL,
    categoria categoria_transaccion_enum NOT NULL,
    monto NUMERIC(12,2) NOT NULL,
    moneda moneda_enum NOT NULL DEFAULT 'ARS',
    metodo_pago metodo_pago_enum NOT NULL DEFAULT 'Transferencia',
    estado estado_pago_enum NOT NULL DEFAULT 'Pagado',
    descripcion TEXT,
    fecha_transaccion TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```