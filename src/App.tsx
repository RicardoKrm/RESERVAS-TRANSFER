import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import ReservasTurismo from './pages/Reservas';
import Programacion from './pages/operaciones/Programacion';
import Contratos from './pages/operaciones/Contratos';
import GestionRutas from './pages/operaciones/GestionRutas';
import ControlDocumental from './pages/operaciones/ControlDocumental';
import PortalConductor from './pages/operaciones/PortalConductor';
import GPS from './pages/operaciones/GPS';
import Historial from './pages/operaciones/Historial';
import Dashboard from './pages/Dashboard';
import Herramientas from './pages/Herramientas';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CompanyProvider, useCompany } from './contexts/CompanyContext';
import { DEFAULT_EMPRESAS } from './lib/mockData';
import { supabase } from './lib/supabase';
import { Plane, LogOut, Sun, Moon } from 'lucide-react';

function AppContent() {
  const { profile, loading, canAccessTab, signOut } = useAuth();
  const { activeCompanyId, setActiveCompanyId } = useCompany();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('reservas_theme') === 'dark';
  });
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    return (localStorage.getItem('reservas_active_tab') as NavTab) || 'dashboard';
  });
  const [companies, setCompanies] = useState<{ id: string; nombre: string }[]>(DEFAULT_EMPRESAS);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('reservas_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('reservas_theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('reservas_active_tab', activeTab);
  }, [activeTab]);

  // Keep active tab valid for current user's role permissions
  useEffect(() => {
    if (profile && !canAccessTab(activeTab)) {
      const fallback = (profile.panel_inicio as NavTab) || (profile.allowed_tabs?.[0] as NavTab) || 'reservas';
      setActiveTab(fallback);
    }
  }, [profile, activeTab, canAccessTab]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data, error } = await supabase.from('empresa').select('id, nombre');
        if (!error && data && data.length > 0) {
          setCompanies(data);
        }
      } catch {}
    };
    fetchCompanies();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white select-none">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/30 animate-pulse mb-4">
          <Plane className="w-7 h-7 -rotate-45" />
        </div>
        <div className="text-base font-bold tracking-tight">Cargando RESERVAS ERP...</div>
        <div className="text-xs text-slate-400 mt-1">Verificando sesión y perfiles de acceso</div>
      </div>
    );
  }

  // Unauthenticated -> Show Login Portal
  if (!profile) {
    return <Login />;
  }

  // Driver Role -> Isolated Mobile-First Driver Portal
  if (profile.rol?.tipo === 'CONDUCTOR') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-4 py-3 shadow-xs">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-600 flex items-center justify-center text-white shadow-md shadow-rose-600/20 shrink-0">
                <Plane className="w-5 h-5 -rotate-45" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">RESERVAS</span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                    Móvil Conductor
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 truncate">Hoja de Ruta & Servicios Asignados</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{profile.nombre}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">En Servicio Activo</span>
              </div>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer"
                title="Cambiar tema"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>

              <button
                onClick={signOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-600 text-rose-600 hover:text-white text-xs font-bold transition-all border border-rose-500/20 cursor-pointer"
                title="Cerrar Sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-5">
          <PortalConductor />
        </main>
      </div>
    );
  }

  // Standard SaaS ERP Layout for Admin, Tráfico, Ventas, Control Documental
  const renderActiveModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={(tab) => setActiveTab(tab)} />;
      case 'reservas':
        return <ReservasTurismo activeCompanyId={activeCompanyId} />;
      case 'programacion':
        return <Programacion />;
      case 'contratos':
        return <Contratos />;
      case 'rutas':
        return <GestionRutas />;
      case 'documentacion':
        return <ControlDocumental />;
      case 'portal-conductor':
        return <PortalConductor />;
      case 'gps':
        return <GPS />;
      case 'historial':
        return <Historial />;
      case 'herramientas':
        return <Herramientas onNavigate={(tab) => setActiveTab(tab)} />;
      default:
        return <Dashboard onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex font-sans transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          activeTab={activeTab}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          selectedCompany={activeCompanyId}
          setSelectedCompany={setActiveCompanyId}
          companies={companies}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderActiveModule()}
          </div>
        </main>

        <footer className="border-t border-slate-200 dark:border-slate-800 py-3 px-6 text-center text-xs text-slate-400 bg-white/50 dark:bg-slate-900/50">
          RESERVAS ERP © {new Date().getFullYear()} — Plataforma Integral de Operaciones para Empresas de Transfers & Turismo
        </footer>
      </div>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CompanyProvider>
          <AppContent />
        </CompanyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
