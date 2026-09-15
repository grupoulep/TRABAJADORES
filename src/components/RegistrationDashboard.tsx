import React, { useState } from 'react';
import { Volunteer } from '../types';
import {
  ArrowLeft,
  UserPlus,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Lock,
  Shirt,
  HeartPulse,
  AlertCircle,
  CheckCircle2,
  Building2,
  Clock,
  ShieldCheck,
  FileText,
  HelpCircle,
} from 'lucide-react';
import logoImg from '../assets/LOGO.png';

interface Props {
  onBackToLogin: () => void;
  existingVolunteers: Volunteer[];
  onRegisterSuccess: (volunteer: Volunteer) => Promise<void> | void;
  registrationEnabled?: boolean;
}

export const RegistrationDashboard: React.FC<Props> = ({
  onBackToLogin,
  existingVolunteers,
  onRegisterSuccess,
  registrationEnabled = true,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    documentType: 'Cédula de Ciudadanía',
    documentNumber: '',
    documentExpeditionCity: 'Popayán, Cauca',
    age: 24,
    city: 'Popayán, Cauca',
    email: '',
    phone: '',
    address: '',
    career: '',
    roleTitle: 'Voluntario de Apoyo',
    contractType: 'Voluntariado / Contrato de Apoyo',
    // Dotación y Salud
    shirtSize: 'M',
    pantsSize: '32',
    shoeSize: '38',
    bloodType: 'O+',
    epsHealth: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    // Credenciales
    password: '',
    confirmPassword: '',
    acceptTerms: true,
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedVolunteer, setSubmittedVolunteer] = useState<Volunteer | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!registrationEnabled) {
      setError('El registro de nuevos colaboradores se encuentra temporalmente pausado por la administración.');
      return;
    }

    if (!formData.fullName.trim()) {
      setError('Por favor ingrese su nombre completo.');
      return;
    }

    const cleanDoc = formData.documentNumber.trim().replace(/\D/g, '');
    if (!cleanDoc || cleanDoc.length < 5) {
      setError('Por favor ingrese un número de cédula o documento válido (mínimo 5 dígitos).');
      return;
    }

    // Check duplicate document number
    const isDuplicate = existingVolunteers.some(
      (v) => v.documentNumber.replace(/\D/g, '') === cleanDoc
    );
    if (isDuplicate) {
      setError(
        'El número de documento ya está registrado en la base de datos de la Fundación ULEP. Si olvidó su contraseña o acceso, por favor comuníquese con el Administrador.'
      );
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Por favor ingrese un correo electrónico válido.');
      return;
    }

    if (!formData.phone.trim()) {
      setError('Por favor ingrese su número de teléfono o celular de contacto.');
      return;
    }

    if (!formData.password || formData.password.length < 3) {
      setError('La contraseña debe tener al menos 3 caracteres.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor verifíquelas.');
      return;
    }

    if (!formData.acceptTerms) {
      setError('Debe autorizar el tratamiento de datos personales para continuar con el registro.');
      return;
    }

    setIsSubmitting(true);

    try {
      const today = new Date();
      const formattedDate = today.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      const uniqueCertCode = `ULEP-REG-${cleanDoc.slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newVolunteer: Volunteer = {
        id: `vol-${Date.now()}-${cleanDoc.slice(-4)}`,
        username: cleanDoc, // Document number acts as username
        password: formData.password.trim(),
        fullName: formData.fullName.trim(),
        documentType: formData.documentType,
        documentNumber: cleanDoc,
        documentExpeditionCity: formData.documentExpeditionCity.trim() || 'Popayán, Cauca',
        age: Number(formData.age) || 24,
        career: formData.career.trim() || 'Voluntariado Social',
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim() || 'Popayán, Cauca',
        startDate: formattedDate,
        endDate: 'En proceso de habilitación por Administrador',
        roleTitle: formData.roleTitle.trim() || 'Colaborador / Voluntario',
        hoursCompleted: 0,
        duties: 'Funciones y actividades asignadas en el marco de los proyectos y programas de la Fundación ULEP.',
        contractType: formData.contractType,
        issueCity: formData.city.trim() || 'Popayán, Cauca',
        issueDate: formattedDate,
        certificateCode: uniqueCertCode,
        status: 'Pendiente', // EL ADMIN HABILITA ESTE
        isSelfRegistered: true,
        registrationDate: new Date().toISOString(),
        signatoryName: 'Jerson Stive López Rengifo',
        signatoryRole: 'Director Ejecutivo',
        signatoryDocument: '1.061.768.490',
        signatoryEntity: 'FUNDACIÓN ULEP',
        // Dotación
        shirtSize: formData.shirtSize,
        pantsSize: formData.pantsSize,
        shoeSize: formData.shoeSize,
        bloodType: formData.bloodType,
        epsHealth: formData.epsHealth.trim(),
        emergencyContactName: formData.emergencyContactName.trim(),
        emergencyContactPhone: formData.emergencyContactPhone.trim(),
      };

      await onRegisterSuccess(newVolunteer);
      setSubmittedVolunteer(newVolunteer);
    } catch (err) {
      console.error('Error al registrar colaborador:', err);
      setError('Ocurrió un error al guardar el registro. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION DASHBOARD SCREEN
  if (submittedVolunteer) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-sky-50/70 to-blue-100/60 flex flex-col font-sans">
        {/* Navigation Bar */}
        <header className="w-full bg-white/90 backdrop-blur-md border-b border-sky-200/80 sticky top-0 z-30 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-sky-100 p-1.5 flex items-center justify-center">
                <img
                  src={logoImg}
                  alt="Logo ULEP"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Fundación ULEP
                </h1>
                <p className="text-xs text-blue-600 font-medium">
                  Portal Institucional de Registro de Colaboradores
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onBackToLogin}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Inicio de Sesión</span>
            </button>
          </div>
        </header>

        {/* Confirmation Content */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center">
          <div className="w-full bg-white/95 backdrop-blur-md rounded-3xl border border-sky-200/80 shadow-xl shadow-blue-950/5 p-8 sm:p-12 text-center space-y-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> Solicitud Registrada · Pendiente de Habilitación
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                ¡Registro Recibido con Éxito!
              </h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
                Apreciado(a) <strong className="text-slate-900">{submittedVolunteer.fullName}</strong>, tus datos han sido cargados en la base de datos oficial de la <strong>Fundación ULEP</strong>.
              </p>
            </div>

            {/* Registration Summary Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Nombre Completo:</span>
                <p className="text-slate-900 font-bold text-sm mt-0.5">{submittedVolunteer.fullName}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Usuario / Cédula para Iniciar Sesión:</span>
                <p className="text-blue-700 font-mono font-bold text-sm mt-0.5">{submittedVolunteer.documentNumber}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Correo Electrónico:</span>
                <p className="text-slate-900 font-medium mt-0.5">{submittedVolunteer.email}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Cargo o Área:</span>
                <p className="text-slate-900 font-medium mt-0.5">{submittedVolunteer.roleTitle}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Estado Actual:</span>
                <p className="text-amber-800 font-bold mt-0.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> Pendiente de Habilitación por Admin
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Código de Radicado:</span>
                <p className="text-slate-700 font-mono font-semibold mt-0.5">{submittedVolunteer.certificateCode}</p>
              </div>
            </div>

            {/* Process Roadmap */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-6 text-left space-y-4">
              <h3 className="font-bold text-blue-950 text-sm flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                ¿Cómo funciona el proceso de habilitación?
              </h3>
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">
                    1
                  </span>
                  <p className="pt-0.5">
                    <strong>Revisión Administrativa:</strong> El Administrador de la Fundación ULEP revisará tu solicitud en el panel de control institucional.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">
                    2
                  </span>
                  <p className="pt-0.5">
                    <strong>Habilitación de Cuenta:</strong> Una vez aprobada tu vinculación, el Administrador cambiará tu estado a <em>Activo</em> con un solo clic.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">
                    3
                  </span>
                  <p className="pt-0.5">
                    <strong>Acceso al Portal:</strong> Podrás ingresar al portal institucional usando tu <strong>número de cédula</strong> ({submittedVolunteer.documentNumber}) y la contraseña que configuraste.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onBackToLogin}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Ir a la Pantalla de Inicio de Sesión</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // MAIN REGISTRATION DASHBOARD FORM VIEW
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-sky-50/60 to-blue-100/50 flex flex-col font-sans">
      {/* Top Header Navigation Bar */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-sky-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-sky-100 p-1.5 flex items-center justify-center">
              <img
                src={logoImg}
                alt="Logo ULEP"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Fundación ULEP
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  Panel de Registro
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Formulario Oficial de Inscripción de Colaboradores y Voluntarios
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onBackToLogin}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-700 bg-white hover:bg-blue-50/80 rounded-xl border border-slate-200 hover:border-blue-300 transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span className="hidden xs:inline">Volver al</span>
            <span>Inicio de Sesión</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Registration Paused Warning */}
        {!registrationEnabled && (
          <div className="mb-8 p-5 bg-amber-50 border border-amber-300 rounded-3xl text-amber-900 flex items-start gap-3.5 shadow-sm">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm">Registro Público Pausado</h3>
              <p className="text-xs mt-1 text-amber-800">
                La recepción de nuevos registros públicos está pausada en este momento por la administración. Por favor contacte directamente al equipo directivo de la Fundación ULEP.
              </p>
            </div>
          </div>
        )}

        {/* Dashboard Title & Introduction Hero Card */}
        <div className="mb-8 bg-gradient-to-r from-blue-700 via-sky-600 to-blue-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/15 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-sky-100 text-xs font-semibold mb-3 border border-white/20">
              <UserPlus className="w-3.5 h-3.5 text-sky-200" />
              <span>Convocatoria y Vinculación Institucional</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bienvenido a la Fundación ULEP
            </h2>
            <p className="text-sky-100 text-xs sm:text-sm mt-2 leading-relaxed">
              Diligencie el siguiente formulario oficial para registrarse como colaborador o voluntario. Una vez enviada su información, su cuenta quedará registrada y el <strong>Administrador la habilitará</strong> para permitir su ingreso al sistema.
            </p>
          </div>
        </div>

        {/* Form Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* Full Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Card 1: Identificación y Datos Personales */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-sky-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    1. Identificación y Datos Personales
                  </h3>
                  <p className="text-xs text-slate-500">
                    Información legal y personal para el registro institucional
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-rose-500">* Campos requeridos</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nombre Completo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Camila Andrea Rodríguez Mora"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tipo de Documento <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.documentType}
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-medium"
                >
                  <option value="Cédula de Ciudadanía">Cédula de Ciudadanía</option>
                  <option value="Tarjeta de Identidad">Tarjeta de Identidad</option>
                  <option value="Cédula de Extranjería">Cédula de Extranjería</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="Permiso Especial de Permanencia">Permiso Especial de Permanencia</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Número de Cédula / Documento <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 1061789234"
                  value={formData.documentNumber}
                  onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-mono font-semibold"
                />
                <p className="text-[11px] text-blue-600 font-medium mt-1">
                  Este número será tu usuario para iniciar sesión una vez habilitado.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ciudad de Expedición
                </label>
                <input
                  type="text"
                  placeholder="Ej. Popayán, Cauca"
                  value={formData.documentExpeditionCity}
                  onChange={(e) => setFormData({ ...formData, documentExpeditionCity: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Edad (Años)
                </label>
                <input
                  type="number"
                  min="16"
                  max="99"
                  placeholder="Ej. 24"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) || 24 })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ciudad de Residencia
                </label>
                <input
                  type="text"
                  placeholder="Ej. Popayán"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Contacto y Comunicaciones */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-sky-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  2. Canales de Contacto y Comunicación
                </h3>
                <p className="text-xs text-slate-500">
                  Medios a través de los cuales la Fundación se comunicará con usted
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Correo Electrónico <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Teléfono / Celular / WhatsApp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ej. 312 456 7890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Dirección de Residencia
                </label>
                <input
                  type="text"
                  placeholder="Ej. Cra 8 # 4-50, Barrio Centro"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Perfil Profesional y Cargo de Interés */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-sky-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  3. Perfil Académico y Cargo de Interés
                </h3>
                <p className="text-xs text-slate-500">
                  Área de desempeño dentro de los programas y proyectos sociales
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Carrera, Ocupación o Profesión
                </label>
                <input
                  type="text"
                  placeholder="Ej. Psicología, Trabajo Social, Administración..."
                  value={formData.career}
                  onChange={(e) => setFormData({ ...formData, career: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Cargo o Función de Interés
                </label>
                <input
                  type="text"
                  placeholder="Ej. Voluntario de Apoyo, Coordinador de Campo..."
                  value={formData.roleTitle}
                  onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Modalidad de Vinculación
                </label>
                <select
                  value={formData.contractType}
                  onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-medium"
                >
                  <option value="Voluntariado / Contrato de Apoyo">Voluntariado / Contrato de Apoyo</option>
                  <option value="Práctica / Pasantía Académica">Práctica / Pasantía Académica</option>
                  <option value="Contrato por Prestación de Servicios">Contrato por Prestación de Servicios</option>
                  <option value="Colaborador Operativo">Colaborador Operativo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 4: Dotación Institucional y Seguridad en el Trabajo (SST) */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-sky-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <Shirt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  4. Dotación Institucional y Salud (SST)
                </h3>
                <p className="text-xs text-slate-500">
                  Tallas de uniforme corporativo y datos de atención médica
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Talla Camisa
                </label>
                <select
                  value={formData.shirtSize}
                  onChange={(e) => setFormData({ ...formData, shirtSize: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-medium"
                >
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Talla Pantalón
                </label>
                <input
                  type="text"
                  placeholder="Ej. 30, 32"
                  value={formData.pantsSize}
                  onChange={(e) => setFormData({ ...formData, pantsSize: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Calzado
                </label>
                <input
                  type="text"
                  placeholder="Ej. 38, 40"
                  value={formData.shoeSize}
                  onChange={(e) => setFormData({ ...formData, shoeSize: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Grupo Sanguíneo (RH)
                </label>
                <select
                  value={formData.bloodType}
                  onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-medium"
                >
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  EPS Afiliada
                </label>
                <input
                  type="text"
                  placeholder="Ej. Sanitas, Nueva EPS..."
                  value={formData.epsHealth}
                  onChange={(e) => setFormData({ ...formData, epsHealth: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                />
              </div>

              <div className="col-span-2 sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contacto de Emergencia y Parentesco
                </label>
                <input
                  type="text"
                  placeholder="Ej. María Mora (Madre)"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Teléfono Emergencia
                </label>
                <input
                  type="tel"
                  placeholder="Ej. 315 789 0123"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Card 5: Credenciales de Acceso */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-sky-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  5. Contraseña de Acceso al Portal
                </h3>
                <p className="text-xs text-slate-500">
                  Defina la clave con la cual ingresará una vez sea habilitado por el Administrador
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contraseña <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 3 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirmar Contraseña <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Repita su contraseña exactamente igual"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Consentimiento Legal */}
          <div className="p-5 bg-sky-50/90 border border-sky-200 rounded-3xl space-y-3">
            <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                required
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500 shrink-0"
              />
              <span className="leading-relaxed">
                Autorizo de manera libre, voluntaria, previa, explícita e informada a la <strong>FUNDACIÓN ULEP</strong> para el tratamiento de mis datos personales y de contacto, para fines estrictamente institucionales, emisión de certificaciones laborales y dotación, conforme a la normatividad legal de protección de datos (Ley 1581 de 2012 de Colombia).
              </span>
            </label>
          </div>

          {/* Final Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-12">
            <button
              type="button"
              onClick={onBackToLogin}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-2xl transition-all cursor-pointer shadow-xs text-center"
            >
              Cancelar y Volver al Inicio
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !registrationEnabled}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 rounded-2xl shadow-lg shadow-blue-600/25 transition-all cursor-pointer hover:scale-[1.01]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Guardando y Enviando Registro...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Enviar Formulario de Registro</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
