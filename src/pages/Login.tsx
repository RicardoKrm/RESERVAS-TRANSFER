import React, { useState } from 'react';
import { useAuth, DEMO_PROFILES, DemoUserConfig } from '../context/AuthContext';
import { 
  Plane, Lock, Mail, Eye, EyeOff, ShieldCheck, 
  ArrowRight, Sparkles, Building2, User, KeyRound, 
  CheckCircle2, AlertCircle, Phone, FileText, X
} from 'lucide-react';
import Swal from 'sweetalert2';

interface LoginProps {
  onSuccess?: () => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const { login, loginAsRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Password reset modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotRut, setForgotRut] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Por favor ingrese su correo electrónico.');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await login(email, password);
      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Acceso Concedido!',
          text: `Bienvenido a RESERVAS ERP`,
          timer: 1200,
          showConfirmButton: false,
          timerProgressBar: true
        });
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.error || 'Credenciales inválidas.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (cfg: DemoUserConfig) => {
    setLoading(true);
    setErrorMsg('');
    setEmail(cfg.email);
    setPassword(cfg.password);

    try {
      await loginAsRole(cfg.key);
      Swal.fire({
        icon: 'success',
        title: `Sesión Iniciada: ${cfg.rolNombre}`,
        html: `<p class="text-sm">Iniciaste como <b>${cfg.nombre}</b> (${cfg.cargo})</p>`,
        timer: 1400,
        showConfirmButton: false,
        timerProgressBar: true
      });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg('No se pudo iniciar sesión con este perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSent(false);
      setForgotEmail('');
      setForgotRut('');
      Swal.fire({
        icon: 'info',
        title: 'Solicitud Enviada',
        text: 'Se ha enviado un enlace de recuperación temporal a su correo corporativo.',
        confirmButtonColor: '#2563eb'
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Background glowing gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[130px] pointer-events-none" />

      <div className="max-w-5xl mx-auto w-full z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 text-white shadow-xl shadow-blue-500/30 mb-3 -rotate-3 hover:rotate-0 transition-transform">
            <Plane className="w-8 h-8 -rotate-45" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            RESERVAS <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">ERP</span>
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-slate-400 max-w-xl mx-auto font-medium">
            Portal Corporativo Integral para Empresas de Transporte, Turismo y Transfers Aeropuerto
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Credentials Card (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-700/60">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-bold text-white">Ingreso al Sistema</h2>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                RBAC v2.4
              </span>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@reservas.cl"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    ¿Olvidaste tu clave?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Entrar a la Plataforma</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                Cifrado TLS 256-Bit
              </span>
              <span>Gaval Consultora © 2026</span>
            </div>
          </div>

          {/* Quick RBAC Role Selector (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Acceso Rápido por Perfil (Demostración de Roles)
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">1-Clic para probar</span>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Cada cargo dispone de permisos y vistas restringidas según sus funciones en la empresa:
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                {Object.values(DEMO_PROFILES).map((cfg) => {
                  const isDriver = cfg.rolTipo === 'CONDUCTOR';

                  return (
                    <div
                      key={cfg.key}
                      onClick={() => handleQuickLogin(cfg)}
                      className="group p-3 sm:p-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/70 hover:border-blue-500/50 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-md hover:shadow-blue-500/10"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0`}>
                          {cfg.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div className="min-w-0 flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white truncate group-hover:text-blue-300 transition-colors">
                              {cfg.nombre}
                            </span>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-900/90 text-slate-300 border border-slate-700">
                              {cfg.badge}
                            </span>
                          </div>
                          <span className="text-xs text-slate-300 font-medium truncate">
                            {cfg.cargo}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate hidden sm:block mt-0.5">
                            {cfg.descripcion}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right hidden md:block">
                          <div className="text-[10px] text-slate-400 font-mono">{cfg.email}</div>
                          <div className="text-[9px] text-emerald-400 font-bold uppercase">{cfg.allowed_tabs.length} Módulos</div>
                        </div>
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg bg-blue-600/20 group-hover:bg-blue-600 text-blue-300 group-hover:text-white text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <span>Entrar</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/60"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <KeyRound className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Recuperación de Contraseña</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Ingrese su correo institucional y su RUT para generar una clave provisoria autorizada por el Administrador.
            </p>

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="ejemplo@reservas.cl"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  RUT del Usuario
                </label>
                <input
                  type="text"
                  required
                  value={forgotRut}
                  onChange={(e) => setForgotRut(e.target.value)}
                  placeholder="12.345.678-9"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={forgotSent}
                className="w-full mt-2 py-2.5 px-4 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {forgotSent ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enviar Solicitud de Restablecimiento</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
