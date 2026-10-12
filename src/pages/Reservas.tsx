import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { 
  Plus, Search, Filter, MapPin, Clock, User, Users, Car, FileText, 
  FileSpreadsheet, ChevronRight, CheckCircle, XCircle, Calendar as CalendarIcon, 
  Copy, Briefcase, Hash, Luggage, Baby, Phone, Mail, DollarSign, Info, Settings, Trash2,
  ShieldCheck, Truck
} from 'lucide-react';
import { exportToExcel } from '../lib/excelExport';
import { Pagination } from '../components/ui/Pagination';
import { ReservaTurismo, Conductor, Vehiculo, Ruta } from '../types';
import { 
  DEFAULT_CATEGORIAS, 
  DEFAULT_VEHICULOS, 
  DEFAULT_CONDUCTORES, 
  DEFAULT_EMPRESAS, 
  DEFAULT_CONTRATOS, 
  DEFAULT_RUTAS, 
  DEFAULT_RESERVAS 
} from '../lib/mockData';

export default function ReservasTurismo({ activeCompanyId = 'GLOBAL' }: { activeCompanyId?: string }) {
  
  // States with robust fallback and localStorage persistence
  const [reservasTurismo, setReservasTurismo] = useState<ReservaTurismo[]>(() => {
    try {
      const saved = localStorage.getItem('reservas_turismo_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_RESERVAS;
  });

  const [conductores, setConductores] = useState<Conductor[]>(() => {
    try {
      const saved = localStorage.getItem('reservas_conductores');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_CONDUCTORES;
  });

  const [vehiculos, setVehiculos] = useState<Vehiculo[]>(() => {
    try {
      const saved = localStorage.getItem('reservas_vehiculos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_VEHICULOS;
  });

  const [contratos, setContratos] = useState<{id: string, razonSocial: string}[]>(DEFAULT_CONTRATOS);

  const [categoriasMaestras, setCategoriasMaestras] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('categoriasMaestras');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_CATEGORIAS;
  });

  const [categoriasDisponibles, setCategoriasDisponibles] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('categoriasMaestras');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_CATEGORIAS;
  });

  const [rutasGuardadas, setRutasGuardadas] = useState<Ruta[]>(() => {
    try {
      const saved = localStorage.getItem('reservas_rutas');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_RUTAS;
  });

  const [userCompanies, setUserCompanies] = useState<{id: string, nombre: string}[]>(DEFAULT_EMPRESAS);
  const [newEmpresaId, setNewEmpresaId] = useState<string>(DEFAULT_EMPRESAS[0].id);

  // Modals
  const [mostrarPanelCategorias, setMostrarPanelCategorias] = useState(false);
  const [nuevaCategoriaForm, setNuevaCategoriaForm] = useState('');
  const [mostrarPanelVehiculos, setMostrarPanelVehiculos] = useState(false);
  const [nuevoVehiculoForm, setNuevoVehiculoForm] = useState({
    patente: '',
    marca: '',
    modelo: '',
    tipo: 'Van' as const,
    capacidadPax: 15
  });
  const [mostrarPanelConductores, setMostrarPanelConductores] = useState(false);
  const [nuevoConductorForm, setNuevoConductorForm] = useState({
    nombre: '',
    telefono: '',
    rol: 'Conductor Turismo & Transfer',
    licencia: 'A2'
  });
  const [mostrarCrearRuta, setMostrarCrearRuta] = useState(false);
  const [nuevaRutaForm, setNuevaRutaForm] = useState({ nombre: '', origen: '', destino: '', enlaceMapa: '' });

  const guardarCategorias = (nuevas: string[]) => {
    setCategoriasMaestras(nuevas);
    setCategoriasDisponibles(nuevas);
    localStorage.setItem('categoriasMaestras', JSON.stringify(nuevas));
  };

  const loadData = async () => {
    try {
      let query = supabase
        .from('operacion_reserva')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeCompanyId && activeCompanyId !== 'GLOBAL') {
        query = query.eq('empresa_id', activeCompanyId);
      }

      const { data: reservasData, error: reservasError } = await query;

      if (!reservasError && reservasData && reservasData.length > 0) {
        const formattedReservas: ReservaTurismo[] = reservasData.map((dbR: any) => ({
          id: dbR.id,
          op: dbR.codigo || 'SIN-OP',
          categoria: dbR.categoria as any,
          cliente: {
            nombre: dbR.cliente_nombre || '',
            email: dbR.cliente_email || '',
            telefono: dbR.cliente_telefono || '',
            dni_pasaporte: dbR.detalles?.cliente?.dni_pasaporte || '',
            rut_empresa: dbR.cliente_rut || '',
            tipoCliente: dbR.detalles?.cliente?.tipoCliente || 'Particular',
            contratoId: dbR.detalles?.cliente?.contratoId || ''
          },
          pasajeros: dbR.detalles?.pasajeros || { nombre: '', telefono: '', cantidad: dbR.pasajeros_cantidad || 1 },
          pasajerosList: dbR.detalles?.pasajerosList || [],
          lugares: {
            origen: dbR.origen || '',
            destino: dbR.destino || '',
            numeroVuelo: dbR.detalles?.lugares?.numeroVuelo || ''
          },
          logistica: dbR.detalles?.logistica || { maletasGrandes: 0, maletasChicas: 0, sillaBebe: false, alzador: false, cantidadSillas: 0 },
          servicio: dbR.detalles?.servicio || '',
          tipoVehiculo: dbR.detalles?.tipoVehiculo || 'Van',
          enlaceMapa: dbR.detalles?.enlaceMapa || '',
          fecha: dbR.fecha_reserva ? new Date(dbR.fecha_reserva).toISOString().split('T')[0] : '',
          horaInicio: dbR.detalles?.horaInicio || '',
          horaTermino: dbR.detalles?.horaTermino || '',
          conductorId: dbR.conductor_id || '',
          vehiculoId: dbR.vehiculo_id || '',
          finanzas: dbR.detalles?.finanzas || {
            montoBruto: Number(dbR.monto_total) || 0,
            gastosAdicionales: 0,
            porcentajeComision: 10,
            formaPago: 'Efectivo',
            tipoDocumento: 'Boleta',
            cobrado: false,
            montoNeto: 0,
            fechaDeposito: ''
          },
          archivosAdicionales: dbR.detalles?.archivosAdicionales || [],
          comentarios: dbR.detalles?.comentarios || { conductor: '', interno: '' },
          estado: dbR.estado_viaje?.toLowerCase() || 'pendiente',
          auditLogs: dbR.detalles?.auditLogs || []
        }));

        setReservasTurismo(formattedReservas);
        localStorage.setItem('reservas_turismo_data', JSON.stringify(formattedReservas));

        const dbCategories = reservasData.map((dbR: any) => dbR.categoria).filter(Boolean);
        const uniqueCats = Array.from(new Set([...categoriasMaestras, ...dbCategories])) as string[];
        setCategoriasDisponibles(uniqueCats);
      } else {
        const saved = localStorage.getItem('reservas_turismo_data');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setReservasTurismo(parsed);
            }
          } catch {}
        }
        setCategoriasDisponibles(categoriasMaestras);
      }

      // Vehículos
      let vehQuery = supabase.from('vehiculo').select('id, patente, marca, estado');
      if (activeCompanyId && activeCompanyId !== 'GLOBAL') {
        vehQuery = vehQuery.eq('empresa_id', activeCompanyId);
      }
      const { data: vehData, error: vehErr } = await vehQuery;
      if (!vehErr && vehData && vehData.length > 0) {
        setVehiculos(vehData);
        localStorage.setItem('reservas_vehiculos', JSON.stringify(vehData));
      }

      // Conductores
      let condQuery = supabase.from('colaborador').select('id, nombre, estado');
      if (activeCompanyId && activeCompanyId !== 'GLOBAL') {
        condQuery = condQuery.eq('empresa_id', activeCompanyId);
      }
      const { data: condData, error: condErr } = await condQuery;
      if (!condErr && condData && condData.length > 0) {
        setConductores(condData);
        localStorage.setItem('reservas_conductores', JSON.stringify(condData));
      }

      // Rutas
      let rutasQuery = supabase.from('operacion_ruta').select('*').order('created_at', { ascending: false });
      if (activeCompanyId && activeCompanyId !== 'GLOBAL') {
        rutasQuery = rutasQuery.eq('empresa_id', activeCompanyId);
      }
      const { data: rutasData, error: rutasErr } = await rutasQuery;
      if (!rutasErr && rutasData && rutasData.length > 0) {
        setRutasGuardadas(rutasData);
      }

      // Contratos
      let contratosQ = supabase.from('operacion_contrato').select('id, cliente_razon_social').eq('activo', true);
      if (activeCompanyId && activeCompanyId !== 'GLOBAL') {
        contratosQ = contratosQ.eq('empresa_id', activeCompanyId);
      }
      const { data: contratosData, error: contErr } = await contratosQ;
      if (!contErr && contratosData && contratosData.length > 0) {
        setContratos(contratosData.map(c => ({ id: c.id, razonSocial: c.cliente_razon_social })));
      }

      // Empresas
      const { data: empData, error: empErr } = await supabase.from('empresa').select('id, nombre');
      if (!empErr && empData && empData.length > 0) {
        setUserCompanies(empData);
        if (!newEmpresaId) setNewEmpresaId(empData[0].id);
      }
    } catch (error) {
      console.warn('Carga de datos Supabase offline/fallback:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeCompanyId]);
  
  const opcionesFecha: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const fechaTexto = new Date().toLocaleDateString('es-ES', opcionesFecha);
  const fechaHoy = fechaTexto.charAt(0).toUpperCase() + fechaTexto.slice(1);
  
  // States for filters
  const [busqueda, setBusqueda] = useState('');
  const [filtroVehiculo, setFiltroVehiculo] = useState('');
  const [filtroConductor, setFiltroConductor] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 8;

  // State for Modal / Details
  const [reservaSeleccionada, setReservaSeleccionada] = useState<ReservaTurismo | null>(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(() => {
    try {
      return localStorage.getItem('mostrarFormularioDraft') === 'true';
    } catch { return false; }
  });

  // Initial Form State
  const initialFormState: any = {
    categoria: 'Transfer Aeropuerto',
    cliente: { nombre: '', email: '', telefono: '', dni_pasaporte: '', rut_empresa: '', tipoCliente: 'Particular', contratoId: '' },
    pasajeros: { nombre: '', telefono: '', cantidad: 1 },
    pasajerosList: [],
    lugares: { origen: '', destino: '', numeroVuelo: '' },
    logistica: { maletasGrandes: 0, maletasChicas: 0, sillaBebe: false, alzador: false, cantidadSillas: 0, cantidadAlzadores: 0 },
    servicio: '',
    tipoVehiculo: 'Van' as const,
    enlaceMapa: '',
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: '09:00',
    conductorId: '',
    vehiculoId: '',
    finanzas: {
      montoBruto: 0,
      gastosAdicionales: 0,
      porcentajeComision: 10,
      formaPago: 'Efectivo',
      tipoDocumento: 'Boleta',
      cobrado: false,
      fechaDeposito: ''
    },
    archivosAdicionales: [],
    comentarios: { conductor: '', interno: '' }
  };

  const [formReserva, setFormReserva] = useState(() => {
    try {
      const saved = localStorage.getItem('formReservaDraft');
      if (saved) return JSON.parse(saved);
    } catch(e){}
    return initialFormState;
  });

  useEffect(() => {
    localStorage.setItem('formReservaDraft', JSON.stringify(formReserva));
    localStorage.setItem('mostrarFormularioDraft', mostrarFormulario.toString());
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
       if (mostrarFormulario) {
         e.preventDefault();
         e.returnValue = '';
       }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formReserva, mostrarFormulario]);

  const empresasConvenio = useMemo(() => Array.from(new Set(reservasTurismo.map(r => r.cliente.nombre).filter(Boolean))), [reservasTurismo]);
  const lugaresComunes = useMemo(() => {
    const list = new Set([...reservasTurismo.map(r => r.lugares.origen), ...reservasTurismo.map(r => r.lugares.destino)].filter(Boolean));
    ['Aeropuerto Arturo Merino Benítez (SCL)', 'Terminal de Bus', 'Hotel W Santiago', 'Hotel Mandarin Oriental', 'Valparaíso / Viña del Mar'].forEach(l => list.add(l));
    return Array.from(list);
  }, [reservasTurismo]);

  const telefonosComunes = useMemo(() => {
    const list = new Set(reservasTurismo.map(r => r.pasajeros.telefono).filter(Boolean));
    return Array.from(list);
  }, [reservasTurismo]);

  const handlePhoneChange = (val: string) => {
    setFormReserva((prev: any) => ({...prev, pasajeros: {...prev.pasajeros, telefono: val}}));
    const match = reservasTurismo.find(r => r.pasajeros.telefono === val);
    if (match) {
      setFormReserva((prev: any) => ({
        ...prev,
        pasajeros: {
          ...prev.pasajeros,
          telefono: val,
          nombre: prev.pasajeros.nombre || match.pasajeros.nombre
        },
        cliente: {
          ...prev.cliente,
          nombre: prev.cliente.nombre || match.cliente.nombre || prev.pasajeros.nombre || match.pasajeros.nombre
        },
        lugares: {
          ...prev.lugares,
          origen: prev.lugares.origen || match.lugares.origen,
          destino: prev.lugares.destino || match.lugares.destino
        }
      }));
    }
  };

  // Filter Logic
  const reservasFiltradas = reservasTurismo.filter(res => {
    const term = busqueda.toLowerCase();
    const matchesBusqueda = 
      res.cliente.nombre.toLowerCase().includes(term) || 
      res.servicio.toLowerCase().includes(term) ||
      res.op.toLowerCase().includes(term) ||
      res.cliente.telefono.includes(term) ||
      (res.lugares.origen || '').toLowerCase().includes(term) ||
      (res.lugares.destino || '').toLowerCase().includes(term);
    
    const matchesVehiculo = filtroVehiculo ? res.vehiculoId === filtroVehiculo : true;
    const matchesConductor = filtroConductor ? res.conductorId === filtroConductor : true;
    const matchesEstado = filtroEstado ? (res.estado || '').toLowerCase() === filtroEstado.toLowerCase() : true;
    const matchesCategoria = filtroCategoria ? res.categoria === filtroCategoria : true;
    
    const resFecha = new Date(res.fecha);
    const matchesFechaInicio = fechaInicio ? resFecha >= new Date(fechaInicio) : true;
    const matchesFechaFin = fechaFin ? resFecha <= new Date(fechaFin) : true;
    
    return matchesBusqueda && matchesVehiculo && matchesConductor && matchesEstado && matchesCategoria && matchesFechaInicio && matchesFechaFin;
  });

  const totalPaginas = Math.ceil(reservasFiltradas.length / itemsPorPagina) || 1;
  const offset = (paginaActual - 1) * itemsPorPagina;
  const reservasPaginadas = reservasFiltradas.slice(offset, offset + itemsPorPagina);

  const handleExport = () => {
    const dataToExport = reservasFiltradas.map(r => {
      const v = vehiculos.find(veh => veh.id === r.vehiculoId);
      const c = conductores.find(cond => cond.id === r.conductorId);
      return {
        'ID/OP': r.op,
        'Categoría': r.categoria,
        'Cliente': r.cliente.nombre,
        'RUT Empresa': r.cliente.rut_empresa || 'N/A',
        'Pax Principal': r.pasajeros.nombre,
        'Tel Pax': r.pasajeros.telefono,
        'Cantidad Pax': r.pasajeros.cantidad,
        'Servicio': r.servicio,
        'Origen': r.lugares.origen,
        'Destino': r.lugares.destino,
        'N° Vuelo': r.lugares.numeroVuelo || 'N/A',
        'Fecha': r.fecha,
        'Hora Inicio': r.horaInicio,
        'Vehículo': v ? `${v.patente} (${v.marca || ''})` : 'N/A',
        'Conductor': c ? c.nombre : 'N/A',
        'Monto Bruto': r.finanzas.montoBruto,
        'Gastos Adic.': r.finanzas.gastosAdicionales,
        'Neto': r.finanzas.montoNeto,
        'Estado': r.estado,
        'Cobrado': r.finanzas.cobrado ? 'SÍ' : 'NO'
      };
    });
    exportToExcel(dataToExport, `Reservas_${new Date().toISOString().split('T')[0]}`, 'Reservas');
  };

  const calcularNeto = (bruto: number, adicional: number, comision: number) => {
    return (bruto - adicional) * (1 - comision / 100);
  };

  const handleActualizarEstado = async (nuevoEstado: string) => {
    if (!reservaSeleccionada) return;
    const updated = reservasTurismo.map(r => r.id === reservaSeleccionada.id ? { ...r, estado: nuevoEstado } : r);
    setReservasTurismo(updated);
    localStorage.setItem('reservas_turismo_data', JSON.stringify(updated));
    setReservaSeleccionada({ ...reservaSeleccionada, estado: nuevoEstado });

    try {
      await supabase.from('operacion_reserva').update({ estado_viaje: nuevoEstado }).eq('id', reservaSeleccionada.id);
    } catch (e) {
      console.warn('Actualización Supabase omitida:', e);
    }
    setMostrarDetalle(false);
  };

  const handleCopiarReserva = (reserva: ReservaTurismo, tipo: 'chofer' | 'pasajero') => {
    const c = conductores.find(cond => cond.id === reserva.conductorId);
    const v = vehiculos.find(veh => veh.id === reserva.vehiculoId);
    
    let texto = `https://www.fastour.cl/\n`;
    texto += `OP: ${reserva.op}   Tipo: ${reserva.categoria}\n`;
    texto += `Fecha: ${reserva.fecha}\n`;
    texto += `Hora🛑⏰: ${reserva.horaInicio}\n`;
    
    if (reserva.lugares.numeroVuelo) {
       texto += `🛑 Vuelo: ${reserva.lugares.numeroVuelo}\n`;
    }

    texto += `(Vehículo: ${v ? v.patente : reserva.tipoVehiculo} + ${reserva.pasajeros.cantidad} Pax + ${reserva.logistica.maletasGrandes || 0} MG 23K + ${reserva.logistica.maletasChicas || 0} Mch)\n`;
    texto += `📞 ${reserva.cliente.telefono}\n`;
    texto += `Empresa: *${reserva.cliente.nombre} ${reserva.cliente.rut_empresa ? reserva.cliente.rut_empresa : ''}*\n`;
    texto += `Pax: *${reserva.pasajeros.nombre}*\n`;
    texto += `A Origen: *${reserva.lugares.origen}*\n`;
    
    if (reserva.pasajerosList && reserva.pasajerosList.length > 0) {
       texto += `B Destino: *PASAJERO 1: ${reserva.lugares.destino}*\n`;
       reserva.pasajerosList.forEach((p, idx) => {
          texto += `PASAJERO ${idx + 2}: ${p.nombre} ${p.telefono ? p.telefono : ''} ${p.destino}\n`;
       });
    } else {
       texto += `B Destino: *${reserva.lugares.destino}*\n`;
    }

    if (tipo === 'chofer') {
       texto += `Monto: $${reserva.finanzas.montoBruto.toLocaleString()} ${reserva.finanzas.tipoDocumento}\n`;
       texto += `Conductor: ${c ? c.nombre : 'Sin Asignar'}\n`;
       texto += `Pago: ${reserva.finanzas.formaPago}\n`;
       texto += `Comentarios: 🛑👁️ ${reserva.comentarios.conductor || ''} ${reserva.comentarios.interno || ''} ${reserva.enlaceMapa || ''}\n`;
    } else {
       texto += `Conductor: ${c ? c.nombre : 'Sin Asignar'}\n`;
       if (reserva.comentarios.conductor || reserva.enlaceMapa) {
          texto += `Comentarios: ${reserva.comentarios.conductor || ''} ${reserva.enlaceMapa || ''}\n`;
       }
    }

    navigator.clipboard.writeText(texto).then(() => {
       alert(`Copiado formato para ${tipo}`);
    }).catch(err => {
       console.error(err);
       alert('Error al copiar al portapapeles');
    });
  };

  const handleCrearReserva = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCompanyId = activeCompanyId === 'GLOBAL' ? (newEmpresaId || DEFAULT_EMPRESAS[0].id) : activeCompanyId;

    const neto = calcularNeto(formReserva.finanzas.montoBruto, formReserva.finanzas.gastosAdicionales, formReserva.finanzas.porcentajeComision);
    
    const isEdit = !!(formReserva as any).id;
    const auditLogs = (formReserva as any).auditLogs || [];

    const newOp = isEdit ? (formReserva as any).op : `OP-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`;
    const newId = isEdit ? (formReserva as any).id : `res-${Date.now()}`;

    const reservationData: any = {
      empresa_id: finalCompanyId,
      categoria: formReserva.categoria || 'Transfer Aeropuerto',
      cliente_nombre: formReserva.cliente.nombre,
      cliente_email: formReserva.cliente.email,
      cliente_telefono: formReserva.cliente.telefono,
      cliente_rut: formReserva.cliente.rut_empresa,
      origen: formReserva.lugares.origen,
      destino: formReserva.lugares.destino,
      fecha_reserva: formReserva.fecha ? new Date(`${formReserva.fecha}T${formReserva.horaInicio || '00:00'}:00`).toISOString() : null,
      pasajeros_cantidad: formReserva.pasajeros.cantidad,
      monto_total: formReserva.finanzas.montoBruto,
      estado_pago: formReserva.finanzas.cobrado ? 'Pagado' : 'Pendiente',
      conductor_id: formReserva.conductorId || null,
      vehiculo_id: formReserva.vehiculoId || null,
      detalles: {
        cliente: formReserva.cliente,
        pasajeros: formReserva.pasajeros,
        pasajerosList: formReserva.pasajerosList,
        archivosAdicionales: formReserva.archivosAdicionales,
        lugares: formReserva.lugares,
        logistica: formReserva.logistica,
        servicio: formReserva.servicio || `${formReserva.categoria} (${formReserva.lugares.origen} → ${formReserva.lugares.destino})`,
        tipoVehiculo: formReserva.tipoVehiculo,
        enlaceMapa: (formReserva as any).enlaceMapa,
        horaInicio: formReserva.horaInicio,
        finanzas: {
          ...formReserva.finanzas,
          montoNeto: neto
        },
        comentarios: formReserva.comentarios,
        auditLogs: isEdit 
            ? [...auditLogs, { accion: 'Reserva Actualizada', quien: 'Operador', cuando: new Date().toISOString() }]
            : [{ accion: 'Reserva Creada', quien: 'Operador', cuando: new Date().toISOString() }]
      }
    };

    if (!isEdit) {
       reservationData.codigo = newOp;
       reservationData.estado_viaje = 'Confirmado';
    }

    const localReserva: ReservaTurismo = {
      id: newId,
      op: newOp,
      categoria: formReserva.categoria || 'Transfer Aeropuerto',
      cliente: { ...formReserva.cliente },
      pasajeros: { ...formReserva.pasajeros },
      pasajerosList: [...(formReserva.pasajerosList || [])],
      lugares: { ...formReserva.lugares },
      logistica: { ...formReserva.logistica },
      servicio: reservationData.detalles.servicio,
      tipoVehiculo: formReserva.tipoVehiculo,
      enlaceMapa: (formReserva as any).enlaceMapa || '',
      fecha: formReserva.fecha,
      horaInicio: formReserva.horaInicio,
      conductorId: formReserva.conductorId || '',
      vehiculoId: formReserva.vehiculoId || '',
      finanzas: {
        ...formReserva.finanzas,
        montoNeto: neto
      },
      archivosAdicionales: formReserva.archivosAdicionales || [],
      comentarios: { ...formReserva.comentarios },
      estado: isEdit ? ((formReserva as any).estado || 'confirmado') : 'confirmado',
      auditLogs: reservationData.detalles.auditLogs
    };

    // Update local state and localStorage immediately
    let updatedList: ReservaTurismo[];
    if (isEdit) {
      updatedList = reservasTurismo.map(r => r.id === localReserva.id ? localReserva : r);
    } else {
      updatedList = [localReserva, ...reservasTurismo];
    }
    setReservasTurismo(updatedList);
    localStorage.setItem('reservas_turismo_data', JSON.stringify(updatedList));

    // Also attempt Supabase insert in background
    try {
      if (isEdit) {
        await supabase.from('operacion_reserva').update(reservationData).eq('id', (formReserva as any).id);
      } else {
        await supabase.from('operacion_reserva').insert([reservationData]);
      }
    } catch (err) {
      console.warn('Sync to Supabase omitido (modo híbrido activo):', err);
    }

    setMostrarFormulario(false);
    setFormReserva(initialFormState);
    localStorage.removeItem('formReservaDraft');
  };

  const verDetalle = (reserva: ReservaTurismo) => {
    setReservaSeleccionada(reserva);
    setMostrarDetalle(true);
  };

  const clonarReserva = (reserva: ReservaTurismo) => {
    setFormReserva({
      ...reserva,
      id: undefined,
      op: undefined,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'confirmado',
      finanzas: {
        ...reserva.finanzas,
        cobrado: false,
        folioFactura: undefined,
        fechaDeposito: undefined
      }
    });
    setMostrarFormulario(true);
  };

  const handleCrearVehiculo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoVehiculoForm.patente.trim()) return;
    const nuevoV: Vehiculo = {
      id: `veh-${Date.now()}`,
      patente: nuevoVehiculoForm.patente.toUpperCase().trim(),
      marca: nuevoVehiculoForm.marca.trim(),
      modelo: nuevoVehiculoForm.modelo.trim(),
      tipo: nuevoVehiculoForm.tipo,
      capacidadPax: Number(nuevoVehiculoForm.capacidadPax) || 10,
      estado: 'Disponible'
    };
    const updated = [nuevoV, ...vehiculos];
    setVehiculos(updated);
    localStorage.setItem('reservas_vehiculos', JSON.stringify(updated));
    setFormReserva((prev: any) => ({
      ...prev,
      vehiculoId: nuevoV.id,
      tipoVehiculo: (nuevoV.tipo as any) || prev.tipoVehiculo
    }));
    setNuevoVehiculoForm({ patente: '', marca: '', modelo: '', tipo: 'Van', capacidadPax: 15 });
    setMostrarPanelVehiculos(false);
  };

  const handleCrearConductor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoConductorForm.nombre.trim()) return;
    const nuevoC: Conductor = {
      id: `cond-${Date.now()}`,
      nombre: nuevoConductorForm.nombre.trim(),
      telefono: nuevoConductorForm.telefono.trim(),
      rol: nuevoConductorForm.rol.trim(),
      licencia: nuevoConductorForm.licencia.trim(),
      estado: 'Activo'
    };
    const updated = [nuevoC, ...conductores];
    setConductores(updated);
    localStorage.setItem('reservas_conductores', JSON.stringify(updated));
    setFormReserva((prev: any) => ({ ...prev, conductorId: nuevoC.id }));
    setNuevoConductorForm({ nombre: '', telefono: '', rol: 'Conductor Turismo & Transfer', licencia: 'A2' });
    setMostrarPanelConductores(false);
  };

  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case 'Web / Online':
      case 'Web':
        return { card: 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800', textBase: 'text-blue-700 dark:text-blue-400', innerBox: 'border-blue-400 dark:border-blue-700 bg-white dark:bg-slate-800/50', innerText: 'text-blue-700 dark:text-blue-300', button: 'border-blue-500 text-blue-600 dark:text-blue-400', iconBox: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400' };
      case 'Whatsapp Directo':
      case 'Whatsapp':
        return { card: 'bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-800', textBase: 'text-green-700 dark:text-green-400', innerBox: 'border-green-400 dark:border-green-700 bg-white dark:bg-slate-800/50', innerText: 'text-green-700 dark:text-green-300', button: 'border-green-500 text-green-600 dark:text-green-400', iconBox: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400' };
      case 'Transfer Aeropuerto':
        return { card: 'bg-sky-50/50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800', textBase: 'text-sky-700 dark:text-sky-400', innerBox: 'border-sky-400 dark:border-sky-700 bg-white dark:bg-slate-800/50', innerText: 'text-sky-700 dark:text-sky-300', button: 'border-sky-500 text-sky-600 dark:text-sky-400', iconBox: 'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-400' };
      case 'Turismo Receptivo / Tours':
      case 'Turismo Receptivo':
        return { card: 'bg-purple-50/50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800', textBase: 'text-purple-700 dark:text-purple-400', innerBox: 'border-purple-400 dark:border-purple-700 bg-white dark:bg-slate-800/50', innerText: 'text-purple-700 dark:text-purple-300', button: 'border-purple-500 text-purple-600 dark:text-purple-400', iconBox: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400' };
      case 'Minera / Faena':
      case 'Minera':
        return { card: 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', textBase: 'text-emerald-700 dark:text-emerald-400', innerBox: 'border-emerald-600 dark:border-emerald-700 bg-white dark:bg-slate-800/50', innerText: 'text-emerald-700 dark:text-emerald-300', button: 'border-emerald-600 text-emerald-700 dark:text-emerald-400', iconBox: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400' };
      case 'Corporativo / Convenio':
        return { card: 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800', textBase: 'text-indigo-700 dark:text-indigo-400', innerBox: 'border-indigo-400 dark:border-indigo-700 bg-white dark:bg-slate-800/50', innerText: 'text-indigo-700 dark:text-indigo-300', button: 'border-indigo-500 text-indigo-600 dark:text-indigo-400', iconBox: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400' };
      default:
        return { card: 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800', textBase: 'text-slate-700 dark:text-slate-300', innerBox: 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50', innerText: 'text-slate-700 dark:text-slate-300', button: 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300', iconBox: 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Pizarra Máster de Reservas</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="default" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 shadow-sm border dark:border-slate-800 font-medium px-2.5 py-0.5">
              <CalendarIcon className="w-3 h-3 mr-1.5" />
              {fechaHoy}
            </Badge>
            <p className="text-sm text-slate-500 dark:text-slate-400">Gestión de Transfer Aeropuerto, Turismo Receptivo y Vans</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setMostrarFormulario(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" /> Nueva Reserva
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExport}
            className="border-green-600 text-green-600 hover:bg-green-50 dark:bg-green-900/30 dark:hover:bg-green-900/20 shadow-sm"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" /> Exportar Excel
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-800/50 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500"></div>
        <CardContent className="p-4">
          <div className="grid gap-3 md:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input 
                type="text" 
                placeholder="Buscar OP, Pasajero, Teléfono o Lugar..." 
                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:border-slate-800 text-sm focus:ring-2 focus:ring-blue-500 bg-slate-50/50 dark:bg-slate-900/50 dark:text-slate-100"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <select 
              className="px-3 py-2 border rounded-lg dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900/50 dark:text-slate-100"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
            >
              <option value="">Todas las Categorías ({categoriasDisponibles.length})</option>
              {categoriasDisponibles.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select 
              className="px-3 py-2 border rounded-lg dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900/50 dark:text-slate-100"
              value={filtroVehiculo}
              onChange={(e) => setFiltroVehiculo(e.target.value)}
            >
              <option value="">Todos los Vehículos ({vehiculos.length})</option>
              {vehiculos.map(v => (
                 <option key={v.id} value={v.id}>{v.patente} — {v.marca || ''} {v.modelo || ''}</option>
              ))}
            </select>
            <select 
              className="px-3 py-2 border rounded-lg dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900/50 dark:text-slate-100"
              value={filtroConductor}
              onChange={(e) => setFiltroConductor(e.target.value)}
            >
              <option value="">Todos los Conductores ({conductores.length})</option>
              {conductores.map(c => (
                 <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            <select 
              className="px-3 py-2 border rounded-lg dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900/50 dark:text-slate-100"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="">Todos los Estados</option>
              <option value="confirmado">Confirmado</option>
              <option value="pendiente">Pendiente</option>
              <option value="en curso">En Curso</option>
              <option value="finalizado">Finalizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Grid of Reservation Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {reservasPaginadas.map(res => {
          const conductor = conductores.find(c => c.id === res.conductorId);
          const vehiculo = vehiculos.find(v => v.id === res.vehiculoId);
          const diaSemana = res.fecha ? new Date(res.fecha).toLocaleDateString('es-ES', { weekday: 'long' }) : '';
          const theme = getCategoryTheme(res.categoria);
          
          return (
            <Card key={res.id} className={`hover:shadow-lg transition-all border border-2 dark:border-slate-800 rounded-xl ${theme.card}`}>
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className={`text-[11px] font-black uppercase ${theme.textBase}`}>{res.op}</span>
                    <span className={`text-[14px] font-bold leading-tight mt-0.5 line-clamp-2 ${theme.textBase}`}>{res.servicio || res.categoria}</span>
                  </div>
                  <Badge className="text-[10px] h-6 px-2 font-bold uppercase" variant={(res.estado || '').toLowerCase().includes('confirm') ? 'default' : 'outline'}>
                    {res.estado}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3 pt-1">
                <div className="space-y-1 mt-1">
                  <div className="flex items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                    <User className="h-3.5 w-3.5 mr-2 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span className="truncate">{res.pasajeros.nombre || res.cliente.nombre}</span>
                  </div>
                  <div className="flex items-center text-[11px] text-slate-500 dark:text-slate-400">
                    <Phone className="h-3 w-3 mr-2 text-slate-400 shrink-0" />
                    <span>{res.pasajeros.telefono || res.cliente.telefono || 'Sin teléfono'}</span>
                  </div>
                </div>

                <div className={`p-3 rounded-lg border dark:border-slate-800 space-y-2 ${theme.innerBox}`}>
                   <div className="flex items-center text-[10px] font-medium">
                      <MapPin className={`h-3 w-3 mr-2 shrink-0 ${theme.textBase}`} />
                      <span className={`line-clamp-1 ${theme.innerText}`}>{res.lugares.origen || 'Origen por definir'}</span>
                   </div>
                   <div className="flex items-center text-[10px] font-medium ml-1">
                      <ChevronRight className="h-3 w-3 mr-2 text-slate-400 shrink-0" />
                      <span className={`line-clamp-1 ${theme.innerText}`}>{res.lugares.destino || 'Destino por definir'}</span>
                   </div>
                   {res.lugares.numeroVuelo && (
                     <div className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                       Vuelo: {res.lugares.numeroVuelo}
                     </div>
                   )}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="text-[10px] flex flex-col">
                    <span className="text-slate-400 dark:text-slate-500 uppercase font-black tracking-wide">Fecha / Día</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">{res.fecha} {diaSemana ? `(${diaSemana.substring(0, 3)})` : ''}</span>
                  </div>
                  <div className="text-[10px] flex flex-col text-right">
                    <span className="text-slate-400 dark:text-slate-500 uppercase font-black tracking-wide">Horario</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">{res.horaInicio || '00:00'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t mt-3 border-slate-200 dark:border-slate-800">
                   <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[11px] font-bold shadow-inner shrink-0">
                        {conductor?.nombre?.[0] || 'C'}
                      </div>
                      <div className="flex flex-col justify-center overflow-hidden">
                         <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest leading-none truncate">
                           {conductor ? conductor.nombre.split(' ')[0] : 'Sin Conductor'}
                         </span>
                         <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight mt-0.5 truncate">
                           {vehiculo ? `${vehiculo.patente}` : res.tipoVehiculo}
                         </span>
                      </div>
                   </div>
                   <div className="flex gap-1.5 shrink-0">
                      <Button variant="ghost" size="icon" className={`h-8 w-8 bg-transparent rounded-full border dark:border-slate-800 ${theme.button} hover:bg-white dark:hover:bg-slate-800/50`} onClick={() => clonarReserva(res)} title="Replicar Servicio">
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 bg-blue-600 text-white rounded-full shadow-sm hover:bg-blue-700" onClick={() => verDetalle(res)} title="Ver Ficha Completa">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                   </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {reservasFiltradas.length > itemsPorPagina && (
        <Pagination 
          currentPage={paginaActual}
          totalPages={totalPaginas}
          onPageChange={setPaginaActual}
        />
      )}

      {/* Modal Detalle / Finanzas / Auditoría */}
      {mostrarDetalle && reservaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-800/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-4xl bg-white dark:bg-slate-900 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-white dark:bg-slate-900 px-6 py-4">
              <div className="flex items-center gap-3">
                 <div className={`p-2.5 rounded-xl ${getCategoryTheme(reservaSeleccionada.categoria).iconBox}`}>
                    <Briefcase className="h-5 w-5" />
                 </div>
                 <div>
                    <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Gestión de Reserva {reservaSeleccionada.op}</CardTitle>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium pt-0.5">Categoría: {reservaSeleccionada.categoria}</p>
                 </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setMostrarDetalle(false)} className="rounded-full hover:bg-slate-100 dark:bg-slate-800 p-1.5 h-auto w-auto group">
                <XCircle className="h-6 w-6 text-slate-500 group-hover:text-slate-900 dark:text-slate-100" />
              </Button>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto max-h-[75vh]">
              <div className="grid md:grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800">
                {/* Info Principal */}
                <div className="col-span-2 p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <section className="space-y-3">
                       <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-b pb-1">Logística de Carga & Pasajeros</h4>
                       <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                             <span className="text-slate-500 dark:text-slate-400">Total Pasajeros:</span>
                             <span className="font-bold">{reservaSeleccionada.pasajeros.cantidad} PAX</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-slate-500 dark:text-slate-400">Maletas Grandes (23K):</span>
                             <span className="font-bold">{reservaSeleccionada.logistica.maletasGrandes}</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-slate-500 dark:text-slate-400">Maletas Cabina:</span>
                             <span className="font-bold">{reservaSeleccionada.logistica.maletasChicas}</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <span className="text-slate-500 dark:text-slate-400">Sillas de Bebé / Alzador:</span>
                             <span className="font-bold">{reservaSeleccionada.logistica.cantidadSillas || 0}</span>
                          </div>
                       </div>
                    </section>
                    <section className="space-y-3">
                       <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b pb-1">Recorrido y Flota</h4>
                       <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">Origen</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">{reservaSeleccionada.lugares.origen}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">Destino</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">{reservaSeleccionada.lugares.destino}</span>
                          </div>
                          <div className="pt-1">
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">Vehículo Asignado</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {(() => {
                                const v = vehiculos.find(veh => veh.id === reservaSeleccionada.vehiculoId);
                                return v ? `${v.patente} — ${v.marca || ''} ${v.modelo || ''}` : reservaSeleccionada.tipoVehiculo;
                              })()}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">Conductor Asignado</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {(() => {
                                const c = conductores.find(cond => cond.id === reservaSeleccionada.conductorId);
                                return c ? `${c.nombre} (${c.telefono || ''})` : 'Sin Asignar';
                              })()}
                            </span>
                          </div>
                       </div>
                    </section>
                  </div>

                  {reservaSeleccionada.comentarios && (
                    <section className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-xs">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Comentarios de Operación</h4>
                      {reservaSeleccionada.comentarios.conductor && (
                        <p><strong className="text-blue-600">Para Conductor:</strong> {reservaSeleccionada.comentarios.conductor}</p>
                      )}
                      {reservaSeleccionada.comentarios.interno && (
                        <p><strong className="text-red-600">Interno:</strong> {reservaSeleccionada.comentarios.interno}</p>
                      )}
                    </section>
                  )}
                </div>

                {/* Finanzas Panel */}
                <div className="bg-slate-50 dark:bg-slate-900 p-6 space-y-5">
                   <h4 className="text-[10px] font-black text-green-700 uppercase tracking-widest border-b pb-1">Liquidación Financiera</h4>
                   <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                         <span className="text-slate-500 dark:text-slate-400">Monto Bruto:</span>
                         <span className="text-sm font-bold text-slate-900 dark:text-slate-100">${reservaSeleccionada.finanzas.montoBruto.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-slate-500 dark:text-slate-400">Gastos Adicionales:</span>
                         <span className="font-bold text-red-600">-${reservaSeleccionada.finanzas.gastosAdicionales.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-slate-500 dark:text-slate-400">Comisión ({reservaSeleccionada.finanzas.porcentajeComision}%):</span>
                         <span className="font-bold text-blue-600">
                           -${Math.round((reservaSeleccionada.finanzas.montoBruto - reservaSeleccionada.finanzas.gastosAdicionales) * (reservaSeleccionada.finanzas.porcentajeComision / 100)).toLocaleString()}
                         </span>
                      </div>
                      <div className="bg-emerald-600 p-3 rounded-xl text-white shadow-md text-center mt-3">
                         <p className="text-[9px] font-black uppercase opacity-90 tracking-wider">Resultado Neto Líquido</p>
                         <p className="text-xl font-black">${Math.round(calcularNeto(reservaSeleccionada.finanzas.montoBruto, reservaSeleccionada.finanzas.gastosAdicionales, reservaSeleccionada.finanzas.porcentajeComision)).toLocaleString()}</p>
                      </div>
                   </div>

                   <div className="pt-2 border-t dark:border-slate-800 space-y-2 text-xs">
                     <div className="flex justify-between">
                       <span className="text-slate-500">Documento:</span>
                       <span className="font-bold">{reservaSeleccionada.finanzas.tipoDocumento}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-slate-500">Forma de Pago:</span>
                       <span className="font-bold">{reservaSeleccionada.finanzas.formaPago}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-slate-500">Cobrado:</span>
                       <span className={`font-bold ${reservaSeleccionada.finanzas.cobrado ? 'text-green-600' : 'text-orange-500'}`}>
                         {reservaSeleccionada.finanzas.cobrado ? 'PAGADO' : 'PENDIENTE'}
                       </span>
                     </div>
                   </div>
                </div>
              </div>
            </CardContent>
            <div className="p-4 border-t bg-white dark:bg-slate-900 flex flex-col md:flex-row justify-between items-center gap-3">
               <div className="flex flex-wrap gap-2">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 shadow-md" size="sm" onClick={() => handleCopiarReserva(reservaSeleccionada, 'pasajero')}>
                     <Copy className="h-4 w-4 mr-1.5" /> Copiar Pax
                  </Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 shadow-md" size="sm" onClick={() => handleCopiarReserva(reservaSeleccionada, 'chofer')}>
                     <Copy className="h-4 w-4 mr-1.5" /> Copiar Chofer
                  </Button>
               </div>
               <div className="flex gap-2 w-full md:w-auto">
                  <Button variant="outline" size="sm" onClick={() => {
                      setFormReserva(reservaSeleccionada as any);
                      setMostrarDetalle(false);
                      setMostrarFormulario(true);
                  }}>Editar</Button>
                  <Button variant="outline" size="sm" className="border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => handleActualizarEstado('cancelado')}>
                    Anular
                  </Button>
                  <Button size="sm" onClick={() => handleActualizarEstado('finalizado')} className="bg-slate-900 text-white hover:bg-black dark:bg-slate-800">
                    Marcar Finalizado
                  </Button>
               </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Gestionar Categorías */}
      {mostrarPanelCategorias && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 dark:bg-slate-800/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl overflow-hidden rounded-2xl animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between border-b dark:border-slate-800 bg-indigo-600 text-white px-5 py-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Settings className="h-4 w-4" /> Gestionar Categorías
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setMostrarPanelCategorias(false)} className="text-white hover:bg-indigo-700/50 rounded-full h-8 w-8 p-0">
                <XCircle className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex gap-2">
                 <input 
                   type="text" 
                   required 
                   className="flex-1 px-3 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500" 
                   placeholder="Nueva Categoría" 
                   value={nuevaCategoriaForm}
                   onChange={e => setNuevaCategoriaForm(e.target.value)}
                 />
                 <Button type="button" onClick={() => {
                    if (nuevaCategoriaForm.trim() && !categoriasMaestras.includes(nuevaCategoriaForm.trim())) {
                      guardarCategorias([...categoriasMaestras, nuevaCategoriaForm.trim()]);
                      setNuevaCategoriaForm('');
                    }
                 }} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                    Agregar
                 </Button>
              </div>

              <div className="space-y-2 max-h-[30vh] overflow-y-auto mt-4 pr-1">
                {categoriasMaestras.map(cat => (
                  <div key={cat} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm font-medium border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-800 dark:text-slate-200">{cat}</span>
                    <button 
                      type="button" 
                      onClick={() => {
                        if (categoriasMaestras.length > 1) {
                          guardarCategorias(categoriasMaestras.filter(c => c !== cat));
                        }
                      }}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="p-4 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
              <Button onClick={() => setMostrarPanelCategorias(false)} variant="outline" className="w-full">
                Cerrar Panel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Nuevo Vehículo */}
      {mostrarPanelVehiculos && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 dark:bg-slate-800/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl overflow-hidden rounded-2xl animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between border-b dark:border-slate-800 bg-blue-600 text-white px-5 py-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Truck className="h-4 w-4" /> Registrar Vehículo en Flota
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setMostrarPanelVehiculos(false)} className="text-white hover:bg-blue-700/50 rounded-full h-8 w-8 p-0">
                <XCircle className="h-5 w-5" />
              </Button>
            </CardHeader>
            <form onSubmit={handleCrearVehiculo}>
              <CardContent className="p-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Patente *</label>
                    <input 
                      type="text" required placeholder="Ej: ABCD-12"
                      className="w-full px-3 py-2 border rounded-lg text-sm font-bold uppercase dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      value={nuevoVehiculoForm.patente}
                      onChange={e => setNuevoVehiculoForm({...nuevoVehiculoForm, patente: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Tipo de Vehículo</label>
                    <select 
                      className="w-full px-3 py-2 border rounded-lg text-sm font-bold dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      value={nuevoVehiculoForm.tipo}
                      onChange={e => setNuevoVehiculoForm({...nuevoVehiculoForm, tipo: e.target.value as any})}
                    >
                      <option value="Van">Van (10-19 Pax)</option>
                      <option value="Mini Bus">Mini Bus (15-25 Pax)</option>
                      <option value="SUV">SUV VIP (4-6 Pax)</option>
                      <option value="Bus">Bus Pasajeros (44 Pax)</option>
                      <option value="Auto">Sedán / Auto (1-4 Pax)</option>
                      <option value="Otros">Otros</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Marca</label>
                    <input 
                      type="text" placeholder="Ej: Mercedes-Benz"
                      className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      value={nuevoVehiculoForm.marca}
                      onChange={e => setNuevoVehiculoForm({...nuevoVehiculoForm, marca: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Modelo</label>
                    <input 
                      type="text" placeholder="Ej: Sprinter 515"
                      className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      value={nuevoVehiculoForm.modelo}
                      onChange={e => setNuevoVehiculoForm({...nuevoVehiculoForm, modelo: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Capacidad Pasajeros (PAX)</label>
                  <input 
                    type="number" min="1" max="60" placeholder="15"
                    className="w-full px-3 py-2 border rounded-lg text-sm font-bold dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={nuevoVehiculoForm.capacidadPax}
                    onChange={e => setNuevoVehiculoForm({...nuevoVehiculoForm, capacidadPax: parseInt(e.target.value) || 1})}
                  />
                </div>
              </CardContent>
              <div className="p-4 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-2">
                <Button type="button" variant="outline" onClick={() => setMostrarPanelVehiculos(false)} className="flex-1">Cancelar</Button>
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold">Guardar Vehículo</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal Nuevo Conductor */}
      {mostrarPanelConductores && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 dark:bg-slate-800/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl overflow-hidden rounded-2xl animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between border-b dark:border-slate-800 bg-emerald-600 text-white px-5 py-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <User className="h-4 w-4" /> Registrar Conductor Profesional
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setMostrarPanelConductores(false)} className="text-white hover:bg-emerald-700/50 rounded-full h-8 w-8 p-0">
                <XCircle className="h-5 w-5" />
              </Button>
            </CardHeader>
            <form onSubmit={handleCrearConductor}>
              <CardContent className="p-5 space-y-3">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Nombre Completo *</label>
                  <input 
                    type="text" required placeholder="Ej: Roberto Morales Gómez"
                    className="w-full px-3 py-2 border rounded-lg text-sm font-bold dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={nuevoConductorForm.nombre}
                    onChange={e => setNuevoConductorForm({...nuevoConductorForm, nombre: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Teléfono / WhatsApp</label>
                    <input 
                      type="text" placeholder="+56 9 8888 7777"
                      className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      value={nuevoConductorForm.telefono}
                      onChange={e => setNuevoConductorForm({...nuevoConductorForm, telefono: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Licencia</label>
                    <select 
                      className="w-full px-3 py-2 border rounded-lg text-sm font-bold dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      value={nuevoConductorForm.licencia}
                      onChange={e => setNuevoConductorForm({...nuevoConductorForm, licencia: e.target.value})}
                    >
                      <option value="A2">Clase A2 (Transfers, Taxis, Ambulancias)</option>
                      <option value="A3">Clase A3 (Buses y Minibuses)</option>
                      <option value="A2 / A3">Clase A2 y A3</option>
                      <option value="B">Clase B (Particular)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Especialidad / Rol</label>
                  <input 
                    type="text" placeholder="Ej: Conductor Transfer Aeropuerto & Bilingüe"
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={nuevoConductorForm.rol}
                    onChange={e => setNuevoConductorForm({...nuevoConductorForm, rol: e.target.value})}
                  />
                </div>
              </CardContent>
              <div className="p-4 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-2">
                <Button type="button" variant="outline" onClick={() => setMostrarPanelConductores(false)} className="flex-1">Cancelar</Button>
                <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold">Guardar Conductor</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal Nueva Ruta Maestra */}
      {mostrarCrearRuta && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 dark:bg-slate-800/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl overflow-hidden rounded-2xl animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between border-b dark:border-slate-800 bg-emerald-600 text-white px-5 py-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                 <MapPin className="h-4 w-4" /> Crear Ruta Frecuente
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setMostrarCrearRuta(false)} className="text-white hover:bg-emerald-700/50 rounded-full h-8 w-8 p-0">
                <XCircle className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
                <div>
                   <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 block">Nombre de la Ruta</label>
                   <input 
                     type="text" placeholder="Ej: Aeropuerto ⇄ Hotel Las Condes"
                     className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700 font-bold dark:text-slate-100"
                     value={nuevaRutaForm.nombre}
                     onChange={(e) => setNuevaRutaForm({...nuevaRutaForm, nombre: e.target.value})}
                   />
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 block">Origen</label>
                   <input 
                      type="text" placeholder="Aeropuerto AMB (SCL)"
                      className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                      value={nuevaRutaForm.origen}
                      onChange={(e) => setNuevaRutaForm({...nuevaRutaForm, origen: e.target.value})}
                   />
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 block">Destino</label>
                   <input 
                      type="text" placeholder="Hotel W Santiago"
                      className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                      value={nuevaRutaForm.destino}
                      onChange={(e) => setNuevaRutaForm({...nuevaRutaForm, destino: e.target.value})}
                   />
                </div>
                <div className="pt-2">
                   <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold" onClick={() => {
                      if (!nuevaRutaForm.nombre || !nuevaRutaForm.origen || !nuevaRutaForm.destino) return alert('Completa todos los campos');
                      const linkMap = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(nuevaRutaForm.origen)}&destination=${encodeURIComponent(nuevaRutaForm.destino)}`;
                      
                      const newRuta: Ruta = {
                        id: `ruta-${Date.now()}`,
                        nombre: nuevaRutaForm.nombre,
                        origen: nuevaRutaForm.origen,
                        destino: nuevaRutaForm.destino,
                        enlaceMapa: linkMap
                      };
                      
                      const updated = [newRuta, ...rutasGuardadas];
                      setRutasGuardadas(updated);
                      localStorage.setItem('reservas_rutas', JSON.stringify(updated));
                      setFormReserva({
                        ...formReserva,
                        lugares: { ...formReserva.lugares, origen: nuevaRutaForm.origen, destino: nuevaRutaForm.destino },
                        enlaceMapa: linkMap
                      });
                      setMostrarCrearRuta(false);
                      setNuevaRutaForm({ nombre: '', origen: '', destino: '', enlaceMapa: '' });
                   }}>
                     Guardar y Seleccionar
                   </Button>
                </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Formulario Nueva Reserva / Clonación */}
      {mostrarFormulario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-800/80 backdrop-blur-md p-4">
          <Card className="w-full max-w-4xl bg-white dark:bg-slate-900 shadow-2xl rounded-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-blue-600 text-white px-6 py-4">
              <div className="flex items-center gap-3">
                 <MapPin className="h-6 w-6" />
                 <CardTitle className="text-xl font-bold">
                   {formReserva.id ? `Editar Reserva ${formReserva.op}` : 'Formulario de Reserva'}
                 </CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setMostrarFormulario(false)} className="text-white hover:bg-blue-700 rounded-full">
                <XCircle className="h-6 w-6" />
              </Button>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto max-h-[85vh]">
              <form onSubmit={handleCrearReserva} className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeCompanyId === 'GLOBAL' && (
                  <div className="p-6 bg-slate-50 dark:bg-slate-900/50">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">Empresa Operadora (Propietaria)</label>
                    <select 
                      value={newEmpresaId} 
                      onChange={(e) => setNewEmpresaId(e.target.value)} 
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm font-medium outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
                    >
                      {userCompanies.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>
                )}
                {/* Bloque 1: Cliente y Categoría */}
                <div className="p-6 grid md:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-900/50">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Categoría de Reserva</label>
                      <button 
                        type="button" 
                        onClick={() => setMostrarPanelCategorias(true)} 
                        className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <Settings className="w-3 h-3" />
                        Gestionar
                      </button>
                    </div>
                    <select 
                      className="w-full mt-2 px-3 py-2 border rounded-lg dark:border-slate-800 text-sm font-bold bg-white dark:bg-slate-800 dark:text-slate-100"
                      value={formReserva.categoria}
                      onChange={(e) => setFormReserva({ ...formReserva, categoria: e.target.value as any })}
                    >
                      {categoriasMaestras.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Datos del Cliente Reservante</label>
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-3">
                        <select 
                          className="flex-1 px-3 py-2 border rounded-lg dark:border-slate-800 text-sm font-bold bg-white dark:bg-slate-800 dark:text-slate-100"
                          value={(formReserva.cliente as any).tipoCliente || 'Particular'}
                          onChange={(e) => setFormReserva({...formReserva, cliente: {...formReserva.cliente, tipoCliente: e.target.value}})}
                        >
                           <option value="Particular">Particular</option>
                           <option value="Empresa / Convenio">Empresa / Convenio</option>
                           <option value="Agencia">Agencia de Turismo / Receptivo</option>
                        </select>
                        {((formReserva.cliente as any).tipoCliente === 'Empresa / Convenio' || (formReserva.cliente as any).tipoCliente === 'Agencia') && (
                          <select
                            className="flex-1 px-3 py-2 border rounded-lg dark:border-slate-800 text-sm font-bold bg-white dark:bg-slate-800 dark:text-slate-100 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50"
                            value={(formReserva.cliente as any).contratoId || ''}
                            onChange={(e) => setFormReserva({...formReserva, cliente: {...formReserva.cliente, contratoId: e.target.value}})}
                          >
                            <option value="">Seleccione Contrato / Cuenta...</option>
                            {contratos.map(c => (
                              <option key={c.id} value={c.id}>{c.razonSocial}</option>
                            ))}
                          </select>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative group">
                          <Users className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500" />
                          <input 
                            type="text" required placeholder="Nombre / Razón Social Principal"
                            list="empresas-list"
                            className="w-full pl-10 pr-3 py-2 border rounded-lg dark:border-slate-800 text-sm bg-white dark:bg-slate-800 dark:text-slate-100"
                            value={formReserva.cliente.nombre}
                            onChange={(e) => setFormReserva({...formReserva, cliente: {...formReserva.cliente, nombre: e.target.value}})}
                          />
                          <datalist id="empresas-list">
                            {empresasConvenio.map((empresa, idx) => <option key={idx} value={empresa} />)}
                          </datalist>
                        </div>
                        <div className="relative group">
                           <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500 focus-within:text-blue-500" />
                           <input 
                              type="text" placeholder="Teléfono de Contacto"
                              list="telefonos-list"
                              className="w-full pl-10 pr-3 py-2 border rounded-lg dark:border-slate-800 text-sm font-bold bg-white dark:bg-slate-800 dark:text-slate-100"
                              value={formReserva.pasajeros.telefono}
                              onChange={(e) => handlePhoneChange(e.target.value)}
                           />
                           <datalist id="telefonos-list">
                             {telefonosComunes.map((tel, idx) => <option key={idx} value={tel} />)}
                           </datalist>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative group">
                           <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500 focus-within:text-blue-500" />
                           <input 
                            type="email" placeholder="Email (Opcional)"
                            className="w-full pl-10 pr-3 py-2 border rounded-lg dark:border-slate-800 text-sm bg-white dark:bg-slate-800 dark:text-slate-100"
                            value={formReserva.cliente.email}
                            onChange={(e) => setFormReserva({...formReserva, cliente: {...formReserva.cliente, email: e.target.value}})}
                          />
                        </div>
                        <input 
                          type="text" placeholder="RUT Empresa (Opcional)"
                          className="w-full px-3 py-2 border rounded-lg dark:border-slate-800 text-sm bg-white dark:bg-slate-800 dark:text-slate-100"
                          value={formReserva.cliente.rut_empresa}
                          onChange={(e) => setFormReserva({...formReserva, cliente: {...formReserva.cliente, rut_empresa: e.target.value}})}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bloque 2: Pasajeros y Ruta */}
                <div className="p-6 grid md:grid-cols-2 gap-8 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                   {/* Left Side: Pasajeros y Ruta */}
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                           <Users className="h-4 w-4 text-blue-500" /><MapPin className="h-4 w-4 text-emerald-500 -ml-1" /> PASAJEROS (PAX) Y RUTA
                         </h3>
                         <button type="button" onClick={() => setMostrarCrearRuta(true)} className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                           + Guardar Ruta Frecuente
                         </button>
                      </div>

                      <div className="space-y-3">
                         <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2">
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase block mb-1">Nombre Pasajero Principal</span>
                              <input 
                                 type="text" required placeholder="Nombre Pax"
                                 className="w-full px-3 py-2 border rounded-lg dark:border-slate-800 text-sm bg-white dark:bg-slate-800 dark:text-slate-100"
                                 value={formReserva.pasajeros.nombre}
                                 onChange={(e) => setFormReserva({...formReserva, pasajeros: {...formReserva.pasajeros, nombre: e.target.value}})}
                              />
                            </div>
                            <div className="col-span-1">
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase block mb-1">Cant. Pax</span>
                              <input 
                                 type="number" min="1" max="60" required
                                 className="w-full px-3 py-2 border rounded-lg dark:border-slate-800 text-sm font-bold text-center bg-white dark:bg-slate-800 dark:text-slate-100"
                                 value={formReserva.pasajeros.cantidad}
                                 onChange={(e) => setFormReserva({...formReserva, pasajeros: {...formReserva.pasajeros, cantidad: parseInt(e.target.value) || 1}})}
                              />
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-3">
                            <div>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase block mb-1">Origen (Recogida)</span>
                              <input 
                                 type="text" required placeholder="Hotel / Aeropuerto / Domicilio"
                                 list="lugares-list"
                                 className="w-full px-3 py-2 border rounded-lg dark:border-slate-800 text-sm bg-white dark:bg-slate-800 dark:text-slate-100"
                                 value={formReserva.lugares.origen}
                                 onChange={(e) => setFormReserva({...formReserva, lugares: {...formReserva.lugares, origen: e.target.value}})}
                              />
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase block mb-1">Destino Final</span>
                              <input 
                                 type="text" required placeholder="Destino del traslado"
                                 list="lugares-list"
                                 className="w-full px-3 py-2 border rounded-lg dark:border-slate-800 text-sm bg-white dark:bg-slate-800 dark:text-slate-100"
                                 value={formReserva.lugares.destino}
                                 onChange={(e) => setFormReserva({...formReserva, lugares: {...formReserva.lugares, destino: e.target.value}})}
                              />
                            </div>
                         </div>

                         <div className="grid grid-cols-2 gap-3">
                            <div>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase block mb-1">N° Vuelo (Tracking)</span>
                              <input 
                                 type="text" placeholder="Ej: LA-500 / IB-6830"
                                 className="w-full px-3 py-2 border rounded-lg dark:border-slate-800 text-sm bg-white dark:bg-slate-800 dark:text-slate-100"
                                 value={formReserva.lugares.numeroVuelo}
                                 onChange={(e) => setFormReserva({...formReserva, lugares: {...formReserva.lugares, numeroVuelo: e.target.value}})}
                              />
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase block mb-1">Servicio / Glosa</span>
                              <input 
                                 type="text" placeholder="Ej: Transfer Aeropuerto In"
                                 className="w-full px-3 py-2 border rounded-lg dark:border-slate-800 text-sm bg-white dark:bg-slate-800 dark:text-slate-100"
                                 value={formReserva.servicio}
                                 onChange={(e) => setFormReserva({...formReserva, servicio: e.target.value})}
                              />
                            </div>
                         </div>

                         <datalist id="lugares-list">
                           {lugaresComunes.map((l, idx) => <option key={idx} value={l} />)}
                         </datalist>
                      </div>
                   </div>

                   {/* Right Side: Día/Hora + Vehículo + Chofer */}
                   <div className="space-y-6">
                      <div className="space-y-4">
                         <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                           <CalendarIcon className="h-4 w-4 text-fuchsia-500" /> DÍA, HORA Y ASIGNACIÓN DE FLOTA
                         </h3>
                         <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-1">
                               <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase block mb-1">Fecha</span>
                               <input 
                                  type="date" required
                                  className="w-full px-2 py-2 border rounded-lg dark:border-slate-800 text-sm bg-white dark:bg-slate-800 dark:text-slate-100 font-medium"
                                  value={formReserva.fecha}
                                  onChange={(e) => setFormReserva({...formReserva, fecha: e.target.value})}
                               />
                            </div>
                            <div className="col-span-2">
                               <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase block mb-1">Hora Inicio / Presentación</span>
                               <input 
                                  type="time" required
                                  className="w-full px-2 py-2 border rounded-lg dark:border-slate-800 text-sm bg-white dark:bg-slate-800 dark:text-slate-100 font-medium"
                                  value={formReserva.horaInicio}
                                  onChange={(e) => setFormReserva({...formReserva, horaInicio: e.target.value})}
                               />
                            </div>
                         </div>

                         {/* Asignación de Vehículo & Chofer */}
                         <div className="space-y-3 pt-1">
                            <div className="grid grid-cols-2 gap-3">
                               <div>
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Vehículo / Flota</span>
                                    <button type="button" onClick={() => setMostrarPanelVehiculos(true)} className="text-[9px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 font-bold">
                                      <Plus className="w-2.5 h-2.5" /> Agregar
                                    </button>
                                  </div>
                                  <select 
                                     className="w-full px-2 py-2 border rounded-lg dark:border-slate-800 text-sm bg-white dark:bg-slate-800 dark:text-slate-100 font-medium"
                                     value={formReserva.vehiculoId}
                                     onChange={(e) => {
                                       const vId = e.target.value;
                                       const v = vehiculos.find(veh => veh.id === vId);
                                       setFormReserva({
                                         ...formReserva,
                                         vehiculoId: vId,
                                         tipoVehiculo: (v?.tipo as any) || formReserva.tipoVehiculo
                                       });
                                     }}
                                  >
                                     <option value="">Seleccione Móvil / Flota...</option>
                                     {vehiculos.map(v => (
                                       <option key={v.id} value={v.id}>
                                         {v.patente} — {v.marca || ''} {v.modelo || ''} ({v.tipo || 'Vehículo'})
                                       </option>
                                     ))}
                                  </select>
                               </div>
                               <div>
                                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase block mb-1">Tipo de Vehículo</span>
                                  <select 
                                     required className="w-full px-2 py-2 border rounded-lg dark:border-slate-800 text-sm bg-white dark:bg-slate-800 dark:text-slate-100 font-medium"
                                     value={formReserva.tipoVehiculo}
                                     onChange={(e) => setFormReserva({...formReserva, tipoVehiculo: e.target.value as any})}
                                  >
                                     <option value="Van">Van (10 a 19 Pax)</option>
                                     <option value="Mini Bus">Mini Bus (15 a 25 Pax)</option>
                                     <option value="SUV">SUV VIP (4 a 6 Pax)</option>
                                     <option value="Bus">Bus Pasajeros (44 Pax)</option>
                                     <option value="Auto">Sedán / Auto (1 a 4 Pax)</option>
                                     <option value="Otros">Otros</option>
                                  </select>
                               </div>
                            </div>

                            <div>
                               <div className="flex justify-between items-center mb-1">
                                 <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Asignar Conductor</span>
                                 <button type="button" onClick={() => setMostrarPanelConductores(true)} className="text-[9px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 font-bold">
                                   <Plus className="w-2.5 h-2.5" /> Agregar
                                 </button>
                               </div>
                               <select 
                                  className="w-full px-2 py-2 border rounded-lg dark:border-slate-800 text-sm bg-white dark:bg-slate-800 dark:text-slate-100 font-medium"
                                  value={formReserva.conductorId}
                                  onChange={(e) => setFormReserva({...formReserva, conductorId: e.target.value})}
                               >
                                  <option value="">Seleccione Conductor Profesional...</option>
                                  {conductores.map(c => (
                                    <option key={c.id} value={c.id}>
                                      {c.nombre} {c.rol ? `• ${c.rol}` : ''} {c.telefono ? `(${c.telefono})` : ''}
                                    </option>
                                  ))}
                               </select>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-3 pt-2">
                         <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                           <Luggage className="h-4 w-4 text-orange-500" /> EQUIPAJE Y LOGÍSTICA
                         </h3>
                         <div className="grid grid-cols-3 gap-3">
                            <div className="flex flex-col gap-1">
                               <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase text-center">Maletas G (23K)</span>
                               <input 
                                  type="number" required min="0"
                                  className="w-full px-3 py-2 border rounded-lg dark:border-slate-800 text-sm text-center bg-white dark:bg-slate-800 dark:text-slate-100 font-bold"
                                  value={isNaN(formReserva.logistica.maletasGrandes) ? '' : formReserva.logistica.maletasGrandes}
                                  onChange={(e) => setFormReserva({...formReserva, logistica: {...formReserva.logistica, maletasGrandes: parseInt(e.target.value) || 0}})}
                               />
                            </div>
                            <div className="flex flex-col gap-1">
                               <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase text-center">Maletas Cabina</span>
                               <input 
                                  type="number" required min="0"
                                  className="w-full px-3 py-2 border rounded-lg dark:border-slate-800 text-sm text-center bg-white dark:bg-slate-800 dark:text-slate-100 font-bold"
                                  value={isNaN(formReserva.logistica.maletasChicas) ? '' : formReserva.logistica.maletasChicas}
                                  onChange={(e) => setFormReserva({...formReserva, logistica: {...formReserva.logistica, maletasChicas: parseInt(e.target.value) || 0}})}
                               />
                            </div>
                            <div className="flex flex-col gap-1">
                               <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase text-center">Silla Bebé / Alz.</span>
                               <input 
                                  type="number" min="0" max="6"
                                  className="w-full px-3 py-2 border rounded-lg dark:border-slate-800 text-sm text-center bg-white dark:bg-slate-800 dark:text-slate-100 font-bold"
                                  value={formReserva.logistica.cantidadSillas || 0}
                                  onChange={(e) => setFormReserva({...formReserva, logistica: {...formReserva.logistica, cantidadSillas: parseInt(e.target.value) || 0, sillaBebe: parseInt(e.target.value) > 0}})}
                               />
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Bloque 3: Finanzas y Comentarios */}
                <div className="p-6 grid md:grid-cols-2 gap-8 bg-white dark:bg-slate-900">
                   <div className="space-y-4">
                      <h3 className="text-xs font-black text-green-700 dark:text-green-500 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" /> FINANZAS Y COBRO
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                         <div className="flex flex-col gap-1">
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Monto Bruto Total ($)</span>
                            <input 
                               type="number" required placeholder="$ Total"
                               className="w-full px-3 py-2 border rounded-lg dark:border-slate-800 text-sm font-bold bg-white dark:bg-slate-800 dark:text-slate-100"
                               value={isNaN(formReserva.finanzas.montoBruto) ? '' : formReserva.finanzas.montoBruto}
                               onChange={(e) => setFormReserva({...formReserva, finanzas: {...formReserva.finanzas, montoBruto: parseInt(e.target.value) || 0}})}
                            />
                         </div>
                         <div className="flex flex-col gap-1">
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Gastos Adic. (Peajes/Estac)</span>
                            <input 
                               type="number" min="0" placeholder="$ Gastos"
                               className="w-full px-3 py-2 border rounded-lg dark:border-slate-800 text-sm bg-white dark:bg-slate-800 dark:text-slate-100"
                               value={isNaN(formReserva.finanzas.gastosAdicionales) ? '' : formReserva.finanzas.gastosAdicionales}
                               onChange={(e) => setFormReserva({...formReserva, finanzas: {...formReserva.finanzas, gastosAdicionales: parseInt(e.target.value) || 0}})}
                            />
                         </div>
                         <div className="flex flex-col gap-1">
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Forma de Pago</span>
                            <select 
                                className="w-full px-3 py-2 border rounded-lg dark:border-slate-800 text-sm bg-white dark:bg-slate-800 dark:text-slate-100 font-medium"
                                value={formReserva.finanzas.formaPago}
                                onChange={(e) => setFormReserva({...formReserva, finanzas: {...formReserva.finanzas, formaPago: e.target.value as any}})}
                            >
                                <option value="Efectivo">Efectivo</option>
                                <option value="Transferencia">Transferencia</option>
                                <option value="Convenio PF">Convenio PF</option>
                                <option value="Tarjeta">Tarjeta</option>
                            </select>
                         </div>
                         <div className="flex flex-col gap-1">
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Tipo Documento</span>
                            <select 
                                className="w-full px-3 py-2 border rounded-lg dark:border-slate-800 text-sm bg-white dark:bg-slate-800 dark:text-slate-100 font-medium"
                                value={formReserva.finanzas.tipoDocumento}
                                onChange={(e) => setFormReserva({...formReserva, finanzas: {...formReserva.finanzas, tipoDocumento: e.target.value as any}})}
                            >
                                <option value="Boleta">Boleta</option>
                                <option value="Factura">Factura</option>
                            </select>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <h3 className="text-xs font-black text-orange-700 dark:text-orange-500 flex items-center gap-2">
                        <Info className="h-4 w-4" /> INSTRUCCIONES Y NOTAS
                      </h3>
                      <div className="grid gap-3">
                         <div className="flex flex-col gap-1">
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Instrucción para Conductor</span>
                            <textarea 
                               className="w-full px-3 py-1.5 border rounded-lg dark:border-slate-800 text-xs h-12 bg-white dark:bg-slate-800 dark:text-slate-100"
                               placeholder="Ej: Esperar con cartel en puerta 4, ayudar con maletas..."
                               value={formReserva.comentarios.conductor}
                               onChange={(e) => setFormReserva({...formReserva, comentarios: {...formReserva.comentarios, conductor: e.target.value}})}
                            />
                         </div>
                         <div className="flex flex-col gap-1">
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Nota Interna (Privada)</span>
                            <textarea 
                               className="w-full px-3 py-1.5 border rounded-lg dark:border-slate-800 text-xs h-12 bg-white dark:bg-slate-800 dark:text-slate-100"
                               placeholder="Ej: Facturación a 30 días, depósito confirmado..."
                               value={formReserva.comentarios.interno}
                               onChange={(e) => setFormReserva({...formReserva, comentarios: {...formReserva.comentarios, interno: e.target.value}})}
                            />
                         </div>
                      </div>
                   </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 flex flex-col md:flex-row justify-between items-center gap-4">
                   <div className="flex flex-col">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Liquidación Neta Estimada</span>
                      <div className="flex items-center gap-3">
                         <div className="text-slate-400 dark:text-slate-500 font-bold flex flex-col">
                            <span className="text-[10px]">Bruto - Gastos</span>
                            <span className="text-sm">${(formReserva.finanzas.montoBruto - formReserva.finanzas.gastosAdicionales).toLocaleString()}</span>
                         </div>
                         <div className="text-slate-300">|</div>
                         <div className="text-blue-600 font-bold flex flex-col">
                            <span className="text-[10px]">Neto Liquidable ({100 - formReserva.finanzas.porcentajeComision}%)</span>
                            <span className="text-sm">${Math.round(calcularNeto(formReserva.finanzas.montoBruto, formReserva.finanzas.gastosAdicionales, formReserva.finanzas.porcentajeComision)).toLocaleString()}</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex gap-3 w-full md:w-auto">
                      <Button type="button" variant="outline" onClick={() => {
                         setFormReserva(initialFormState);
                         setMostrarFormulario(false);
                         localStorage.removeItem('formReservaDraft');
                      }} className="flex-1 md:flex-none">Descartar</Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-8 shadow-lg flex-1 md:flex-none">
                        Confirmar y Guardar Reserva
                      </Button>
                   </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
