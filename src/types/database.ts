export type CondicionIva = 'Responsable Inscripto' | 'Monotributo' | 'Consumidor Final' | 'Exento';
export type TipoItem = 'Fijo' | 'Consumible' | 'Servicio';
export type EstadoProyecto = 'Borrador_Bot' | 'Pendiente_Aprobacion_Cliente' | 'Aprobado' | 'En_Ejecucion' | 'Finalizado' | 'Cancelado';
export type TipoDatoBoveda = 'Password' | 'IP_Publica' | 'AnyDesk_ID' | 'Config_Router' | 'Otro';
export type TipoTransaccion = 'Ingreso' | 'Egreso';

export interface Cliente {
  id: string; // UUID
  nombre_razon_social: string;
  telefono?: string;
  cuit_cuil?: string;
  condicion_iva?: CondicionIva;
  direccion?: string;
  created_at?: string;
}

export interface Inventario {
  id: string; // UUID
  sku?: string;
  nombre: string;
  tipo: TipoItem;
  precio_unitario: number;
  stock_actual?: number;
  stock_minimo?: number;
  created_at?: string;
}

export interface Proyecto {
  id: string; // UUID
  cliente_id: string; // UUID
  estado?: EstadoProyecto;
  notas_tecnicas?: string;
  total_estimado?: number;
  total_final?: number;
  stock_descontado?: boolean;
  created_at?: string;
}

export interface ItemProyecto {
  id: string; // UUID
  proyecto_id: string; // UUID
  inventario_id: string; // UUID
  precio_congelado: number;
  cantidad_estimada?: number;
  cantidad_real?: number | null;
  created_at?: string;
}

export interface BovedaSeguridad {
  id: string; // UUID
  proyecto_id: string; // UUID
  tipo_dato: TipoDatoBoveda;
  descripcion: string;
  valor_encriptado?: string;
  archivo_url?: string;
  created_at?: string;
}

export type CategoriaTransaccion = 'Hardware' | 'Cloud' | 'Movilidad' | 'Honorarios' | 'Abono' | 'Otros';
export type Moneda = 'ARS' | 'USDT';
export type MetodoPago = 'Efectivo' | 'Transferencia' | 'Tarjeta Virtual/Crypto';
export type EstadoPago = 'Pagado' | 'Pendiente';

export interface Transaccion {
  id: string; // UUID
  proyecto_id?: string; // UUID
  tipo: TipoTransaccion;
  categoria: CategoriaTransaccion;
  monto: number;
  moneda: Moneda;
  metodo_pago: MetodoPago;
  estado: EstadoPago;
  descripcion?: string;
  fecha_transaccion?: string;
  created_at?: string;
}

export type Rol = 'SuperAdmin' | 'Admin' | 'Tecnico';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  telefono?: string | null;
  especialidad?: string | null;
  activo: boolean;
  last_login_at?: string | null;
  created_at?: string;
}

