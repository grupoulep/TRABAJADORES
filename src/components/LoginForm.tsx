import React, { useState, useEffect } from 'react';
import { Volunteer, AuthUser } from '../types';
import { Lock, User, HeartHandshake, ArrowRight, KeyRound, AlertCircle, Cookie, Building2, UserPlus, Clock } from 'lucide-react';
import logoImg from '../assets/LOGO.png';

interface Props {
  volunteers: Volunteer[];
  onLoginSuccess: (user: AuthUser) => void;
  onRegisterVolunteer?: (volunteer: Volunteer) => Promise<void> | void;
  registrationEnabled?: boolean;
  onNavigateToRegister?: () => void;
  initialUsername?: string;
  initialNotice?: string | null;
}

export const LoginForm: React.FC<Props> = ({
  volunteers,
  onLoginSuccess,
  registrationEnabled = true,
  onNavigateToRegister,
  initialUsername = '',
  initialNotice = null,
}) => {
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState('');
  const [pendingNotice, setPendingNotice] = useState<string | null>(initialNotice);

  useEffect(() => {
    if (initialUsername) {
      setUsername(initialUsername);
    }
  }, [initialUsername]);

  useEffect(() => {
    if (initialNotice) {
      setPendingNotice(initialNotice);
    }
  }, [initialNotice]);
  const [acceptCookiesAndCorporateUse, setAcceptCookiesAndCorporateUse] = useState(() => {
    try {
      const stored = localStorage.getItem('ulep_cookie_corporate_consent');
      return stored ? true : true; // Default to true for convenience
    } catch {
      return true;
    }
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPendingNotice(null);

    if (!acceptCookiesAndCorporateUse) {
      setError('Debe aceptar el uso de cookies y autorizar la presentación de información con fines de la empresa para continuar.');
      return;
    }

    // Persist acceptance
    try {
      localStorage.setItem('ulep_cookie_corporate_consent', JSON.stringify({
        accepted: true,
        essentialCookies: true,
        corporateDataProcessing: true,
        dateAccepted: new Date().toISOString()
      }));
    } catch (err) {
      console.error(err);
    }

    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    // Check Admin (ADMINIULEP)
    const isAdminUser = trimmedUser === 'adminiulep' || trimmedUser === 'admin';
    const isAdminPass = trimmedPass.toUpperCase() === 'ADMINIULEP';

    if (isAdminUser && isAdminPass) {
      onLoginSuccess({
        id: 'admin-1',
        username: 'ADMINIULEP',
        role: 'admin',
      });
      return;
    }

    // Check Worker / Volunteer (by username or document number)
    const cleanDocUser = trimmedUser.replace(/\D/g, '');
    const matchedVolunteer = volunteers.find(
      (v) =>
        (v.username.toLowerCase() === trimmedUser ||
         v.documentNumber.trim().toLowerCase() === trimmedUser ||
         (cleanDocUser && v.documentNumber.replace(/\D/g, '') === cleanDocUser)) &&
        (v.password ? v.password === trimmedPass : trimmedPass === '123')
    );

    if (matchedVolunteer) {
      // Check if volunteer is pending approval by the admin
      if (matchedVolunteer.status === 'Pendiente') {
        setPendingNotice(
          `Hola ${matchedVolunteer.fullName}. Tu solicitud de registro se encuentra PENDIENTE DE HABILITACIÓN. El Administrador de la Fundación ULEP debe habilitar tu cuenta antes de que puedas ingresar.`
        );
        return;
      }

      onLoginSuccess({
        id: matchedVolunteer.id,
        username: matchedVolunteer.username,
        role: 'worker',
        volunteerData: matchedVolunteer,
      });
      return;
    }

    // Check if user exists but has pending status with wrong password
    const userPending = volunteers.find(
      (v) =>
        (v.username.toLowerCase() === trimmedUser ||
         v.documentNumber.trim().toLowerCase() === trimmedUser ||
         (cleanDocUser && v.documentNumber.replace(/\D/g, '') === cleanDocUser)) &&
        v.status === 'Pendiente'
    );

    if (userPending) {
      setPendingNotice(
        `La cédula ${userPending.documentNumber} (${userPending.fullName}) está registrada pero se encuentra PENDIENTE DE HABILITACIÓN por el Administrador.`
      );
      return;
    }

    setError('Usuario o contraseña incorrectos. Por favor verifique sus credenciales de acceso institucional.');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-40 h-40 sm:w-48 sm:h-48 mb-3 p-1">
          <img
            src={logoImg}
            alt="Logo Fundación ULEP"
            className="w-full h-full object-contain border-0"
            onError={(e) => {
              // Try fallback to public directory with relative path
              if (e.currentTarget.src !== `${window.location.origin}${import.meta.env.BASE_URL}LOGO.png`) {
                e.currentTarget.src = `${import.meta.env.BASE_URL}LOGO.png`;
                return;
              }
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div className="hidden items-center justify-center w-full h-full text-blue-600">
            <HeartHandshake className="w-12 h-12" />
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Glassmorphic Crystalline Card */}
        <div className="bg-white/80 backdrop-blur-xl py-8 px-6 sm:px-10 rounded-3xl border border-white/90 shadow-xl shadow-blue-950/5 ring-1 ring-blue-100/60">
          {error && (
            <div className="mb-5 p-3 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 shadow-2xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {pendingNotice && (
            <div className="mb-5 p-3.5 rounded-2xl bg-amber-50/95 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5 shadow-sm">
              <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <div className="space-y-1">
                <p className="font-bold">Cuenta Pendiente de Habilitación</p>
                <p className="leading-relaxed text-amber-800">{pendingNotice}</p>
                <p className="text-[11px] text-amber-700 font-semibold pt-1">
                  El Administrador habilitará tu acceso desde el panel principal.
                </p>
              </div>
            </div>
          )}

          <form action="#" method="post" className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Cédula de ciudadanía
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-600/70">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Cédula de ciudadanía"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-white/75 border border-sky-200/80 rounded-xl focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:outline-hidden transition-all placeholder:text-slate-400 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-600/70">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-white/75 border border-sky-200/80 rounded-xl focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:outline-hidden transition-all placeholder:text-slate-400 text-slate-900"
                />
              </div>
            </div>

            {/* Acepto cookies y presentar información con fines de la empresa */}
            <div className="p-3 bg-sky-50/60 border border-sky-100/90 rounded-xl">
              <label className="flex items-start gap-2.5 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  required
                  checked={acceptCookiesAndCorporateUse}
                  onChange={(e) => setAcceptCookiesAndCorporateUse(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500 cursor-pointer shrink-0"
                />
                <span className="text-[11px] text-slate-600 group-hover:text-slate-900 leading-tight transition-colors">
                  <span className="font-semibold text-slate-800">Acepto cookies</span> y autorizo de forma expresa a la Fundación ULEP a <span className="font-semibold text-blue-800">presentar y tratar información con fines legítimos y corporativos de la empresa</span>.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md shadow-blue-600/20 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 hover:from-blue-700 hover:via-sky-700 hover:to-blue-800 focus:outline-hidden focus:ring-4 focus:ring-blue-500/20 transition-all cursor-pointer"
            >
              <span>Ingresar al Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Registration Link */}
          {registrationEnabled && (
            <div className="mt-5 pt-4 border-t border-slate-200/60 text-center">
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                Registrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
