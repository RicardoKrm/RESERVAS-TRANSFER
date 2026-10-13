import React, { useState, useEffect } from 'react';
import { 
  Users, Shield, Building2, Key, Plus, Search, 
  Check, X, Edit, Trash2, Copy, RefreshCw, Send, 
  CheckCircle2, Lock, Eye, EyeOff, AlertCircle, 
  Sparkles, Smartphone, Download, ExternalLink, Globe, 
  Sliders, ShieldCheck, Mail, Phone, UserCheck, UserX,
  FileText, Briefcase, Radio, Terminal, Webhook
} from 'lucide-react';
import { useAuth, DEMO_PROFILES } from '../context/AuthContext';
import { useCompany } from '../contexts/CompanyContext';
import { supabase } from '../lib/supabase';
import Swal from 'sweetalert2';
import { NavTab } from '../components/Sidebar';

interface UserRecord {
  id: string;
  nombre: string;
  email: string;
  rut: string;
  cargo: string;
  telefono: string;
  rolTipo: 'ADMIN' | 'TRAFICO' | 'VENTAS' | 'CONTROL_DOCUMENTAL' | 'CONDUCTOR';
  rolNombre: string;
  estado: 'ACTIVO' | 'INACTIVO';
  password?: string;
  fechaCreacion: string;
  ultimoAcceso: string;
  allowed_tabs: string[];
}

interface RoleConfig {
  id: string;
  nombre: string;
  tipo: string;
  descripcion: string;
  badgeColor: string;
  usuariosCount: number;
  allowedTabs: string[];
  permisosEspeciales: {
    verMargenes: boolean;
    exportarExcel: boolean;
    modificarContratos: boolean;
    eliminarRegistros: boolean;
    accesoHerramientas: boolean;
  };
}

const DEFAULT_ROLES: RoleConfig[] = [
  {
    id: 'rol-admin',
    nombre: 'Director General / Súper Administrador',
    tipo: 'ADMIN',
    descripcion: 'Control absoluto del ERP, auditoría, configuración global, contratos y márgenes financieros.',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    usuariosCount: 1,
    allowedTabs: ['dashboard', 'reservas', 'programacion', 'contratos', 'rutas', 'documentacion', 'portal-conductor', 'gps', 'historial', 'herramientas'],
    permisosEspeciales: {
      verMargenes: true,
      exportarExcel: true,
      modificarContratos: true,
      eliminarRegistros: true,
      accesoHerramientas: true,
    }
  },
  {
    id: 'rol-trafico',
    nombre: 'Jefe de Operaciones / Tráfico',
    tipo: 'TRAFICO',
    descripcion: 'Pizarra de reservas, despacho en vivo, cuadrantes, rutas y telemetría satelital.',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    usuariosCount: 1,
    allowedTabs: ['dashboard', 'reservas', 'programacion', 'rutas', 'portal-conductor', 'gps', 'historial'],
    permisosEspeciales: {
      verMargenes: false,
      exportarExcel: true,
      modificarContratos: false,
      eliminarRegistros: false,
      accesoHerramientas: false,
    }
  },
  {
    id: 'rol-ventas',
    nombre: 'Recepción & Ventas',
    tipo: 'VENTAS',
    descripcion: 'Creación de reservas, agenda de turistas y vuelos; sin acceso a contratos o flota técnica.',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    usuariosCount: 1,
    allowedTabs: ['dashboard', 'reservas', 'rutas'],
    permisosEspeciales: {
      verMargenes: false,
      exportarExcel: false,
      modificarContratos: false,
      eliminarRegistros: false,
      accesoHerramientas: false,
    }
  },
  {
    id: 'rol-control',
    nombre: 'Control Documental & Prevención',
    tipo: 'CONTROL_DOCUMENTAL',
    descripcion: 'Monitoreo de revisiones técnicas, licencias, SOAP, Decreto 80 MTT y bitácora.',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    usuariosCount: 1,
    allowedTabs: ['dashboard', 'documentacion', 'rutas', 'historial'],
    permisosEspeciales: {
      verMargenes: false,
      exportarExcel: true,
      modificarContratos: false,
      eliminarRegistros: false,
      accesoHerramientas: false,
    }
  },
  {
    id: 'rol-conductor',
    nombre: 'Conductor / Chofer Oficial',
    tipo: 'CONDUCTOR',
    descripcion: 'Interfaz móvil aislada para recibir viajes, pasajeros, vuelos y marcar estados.',
    badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
    usuariosCount: 1,
    allowedTabs: ['portal-conductor'],
    permisosEspeciales: {
      verMargenes: false,
      exportarExcel: false,
      modificarContratos: false,
      eliminarRegistros: false,
      accesoHerramientas: false,
    }
  }
];

const INITIAL_USERS: UserRecord[] = [
  {
    id: 'usr-admin',
    nombre: 'Gabriel Ávalos',
    email: 'admin@reservas.cl',
    rut: '12.345.678-9',
    cargo: 'Director General & Dueño de Negocio',
    telefono: '+56 9 8451 2290',
    rolTipo: 'ADMIN',
    rolNombre: 'Súper Administrador',
    estado: 'ACTIVO',
    password: 'admin123',
    fechaCreacion: '2026-01-10',
    ultimoAcceso: 'En línea ahora',
    allowed_tabs: ['dashboard', 'reservas', 'programacion', 'contratos', 'rutas', 'documentacion', 'portal-conductor', 'gps', 'historial', 'herramientas']
  },
  {
    id: 'usr-trafico',
    nombre: 'Carlos Mendoza',
    email: 'trafico@reservas.cl',
    rut: '14.567.890-1',
    cargo: 'Jefe de Operaciones & Despacho',
    telefono: '+56 9 7623 4410',
    rolTipo: 'TRAFICO',
    rolNombre: 'Jefe de Operaciones / Tráfico',
    estado: 'ACTIVO',
    password: 'trafico123',
    fechaCreacion: '2026-02-15',
    ultimoAcceso: 'Hoy a las 15:40',
    allowed_tabs: ['dashboard', 'reservas', 'programacion', 'rutas', 'portal-conductor', 'gps', 'historial']
  },
  {
    id: 'usr-ventas',
    nombre: 'Valentina Torres',
    email: 'ventas@reservas.cl',
    rut: '16.789.012-3',
    cargo: 'Coordinadora de Reservas & Ventas',
    telefono: '+56 9 9122 3344',
    rolTipo: 'VENTAS',
    rolNombre: 'Recepción & Ventas',
    estado: 'ACTIVO',
    password: 'ventas123',
    fechaCreacion: '2026-03-01',
    ultimoAcceso: 'Ayer a las 18:20',
    allowed_tabs: ['dashboard', 'reservas', 'rutas']
  },
  {
    id: 'usr-control',
    nombre: 'Rodrigo Muñoz',
    email: 'control@reservas.cl',
    rut: '15.234.567-8',
    cargo: 'Encargado de Control Legal & Flota',
    telefono: '+56 9 5541 7720',
    rolTipo: 'CONTROL_DOCUMENTAL',
    rolNombre: 'Control Documental & Prevención',
    estado: 'ACTIVO',
    password: 'control123',
    fechaCreacion: '2026-03-12',
    ultimoAcceso: 'Hoy a las 11:15',
    allowed_tabs: ['dashboard', 'documentacion', 'rutas', 'historial']
  },
  {
    id: 'usr-chofer',
    nombre: 'Juan Pérez',
    email: 'chofer@reservas.cl',
    rut: '17.890.123-4',
    cargo: 'Conductor Oficial Transfer Aeropuerto',
    telefono: '+56 9 4412 9901',
    rolTipo: 'CONDUCTOR',
    rolNombre: 'Conductor de Flota',
    estado: 'ACTIVO',
    password: 'chofer123',
    fechaCreacion: '2026-04-05',
    ultimoAcceso: 'En ruta (Móvil)',
    allowed_tabs: ['portal-conductor']
  }
];

export default function Herramientas({ onNavigate }: { onNavigate?: (tab: NavTab) => void }) {
  const { profile } = useAuth();
  const { activeCompany, activeCompanyId } = useCompany();

  const [activeSubTab, setActiveSubTab] = useState<'usuarios' | 'roles' | 'empresa' | 'api'>('usuarios');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('TODOS');

  // Users State
  const [users, setUsers] = useState<UserRecord[]>(() => {
    const saved = localStorage.getItem('reservas_custom_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_USERS;
  });

  // Roles State
  const [roles, setRoles] = useState<RoleConfig[]>(() => {
    const saved = localStorage.getItem('reservas_roles_matrix');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return DEFAULT_ROLES;
  });

  const [selectedRole, setSelectedRole] = useState<RoleConfig>(roles[0]);

  // Company Profile Form
  const [companyForm, setCompanyForm] = useState({
    nombreFantasia: 'Transfer & Turismo Express Chile',
    razonSocial: 'Transportes y Turismo Avalos SpA',
    rut: '76.123.456-7',
    giro: 'Transporte terrestre de pasajeros, transfers aeropuerto y turismo receptivo',
    direccion: 'Av. Américo Vespucio Oriente 1234, Of. 402, Pudahuel',
    ciudad: 'Santiago, Chile',
    telefono: '+56 2 2987 6543',
    emailContacto: 'contacto@transferturismo.cl',
    sitioWeb: 'https://transferturismo.cl',
    monedaDefault: 'CLP',
    diasAlertaDocumentos: 30,
    apiKey: 'ak_live_79f82d1c5a93411b0e27c889f02c',
    apiSecret: 'sec_live_9204bc99a8e7d234123567891234',
    webhookUrl: 'https://mi-erp.cl/api/webhooks/viajes-reservas'
  });

  // Modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({
    nombre: '',
    email: '',
    rut: '',
    cargo: '',
    telefono: '',
    rolTipo: 'TRAFICO' as 'ADMIN' | 'TRAFICO' | 'VENTAS' | 'CONTROL_DOCUMENTAL' | 'CONDUCTOR',
    password: '',
    estado: 'ACTIVO' as 'ACTIVO' | 'INACTIVO'
  });

  const [showPassword, setShowPassword] = useState(false);

  // Sync users to localStorage
  useEffect(() => {
    localStorage.setItem('reservas_custom_users', JSON.stringify(users));
  }, [users]);

  // Sync roles to localStorage
  useEffect(() => {
    localStorage.setItem('reservas_roles_matrix', JSON.stringify(roles));
  }, [roles]);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setUserForm(prev => ({ ...prev, password: pass }));
  };

  const handleOpenNewUser = () => {
    setEditingUserId(null);
    setUserForm({
      nombre: '',
      email: '',
      rut: '',
      cargo: '',
      telefono: '',
      rolTipo: 'TRAFICO',
      password: '',
      estado: 'ACTIVO'
    });
    generateRandomPassword();
    setShowUserModal(true);
  };

  const handleEditUser = (user: UserRecord) => {
    setEditingUserId(user.id);
    setUserForm({
      nombre: user.nombre,
      email: user.email,
      rut: user.rut,
      cargo: user.cargo,
      telefono: user.telefono,
      rolTipo: user.rolTipo,
      password: user.password || 'admin123',
      estado: user.estado
    });
    setShowUserModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.nombre || !userForm.email) {
      Swal.fire('Atención', 'Complete nombre y correo electrónico', 'warning');
      return;
    }

    const matchedRole = roles.find(r => r.tipo === userForm.rolTipo) || roles[1];

    if (editingUserId) {
      // Update existing
      setUsers(prev => prev.map(u => {
        if (u.id === editingUserId) {
          return {
            ...u,
            ...userForm,
            rolNombre: matchedRole.nombre,
            allowed_tabs: matchedRole.allowedTabs
          };
        }
        return u;
      }));
      Swal.fire({
        icon: 'success',
        title: 'Usuario Actualizado',
        text: `Los cambios para ${userForm.nombre} fueron guardados con éxito.`,
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      // Create new user
      const newUser: UserRecord = {
        id: `usr-${Date.now()}`,
        nombre: userForm.nombre,
        email: userForm.email.trim().toLowerCase(),
        rut: userForm.rut || '12.345.678-9',
        cargo: userForm.cargo || matchedRole.nombre,
        telefono: userForm.telefono,
        rolTipo: userForm.rolTipo,
        rolNombre: matchedRole.nombre,
        estado: userForm.estado,
        password: userForm.password,
        fechaCreacion: new Date().toISOString().split('T')[0],
        ultimoAcceso: 'Sin ingresos aún',
        allowed_tabs: matchedRole.allowedTabs
      };

      setUsers(prev => [newUser, ...prev]);

      // Pop-up with credential copy
      Swal.fire({
        icon: 'success',
        title: '¡Usuario Creado Exitosamente!',
        html: `
          <div class="text-left text-xs bg-slate-100 p-3 rounded-xl border mt-2 space-y-1 font-mono">
            <div><b>Nombre:</b> ${newUser.nombre}</div>
            <div><b>Email:</b> ${newUser.email}</div>
            <div><b>Contraseña:</b> ${newUser.password}</div>
            <div><b>Cargo / Rol:</b> ${newUser.rolNombre}</div>
            <div><b>URL Acceso:</b> ${window.location.origin}</div>
          </div>
        `,
        confirmButtonText: 'Copiar Credenciales',
        showCancelButton: true,
        cancelButtonText: 'Cerrar',
        confirmButtonColor: '#2563eb'
      }).then((result) => {
        if (result.isConfirmed) {
          const text = `Hola ${newUser.nombre}, tus accesos a RESERVAS ERP son:\nURL: ${window.location.origin}\nUsuario: ${newUser.email}\nContraseña: ${newUser.password}\nCargo: ${newUser.rolNombre}`;
          navigator.clipboard.writeText(text);
          Swal.fire('¡Copiado!', 'Datos copiados al portapapeles listos para enviar por WhatsApp o correo.', 'success');
        }
      });
    }

    setShowUserModal(false);
  };

  const handleToggleUserStatus = (user: UserRecord) => {
    const nuevoEstado = user.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, estado: nuevoEstado } : u));
    Swal.fire({
      icon: 'info',
      title: `Usuario ${nuevoEstado === 'ACTIVO' ? 'Activado' : 'Suspendido'}`,
      text: `El colaborador ${user.nombre} ahora está ${nuevoEstado}.`,
      timer: 1200,
      showConfirmButton: false
    });
  };

  const handleDeleteUser = (user: UserRecord) => {
    if (user.rolTipo === 'ADMIN' && users.filter(u => u.rolTipo === 'ADMIN').length <= 1) {
      Swal.fire('Error', 'No puede eliminar al único Administrador del sistema.', 'error');
      return;
    }

    Swal.fire({
      title: `¿Eliminar a ${user.nombre}?`,
      text: 'El usuario perderá el acceso a la plataforma de forma inmediata.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sí, eliminar acceso'
    }).then((res) => {
      if (res.isConfirmed) {
        setUsers(prev => prev.filter(u => u.id !== user.id));
        Swal.fire('Eliminado', 'Usuario revocado con éxito.', 'success');
      }
    });
  };

  // Toggle Module in Role Matrix
  const handleToggleRoleTab = (tabId: string) => {
    if (selectedRole.tipo === 'ADMIN' && tabId === 'herramientas') {
      Swal.fire('Aviso', 'El rol Súper Administrador siempre debe mantener acceso al panel de Herramientas.', 'info');
      return;
    }

    setRoles(prev => prev.map(r => {
      if (r.id === selectedRole.id) {
        const hasTab = r.allowedTabs.includes(tabId);
        const updatedTabs = hasTab 
          ? r.allowedTabs.filter(t => t !== tabId)
          : [...r.allowedTabs, tabId];
        
        const updatedRole = { ...r, allowedTabs: updatedTabs };
        setSelectedRole(updatedRole);
        return updatedRole;
      }
      return r;
    }));
  };

  const handleToggleSpecialPerm = (permKey: keyof RoleConfig['permisosEspeciales']) => {
    setRoles(prev => prev.map(r => {
      if (r.id === selectedRole.id) {
        const updated = {
          ...r,
          permisosEspeciales: {
            ...r.permisosEspeciales,
            [permKey]: !r.permisosEspeciales[permKey]
          }
        };
        setSelectedRole(updated);
        return updated;
      }
      return r;
    }));
  };

  const handleSaveCompanyConfig = (e: React.FormEvent) => {
    e.preventDefault();
    Swal.fire({
      icon: 'success',
      title: 'Configuración Guardada',
      text: 'Los datos corporativos, alertas y parámetros del SaaS fueron actualizados.',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleRegenerateApiKey = () => {
    Swal.fire({
      title: '¿Regenerar Llave API?',
      text: 'Cualquier sistema conectado (GPS o ERP) deberá ser actualizado con la nueva clave.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, regenerar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563eb'
    }).then((res) => {
      if (res.isConfirmed) {
        const newKey = `ak_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
        setCompanyForm(prev => ({ ...prev, apiKey: newKey }));
        Swal.fire('Nueva Llave Generada', 'Guarde la nueva clave en sus sistemas externos.', 'success');
      }
    });
  };

  const handleTestWebhook = () => {
    Swal.fire({
      title: 'Probando Conexión Webhook...',
      html: `<p class="text-xs text-slate-500">Enviando evento de prueba a <code>${companyForm.webhookUrl}</code></p>`,
      didOpen: () => {
        Swal.showLoading();
        setTimeout(() => {
          Swal.fire({
            icon: 'success',
            title: '¡Webhook Respondió con Éxito (HTTP 200)!',
            text: 'La plataforma externa confirmó la recepción del payload de prueba de RESERVAS ERP.',
            confirmButtonColor: '#2563eb'
          });
        }, 1200);
      }
    });
  };

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.cargo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'TODOS' || u.rolTipo === filterRole;
    return matchesSearch && matchesRole;
  });

  const ALL_MODULES = [
    { id: 'dashboard', name: 'Dashboard & Métricas', desc: 'KPIs de negocio, facturación y trazabilidad en vivo' },
    { id: 'reservas', name: 'Pizarra de Reservas', desc: 'Crear, consultar y editar traslados turísticos y aeropuerto' },
    { id: 'programacion', name: 'Programación & Despacho', desc: 'Cuadrante de turnos y asignación de franjas horarias' },
    { id: 'contratos', name: 'Contratos Clientes', desc: 'Convenios comerciales corporativos y acuerdos pactados' },
    { id: 'rutas', name: 'Gestión de Rutas', desc: 'Catálogo de trayectos predefinidos y geocercas' },
    { id: 'documentacion', name: 'Control Documental', desc: 'Revisiones técnicas, permisos de circulación, Decreto 80 y licencias' },
    { id: 'portal-conductor', name: 'Portal Conductor Móvil', desc: 'Hoja de ruta del chofer con pasajeros y vuelos' },
    { id: 'gps', name: 'GPS FleetSat en Vivo', desc: 'Telemetría y rastreo satelital en mapa en tiempo real' },
    { id: 'historial', name: 'Historial de Viajes', desc: 'Bitácora consolidada de servicios realizados y auditoría' },
    { id: 'herramientas', name: 'Herramientas & Ajustes', desc: 'Administración de usuarios, roles RBAC y llaves API' },
  ];

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              Módulo de Administración SaaS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Panel de Herramientas, Usuarios & Configuración
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Crea cuentas de acceso para tus colaboradores, configura qué módulos puede ver cada cargo y administra tus integraciones.
          </p>
        </div>

        {/* Sub-tab Navigation Buttons */}
        <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex items-center border border-slate-200 dark:border-slate-700 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('usuarios')}
            className={`px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'usuarios'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuarios & Credenciales</span>
          </button>

          <button
            onClick={() => setActiveSubTab('roles')}
            className={`px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'roles'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Roles & Permisos (RBAC)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('empresa')}
            className={`px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'empresa'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Empresa & Branding</span>
          </button>

          <button
            onClick={() => setActiveSubTab('api')}
            className={`px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeSubTab === 'api'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Integraciones & API</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: USUARIOS & CREDENCIALES                                */}
      {/* ============================================================== */}
      {activeSubTab === 'usuarios' && (
        <div className="space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Cuentas Creadas</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{users.length} usuarios</div>
              <span className="text-[11px] text-emerald-500 font-semibold mt-1 block">Acceso individual habilitado</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Usuarios Activos</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {users.filter(u => u.estado === 'ACTIVO').length} activos
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Operando en la plataforma</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Choferes en Portal Móvil</span>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {users.filter(u => u.rolTipo === 'CONDUCTOR').length} choferes
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Con interfaz móvil asignada</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Cargos / Roles Activos</span>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{roles.length} roles</div>
              <span className="text-[11px] text-slate-400 mt-1 block">Matriz de restricciones lista</span>
            </div>
          </div>

          {/* User Table Header & Filters */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre, correo, RUT o cargo..."
                    className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-64 sm:w-80"
                  />
                </div>

                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="TODOS">Todos los Roles</option>
                  <option value="ADMIN">Administradores</option>
                  <option value="TRAFICO">Jefes de Tráfico</option>
                  <option value="VENTAS">Recepción & Ventas</option>
                  <option value="CONTROL_DOCUMENTAL">Control Documental</option>
                  <option value="CONDUCTOR">Conductores</option>
                </select>
              </div>

              <button
                onClick={handleOpenNewUser}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Crear Nuevo Usuario</span>
              </button>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="pb-3">Colaborador / Usuario</th>
                    <th className="pb-3">Contacto / RUT</th>
                    <th className="pb-3">Cargo Asignado</th>
                    <th className="pb-3">Rol & Permisos</th>
                    <th className="pb-3">Estado</th>
                    <th className="pb-3">Último Acceso</th>
                    <th className="pb-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredUsers.map((user) => {
                    const isConductor = user.rolTipo === 'CONDUCTOR';

                    return (
                      <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                              {user.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                                {user.nombre}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {user.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5">
                          <div className="flex flex-col text-slate-600 dark:text-slate-300">
                            <span className="font-mono text-xs">{user.rut}</span>
                            <span className="text-[11px] text-slate-400">{user.telefono || 'Sin teléfono'}</span>
                          </div>
                        </td>

                        <td className="py-3.5 font-medium text-slate-700 dark:text-slate-200">
                          {user.cargo}
                        </td>

                        <td className="py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                              user.rolTipo === 'ADMIN' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' :
                              user.rolTipo === 'TRAFICO' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' :
                              user.rolTipo === 'VENTAS' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' :
                              user.rolTipo === 'CONTROL_DOCUMENTAL' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30' :
                              'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                            }`}>
                              {user.rolNombre}
                            </span>
                            <span className="text-[10px] text-slate-400">({user.allowed_tabs.length} tabs)</span>
                          </div>
                        </td>

                        <td className="py-3.5">
                          {user.estado === 'ACTIVO' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              Suspendido
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 text-slate-400 text-[11px]">
                          {user.ultimoAcceso}
                        </td>

                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Editar usuario"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleToggleUserStatus(user)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                user.estado === 'ACTIVO' 
                                  ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40' 
                                  : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                              }`}
                              title={user.estado === 'ACTIVO' ? "Suspender acceso" : "Reactivar acceso"}
                            >
                              {user.estado === 'ACTIVO' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ROLES & MATRIZ DE PERMISOS (RBAC)                       */}
      {/* ============================================================== */}
      {activeSubTab === 'roles' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Roles List (4 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  Cargos y Roles Disponibles
                </h3>
                <span className="text-xs text-slate-400">{roles.length} roles</span>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Seleccione un cargo para personalizar a qué módulos y funciones operativas tiene permiso:
              </p>

              <div className="space-y-2">
                {roles.map((r) => {
                  const isSelected = selectedRole.id === r.id;

                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRole(r)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {r.nombre}
                        </span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${r.badgeColor}`}>
                          {r.tipo}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {r.descripcion}
                      </p>
                      <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500">
                        <span>{r.allowedTabs.length} módulos habilitados</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">Configurar &rarr;</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Permission Matrix (8 Cols) */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">
                    Permisos de Acceso: {selectedRole.nombre}
                  </h3>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${selectedRole.badgeColor}`}>
                    {selectedRole.tipo}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Marca las casillas para habilitar o restringir módulos a este perfil de usuario.
                </p>
              </div>

              <button
                onClick={() => {
                  Swal.fire({
                    icon: 'success',
                    title: 'Permisos Sincronizados',
                    text: `La matriz de restricciones para ${selectedRole.nombre} ha sido guardada.`,
                    timer: 1400,
                    showConfirmButton: false
                  });
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
              >
                Guardar Matriz
              </button>
            </div>

            {/* Modules Checkbox Matrix */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Módulos del Sistema Habilitados
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ALL_MODULES.map((mod) => {
                  const isChecked = selectedRole.allowedTabs.includes(mod.id);

                  return (
                    <label
                      key={mod.id}
                      onClick={() => handleToggleRoleTab(mod.id)}
                      className={`p-3 rounded-xl border flex items-start gap-3 transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-400 dark:border-blue-700'
                          : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-slate-900 dark:text-white block">
                          {mod.name}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 leading-snug">
                          {mod.desc}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Special Privileges & Financial Attributes */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Atributos Especiales de Seguridad & Finanzas
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label 
                  onClick={() => handleToggleSpecialPerm('verMargenes')}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedRole.permisosEspeciales.verMargenes}
                    onChange={() => {}}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                      Ver Márgenes Financieros & Tarifas
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Permite ver cobros brutos, comisiones y utilidades del negocio.
                    </span>
                  </div>
                </label>

                <label 
                  onClick={() => handleToggleSpecialPerm('exportarExcel')}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedRole.permisosEspeciales.exportarExcel}
                    onChange={() => {}}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                      Exportar Informes a Excel / CSV
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Descarga de bases de datos de clientes, viajes y documentación.
                    </span>
                  </div>
                </label>

                <label 
                  onClick={() => handleToggleSpecialPerm('modificarContratos')}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedRole.permisosEspeciales.modificarContratos}
                    onChange={() => {}}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                      Editar Contratos Comerciales
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Crear o alterar convenios con aerolíneas, hoteles y mineras.
                    </span>
                  </div>
                </label>

                <label 
                  onClick={() => handleToggleSpecialPerm('eliminarRegistros')}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedRole.permisosEspeciales.eliminarRegistros}
                    onChange={() => {}}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                      Eliminar Registros & Reservas
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Borrado definitivo de historial y asignaciones operativas.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: EMPRESA & BRANDING                                      */}
      {/* ============================================================== */}
      {activeSubTab === 'empresa' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs max-w-4xl">
          <div className="pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Datos de la Empresa & Personalización de Marca
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Información corporativa que aparece en los vouchers de reserva, cotizaciones y encabezado del ERP.
            </p>
          </div>

          <form onSubmit={handleSaveCompanyConfig} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre Comercial / Fantasía
                </label>
                <input
                  type="text"
                  value={companyForm.nombreFantasia}
                  onChange={(e) => setCompanyForm({ ...companyForm, nombreFantasia: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Razón Social (Tributaria)
                </label>
                <input
                  type="text"
                  value={companyForm.razonSocial}
                  onChange={(e) => setCompanyForm({ ...companyForm, razonSocial: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  RUT de la Empresa
                </label>
                <input
                  type="text"
                  value={companyForm.rut}
                  onChange={(e) => setCompanyForm({ ...companyForm, rut: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Giro Comercial
                </label>
                <input
                  type="text"
                  value={companyForm.giro}
                  onChange={(e) => setCompanyForm({ ...companyForm, giro: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dirección Comercial / Casa Matriz
                </label>
                <input
                  type="text"
                  value={companyForm.direccion}
                  onChange={(e) => setCompanyForm({ ...companyForm, direccion: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Teléfono de Contacto Central
                </label>
                <input
                  type="text"
                  value={companyForm.telefono}
                  onChange={(e) => setCompanyForm({ ...companyForm, telefono: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Correo de Notificaciones Operativas
                </label>
                <input
                  type="email"
                  value={companyForm.emailContacto}
                  onChange={(e) => setCompanyForm({ ...companyForm, emailContacto: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Días de Alerta Previa para Vencimiento de Documentos
                </label>
                <select
                  value={companyForm.diasAlertaDocumentos}
                  onChange={(e) => setCompanyForm({ ...companyForm, diasAlertaDocumentos: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value={15}>15 días de anticipación</option>
                  <option value={30}>30 días de anticipación (Recomendado)</option>
                  <option value={45}>45 días de anticipación</option>
                  <option value={60}>60 días de anticipación</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                Guardar Configuración de Empresa
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: INTEGRACIONES & API KEYS                                */}
      {/* ============================================================== */}
      {activeSubTab === 'api' && (
        <div className="space-y-6 max-w-4xl">
          {/* API Keys Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Llaves de Acceso API (Para GPS, Softland o Webhooks)
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                API Activa
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Utiliza estas credenciales para autenticar llamadas entrantes desde sistemas GPS o ERPs contables:
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  API Key Pública (Client ID)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={companyForm.apiKey}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(companyForm.apiKey);
                      Swal.fire('Copiado', 'API Key copiada al portapapeles', 'success');
                    }}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                    title="Copiar"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  API Secret (Firma de Servidor)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    readOnly
                    value={companyForm.apiSecret}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300"
                  />
                  <button
                    onClick={handleRegenerateApiKey}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                    title="Regenerar clave"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Webhook Configuration Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Webhook className="w-5 h-5 text-blue-600" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Webhooks Salientes (Notificaciones a Softland o Sistemas Externos)
              </h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              RESERVAS enviará una solicitud HTTP POST cada vez que una reserva cambie a <code>finalizado</code> o se emita una alerta de vencimiento documental:
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Endpoint URL de Recepción
                </label>
                <input
                  type="url"
                  value={companyForm.webhookUrl}
                  onChange={(e) => setCompanyForm({ ...companyForm, webhookUrl: e.target.value })}
                  placeholder="https://tu-erp.cl/api/webhook"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">Eventos suscritos: <code>viaje.finalizado</code>, <code>pago.cobrado</code></span>
                <button
                  onClick={handleTestWebhook}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  Probar Conexión (Ping Test)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CREAR / EDITAR USUARIO                                  */}
      {/* ============================================================== */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setShowUserModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingUserId ? 'Editar Colaborador' : 'Crear Nuevo Acceso de Usuario'}
              </h3>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={userForm.nombre}
                  onChange={(e) => setUserForm({ ...userForm, nombre: e.target.value })}
                  placeholder="Ej: Marcelo Morales Soto"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Correo Electrónico (Login) *
                  </label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="marcelo@empresa.cl"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    RUT del Usuario
                  </label>
                  <input
                    type="text"
                    value={userForm.rut}
                    onChange={(e) => setUserForm({ ...userForm, rut: e.target.value })}
                    placeholder="15.890.123-K"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cargo Formal
                  </label>
                  <input
                    type="text"
                    value={userForm.cargo}
                    onChange={(e) => setUserForm({ ...userForm, cargo: e.target.value })}
                    placeholder="Ej: Despachador Turno Noche"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Teléfono Móvil
                  </label>
                  <input
                    type="text"
                    value={userForm.telefono}
                    onChange={(e) => setUserForm({ ...userForm, telefono: e.target.value })}
                    placeholder="+56 9 8765 4321"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rol en el Sistema *
                  </label>
                  <select
                    value={userForm.rolTipo}
                    onChange={(e) => setUserForm({ ...userForm, rolTipo: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="ADMIN">Director General / Súper Admin</option>
                    <option value="TRAFICO">Jefe de Operaciones / Tráfico</option>
                    <option value="VENTAS">Recepción & Ventas</option>
                    <option value="CONTROL_DOCUMENTAL">Control Documental</option>
                    <option value="CONDUCTOR">Conductor Chofer (Portal Móvil)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Estado de la Cuenta
                  </label>
                  <select
                    value={userForm.estado}
                    onChange={(e) => setUserForm({ ...userForm, estado: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="ACTIVO">Activo (Habilitado)</option>
                    <option value="INACTIVO">Inactivo (Suspendido)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Contraseña de Acceso *
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    Generar Clave Segura
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-3.5 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  {editingUserId ? 'Guardar Cambios' : 'Crear Usuario & Accesos'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
