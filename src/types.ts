export interface ReservaTurismo {
  id: string;
  op: string;
  categoria: string;
  cliente: {
    nombre: string;
    email: string;
    telefono: string;
    dni_pasaporte: string;
    rut_empresa: string;
    tipoCliente?: string;
    contratoId?: string;
  };
  pasajeros: {
    nombre: string;
    telefono: string;
    cantidad: number;
  };
  pasajerosList: {
    nombre: string;
    telefono: string;
    origen: string;
    destino: string;
  }[];
  lugares: {
    origen: string;
    destino: string;
    numeroVuelo: string;
  };
  logistica: {
    maletasGrandes: number;
    maletasChicas: number;
    sillaBebe: boolean;
    alzador: boolean;
    cantidadSillas: number;
    cantidadAlzadores?: number;
  };
  servicio: string;
  enlaceMapa?: string;
  tipoVehiculo: 'Auto' | 'SUV' | 'Van' | 'Minibus' | 'Mini Bus' | 'Bus' | 'Otros';
  fecha: string;
  horaInicio: string;
  horaTermino?: string;
  conductorId: string;
  vehiculoId: string;
  finanzas: {
    montoBruto: number;
    gastosAdicionales: number;
    porcentajeComision: number;
    formaPago: 'Efectivo' | 'Transferencia' | 'Convenio PF' | 'Tarjeta';
    tipoDocumento: 'Boleta' | 'Factura';
    cobrado: boolean;
    montoNeto?: number;
    folioFactura?: string;
    fechaDeposito?: string;
  };
  archivosAdicionales?: {
    nombre: string;
    url: string;
    tipo: 'Imagen' | 'Documento' | 'Otro';
  }[];
  comentarios: {
    conductor: string;
    interno: string;
  };
  estado: 'pendiente' | 'confirmada' | 'confirmado' | 'en curso' | 'finalizada' | 'finalizado' | 'cancelada' | 'cancelado' | string;
  auditLogs?: { quien: string; accion: string; cuando: string }[];
}

export interface Conductor {
  id: string;
  nombre: string;
  telefono?: string;
  rol?: string;
  licencia?: string;
  estado: string;
}

export interface Vehiculo {
  id: string;
  patente: string;
  marca?: string;
  modelo?: string;
  tipo?: string;
  capacidadPax?: number;
  estado?: string;
}

export interface Empresa {
  id: string;
  nombre: string;
}

export interface Ruta {
  id: string;
  nombre: string;
  origen: string;
  destino: string;
  enlaceMapa?: string;
}
