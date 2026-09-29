import React from 'react';
import { ShieldAlert, Database, Lock, Terminal } from 'lucide-react';

export const Settings: React.FC = () => {
  const auditLogs = [
    { time: "2026-07-24 21:55:04", user: "Admin (KG-18274)", event: "Accessed District Intelligence Forecast report", status: "SUCCESS" },
    { time: "2026-07-24 21:52:12", user: "Officer (KG-92837)", event: "Queried Case link network diagram for FIR 1044300", status: "SUCCESS" },
    { time: "2026-07-24 21:48:30", user: "Analyst (KG-88392)", event: "Re-seeded database schema parameters", status: "SUCCESS" },
    { time: "2026-07-24 21:40:02", user: "Inspector (KG-37291)", event: "Viewed Accused A2 Profile facts", status: "SUCCESS" }
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold font-heading text-white tracking-wide">Settings & Security Audit</h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Platform System Controls & Activity Audit Log</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side Configurations */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Security Clearance level description */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 pb-2 border-b border-white/10 mb-2 flex items-center space-x-1.5">
              <Lock className="w-4.5 h-4.5 text-blue-500" />
              <span>Role-Based Access Control (RBAC) Settings</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Security clearances and navigation access are mapped automatically to personnel tags and role-based policies. Audit trails are logged securely for every transaction.
            </p>
            <div className="space-y-3.5 pt-2 text-xs">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="font-bold text-white">Administrator</span>
                <span className="text-slate-500">Full clearance. Access to all pages.</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="font-bold text-white">Crime Analyst</span>
                <span className="text-slate-500">Access to Analytics, Maps, Network graphs and AI forecasting.</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="font-bold text-white">Police Officer</span>
                <span className="text-slate-500">Access to Executive Dashboard, Maps, FIR Management.</span>
              </div>
            </div>
          </div>

          {/* Integration Statuses */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 pb-2 border-b border-white/10 mb-2 flex items-center space-x-1.5">
              <Database className="w-4.5 h-4.5 text-orange-500" />
              <span>Cloud Services Integration Status</span>
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-900/60 rounded border border-emerald-500/20 text-emerald-400 font-bold">
                ✓ Render Backend: Active
              </div>
              <div className="p-3 bg-slate-900/60 rounded border border-emerald-500/20 text-emerald-400 font-bold">
                ✓ SQLite Database: Connected
              </div>
              <div className="p-3 bg-slate-900/60 rounded border border-emerald-500/20 text-emerald-400 font-bold">
                ✓ Netlify Edge: Deployed
              </div>
              <div className="p-3 bg-slate-900/60 rounded border border-emerald-500/20 text-emerald-400 font-bold">
                ✓ AI Predictive Engine: Synced
              </div>
            </div>
          </div>

        </div>

        {/* Right Side Security Audit Logs */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white pb-2 border-b border-white/10 mb-2 flex items-center space-x-1.5">
            <Terminal className="w-4.5 h-4.5 text-rose-500" />
            <span>Access Audit Log</span>
          </h3>
          <div className="space-y-4 text-xs max-h-96 overflow-y-auto pr-1">
            {auditLogs.map((log, idx) => (
              <div key={idx} className="p-3 bg-slate-950/60 rounded border border-white/5 space-y-1.5">
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>{log.time}</span>
                  <span className="text-emerald-400 font-bold">{log.status}</span>
                </div>
                <p className="font-semibold text-white">{log.user}</p>
                <p className="text-slate-400 leading-normal">{log.event}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
