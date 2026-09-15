import React, { useState } from 'react';
import { Volunteer } from '../types';
import {
  Cloud,
  X,
  ExternalLink,
  Save,
  CheckCircle2,
  Globe,
  User,
  Search,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  volunteers: Volunteer[];
  onUpdateVolunteer: (volunteer: Volunteer) => void;
  onShowToast: (message: string) => void;
}

export const CloudSpaceSettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  volunteers,
  onUpdateVolunteer,
  onShowToast,
}) => {
  const [globalUrl, setGlobalUrl] = useState(() => {
    try {
      return localStorage.getItem('ulep_global_cloud_space_url') || 'https://drive.google.com';
    } catch {
      return 'https://drive.google.com';
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [editingUrls, setEditingUrls] = useState<{ [volunteerId: string]: string }>(() => {
    const map: { [volunteerId: string]: string } = {};
    volunteers.forEach((v) => {
      map[v.id] = v.cloudSpaceUrl || '';
    });
    return map;
  });

  if (!isOpen) return null;

  const handleSaveGlobal = () => {
    try {
      localStorage.setItem('ulep_global_cloud_space_url', globalUrl.trim());
      onShowToast('URL global del Espacio en la Nube guardada correctamente.');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveIndividual = (volunteer: Volunteer) => {
    const newUrl = (editingUrls[volunteer.id] || '').trim();
    const updated: Volunteer = {
      ...volunteer,
      cloudSpaceUrl: newUrl,
    };
    onUpdateVolunteer(updated);
    onShowToast(`Espacio en la Nube actualizado para ${volunteer.fullName}.`);
  };

  const filteredVolunteers = volunteers.filter(
    (v) =>
      v.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.documentNumber.includes(searchTerm) ||
      v.certificateCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-sky-200/80 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-900 via-sky-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20 text-sky-300">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Configuración de "Espacio en la Nube"
              </h2>
              <p className="text-xs text-sky-200">
                Define las URL a las que redirigirá el botón en el panel de cada cliente/colaborador
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-sky-200 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Global Default URL Section */}
          <div className="p-5 bg-sky-50/70 border border-sky-200/80 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-950">
              <Globe className="w-4 h-4 text-blue-700" />
              <span>1. URL Predeterminada Global (Para todos los colaboradores)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Si un colaborador no tiene una carpeta personal configurada, el botón{' '}
              <strong className="text-blue-900 font-semibold">"Espacio en la Nube"</strong>{' '}
              lo redirigirá automáticamente a esta dirección general (ej. Carpeta General de Google Drive o OneDrive).
            </p>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={globalUrl}
                onChange={(e) => setGlobalUrl(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-sky-300 rounded-xl font-mono text-slate-900 focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleSaveGlobal}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Global</span>
              </button>
              {globalUrl && (
                <a
                  href={globalUrl.startsWith('http') ? globalUrl : `https://${globalUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-sky-100 hover:bg-sky-200 text-blue-900 rounded-xl transition-all shrink-0"
                  title="Abrir y probar enlace global"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Individual Volunteer URLs */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
                <User className="w-4 h-4 text-blue-700" />
                <span>2. Carpetas Individuales por Colaborador ({volunteers.length})</span>
              </div>
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar colaborador..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {filteredVolunteers.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-500">
                  No se encontraron colaboradores coincidentes.
                </p>
              ) : (
                filteredVolunteers.map((vol) => {
                  const currentVal = editingUrls[vol.id] !== undefined ? editingUrls[vol.id] : (vol.cloudSpaceUrl || '');
                  return (
                    <div
                      key={vol.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2 hover:bg-sky-50/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{vol.fullName}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            Doc: {vol.documentNumber} · Cód: {vol.certificateCode}
                          </p>
                        </div>
                        {vol.cloudSpaceUrl ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Personalizado
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-semibold rounded-md">
                            Usa URL Global
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="url"
                          value={currentVal}
                          onChange={(e) =>
                            setEditingUrls({
                              ...editingUrls,
                              [vol.id]: e.target.value,
                            })
                          }
                          placeholder="URL específica para este colaborador (Google Drive, OneDrive...)"
                          className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl font-mono text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveIndividual(vol)}
                          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shrink-0"
                          title="Guardar URL para este colaborador"
                        >
                          Guardar
                        </button>
                        {currentVal && (
                          <a
                            href={currentVal.startsWith('http') ? currentVal : `https://${currentVal}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100/50 rounded-lg transition-colors"
                            title="Probar enlace"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Los cambios se sincronizan en tiempo real para la sesión de cada colaborador.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
