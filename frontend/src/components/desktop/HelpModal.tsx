import React from 'react';
import { X, ShieldAlert, Phone, BookOpen, Lock, ExternalLink, LifeBuoy } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#091a33] px-6 py-4 flex items-center justify-between border-b border-amber-500/30">
          <div className="flex items-center space-x-3">
            <LifeBuoy className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                KSP AI-Portal • Officer Assistance & Standard Operating Procedures
              </h2>
              <p className="text-[11px] text-slate-300">
                Karnataka State Police State Intelligence & Investigation Directive
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
            aria-label="Close Help Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Emergency Escalation */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900">24/7 Police Emergency & Cyber Help Desk</h3>
              <p className="text-amber-800 mt-1 leading-relaxed">
                For immediate tactical assistance or emergency response dispatch, dial <strong>112</strong> (Police Control Room) or <strong>1930</strong> (National Cybercrime Reporting Portal).
              </p>
            </div>
          </div>

          {/* Module Navigation Overview */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-200 pb-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Portal Modules & Quick Guidelines</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <span className="font-bold text-blue-700 block mb-1">Command Center</span>
                <p className="text-slate-600 leading-normal">
                  Overview of statewide FIR trends, real-time alerts, pending investigations, and clearance ratios.
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <span className="font-bold text-blue-700 block mb-1">Crime Records & FIRs</span>
                <p className="text-slate-600 leading-normal">
                  Query crime categories, view registered FIR details, offender histories, and victim impact tracking.
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <span className="font-bold text-blue-700 block mb-1">Interactive Map</span>
                <p className="text-slate-600 leading-normal">
                  Geospatial heatmaps displaying crime concentration across districts and station jurisdictions.
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <span className="font-bold text-blue-700 block mb-1">AI Intelligence</span>
                <p className="text-slate-600 leading-normal">
                  Predictive crime forecasting and conversational AI assistant for IPC/BNS statutory analysis.
                </p>
              </div>
            </div>
          </div>

          {/* Security & Confidentiality */}
          <div className="p-3.5 bg-slate-100 rounded-md border border-slate-200 flex items-start space-x-3 text-slate-600">
            <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Official Use Notice:</strong> All data accessed through this portal is classified under the Official Secrets Act and Karnataka Police Regulations. Unauthorized disclosure or export is strictly prohibited and subject to departmental audit.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            KSP Technical Services Wing • CID IT Cell
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
