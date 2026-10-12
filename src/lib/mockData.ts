import { ReservaTurismo, Conductor, Vehiculo, Empresa, Ruta } from '../types';

export const DEFAULT_CATEGORIAS: string[] = [
  'Transfer Aeropuerto',
  'Turismo Receptivo / Tours',
  'Viaje Especial / City Tour',
  'Corporativo / Convenio',
  'Minera / Faena',
  'Hotel / Particular',
  'Web / Online',
  'Whatsapp Directo'
];

export const DEFAULT_VEHICULOS: Vehiculo[] = [
  { id: 'veh-01', patente: 'KLPX-24', marca: 'Mercedes-Benz', modelo: 'Sprinter 515 (19+1 Pax)', tipo: 'Van', capacidadPax: 19, estado: 'Disponible' },
  { id: 'veh-02', patente: 'HJTR-88', marca: 'Mercedes-Benz', modelo: 'Sprinter 415 (15+1 Pax)', tipo: 'Van', capacidadPax: 15, estado: 'Disponible' },
  { id: 'veh-03', patente: 'PBRT-19', marca: 'Hyundai', modelo: 'Grand H1 (10+1 Pax)', tipo: 'Van', capacidadPax: 10, estado: 'Disponible' },
  { id: 'veh-04', patente: 'SKLT-42', marca: 'Chevrolet', modelo: 'Suburban VIP (6+1 Pax)', tipo: 'SUV', capacidadPax: 6, estado: 'Disponible' },
  { id: 'veh-05', patente: 'LMFD-55', marca: 'Toyota', modelo: 'HiAce GranVia (14+1 Pax)', tipo: 'Van', capacidadPax: 14, estado: 'Disponible' },
  { id: 'veh-06', patente: 'NXZW-90', marca: 'Ford', modelo: 'Transit Bus (17+1 Pax)', tipo: 'Mini Bus', capacidadPax: 17, estado: 'Disponible' },
  { id: 'veh-07', patente: 'RHJK-31', marca: 'Scania / Marcopolo', modelo: 'Paradiso G7 (44 Pax)', tipo: 'Bus', capacidadPax: 44, estado: 'Disponible' },
  { id: 'veh-08', patente: 'TDCL-67', marca: 'Peugeot', modelo: 'Traveller Executive (7+1 Pax)', tipo: 'Mini Bus', capacidadPax: 7, estado: 'Disponible' }
];

export const DEFAULT_CONDUCTORES: Conductor[] = [
  { id: 'cond-01', nombre: 'Carlos Muñoz Soto', telefono: '+56 9 8451 2290', rol: 'Conductor Turismo & Transfer', licencia: 'A2 / A3', estado: 'Activo' },
  { id: 'cond-02', nombre: 'Rodrigo González P.', telefono: '+56 9 7623 4410', rol: 'Conductor Bilingüe / Receptivo', licencia: 'A2', estado: 'Activo' },
  { id: 'cond-03', nombre: 'Marcelo Henríquez V.', telefono: '+56 9 9134 5567', rol: 'Conductor Alta Montaña / Faena', licencia: 'A3', estado: 'Activo' },
  { id: 'cond-04', nombre: 'Patricio Soto Alarcón', telefono: '+56 9 6219 8832', rol: 'Conductor Ejecutivo VIP', licencia: 'A2', estado: 'Activo' },
  { id: 'cond-05', nombre: 'Fernando Castro M.', telefono: '+56 9 5541 7720', rol: 'Conductor Rutas Interprovincial', licencia: 'A3', estado: 'Activo' },
  { id: 'cond-06', nombre: 'Juan Pablo Silva', telefono: '+56 9 4412 9901', rol: 'Conductor Aeropuerto Express', licencia: 'A2', estado: 'Activo' }
];

export const DEFAULT_EMPRESAS: Empresa[] = [
  { id: 'emp-01', nombre: 'Transfer & Turismo Express Chile' },
  { id: 'emp-02', nombre: 'Imperia Rent a Car & Transfers' },
  { id: 'emp-03', nombre: 'Gaval Servicios de Transporte' }
];

export const DEFAULT_CONTRATOS = [
  { id: 'cont-01', razonSocial: 'LATAM Airlines Group' },
  { id: 'cont-02', razonSocial: 'Hotel W Santiago / Marriott' },
  { id: 'cont-03', razonSocial: 'Anglo American Chile' },
  { id: 'cont-04', razonSocial: 'Sky Airline' },
  { id: 'cont-05', razonSocial: 'Agencia Turismo Cocha / Viajes' }
];

export const DEFAULT_RUTAS: Ruta[] = [
  { id: 'ruta-01', nombre: 'Aeropuerto SCL ⇄ Santiago Centro / Providencia', origen: 'Aeropuerto Arturo Merino Benítez (SCL)', destino: 'Hoteles Providencia / Santiago Centro', enlaceMapa: 'https://maps.google.com' },
  { id: 'ruta-02', nombre: 'Santiago ⇄ Tour Viña del Mar / Valparaíso Full Day', origen: 'Hoteles Sector Oriente (Las Condes / Vitacura)', destino: 'Viña del Mar / Reloj de Flores / Muelle Vergara', enlaceMapa: 'https://maps.google.com' },
  { id: 'ruta-03', nombre: 'Santiago ⇄ Valle del Maipo (Ruta del Vino)', origen: 'Hotel W Santiago', destino: 'Viña Concha y Toro / Pirque', enlaceMapa: 'https://maps.google.com' },
  { id: 'ruta-04', nombre: 'Santiago ⇄ Faena Minera Los Bronces', origen: 'Terminal Los Héroes / Santiago', destino: 'Garita Faena Minera Los Bronces (Cordillera)', enlaceMapa: 'https://maps.google.com' }
];

const hoy = new Date().toISOString().split('T')[0];

export const DEFAULT_RESERVAS: ReservaTurismo[] = [
  {
    id: 'res-001',
    op: 'OP-4821-2026',
    categoria: 'Transfer Aeropuerto',
    cliente: {
      nombre: 'LATAM Airlines Group',
      email: 'operaciones.crew@latam.com',
      telefono: '+56 9 7820 1144',
      dni_pasaporte: '9845122-K',
      rut_empresa: '76.123.456-7',
      tipoCliente: 'Empresa / Convenio',
      contratoId: 'cont-01'
    },
    pasajeros: {
      nombre: 'Tripulación Vuelo LA500 (Capt. Silva + 3 Pax)',
      telefono: '+56 9 7820 1144',
      cantidad: 4
    },
    pasajerosList: [
      { nombre: 'Capt. Silva', telefono: '+56 9 7820 1144', origen: 'Aeropuerto SCL Puerta 4', destino: 'Hotel W Santiago (Isidora Goyenechea)' },
      { nombre: 'Primer Oficial Ríos', telefono: '+56 9 6543 2199', origen: 'Aeropuerto SCL', destino: 'Hotel W Santiago' }
    ],
    lugares: {
      origen: 'Aeropuerto Arturo Merino Benítez (SCL)',
      destino: 'Hotel W Santiago (Las Condes)',
      numeroVuelo: 'LA-500'
    },
    logistica: {
      maletasGrandes: 4,
      maletasChicas: 4,
      sillaBebe: false,
      alzador: false,
      cantidadSillas: 0
    },
    servicio: 'Traslado Tripulación Ejecutiva',
    enlaceMapa: 'https://maps.google.com',
    tipoVehiculo: 'Van',
    fecha: hoy,
    horaInicio: '09:30',
    conductorId: 'cond-01',
    vehiculoId: 'veh-01',
    finanzas: {
      montoBruto: 85000,
      gastosAdicionales: 5000,
      porcentajeComision: 10,
      formaPago: 'Convenio PF',
      tipoDocumento: 'Factura',
      cobrado: true,
      montoNeto: 72000
    },
    archivosAdicionales: [],
    comentarios: {
      conductor: 'Esperar en estacionamiento preferente Puerta 4 Internacional con cartel LATAM.',
      interno: 'Facturación quincenal cuenta corriente corporativa.'
    },
    estado: 'confirmado',
    auditLogs: [{ quien: 'Sistema Base', accion: 'Carga inicial demo', cuando: new Date().toISOString() }]
  },
  {
    id: 'res-002',
    op: 'OP-4822-2026',
    categoria: 'Turismo Receptivo / Tours',
    cliente: {
      nombre: 'Agencia Turismo Cocha / Viajes',
      email: 'receptivo@cocha.com',
      telefono: '+56 9 9122 3344',
      dni_pasaporte: 'US94827110',
      rut_empresa: '96.554.221-3',
      tipoCliente: 'Agencia',
      contratoId: 'cont-05'
    },
    pasajeros: {
      nombre: 'John & Sarah Henderson (Familia 5 Pax)',
      telefono: '+1 415 890 2231',
      cantidad: 5
    },
    pasajerosList: [],
    lugares: {
      origen: 'Hotel Mandarin Oriental (Av. Kennedy 4601)',
      destino: 'Viña del Mar & Valparaíso (Paseo Atkinson)',
      numeroVuelo: ''
    },
    logistica: {
      maletasGrandes: 2,
      maletasChicas: 3,
      sillaBebe: true,
      alzador: false,
      cantidadSillas: 1
    },
    servicio: 'Tour Exclusivo Valparaíso Patrimonial + Degustación Casablanca',
    enlaceMapa: 'https://maps.google.com',
    tipoVehiculo: 'SUV',
    fecha: hoy,
    horaInicio: '10:00',
    conductorId: 'cond-02',
    vehiculoId: 'veh-04',
    finanzas: {
      montoBruto: 220000,
      gastosAdicionales: 20000,
      porcentajeComision: 12,
      formaPago: 'Transferencia',
      tipoDocumento: 'Factura',
      cobrado: true,
      montoNeto: 176000
    },
    archivosAdicionales: [],
    comentarios: {
      conductor: 'Pasajeros de habla inglesa, chofer bilingüe Rodrigo asignado. Incluye peajes.',
      interno: 'Coordinado voucher de pago prepagado.'
    },
    estado: 'en curso',
    auditLogs: [{ quien: 'Sistema Base', accion: 'Carga inicial demo', cuando: new Date().toISOString() }]
  },
  {
    id: 'res-003',
    op: 'OP-4823-2026',
    categoria: 'Minera / Faena',
    cliente: {
      nombre: 'Anglo American Chile',
      email: 'logistica.personal@angloamerican.com',
      telefono: '+56 9 8234 5678',
      dni_pasaporte: '14.520.198-4',
      rut_empresa: '78.990.112-9',
      tipoCliente: 'Empresa / Convenio',
      contratoId: 'cont-03'
    },
    pasajeros: {
      nombre: 'Ingenieros Geología & Mantención (14 Pax)',
      telefono: '+56 9 8234 5678',
      cantidad: 14
    },
    pasajerosList: [],
    lugares: {
      origen: 'Hotel Diego de Almagro (Aeropuerto)',
      destino: 'Garita Faena Los Bronces ( Anglo American )',
      numeroVuelo: ''
    },
    logistica: {
      maletasGrandes: 14,
      maletasChicas: 14,
      sillaBebe: false,
      alzador: false,
      cantidadSillas: 0
    },
    servicio: 'Traslado Cambio de Turno Faena',
    enlaceMapa: 'https://maps.google.com',
    tipoVehiculo: 'Mini Bus',
    fecha: hoy,
    horaInicio: '06:00',
    conductorId: 'cond-03',
    vehiculoId: 'veh-06',
    finanzas: {
      montoBruto: 180000,
      gastosAdicionales: 10000,
      porcentajeComision: 10,
      formaPago: 'Convenio PF',
      tipoDocumento: 'Factura',
      cobrado: false,
      montoNeto: 153000
    },
    archivosAdicionales: [],
    comentarios: {
      conductor: 'Vehículo equipado con pértiga, cuñas, baliza y tracción para alta montaña.',
      interno: 'Control acceso faena validado.'
    },
    estado: 'finalizado',
    auditLogs: [{ quien: 'Sistema Base', accion: 'Carga inicial demo', cuando: new Date().toISOString() }]
  },
  {
    id: 'res-004',
    op: 'OP-4824-2026',
    categoria: 'Hotel / Particular',
    cliente: {
      nombre: 'Mariana Valenzuela (Particular)',
      email: 'm.valenzuela@gmail.com',
      telefono: '+56 9 9345 8812',
      dni_pasaporte: '18.234.901-2',
      rut_empresa: '',
      tipoCliente: 'Particular',
      contratoId: ''
    },
    pasajeros: {
      nombre: 'Mariana Valenzuela y Familia (3 Pax)',
      telefono: '+56 9 9345 8812',
      cantidad: 3
    },
    pasajerosList: [],
    lugares: {
      origen: 'Av. El Bosque Norte 0240, Las Condes',
      destino: 'Aeropuerto Arturo Merino Benítez (SCL)',
      numeroVuelo: 'IB-6830'
    },
    logistica: {
      maletasGrandes: 3,
      maletasChicas: 2,
      sillaBebe: false,
      alzador: true,
      cantidadSillas: 0,
      cantidadAlzadores: 1
    },
    servicio: 'Transfer Aeropuerto Salida Vuelo Iberia',
    enlaceMapa: 'https://maps.google.com',
    tipoVehiculo: 'Van',
    fecha: hoy,
    horaInicio: '17:30',
    conductorId: 'cond-06',
    vehiculoId: 'veh-03',
    finanzas: {
      montoBruto: 45000,
      gastosAdicionales: 0,
      porcentajeComision: 10,
      formaPago: 'Efectivo',
      tipoDocumento: 'Boleta',
      cobrado: false,
      montoNeto: 40500
    },
    archivosAdicionales: [],
    comentarios: {
      conductor: 'Llevar 1 alzador para niño de 5 años. Pago contra entrega en efectivo.',
      interno: 'Reserva confirmada por Whatsapp.'
    },
    estado: 'pendiente',
    auditLogs: [{ quien: 'Sistema Base', accion: 'Carga inicial demo', cuando: new Date().toISOString() }]
  }
];
