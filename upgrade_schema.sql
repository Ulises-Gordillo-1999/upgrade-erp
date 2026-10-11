-- ==========================================
-- Esquema de Base de Datos para UPGRADE (Supabase / PostgreSQL)
-- ==========================================

-- 1. Habilitar extensión para generar UUIDs nativos de Postgres
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Creación de Tipos ENUM para estandarizar datos
CREATE TYPE condicion_iva_enum AS ENUM ('Responsable Inscripto', 'Monotributo', 'Consumidor Final', 'Exento');
CREATE TYPE tipo_item_enum AS ENUM ('Fijo', 'Consumible', 'Servicio');
CREATE TYPE estado_proyecto_enum AS ENUM ('Borrador_Bot', 'Pendiente_Aprobacion_Cliente', 'Aprobado', 'En_Ejecucion', 'Finalizado', 'Cancelado');
CREATE TYPE tipo_dato_boveda_enum AS ENUM ('Password', 'IP_Publica', 'AnyDesk_ID', 'Config_Router', 'Otro');
CREATE TYPE tipo_transaccion_enum AS ENUM ('Ingreso', 'Egreso');

-- 3. Creación de Tablas

CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_razon_social TEXT NOT NULL,
    telefono TEXT UNIQUE, -- Útil para identificar al cliente desde el bot de WhatsApp
    cuit_cuil TEXT,
    condicion_iva condicion_iva_enum,
    direccion TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inventario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku TEXT UNIQUE,
    nombre TEXT NOT NULL,
    tipo tipo_item_enum NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    stock_actual INT DEFAULT 0,
    stock_minimo INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE proyectos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID REFERENCES clientes(id) ON DELETE RESTRICT,
    estado estado_proyecto_enum DEFAULT 'Borrador_Bot',
    notas_tecnicas TEXT,
    total_estimado DECIMAL(12,2) DEFAULT 0.00,
    total_final DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE items_proyecto (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE,
    inventario_id UUID REFERENCES inventario(id) ON DELETE RESTRICT,
    precio_congelado DECIMAL(10,2) NOT NULL,
    cantidad_estimada DECIMAL(10,2) NOT NULL DEFAULT 1,
    cantidad_real DECIMAL(10,2), -- Se llena al finalizar (ej. metros reales de cable)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE boveda_seguridad (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE,
    tipo_dato tipo_dato_boveda_enum NOT NULL,
    descripcion TEXT NOT NULL,
    valor_encriptado TEXT,
    archivo_url TEXT, -- Para URLs de fotos de QR o números de serie en Supabase Storage
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transacciones_financieras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proyecto_id UUID REFERENCES proyectos(id) ON DELETE SET NULL, -- Si se borra el proyecto, el registro financiero queda
    tipo tipo_transaccion_enum NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    concepto TEXT NOT NULL,
    fecha TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Seguridad de Nivel de Fila (RLS - Row Level Security)
-- Habilitamos RLS en todas las tablas por defecto para blindar la arquitectura desde el inicio
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE items_proyecto ENABLE ROW LEVEL SECURITY;
ALTER TABLE boveda_seguridad ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacciones_financieras ENABLE ROW LEVEL SECURITY;

-- 5. Políticas base para SuperAdmin (Gabriel y Ulises)
-- Permite lectura y escritura total a los usuarios autenticados en el sistema
CREATE POLICY "Acceso total a clientes" ON clientes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acceso total a inventario" ON inventario FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acceso total a proyectos" ON proyectos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acceso total a items_proyecto" ON items_proyecto FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acceso total a boveda_seguridad" ON boveda_seguridad FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acceso total a transacciones" ON transacciones_financieras FOR ALL USING (auth.role() = 'authenticated');
