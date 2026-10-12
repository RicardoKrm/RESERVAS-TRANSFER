# 🚐 RESERVAS — Plataforma de Gestión de Transfers, Vans & Turismo Receptivo

Aplicación web independiente (Micro-SaaS) especializada en la administración y control operativo de servicios de transfer al aeropuerto, transporte de pasajeros en vans y turismo receptivo.

---

## 🚀 Características Principales

1. **Gestión Completa de Reservas:**
   - Control de vuelos y aeropuertos (número de vuelo y origen/destino).
   - Detalle de pasajeros, maletas grandes/chicas, sillas de bebé y alzadores.
   - Seguimiento de estado del viaje: *Pendiente, Confirmado, En Curso, Finalizado, Cancelado*.
2. **Asignación de Flota y Conductores:**
   - Asignación de vehículos (Auto, SUV, Van, Minibús, Bus) y choferes con hoja de ruta.
3. **Control Financiero y Comisiones:**
   - Registro de montos brutos, gastos adicionales, comisiones pactadas (ej. con agencias u hoteles).
   - Métodos de pago: *Efectivo, Transferencia, Tarjeta, Convenio*.
   - Tipo de documento: *Boleta o Factura*.
4. **Exportación e Informes:**
   - Exportación de listados a Excel con un clic.
5. **Multi-empresa y Modo Oscuro:**
   - Soporte multitenant y switch de tema claro/oscuro.

---

## 🛠️ Tecnologías

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend / Base de Datos:** Supabase (PostgreSQL + RLS).
- **Exportación:** SheetJS (xlsx).

---

## 📦 Puesta en Marcha Local

1. Entra a la carpeta del proyecto:
   ```bash
   cd RESERVAS
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura tus variables de entorno en `.env`:
   ```env
   VITE_SUPABASE_URL="https://tu-proyecto.supabase.co"
   VITE_SUPABASE_ANON_KEY="tu-anon-key"
   ```

4. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

---

## ☁️ Despliegue en la Nube (Vercel)

1. Sube esta carpeta `RESERVAS` a un repositorio propio en GitHub (o impórtala como proyecto en Vercel).
2. En la configuración de Vercel, agrega las variables de entorno:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. ¡Listo! La aplicación quedará desplegada en su propia URL independiente (ej. `https://reservas-app.vercel.app`).

---

## 🗄️ Base de Datos (Supabase)

Si deseas utilizar una base de datos propia e independiente de Supabase para este producto, copia y pega el archivo:
`database/schema_reservas.sql`
en el **SQL Editor** de Supabase y ejecútalo.
