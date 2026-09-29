import React from 'react';
import { X, ShieldCheck, Info, HelpCircle, PhoneCall, CheckCircle } from 'lucide-react';
import { KarnatakaGovEmblem } from '../desktop/Emblems';

export type AuthInfoModalType = 'about' | 'security' | 'help' | null;

interface AuthInfoModalProps {
  type: AuthInfoModalType;
  onClose: () => void;
}

export const AuthInfoModal: React.FC<AuthInfoModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative text-slate-800 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <KarnatakaGovEmblem className="w-8 h-8 shrink-0" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {type === 'about' && 'About KSP AI-PORTAL'}
                {type === 'security' && 'Security & Access Policy'}
                {type === 'help' && 'Officer Help & Support'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Karnataka State Police · Intelligence Directorate
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        {type === 'about' && (
          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <p>
              The <strong>KSP AI-PORTAL</strong> is the centralized artificial intelligence intelligence and predictive policing platform engineered for the <strong>Karnataka State Police</strong>.
            </p>
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
              <span className="font-bold text-blue-900 block text-[11px] uppercase tracking-wider">Key Capabilities</span>
              <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                <li>Geospatial crime density mapping & AI predictive hotspot modeling.</li>
                <li>Comprehensive FIR, suspect, accused, and complainant pattern analytics.</li>
                <li>Role-based access control with multi-tier clearance dossiers.</li>
              </ul>
            </div>
            <p className="text-[11px] text-slate-500">
              System Version: <strong>Intelligence Ver 2.4.0 (Enterprise Law Enforcement Edition)</strong>
            </p>
          </div>
        )}

        {type === 'security' && (
          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-start space-x-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-900 block text-xs">Secure Restricted Access</span>
                <span className="text-[11px] text-emerald-800">
                  This system is restricted strictly to authorized law enforcement officers and intelligence analysts.
                </span>
              </div>
            </div>
            <ul className="space-y-2 text-[11px] text-slate-700">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>End-to-end 256-bit TLS encryption across all network transactions.</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Every login, query, and export action is immutably logged for audit.</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Compliant with the Information Technology Act and Departmental Security Protocols.</span>
              </li>
            </ul>
          </div>
        )}

        {type === 'help' && (
          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <p>
              If you require access clearance, need your credentials reset, or experience technical difficulties:
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Police / Employee ID:</span>
                <span className="font-mono text-slate-600">e.g. KSP-BGL-4089</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">New Registration Approval:</span>
                <span className="text-slate-600">Requires Administrator verification</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Emergency State Control:</span>
                <span className="font-bold text-blue-700">Dial 112</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
