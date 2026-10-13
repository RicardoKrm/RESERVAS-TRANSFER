import React, { useState } from 'react';
import { Moon, Sun, Building2, User, LogOut, Shield, ChevronDown, CheckCircle } from 'lucide-react';
import { NavTab } from './Sidebar';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  activeTab: NavTab;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  selectedCompany: string;
  setSelectedCompany: (val: string) => void;
  companies: { id: string; nombre: string }[];
}

export function Header({ 
  activeTab, 
  darkMode, 
  setDarkMode, 
  selectedCompany, 
  setSelectedCompany, 
  companies 
}: HeaderProps) {
  const { profile, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    'dashboard': {
      title: 'Dashboard Ejecutivo & Métricas del Negocio',
      subtitle: 'KPIs operativos, semáforo de vencimientos legales y trazabilidad en vivo'
    },
    'reservas': {
      title: 'Pizarra Máster de Reservas',
      subtitle: 'Servicios de Transfer Aeropuerto, Turismo Receptivo y Minería'
    },
    'programacion': {
      title: 'Programación Operativa & Despacho',
      subtitle: 'Cuadrante de distribución y asignación de franjas horarias'
    },
    'contratos': {
      title: 'Contratos & Clientes Corporativos',
      subtitle: 'Gestión de convenios, tarifas pactadas y cuentas comerciales'
    },
    'rutas': {
      title: 'Gestión de Rutas & Geocercas',
      subtitle: 'Catálogo de trayectos predefinidos, tolerancias y puntos de control'
    },
    'documentacion': {
      title: 'Control Documental de Flota & Choferes',
      subtitle: 'Vigencias legales: Revisiones técnicas, permisos, Decreto 80 y licencias'
    },
    'portal-conductor': {
      title: 'Portal del Conductor',
      subtitle: 'Interfaz operativa para seguimiento y ejecución de viajes asignados'
    },
    'gps': {
      title: 'GPS FleetSat en Vivo',
      subtitle: 'Telemetría y rastreo satelital de vehículos en tiempo real'
    },
    'historial': {
      title: 'Historial Operativo & Auditoría',
      subtitle: 'Bitácora consolidada de servicios finalizados y facturados'
    },
    'herramientas': {
      title: 'Panel de Herramientas, Usuarios & Configuración',
      subtitle: 'Administración de accesos, roles RBAC, datos de empresa y llaves API'
    }
  };

  const current = titles[activeTab] || titles['reservas'];

  const getRoleBadgeStyle = (tipo?: string) => {
    switch (tipo) {
      case 'ADMIN':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'TRAFICO':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'VENTAS':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'CONTROL_DOCUMENTAL':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case 'CONDUCTOR':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30';
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Module Title */}
        <div className="flex flex-col overflow-hidden">
          <h2 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight truncate">
            {current.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block">
            {current.subtitle}
          </p>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Company Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="text-xs font-bold bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer max-w-[170px] sm:max-w-[210px] truncate"
            >
              <option value="GLOBAL">Todas las Empresas (Global)</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* User Profile Pill & Dropdown */}
          {profile && (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  {profile.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                      {profile.nombre}
                    </span>
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full border ${getRoleBadgeStyle(profile.rol?.tipo)}`}>
                      {profile.rol?.nombre || profile.cargo}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">
                    {profile.email}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 text-xs animate-in fade-in-50 zoom-in-95 duration-100"
                  onMouseLeave={() => setShowProfileMenu(false)}
                >
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-bold text-slate-800 dark:text-slate-100">{profile.nombre}</p>
                    <p className="text-[11px] text-slate-400">{profile.cargo}</p>
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{profile.empresa?.nombre || 'Transfer Express Chile'}</span>
                    </div>
                  </div>

                  <div className="px-2 py-1.5">
                    <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400">
                      Permisos del Cargo
                    </div>
                    <div className="px-3 py-1 text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {profile.allowed_tabs?.length || 8} módulos
                      </span> habilitados para este perfil.
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 px-2">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="Cambiar tema claro / oscuro"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
}
