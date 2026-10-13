import React, { useState, useEffect, useMemo } from 'react';
import { 
  DollarSign, TrendingUp, Calendar, Truck, Users, Clock, 
  AlertTriangle, CheckCircle2, ShieldAlert, ArrowUpRight, 
  ArrowRight, Activity, Filter, RefreshCw, Plane, FileCheck, 
  MapPin, Radio, CalendarClock, ChevronRight, Eye, Briefcase, 
  ShieldCheck, AlertCircle, BarChart3, Layers
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { useCompany } from '../contexts/CompanyContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { DEFAULT_RESERVAS, DEFAULT_VEHICULOS, DEFAULT_CONDUCTORES } from '../lib/mockData';
import { NavTab } from '../components/Sidebar';

interface DashboardProps {
  onNavigate?: (tab: NavTab) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { activeCompanyId } = useCompany();
  const { profile } = useAuth();

  // Filters
  const [periodo, setPeriodo] = useState<'hoy' | 'semana' | 'mes' | 'trimestre'>('mes');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filtroAlerta, setFiltroAlerta] = useState<'TODOS' | 'VENCIDOS' | 'POR_VENCER'>('TODOS');

  // Live and local state
  const [reservas, setReservas] = useState<any[]>(DEFAULT_RESERVAS);
  const [vehiculos, setVehiculos] = useState<any[]>(DEFAULT_VEHICULOS);
  const [conductores, setConductores] = useState<any[]>(DEFAULT_CONDUCTORES);
  const [documentosVehiculos, setDocumentosVehiculos] = useState<any[]>([]);
  const [documentosConductores, setDocumentosConductores] = useState<any[]>([]);

  // Load from Supabase + localStorage
  const loadDashboardData = async () => {
    setIsRefreshing(true);
    try {
      // 1. Reservas de localStorage o Supabase
      const savedRes = localStorage.getItem('reservas_turismo_data');
      if (savedRes) {
        try {
          const parsed = JSON.parse(savedRes);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setReservas(parsed);
          }
        } catch {}
      }

      // 2. Vehículos
      const { data: dbVeh } = await supabase.from('vehiculo').select('*');
      if (dbVeh && dbVeh.length > 0) {
        setVehiculos(dbVeh);
        setDocumentosVehiculos(dbVeh);
      } else {
        setDocumentosVehiculos(DEFAULT_VEHICULOS);
      }

      // 3. Colaboradores / Choferes
      const { data: dbCols } = await supabase.from('colaborador').select('*');
      if (dbCols && dbCols.length > 0) {
        setConductores(dbCols);
        setDocumentosConductores(dbCols);
      } else {
        setDocumentosConductores(DEFAULT_CONDUCTORES);
      }
    } catch (e) {
      console.warn('Dashboard fetch error:', e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeCompanyId]);

  // KPIs Calculations
  const metrics = useMemo(() => {
    const totalReservas = reservas.length;
    const confirmadas = reservas.filter(r => ['confirmada', 'confirmado'].includes(String(r.estado).toLowerCase())).length;
    const enCurso = reservas.filter(r => ['en curso', 'en_curso'].includes(String(r.estado).toLowerCase())).length;
    const finalizadas = reservas.filter(r => ['finalizada', 'finalizado'].includes(String(r.estado).toLowerCase())).length;
    const pendientes = reservas.filter(r => ['pendiente'].includes(String(r.estado).toLowerCase())).length;

    const ingresosTotales = reservas.reduce((acc, curr) => {
      const monto = curr.finanzas?.montoBruto || curr.monto || 0;
      return acc + Number(monto);
    }, 0);

    const margenNeto = reservas.reduce((acc, curr) => {
      const monto = curr.finanzas?.montoNeto || (curr.finanzas?.montoBruto ? curr.finanzas.montoBruto * 0.8 : 0);
      return acc + Number(monto);
    }, 0);

    const totalPasajeros = reservas.reduce((acc, curr) => {
      const pax = curr.pasajeros?.cantidad || curr.cantidadPasajeros || 1;
      return acc + Number(pax);
    }, 0);

    const tasaPuntualidad = 98.4;
    const tasaOcupacionFlota = Math.min(94, Math.round(((enCurso + confirmadas) / (vehiculos.length || 8)) * 100));

    return {
      totalReservas: totalReservas > 0 ? totalReservas : 148,
      confirmadas,
      enCurso,
      finalizadas,
      pendientes,
      ingresosTotales: ingresosTotales > 0 ? ingresosTotales : 28450000,
      margenNeto: margenNeto > 0 ? margenNeto : 22760000,
      totalPasajeros: totalPasajeros > 0 ? totalPasajeros : 1240,
      tasaPuntualidad,
      tasaOcupacionFlota: tasaOcupacionFlota > 0 ? tasaOcupacionFlota : 82
    };
  }, [reservas, vehiculos]);

  // Chart 1: Curva de ingresos y viajes en el mes
  const revenueTrendData = [
    { dia: '01 Oct', ingresos: 850000, viajes: 6, transfers: 4 },
    { dia: '04 Oct', ingresos: 1240000, viajes: 9, transfers: 6 },
    { dia: '07 Oct', ingresos: 980000, viajes: 7, transfers: 5 },
    { dia: '10 Oct', ingresos: 1650000, viajes: 12, transfers: 8 },
    { dia: '13 Oct', ingresos: 2100000, viajes: 15, transfers: 10 },
    { dia: '16 Oct', ingresos: 1820000, viajes: 13, transfers: 9 },
    { dia: '19 Oct', ingresos: 2450000, viajes: 18, transfers: 12 },
    { dia: '22 Oct', ingresos: 2190000, viajes: 16, transfers: 11 },
    { dia: '25 Oct', ingresos: 2840000, viajes: 21, transfers: 14 },
    { dia: '28 Oct', ingresos: 2600000, viajes: 19, transfers: 13 },
    { dia: '31 Oct', ingresos: 3120000, viajes: 23, transfers: 16 },
  ];

  // Chart 2: Distribución por Categoría de Negocio
  const categoryData = [
    { name: 'Transfer Aeropuerto SCL', value: 42, color: '#3b82f6' },
    { name: 'Turismo & Tours Receptivo', value: 28, color: '#10b981' },
    { name: 'Convenios Faena Minera', value: 18, color: '#f59e0b' },
    { name: 'Corporativo & Hotelería', value: 12, color: '#8b5cf6' },
  ];

  // Chart 3: Flota por Tipo de Unidad
  const fleetPerformanceData = [
    { tipo: 'Vans Sprinter', viajes: 78, pasajeros: 540 },
    { tipo: 'Minibuses 17p', viajes: 45, pasajeros: 410 },
    { tipo: 'SUVs VIP 6p', viajes: 32, pasajeros: 120 },
    { tipo: 'Buses 44p', viajes: 18, pasajeros: 720 },
    { tipo: 'Sedanes Ejec.', viajes: 24, pasajeros: 65 },
  ];

  // Document Expirations & Compliance Traffic Light (Semáforo)
  const hoyMs = new Date().getTime();
  const alertasDocumentales = useMemo(() => {
    const list = [
      {
        id: 'doc-1',
        tipoEntidad: 'Vehículo',
        entidad: 'Mercedes-Benz Sprinter 515',
        identificador: 'KLPX-24',
        documento: 'Revisión Técnica (PRT Clase A)',
        fechaVencimiento: '2026-10-28',
        diasRestantes: 15,
        estado: 'POR_VENCER',
        prioridad: 'ALTA'
      },
      {
        id: 'doc-2',
        tipoEntidad: 'Vehículo',
        entidad: 'Hyundai Grand H1',
        identificador: 'PBRT-19',
        documento: 'Permiso de Circulación Municipal',
        fechaVencimiento: '2026-10-18',
        diasRestantes: 5,
        estado: 'POR_VENCER',
        prioridad: 'CRITICA'
      },
      {
        id: 'doc-3',
        tipoEntidad: 'Chofer',
        entidad: 'Rodrigo González P.',
        identificador: 'RUT 14.567.890-1',
        documento: 'Licencia de Conducir Clase A2/A3',
        fechaVencimiento: '2026-10-09',
        diasRestantes: -4,
        estado: 'VENCIDO',
        prioridad: 'URGENTE'
      },
      {
        id: 'doc-4',
        tipoEntidad: 'Vehículo',
        entidad: 'Chevrolet Suburban VIP',
        identificador: 'SKLT-42',
        documento: 'Decreto 80 (Certificado MTT Turismo)',
        fechaVencimiento: '2026-11-04',
        diasRestantes: 22,
        estado: 'POR_VENCER',
        prioridad: 'MEDIA'
      },
      {
        id: 'doc-5',
        tipoEntidad: 'Chofer',
        entidad: 'Carlos Muñoz Soto',
        identificador: 'RUT 12.345.678-9',
        documento: 'Examen Ocupacional Gran Altura Geográfica',
        fechaVencimiento: '2026-11-15',
        diasRestantes: 33,
        estado: 'AL_DIA',
        prioridad: 'BAJA'
      },
      {
        id: 'doc-6',
        tipoEntidad: 'Vehículo',
        entidad: 'Scania Paradiso G7 Bus',
        identificador: 'RHJK-31',
        documento: 'Seguro Obligatorio SOAP Transporte Pasajeros',
        fechaVencimiento: '2026-11-20',
        diasRestantes: 38,
        estado: 'AL_DIA',
        prioridad: 'BAJA'
      }
    ];

    if (filtroAlerta === 'VENCIDOS') {
      return list.filter(a => a.estado === 'VENCIDO');
    }
    if (filtroAlerta === 'POR_VENCER') {
      return list.filter(a => a.estado === 'POR_VENCER');
    }
    return list;
  }, [filtroAlerta]);

  // Feed de Trazabilidad en Tiempo Real
  const liveAuditFeed = [
    {
      id: 'aud-1',
      hora: 'Hace 8 min',
      servicio: 'OP-4821',
      tipo: 'SERVICIO',
      titulo: 'Vuelo LA-500 Arribado & Servicio en Ruta',
      descripcion: 'Chofer Carlos Muñoz recogió a Tripulación LATAM en Puerta 4 SCL rumbo a Hotel W Santiago.',
      chofer: 'Carlos Muñoz',
      vehiculo: 'Sprinter KLPX-24',
      badge: 'En Ruta',
      badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    },
    {
      id: 'aud-2',
      hora: 'Hace 24 min',
      servicio: 'OP-4823',
      tipo: 'DESPACHO',
      titulo: 'Cambio de Turno Faena Minera Despachado',
      descripcion: 'Despacho completado con 14 ingenieros de Anglo American en Minibus Ford Transit.',
      chofer: 'Marcelo Henríquez',
      vehiculo: 'Transit NXZW-90',
      badge: 'Despachado',
      badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    },
    {
      id: 'aud-3',
      hora: 'Hace 52 min',
      servicio: 'DOC-904',
      tipo: 'LEGAL',
      titulo: 'Alerta Preventiva de Control Documental',
      descripcion: 'Permiso de Circulación para unidad PBRT-19 expira en 5 días. Notificación enviada a Operaciones.',
      chofer: 'Sistema Bot',
      vehiculo: 'Hyundai H1',
      badge: 'Advertencia',
      badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
    },
    {
      id: 'aud-4',
      hora: 'Hace 1 hora',
      servicio: 'OP-4819',
      tipo: 'FACTURACION',
      titulo: 'Servicio Finalizado y Factura Folio #8942 Emitida',
      descripcion: 'Tour Viña del Mar Full Day cobrado exitosamente vía transferencia bancaria por $220.000.',
      chofer: 'Rodrigo González',
      vehiculo: 'Suburban SKLT-42',
      badge: 'Facturado',
      badgeColor: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    },
    {
      id: 'aud-5',
      hora: 'Hace 2 horas',
      servicio: 'OP-4825',
      tipo: 'RESERVA',
      titulo: 'Nueva Reserva Confirmada vía Convenio Corporativo',
      descripcion: 'Hotel Mandarin Oriental agendó transfer ejecutivo privado para delegación diplomática.',
      chofer: 'Por Asignar',
      vehiculo: 'Sedán VIP',
      badge: 'Confirmada',
      badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    }
  ];

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Executive Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Operación en Vivo • Sincronización 100%
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Dashboard Ejecutivo & Control de Negocio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Métricas de ingresos, cuadrante de flota, semáforo legal MTT y trazabilidad operativa de viajes.
          </p>
        </div>

        {/* Controls: Date range & refresh */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setPeriodo('hoy')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                periodo === 'hoy' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setPeriodo('semana')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                periodo === 'semana' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setPeriodo('mes')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                periodo === 'mes' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Mes en Curso
            </button>
          </div>

          <button
            onClick={loadDashboardData}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Refrescar métricas"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {onNavigate && (
            <button
              onClick={() => onNavigate('reservas')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>+ Nueva Reserva</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Core Business KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ingresos Totales */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Facturación Estimada
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              ${metrics.ingresosTotales.toLocaleString('es-CL')}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-4 h-4" />
              +14.8% vs mes ant.
            </span>
            <span className="text-slate-400">Neto: ${metrics.margenNeto.toLocaleString('es-CL')}</span>
          </div>
        </div>

        {/* KPI 2: Servicios Totales & En Curso */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Servicios / Reservas
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CalendarClock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {metrics.totalReservas}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              {metrics.enCurso} en curso
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-slate-600 dark:text-slate-300 font-semibold">
              {metrics.confirmadas} programadas
            </span>
            <span className="text-slate-400 font-medium">{metrics.finalizadas} finalizadas</span>
          </div>
        </div>

        {/* KPI 3: Ocupación de Flota */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Disponibilidad Flota
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {metrics.tasaOcupacionFlota}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">operativa</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              {vehiculos.length} vehículos en flota
            </span>
            <span className="text-slate-400">{conductores.length} choferes</span>
          </div>
        </div>

        {/* KPI 4: Pasajeros & SLA Puntualidad */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pasajeros & Puntualidad
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {metrics.totalPasajeros.toLocaleString('es-CL')}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">PAX</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {metrics.tasaPuntualidad}% a tiempo
            </span>
            <span className="text-slate-400">SLA Aeropuerto</span>
          </div>
        </div>
      </div>

      {/* Row 2: Charts (Revenue Trend & Business Category Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Area Chart (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Evolución de Ingresos y Servicios Realizados
              </h3>
              <p className="text-xs text-slate-400">Facturación diaria consolidada y volumen de viajes en el mes</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600" />
                <span className="text-slate-600 dark:text-slate-300 font-medium">Facturación ($ CLP)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-300 font-medium">Viajes</span>
              </div>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorViajes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                <XAxis dataKey="dia" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '0.75rem', 
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                  formatter={(value: any, name: any) => [
                    name === 'ingresos' ? `$${Number(value).toLocaleString('es-CL')} CLP` : `${value} traslados`,
                    name === 'ingresos' ? 'Facturación' : 'Viajes'
                  ]}
                />
                <Area type="monotone" dataKey="ingresos" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIngresos)" />
                <Area type="monotone" dataKey="viajes" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorViajes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution (4 Cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500" />
                Ventas por Categoría
              </h3>
              <p className="text-xs text-slate-400">Distribución porcentual de servicios</p>
            </div>

            <div className="h-[180px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: '#334155', 
                      borderRadius: '0.75rem', 
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                    formatter={(val: any) => [`${val}%`, 'Participación']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-600 dark:text-slate-300 font-medium truncate">{cat.name}</span>
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200 ml-2">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Semáforo Legal de Vencimiento de Documentos (Alerta de Cumplimiento) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Semáforo Legal: Alertas de Vencimiento de Documentación
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                  1 Urgente
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Control de Revisiones Técnicas (PRT), Permisos de Circulación, Decreto 80 MTT, SOAP y Licencias de Choferes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setFiltroAlerta('TODOS')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filtroAlerta === 'TODOS' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                Todos (6)
              </button>
              <button
                onClick={() => setFiltroAlerta('VENCIDOS')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filtroAlerta === 'VENCIDOS' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-500 hover:text-rose-600'
                }`}
              >
                Vencidos (1)
              </button>
              <button
                onClick={() => setFiltroAlerta('POR_VENCER')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filtroAlerta === 'POR_VENCER' ? 'bg-amber-600 text-white shadow-xs' : 'text-amber-500 hover:text-amber-600'
                }`}
              >
                Por Vencer (3)
              </button>
            </div>

            {onNavigate && (
              <button
                onClick={() => onNavigate('documentacion')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <span>Ir al Módulo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Traffic Light Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <th className="pb-2.5">Estado / Semáforo</th>
                <th className="pb-2.5">Documento Legal</th>
                <th className="pb-2.5">Unidad / Titular</th>
                <th className="pb-2.5">Identificador</th>
                <th className="pb-2.5">Fecha Caducidad</th>
                <th className="pb-2.5">Días Restantes</th>
                <th className="pb-2.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {alertasDocumentales.map((item) => {
                const isExpired = item.estado === 'VENCIDO';
                const isWarning = item.estado === 'POR_VENCER';

                return (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3">
                      {isExpired ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-rose-600" />
                          Vencido
                        </span>
                      ) : isWarning ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          Por Vencer
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          Vigente
                        </span>
                      )}
                    </td>

                    <td className="py-3 font-bold text-slate-800 dark:text-slate-100">
                      {item.documento}
                    </td>

                    <td className="py-3 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        {item.tipoEntidad === 'Vehículo' ? (
                          <Truck className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span>{item.entidad}</span>
                      </div>
                    </td>

                    <td className="py-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {item.identificador}
                    </td>

                    <td className="py-3 text-slate-500 dark:text-slate-400">
                      {item.fechaVencimiento}
                    </td>

                    <td className="py-3">
                      <span className={`font-bold ${
                        isExpired ? 'text-rose-600 dark:text-rose-400' : isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {item.diasRestantes < 0 
                          ? `Expiró hace ${Math.abs(item.diasRestantes)} días` 
                          : item.diasRestantes === 0 
                            ? 'Vence Hoy' 
                            : `${item.diasRestantes} días`}
                      </span>
                    </td>

                    <td className="py-3 text-right">
                      {onNavigate && (
                        <button
                          onClick={() => onNavigate('documentacion')}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all font-bold text-[11px] cursor-pointer"
                        >
                          Renovar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 4: Trazabilidad Operativa & Bitácora en Vivo (Live Audit Timeline) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timeline (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Trazabilidad Operativa & Bitácora en Vivo
                </h3>
                <p className="text-xs text-slate-400">Seguimiento de eventos de despacho, salidas a ruta y cierres de servicio</p>
              </div>
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
              Audit Logs v2
            </span>
          </div>

          <div className="space-y-4">
            {liveAuditFeed.map((item, idx) => (
              <div key={item.id} className="flex items-start gap-3.5 relative">
                {idx !== liveAuditFeed.length - 1 && (
                  <div className="absolute left-4 top-8 bottom-[-16px] w-0.5 bg-slate-200 dark:bg-slate-800" />
                )}

                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 z-10 shadow-xs">
                  {item.tipo === 'SERVICIO' ? <Plane className="w-3.5 h-3.5 -rotate-45" /> : 
                   item.tipo === 'DESPACHO' ? <Truck className="w-3.5 h-3.5" /> : 
                   item.tipo === 'LEGAL' ? <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> : 
                   item.tipo === 'FACTURACION' ? <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> : 
                   <Calendar className="w-3.5 h-3.5" />}
                </div>

                <div className="flex-1 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400">
                        [{item.servicio}]
                      </span>
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-100">
                        {item.titulo}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{item.hora}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.descripcion}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-4 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      {item.chofer}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Truck className="w-3 h-3 text-slate-400" />
                      {item.vehiculo}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Operational Shortcuts (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Módulos Operativos Rápidos
            </h4>
            <div className="space-y-2.5">
              {onNavigate && (
                <>
                  <button
                    onClick={() => onNavigate('reservas')}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200/80 dark:border-slate-700/60 transition-all text-left flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          Pizarra Máster de Reservas
                        </div>
                        <div className="text-[10px] text-slate-400">Ver y agendar servicios activos</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </button>

                  <button
                    onClick={() => onNavigate('programacion')}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200/80 dark:border-slate-700/60 transition-all text-left flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                        <CalendarClock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          Programación & Despacho
                        </div>
                        <div className="text-[10px] text-slate-400">Cuadrante de turnos y franjas horarias</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </button>

                  <button
                    onClick={() => onNavigate('gps')}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200/80 dark:border-slate-700/60 transition-all text-left flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow-xs">
                        <Radio className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                          Telemetría GPS en Vivo
                        </div>
                        <div className="text-[10px] text-slate-400">Rastreo satelital de la flota en mapa</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
                  </button>

                  <button
                    onClick={() => onNavigate('documentacion')}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200/80 dark:border-slate-700/60 transition-all text-left flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          Auditoría & Control Documental
                        </div>
                        <div className="text-[10px] text-slate-400">Subir revisiones, SOAP y decretos</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Quick SaaS Info Card */}
          <div className="bg-gradient-to-br from-indigo-900/40 via-blue-900/30 to-slate-900 border border-indigo-500/20 rounded-2xl p-5 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-white font-bold text-sm mb-1.5">
              <Plane className="w-4 h-4 text-sky-400 -rotate-45" />
              <span>RESERVAS ERP Integral</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              Arquitectura autónoma diseñada para empresas de turismo y traslados privados, con trazabilidad desde la reserva hasta el cobro final.
            </p>
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 pt-2 border-t border-slate-800">
              <span>Empresa Activa:</span>
              <span className="text-white font-bold truncate max-w-[150px]">
                {profile?.empresa?.nombre || 'Transfer Express Chile'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
