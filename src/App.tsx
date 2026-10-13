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
import { AuthProvider } from './context/AuthContext';
import { CompanyProvider, useCompany } from './contexts/CompanyContext';
import { DEFAULT_EMPRESAS } from './lib/mockData';
import { supabase } from './lib/supabase';

function AppContent() {
  const { activeCompanyId, setActiveCompanyId } = useCompany();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('reservas_theme') === 'dark';
  });
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    return (localStorage.getItem('reservas_active_tab') as NavTab) || 'reservas';
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

  const renderActiveModule = () => {
    switch (activeTab) {
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
      default:
        return <ReservasTurismo activeCompanyId={activeCompanyId} />;
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
