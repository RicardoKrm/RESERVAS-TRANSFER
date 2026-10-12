import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import ReservasTurismo from './pages/Reservas';
import { supabase } from './lib/supabase';

export function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('reservas_theme') === 'dark';
  });
  const [selectedCompany, setSelectedCompany] = useState<string>('GLOBAL');
  const [companies, setCompanies] = useState<{ id: string; nombre: string }[]>([]);

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
    supabase.from('empresa').select('id, nombre').then(({ data }) => {
      if (data && data.length > 0) {
        setCompanies(data);
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        selectedCompany={selectedCompany}
        setSelectedCompany={setSelectedCompany}
        companies={companies}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <ReservasTurismo activeCompanyId={selectedCompany} />
      </main>
      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-400">
        RESERVAS © {new Date().getFullYear()} — Plataforma de Gestión de Transfers, Vans & Turismo Receptivo
      </footer>
    </div>
  );
}

export default App;
