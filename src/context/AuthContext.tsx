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
  cargo: string;
  panel_inicio: string;
  allowed_tabs: string[];
  rol: {
    nombre: string;
    tipo: 'ADMIN' | 'TRAFICO' | 'VENTAS' | 'CONTROL_DOCUMENTAL' | 'CONDUCTOR' | string;
    permisos: any;
  };
  empresa: {
    nombre: string;
    rut: string;
  };
}

export interface DemoUserConfig {
  key: 'admin' | 'trafico' | 'ventas' | 'control' | 'conductor';
  email: string;
  password: string;
  nombre: string;
  rut: string;
  cargo: string;
  empresa_id: string;
  empresaNombre: string;
  rolTipo: 'ADMIN' | 'TRAFICO' | 'VENTAS' | 'CONTROL_DOCUMENTAL' | 'CONDUCTOR';
  rolNombre: string;
  color: string;
  badge: string;
  descripcion: string;
  panel_inicio: string;
  allowed_tabs: string[];
}

export const DEMO_PROFILES: Record<string, DemoUserConfig> = {
  admin: {
    key: 'admin',
    email: 'admin@reservas.cl',
    password: 'admin123',
    nombre: 'Gabriel Ávalos',
    rut: '12.345.678-9',
    cargo: 'Director General & Dueño de Negocio',
    empresa_id: 'emp-01',
    empresaNombre: 'Transfer & Turismo Express Chile',
    rolTipo: 'ADMIN',
    rolNombre: 'Súper Administrador',
    color: 'from-amber-500 to-orange-600',
    badge: 'Acceso Total',
    descripcion: 'Control absoluto de los 8 módulos, contratos corporativos, gestión y márgenes.',
    panel_inicio: 'reservas',
    allowed_tabs: ['reservas', 'programacion', 'contratos', 'rutas', 'documentacion', 'portal-conductor', 'gps', 'historial']
  },
  trafico: {
    key: 'trafico',
    email: 'trafico@reservas.cl',
    password: 'trafico123',
    nombre: 'Carlos Mendoza',
    rut: '14.567.890-1',
    cargo: 'Jefe de Operaciones & Despacho',
    empresa_id: 'emp-01',
    empresaNombre: 'Transfer & Turismo Express Chile',
    rolTipo: 'TRAFICO',
    rolNombre: 'Jefe de Operaciones / Tráfico',
    color: 'from-blue-600 to-indigo-600',
    badge: 'Operativa & GPS',
    descripcion: 'Pizarra de reservas, despacho en vivo, cuadrantes, rutas y telemetría de flota.',
    panel_inicio: 'programacion',
    allowed_tabs: ['reservas', 'programacion', 'rutas', 'portal-conductor', 'gps', 'historial']
  },
  ventas: {
    key: 'ventas',
    email: 'ventas@reservas.cl',
    password: 'ventas123',
    nombre: 'Valentina Torres',
    rut: '16.789.012-3',
    cargo: 'Coordinadora de Reservas & Ventas',
    empresa_id: 'emp-01',
    empresaNombre: 'Transfer & Turismo Express Chile',
    rolTipo: 'VENTAS',
    rolNombre: 'Recepción & Ventas',
    color: 'from-emerald-600 to-teal-600',
    badge: 'Comercial & Reservas',
    descripcion: 'Creación y agenda de traslados turísticos y aeropuerto; sin acceso a contratos o flota técnica.',
    panel_inicio: 'reservas',
    allowed_tabs: ['reservas', 'rutas']
  },
  control: {
    key: 'control',
    email: 'control@reservas.cl',
    password: 'control123',
    nombre: 'Rodrigo Muñoz',
    rut: '15.234.567-8',
    cargo: 'Encargado de Control Legal & Flota',
    empresa_id: 'emp-01',
    empresaNombre: 'Transfer & Turismo Express Chile',
    rolTipo: 'CONTROL_DOCUMENTAL',
    rolNombre: 'Control Documental & Prevención',
    color: 'from-violet-600 to-purple-600',
    badge: 'Flota & Decretos',
    descripcion: 'Monitoreo de revisiones técnicas, licencias, SOAP, Decreto 80 y bitácora de viajes.',
    panel_inicio: 'documentacion',
    allowed_tabs: ['documentacion', 'rutas', 'historial']
  },
  conductor: {
    key: 'conductor',
    email: 'chofer@reservas.cl',
    password: 'chofer123',
    nombre: 'Juan Pérez',
    rut: '17.890.123-4',
    cargo: 'Conductor Oficial Transfer Aeropuerto',
    empresa_id: 'emp-01',
    empresaNombre: 'Transfer & Turismo Express Chile',
    rolTipo: 'CONDUCTOR',
    rolNombre: 'Conductor de Flota',
    color: 'from-rose-600 to-pink-600',
    badge: 'Portal Chofer Móvil',
    descripcion: 'Vista móvil exclusiva sin menú administrativo para recibir viajes, pasajeros y vuelos.',
    panel_inicio: 'portal-conductor',
    allowed_tabs: ['portal-conductor']
  }
};

const STORAGE_KEY = 'reservas_auth_user_session';

export function createProfileFromConfig(cfg: DemoUserConfig): AuthProfile {
  return {
    id: `usr-${cfg.key}`,
    auth_user_id: `auth-${cfg.key}`,
    empresa_id: cfg.empresa_id,
    rol_id: `rol-${cfg.key}`,
    nombre: cfg.nombre,
    rut: cfg.rut,
    email: cfg.email,
    estado: 'ACTIVO',
    cargo: cfg.cargo,
    panel_inicio: cfg.panel_inicio,
    allowed_tabs: cfg.allowed_tabs,
    rol: {
      nombre: cfg.rolNombre,
      tipo: cfg.rolTipo,
      permisos: {
        tipo: cfg.rolTipo,
        allowedTabs: cfg.allowed_tabs,
        all: cfg.rolTipo === 'ADMIN'
      }
    },
    empresa: {
      nombre: cfg.empresaNombre,
      rut: '76.123.456-7'
    }
  };
}

interface AuthContextType {
  session: any | null;
  user: any | null;
  profile: AuthProfile | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginAsRole: (roleKey: 'admin' | 'trafico' | 'ventas' | 'control' | 'conductor') => Promise<void>;
  signOut: () => Promise<void>;
  canAccessTab: (tabId: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  login: async () => ({ success: false }),
  loginAsRole: async () => {},
  signOut: async () => {},
  canAccessTab: () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize session from localStorage or Supabase
  useEffect(() => {
    const initAuth = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.email) {
            setProfile(parsed);
            setLoading(false);
            return;
          }
        }

        // Try Supabase session
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          const sUser = data.session.user;
          // Check if matches a demo user
          const matchedDemo = Object.values(DEMO_PROFILES).find(d => d.email.toLowerCase() === sUser.email?.toLowerCase());
          if (matchedDemo) {
            const p = createProfileFromConfig(matchedDemo);
            setProfile(p);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
          } else {
            // General dynamic profile
            const namePart = (sUser.email || 'Usuario').split('@')[0];
            const formatted = namePart.charAt(0).toUpperCase() + namePart.slice(1);
            const p: AuthProfile = {
              id: sUser.id,
              auth_user_id: sUser.id,
              empresa_id: 'emp-01',
              rol_id: 'rol-admin',
              nombre: formatted,
              rut: '12.345.678-9',
              email: sUser.email || 'usuario@reservas.cl',
              estado: 'ACTIVO',
              cargo: 'Usuario Operativo',
              panel_inicio: 'reservas',
              allowed_tabs: ['reservas', 'programacion', 'contratos', 'rutas', 'documentacion', 'portal-conductor', 'gps', 'historial'],
              rol: {
                nombre: 'Administrador',
                tipo: 'ADMIN',
                permisos: { all: true }
              },
              empresa: {
                nombre: 'Transfer & Turismo Express Chile',
                rut: '76.123.456-7'
              }
            };
            setProfile(p);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
          }
        }
      } catch (err) {
        console.warn('Error reading stored session:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Check if matches demo profile
    const matched = Object.values(DEMO_PROFILES).find(d => d.email.toLowerCase() === cleanEmail);
    if (matched) {
      if (password && password !== matched.password && password !== 'admin123' && password !== '123456') {
        return { success: false, error: 'Contraseña incorrecta para el usuario seleccionado.' };
      }
      const newProfile = createProfileFromConfig(matched);
      setProfile(newProfile);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
      return { success: true };
    }

    // Try Supabase auth
    try {
      if (password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (!error && data?.session) {
          const sUser = data.session.user;
          const namePart = (sUser.email || cleanEmail).split('@')[0];
          const formatted = namePart.charAt(0).toUpperCase() + namePart.slice(1);
          const newProfile: AuthProfile = {
            id: sUser.id,
            auth_user_id: sUser.id,
            empresa_id: 'emp-01',
            rol_id: 'rol-custom',
            nombre: formatted,
            rut: '12.345.678-9',
            email: sUser.email || cleanEmail,
            estado: 'ACTIVO',
            cargo: 'Operador del Sistema',
            panel_inicio: 'reservas',
            allowed_tabs: ['reservas', 'programacion', 'contratos', 'rutas', 'documentacion', 'portal-conductor', 'gps', 'historial'],
            rol: {
              nombre: 'Operador General',
              tipo: 'ADMIN',
              permisos: { all: true }
            },
            empresa: {
              nombre: 'Transfer & Turismo Express Chile',
              rut: '76.123.456-7'
            }
          };
          setProfile(newProfile);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
          return { success: true };
        }
      }
    } catch (err) {
      console.warn('Supabase sign-in fallback:', err);
    }

    // If password provided has at least 4 chars, fallback to instant user creation
    if (password && password.length >= 4) {
      const namePart = cleanEmail.split('@')[0];
      const formatted = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      const newProfile: AuthProfile = {
        id: `usr-gen-${Date.now()}`,
        auth_user_id: `auth-${Date.now()}`,
        empresa_id: 'emp-01',
        rol_id: 'rol-admin',
        nombre: formatted,
        rut: '12.345.678-9',
        email: cleanEmail,
        estado: 'ACTIVO',
        cargo: 'Administrador de Sucursal',
        panel_inicio: 'reservas',
        allowed_tabs: ['reservas', 'programacion', 'contratos', 'rutas', 'documentacion', 'portal-conductor', 'gps', 'historial'],
        rol: {
          nombre: 'Administrador',
          tipo: 'ADMIN',
          permisos: { all: true }
        },
        empresa: {
          nombre: 'Transfer & Turismo Express Chile',
          rut: '76.123.456-7'
        }
      };
      setProfile(newProfile);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
      return { success: true };
    }

    return { success: false, error: 'Credenciales inválidas. Ingrese un email y contraseña válidos.' };
  };

  const loginAsRole = async (roleKey: 'admin' | 'trafico' | 'ventas' | 'control' | 'conductor') => {
    const cfg = DEMO_PROFILES[roleKey];
    if (cfg) {
      const newProfile = createProfileFromConfig(cfg);
      setProfile(newProfile);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    localStorage.removeItem(STORAGE_KEY);
    setProfile(null);
  };

  const canAccessTab = (tabId: string): boolean => {
    if (!profile) return false;
    if (profile.rol?.tipo === 'ADMIN' || profile.rol?.permisos?.all) return true;
    return profile.allowed_tabs?.includes(tabId) ?? false;
  };

  return (
    <AuthContext.Provider value={{
      session: null,
      user: null,
      profile,
      loading,
      login,
      loginAsRole,
      signOut,
      canAccessTab
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
