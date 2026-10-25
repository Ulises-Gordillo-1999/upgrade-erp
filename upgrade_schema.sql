-- ==============================================================================
-- UPGRADE ERP/CRM - Esquema SQL Oficial de Producción (PostgreSQL 16)
-- ==============================================================================

-- 1. Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Creación de Tipos ENUM
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

-- 3. Tabla de Usuarios (RBAC y Autenticación JWT)
CREATE TABLE IF NOT EXISTS usuarios (
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

-- 4. Tabla de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_razon_social TEXT NOT NULL,
    telefono TEXT UNIQUE,
    cuit_cuil TEXT,
    condicion_iva condicion_iva_enum,
    direccion TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de Categorías de Inventario
CREATE TABLE IF NOT EXISTS categorias_inventario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL UNIQUE,
    tipo_asociado TEXT NOT NULL DEFAULT 'Producto',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabla de Inventario / Catálogo IT
CREATE TABLE IF NOT EXISTS inventario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku TEXT UNIQUE,
    nombre TEXT NOT NULL,
    tipo tipo_item_enum NOT NULL,
    categoria TEXT,
    precio_unitario NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    stock_actual INT DEFAULT 0,
    stock_minimo INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabla de Proyectos (Problema del Cable)
CREATE TABLE IF NOT EXISTS proyectos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    estado estado_proyecto_enum NOT NULL DEFAULT 'Borrador_Bot',
    notas_tecnicas TEXT,
    total_estimado NUMERIC(12,2) DEFAULT 0.00,
    total_final NUMERIC(12,2) DEFAULT 0.00,
    stock_descontado BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabla de Ítems de Proyecto (Estimado vs Real)
CREATE TABLE IF NOT EXISTS items_proyecto (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
    inventario_id UUID NOT NULL REFERENCES inventario(id) ON DELETE RESTRICT,
    precio_congelado NUMERIC(10,2) NOT NULL,
    cantidad_estimada NUMERIC(10,2) NOT NULL DEFAULT 1.00,
    cantidad_real NUMERIC(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabla de Tipos de Credencial de Bóveda
CREATE TABLE IF NOT EXISTS tipos_credencial_boveda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tabla de Bóveda de Seguridad (Cifrado AES-256)
CREATE TABLE IF NOT EXISTS boveda_seguridad (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
    tipo_dato TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    valor_encriptado TEXT,
    archivo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tabla de Transacciones Financieras
CREATE TABLE IF NOT EXISTS transacciones (
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
