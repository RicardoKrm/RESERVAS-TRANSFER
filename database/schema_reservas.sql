-- =========================================================================
-- ESQUEMA DE BASE DE DATOS: APP STANDALONE DE RESERVAS, TRANSFERS & TURISMO
-- Copie y ejecute este script en el SQL Editor de Supabase
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Empresas / Proveedores de Transfer
CREATE TABLE IF NOT EXISTS public.empresa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    rut TEXT,
    estado TEXT DEFAULT 'Activo',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Choferes / Conductores
CREATE TABLE IF NOT EXISTS public.colaborador (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresa(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    telefono TEXT,
    rol TEXT DEFAULT 'Conductor',
    licencia TEXT,
    estado TEXT DEFAULT 'Activo',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Vehículos / Flota (Vans, Minibuses, SUVs)
CREATE TABLE IF NOT EXISTS public.vehiculo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresa(id) ON DELETE CASCADE,
    patente TEXT NOT NULL,
    marca TEXT,
    modelo TEXT,
    tipo TEXT DEFAULT 'Van',
    capacidad_pasajeros INTEGER DEFAULT 7,
    estado TEXT DEFAULT 'OPERATIVO',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Rutas Frecuentes (ej. Aeropuerto -> Hotel Zona Norte)
CREATE TABLE IF NOT EXISTS public.operacion_ruta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresa(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    origen TEXT NOT NULL,
    destino TEXT NOT NULL,
    enlace_mapa TEXT,
    tarifa_sugerida NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de Contratos / Convenios con Hoteles o Agencias
CREATE TABLE IF NOT EXISTS public.operacion_contrato (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresa(id) ON DELETE CASCADE,
    cliente_razon_social TEXT NOT NULL,
    cliente_rut TEXT,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabla Principal: RESERVAS (Transfers, Turismo, Aeropuerto)
CREATE TABLE IF NOT EXISTS public.operacion_reserva (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresa(id) ON DELETE CASCADE,
    codigo TEXT NOT NULL,
    categoria TEXT DEFAULT 'Web', -- Web, Hotel, Minera, Extranjero, Particular
    cliente_nombre TEXT NOT NULL,
    cliente_email TEXT,
    cliente_telefono TEXT,
    cliente_rut TEXT,
    origen TEXT NOT NULL,
    destino TEXT NOT NULL,
    fecha_reserva TIMESTAMPTZ NOT NULL,
    pasajeros_cantidad INTEGER DEFAULT 1,
    monto_total NUMERIC DEFAULT 0,
    estado_pago TEXT DEFAULT 'Pendiente', -- Pendiente, Pagado, Anticipo
    estado_viaje TEXT DEFAULT 'Pendiente', -- Pendiente, Confirmado, En Curso, Finalizado, Cancelado
    conductor_id UUID REFERENCES public.colaborador(id) ON DELETE SET NULL,
    vehiculo_id UUID REFERENCES public.vehiculo(id) ON DELETE SET NULL,
    notas TEXT,
    detalles JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de Alto Rendimiento
CREATE INDEX IF NOT EXISTS idx_reserva_fecha ON public.operacion_reserva(fecha_reserva);
CREATE INDEX IF NOT EXISTS idx_reserva_empresa ON public.operacion_reserva(empresa_id);
CREATE INDEX IF NOT EXISTS idx_reserva_estado ON public.operacion_reserva(estado_viaje);
CREATE INDEX IF NOT EXISTS idx_reserva_codigo ON public.operacion_reserva(codigo);

-- Políticas RLS
ALTER TABLE public.empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colaborador ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehiculo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operacion_ruta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operacion_contrato ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operacion_reserva ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura y escritura publica o autenticada" ON public.empresa FOR ALL USING (true);
CREATE POLICY "Lectura y escritura publica o autenticada" ON public.colaborador FOR ALL USING (true);
CREATE POLICY "Lectura y escritura publica o autenticada" ON public.vehiculo FOR ALL USING (true);
CREATE POLICY "Lectura y escritura publica o autenticada" ON public.operacion_ruta FOR ALL USING (true);
CREATE POLICY "Lectura y escritura publica o autenticada" ON public.operacion_contrato FOR ALL USING (true);
CREATE POLICY "Lectura y escritura publica o autenticada" ON public.operacion_reserva FOR ALL USING (true);
