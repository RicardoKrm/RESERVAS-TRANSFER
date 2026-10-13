import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface AuthProfile {
  id: string;
  auth_user_id: string;
  empresa_id: string;
  rol_id: string;
  nombre: string;
  rut: string;
  email: string;
  estado: string;
  cargo?: string;
  panel_inicio?: string;
  rol?: {
    nombre: string;
    tipo: string;
    permisos: any;
  };
  empresa?: {
    nombre: string;
    rut: string;
  };
}

interface AuthContextType {
  session: any | null;
  user: any | null;
  profile: AuthProfile | null;
  signOut: () => Promise<void>;
  loading: boolean;
}

const DEFAULT_PROFILE: AuthProfile = {
  id: 'usr-gabriel-01',
  auth_user_id: 'user-gabriel',
  empresa_id: 'emp-01',
  rol_id: 'rol-admin',
  nombre: 'Gabriel Ávalos',
  rut: '12.345.678-9',
  email: 'gavalos@gavalconsultora.cl',
  estado: 'ACTIVO',
  cargo: 'Director General de Operaciones',
  panel_inicio: '/reservas',
  rol: {
    nombre: 'Súper Administrador',
    tipo: 'ADMIN',
    permisos: { all: true }
  },
  empresa: {
    nombre: 'Transfer & Turismo Express Chile',
    rut: '76.123.456-7'
  }
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: DEFAULT_PROFILE,
  signOut: async () => {},
  loading: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<AuthProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setProfile(prev => ({
          ...prev,
          auth_user_id: data.user.id,
          email: data.user.email || prev.email
        }));
      }
    }).catch(() => {});
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{ session: null, user: null, profile, signOut, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
