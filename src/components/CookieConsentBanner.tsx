import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, Check, Building2, FileText, X, ChevronRight } from 'lucide-react';

interface CookiePreferences {
  accepted: boolean;
  essentialCookies: boolean;
  corporateDataProcessing: boolean;
  dateAccepted: string;
}

const STORAGE_KEY = 'ulep_cookie_corporate_consent';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [corporateConsent, setCorporateConsent] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Show after a brief delay for smooth appearance
        const timer = setTimeout(() => setIsVisible(true), 600);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const prefs: CookiePreferences = {
      accepted: true,
      essentialCookies: true,
      corporateDataProcessing: true,
      dateAccepted: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {
      console.error(e);
    }
    setIsVisible(false);
    setShowDetailsModal(false);
  };

  const handleSaveCustom = () => {
    const prefs: CookiePreferences = {
      accepted: true,
      essentialCookies: true,
      corporateDataProcessing: corporateConsent,
      dateAccepted: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {
      console.error(e);
    }
    setIsVisible(false);
    setShowDetailsModal(false);
  };

  const handleReopen = () => {
    setIsVisible(true);
  };

  return (
    <>
      {/* Persistent floating trigger in bottom-left corner when banner is closed */}
      {!isVisible && (
        <button
          type="button"
          onClick={handleReopen}
          title="Configuración de Cookies y Consentimiento de Empresa"
          className="fixed bottom-3 left-3 z-40 bg-white/90 backdrop-blur-md text-slate-700 hover:text-blue-700 p-2.5 rounded-full shadow-lg border border-slate-200/80 hover:border-blue-300 transition-all duration-200 flex items-center gap-2 text-xs font-semibold cursor-pointer group"
        >
          <Cookie className="w-4 h-4 text-amber-600 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline text-[11px]">Cookies y Fines de Empresa</span>
        </button>
      )}

      {/* Main Cookie & Corporate Consent Banner */}
      {isVisible && (
        <div className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4 animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-none">
          <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-xl border border-sky-200/80 rounded-2xl shadow-2xl shadow-slate-900/15 p-4 sm:p-5 pointer-events-auto ring-1 ring-slate-900/5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              {/* Left Section: Icon and Description */}
              <div className="flex items-start gap-3.5 flex-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-sky-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                  <Cookie className="w-5 h-5 text-amber-200" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      Aceptación de Cookies y Tratamiento de Información con Fines de la Empresa
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3" />
                      Fundación ULEP
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    Este portal utiliza cookies técnicas y de seguridad para optimizar su experiencia, autenticar sesiones y proteger la emisión de certificados. Al continuar, usted autoriza el uso de cookies y manifiesta su consentimiento para <strong className="text-slate-800 font-semibold">presentar y tratar su información laboral y de voluntariado con fines legítimos y corporativos de la empresa</strong>, bajo estrictos protocolos de confidencialidad y la Ley 1581 de 2012.
                  </p>
                  <div className="flex items-center gap-3 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setShowDetailsModal(true)}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Ver políticas y fines corporativos detallados</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Section: Action Buttons */}
              <div className="flex flex-row md:flex-col sm:flex-row items-center gap-2 w-full md:w-auto shrink-0 justify-end">
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(true)}
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-colors cursor-pointer text-center"
                >
                  Personalizar
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 shadow-md shadow-blue-500/20 transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Aceptar Cookies y Fines</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Detailed Modal for Customization & Corporate Policy View */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Política de Cookies y Fines Corporativos</h4>
                  <p className="text-[11px] text-slate-500">Fundación ULEP • NIT 902050377-7</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl space-y-1.5">
                <h5 className="font-bold text-blue-900 flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Marco Institucional y de Privacidad
                </h5>
                <p className="text-[11px] text-blue-800 leading-normal">
                  De conformidad con la Constitución Política de Colombia y la Ley Estatutaria 1581 de 2012, la FUNDACIÓN ULEP garantiza la protección, veracidad e intangibilidad de la información consignada en sus registros corporativos.
                </p>
              </div>

              {/* Option 1: Cookies Técnicas (Obligatorias) */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <Cookie className="w-4 h-4 text-amber-600" />
                    Cookies Técnicas y de Seguridad
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                    Obligatorias
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Son indispensables para el inicio de sesión cifrado, almacenamiento local de tokens y protección ante ataques CSRF/XSS. No recopilan datos con fines publicitarios.
                </p>
              </div>

              {/* Option 2: Presentar información con fines de la empresa */}
              <div className="border border-sky-200 bg-sky-50/30 rounded-xl p-3.5 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={corporateConsent}
                    onChange={(e) => setCorporateConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      Presentar información con fines de la empresa
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Autoriza expresamente a la Fundación ULEP a consultar, cotejar y presentar sus datos de voluntariado, tiempo de servicio, funciones y certificados digitales para los fines institucionales, laborales y de auditoría interna de la organización.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleSaveCustom}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Guardar selección
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer shadow-sm"
              >
                Aceptar Todo
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
