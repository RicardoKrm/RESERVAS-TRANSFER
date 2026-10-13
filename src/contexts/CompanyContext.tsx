import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_EMPRESAS } from '../lib/mockData';

export interface Company {
  id: string;
  name: string;
  fleetSize: number;
  usersCount: number;
  status: 'Activo' | 'Inactivo';
  joinDate: string;
  razonSocial?: string;
}

interface CompanyContextType {
  companies: Company[];
  activeCompanyId: string;
  setActiveCompanyId: (id: string) => void;
  activeCompany: Company | undefined;
  currentCompany: Company | undefined;
  isSuperAdmin: boolean;
}

const DEFAULT_COMPANIES: Company[] = DEFAULT_EMPRESAS.map(e => ({
  id: e.id,
  name: e.nombre,
  razonSocial: e.nombre,
  status: 'Activo',
  joinDate: new Date().toISOString(),
  fleetSize: 8,
  usersCount: 6
}));

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [companies, setCompanies] = useState<Company[]>(DEFAULT_COMPANIES);
  const [activeCompanyId, setActiveCompanyId] = useState<string>(DEFAULT_COMPANIES[0].id);

  const isSuperAdmin = true;

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const { data, error } = await supabase.from('empresa').select('*');
        if (!error && data && data.length > 0) {
          const mapped: Company[] = data.map((e: any) => ({
            id: e.id,
            name: e.nombre,
            razonSocial: e.razon_social || e.nombre,
            status: e.estado || 'Activo',
            joinDate: e.created_at || new Date().toISOString(),
            fleetSize: 0,
            usersCount: 0
          }));
          setCompanies(mapped);
        }
      } catch {}
    };
    fetchEmpresas();
  }, []);

  const activeCompany = companies.find(c => c.id === activeCompanyId) || companies[0];

  return (
    <CompanyContext.Provider value={{
      companies,
      activeCompanyId,
      setActiveCompanyId,
      activeCompany,
      currentCompany: activeCompany,
      isSuperAdmin
    }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) {
    return {
      companies: DEFAULT_COMPANIES,
      activeCompanyId: DEFAULT_COMPANIES[0].id,
      setActiveCompanyId: () => {},
      activeCompany: DEFAULT_COMPANIES[0],
      currentCompany: DEFAULT_COMPANIES[0],
      isSuperAdmin: true
    };
  }
  return context;
}
