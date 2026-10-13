import React from 'react';
import { Moon, Sun, Building2, User } from 'lucide-react';
import { NavTab } from './Sidebar';

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
  const titles: Record<NavTab, { title: string; subtitle: string }> = {
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
    }
  };

  const current = titles[activeTab] || titles['reservas'];

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
              className="text-xs font-bold bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer max-w-[180px] sm:max-w-[220px] truncate"
            >
              <option value="GLOBAL">Todas las Empresas (Global)</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* User Profile Pill */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
              GA
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">Gabriel Ávalos</span>
              <span className="text-[10px] text-slate-400 font-medium">Director General</span>
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Cambiar tema claro / oscuro"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
}
