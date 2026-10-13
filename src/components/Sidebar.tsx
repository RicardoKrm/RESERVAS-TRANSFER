import React from 'react';
import { 
  Calendar, CalendarClock, Briefcase, Map as MapIcon, 
  FileCheck, UserCircle, Radio, History, Plane, ChevronLeft, ChevronRight,
  Sparkles
} from 'lucide-react';

export type NavTab = 
  | 'reservas' 
  | 'programacion' 
  | 'contratos' 
  | 'rutas' 
  | 'documentacion' 
  | 'portal-conductor' 
  | 'gps' 
  | 'historial';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }: SidebarProps) {
  const menuItems = [
    {
      id: 'reservas' as NavTab,
      label: 'Pizarra de Reservas',
      shortLabel: 'Reservas',
      icon: Calendar,
      badge: 'Core',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
    },
    {
      id: 'programacion' as NavTab,
      label: 'Programación & Despacho',
      shortLabel: 'Programación',
      icon: CalendarClock,
    },
    {
      id: 'contratos' as NavTab,
      label: 'Contratos Clientes',
      shortLabel: 'Contratos',
      icon: Briefcase,
    },
    {
      id: 'rutas' as NavTab,
      label: 'Gestión de Rutas',
      shortLabel: 'Rutas',
      icon: MapIcon,
    },
    {
      id: 'documentacion' as NavTab,
      label: 'Control Documental',
      shortLabel: 'Documentación',
      icon: FileCheck,
    },
    {
      id: 'portal-conductor' as NavTab,
      label: 'Portal Conductor',
      shortLabel: 'Choferes',
      icon: UserCircle,
      badge: 'Móvil',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    },
    {
      id: 'gps' as NavTab,
      label: 'GPS FleetSat en Vivo',
      shortLabel: 'GPS',
      icon: Radio,
    },
    {
      id: 'historial' as NavTab,
      label: 'Historial de Viajes',
      shortLabel: 'Historial',
      icon: History,
    },
  ];

  return (
    <aside 
      className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 z-40 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <Plane className="w-5 h-5 -rotate-45" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base tracking-tight text-slate-900 dark:text-white">RESERVAS</span>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  ERP
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium truncate">Turismo & Transfers</span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="w-full flex justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Plane className="w-5 h-5 -rotate-45" />
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {!collapsed && (
          <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Operaciones y Servicios
          </div>
        )}

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
              
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between overflow-hidden">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full border ${
                      isActive 
                        ? 'bg-white/20 text-white border-white/30' 
                        : item.badgeColor
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-[11px]">
        {!collapsed ? (
          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              SaaS Autónomo
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">8 Módulos Operativos Sincronizados</p>
          </div>
        ) : (
          <div className="flex justify-center text-slate-400" title="SaaS Autónomo">
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
        )}
      </div>
    </aside>
  );
}
