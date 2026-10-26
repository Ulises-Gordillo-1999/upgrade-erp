import { pgTable, text, timestamp, uuid, numeric, integer, pgEnum, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Enums
export const condicionIvaEnum = pgEnum("condicion_iva_enum", [
  "Responsable Inscripto",
  "Monotributo",
  "Consumidor Final",
  "Exento"
]);

export const tipoItemEnum = pgEnum("tipo_item_enum", [
  "Fijo",
  "Consumible",
  "Servicio"
]);

export const estadoProyectoEnum = pgEnum("estado_proyecto_enum", [
  "Borrador_Bot",
  "Pendiente_Aprobacion_Cliente",
  "Aprobado",
  "En_Ejecucion",
  "Finalizado",
  "Cancelado"
]);

export const tipoDatoBovedaEnum = pgEnum("tipo_dato_boveda_enum", [
  "Password",
  "IP_Publica",
  "AnyDesk_ID",
  "Config_Router",
  "Otro"
]);

export const tipoTransaccionEnum = pgEnum("tipo_transaccion_enum", [
  "Ingreso",
  "Egreso"
]);

export const categoriaTransaccionEnum = pgEnum("categoria_transaccion_enum", [
  "Hardware",
  "Cloud",
  "Movilidad",
  "Honorarios",
  "Abono",
  "Otros"
]);

export const monedaEnum = pgEnum("moneda_enum", [
  "ARS",
  "USDT"
]);

export const metodoPagoEnum = pgEnum("metodo_pago_enum", [
  "Efectivo",
  "Transferencia",
  "Tarjeta Virtual/Crypto"
]);

export const estadoPagoEnum = pgEnum("estado_pago_enum", [
  "Pagado",
  "Pendiente"
]);

export const rolEnum = pgEnum("rol_enum", [
  "SuperAdmin",
  "Admin",
  "Tecnico"
]);

// 2. Tablas
export const usuarios = pgTable("usuarios", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: text("nombre").notNull(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  rol: rolEnum("rol").default("Tecnico").notNull(),
  telefono: text("telefono"),
  especialidad: text("especialidad"),
  activo: boolean("activo").default(true).notNull(),
  last_login_at: timestamp("last_login_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
export const clientes = pgTable("clientes", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre_razon_social: text("nombre_razon_social").notNull(),
  telefono: text("telefono").unique(),
  cuit_cuil: text("cuit_cuil"),
  condicion_iva: condicionIvaEnum("condicion_iva"),
  direccion: text("direccion"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const categoriasInventario = pgTable("categorias_inventario", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: text("nombre").notNull().unique(),
  tipo_asociado: text("tipo_asociado").notNull().default("Producto"), // "Producto" | "Servicio" | "Ambos"
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const inventario = pgTable("inventario", {
  id: uuid("id").primaryKey().defaultRandom(),
  sku: text("sku").unique(),
  nombre: text("nombre").notNull(),
  tipo: tipoItemEnum("tipo").notNull(),
  categoria: text("categoria"),
  precio_unitario: numeric("precio_unitario", { precision: 10, scale: 2 }).notNull().default("0.00"),
  stock_actual: integer("stock_actual").default(0),
  stock_minimo: integer("stock_minimo").default(0),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const proyectos = pgTable("proyectos", {
  id: uuid("id").primaryKey().defaultRandom(),
  cliente_id: uuid("cliente_id").references(() => clientes.id, { onDelete: "restrict" }).notNull(),
  estado: estadoProyectoEnum("estado").default("Borrador_Bot").notNull(),
  notas_tecnicas: text("notas_tecnicas"),
  total_estimado: numeric("total_estimado", { precision: 12, scale: 2 }).default("0.00"),
  total_final: numeric("total_final", { precision: 12, scale: 2 }).default("0.00"),
  stock_descontado: boolean("stock_descontado").default(false).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const itemsProyecto = pgTable("items_proyecto", {
  id: uuid("id").primaryKey().defaultRandom(),
  proyecto_id: uuid("proyecto_id").references(() => proyectos.id, { onDelete: "cascade" }).notNull(),
  inventario_id: uuid("inventario_id").references(() => inventario.id, { onDelete: "restrict" }).notNull(),
  precio_congelado: numeric("precio_congelado", { precision: 10, scale: 2 }).notNull(),
  cantidad_estimada: numeric("cantidad_estimada", { precision: 10, scale: 2 }).notNull().default("1.00"),
  cantidad_real: numeric("cantidad_real", { precision: 10, scale: 2 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const tiposCredencialBoveda = pgTable("tipos_credencial_boveda", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: text("nombre").notNull().unique(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const bovedaSeguridad = pgTable("boveda_seguridad", {
  id: uuid("id").primaryKey().defaultRandom(),
  proyecto_id: uuid("proyecto_id").references(() => proyectos.id, { onDelete: "cascade" }).notNull(),
  tipo_dato: text("tipo_dato").notNull(),
  descripcion: text("descripcion").notNull(),
  valor_encriptado: text("valor_encriptado"),
  archivo_url: text("archivo_url"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const categoriasFinanzas = pgTable("categorias_finanzas", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: text("nombre").notNull().unique(),
  tipo_asociado: text("tipo_asociado").notNull().default("Ambos"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const transacciones = pgTable("transacciones", {
  id: uuid("id").primaryKey().defaultRandom(),
  proyecto_id: uuid("proyecto_id").references(() => proyectos.id, { onDelete: "set null" }),
  tipo: tipoTransaccionEnum("tipo").notNull(),
  categoria: text("categoria").notNull(),
  monto: numeric("monto", { precision: 12, scale: 2 }).notNull(),
  moneda: monedaEnum("moneda").notNull().default("ARS"),
  metodo_pago: metodoPagoEnum("metodo_pago").notNull().default("Transferencia"),
  estado: estadoPagoEnum("estado").notNull().default("Pagado"),
  descripcion: text("descripcion"),
  fecha_transaccion: timestamp("fecha_transaccion", { withTimezone: true }).defaultNow(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 3. Relaciones (Drizzle Relations)
export const clientesRelations = relations(clientes, ({ many }) => ({
  proyectos: many(proyectos),
}));

export const proyectosRelations = relations(proyectos, ({ one, many }) => ({
  cliente: one(clientes, {
    fields: [proyectos.cliente_id],
    references: [clientes.id],
  }),
  items: many(itemsProyecto),
  boveda: many(bovedaSeguridad),
  transacciones: many(transacciones),
}));

export const inventarioRelations = relations(inventario, ({ many }) => ({
  itemsProyecto: many(itemsProyecto),
}));

export const itemsProyectoRelations = relations(itemsProyecto, ({ one }) => ({
  proyecto: one(proyectos, {
    fields: [itemsProyecto.proyecto_id],
    references: [proyectos.id],
  }),
  inventario: one(inventario, {
    fields: [itemsProyecto.inventario_id],
    references: [inventario.id],
  }),
}));

export const bovedaSeguridadRelations = relations(bovedaSeguridad, ({ one }) => ({
  proyecto: one(proyectos, {
    fields: [bovedaSeguridad.proyecto_id],
    references: [proyectos.id],
  }),
}));

export const transaccionesRelations = relations(transacciones, ({ one }) => ({
  proyecto: one(proyectos, {
    fields: [transacciones.proyecto_id],
    references: [proyectos.id],
  }),
}));
