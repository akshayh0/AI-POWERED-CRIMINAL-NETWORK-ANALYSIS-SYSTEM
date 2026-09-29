import React from 'react';
import { useApi } from '../hooks/useApi';
import { UserCheck, Users, HelpCircle } from 'lucide-react';

export const ComplainantAnalytics: React.FC = () => {
  const { data: demographics, loading } = useApi('/cases/demographics', {
    complainant_occupation: [],
    complainant_religion: [],
    complainant_caste: []
  });

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold font-heading text-white tracking-wide">Complainant Analytics</h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">complainant Demographic & Social Distribution</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Occupation distribution */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 border-b border-white/10 pb-2.5">
            <UserCheck className="w-4 h-4 text-blue-400" />
            <span>Occupation Distribution</span>
          </div>
          <div className="space-y-4">
            {loading ? (
              <p className="text-xs text-slate-500">Loading data...</p>
            ) : (
              demographics.complainant_occupation.map((item: any, idx: number) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-300">{item.occupation}</span>
                    <span className="text-white">{item.count}</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full" 
                      style={{ width: `${Math.min(100, (item.count / 120) * 200)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Religion distribution */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 border-b border-white/10 pb-2.5">
            <Users className="w-4 h-4 text-orange-400" />
            <span>Religion Distribution</span>
          </div>
          <div className="space-y-4">
            {loading ? (
              <p className="text-xs text-slate-500">Loading data...</p>
            ) : (
              demographics.complainant_religion.map((item: any, idx: number) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-300">{item.religion}</span>
                    <span className="text-white">{item.count}</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5">
                    <div 
                      className="bg-orange-500 h-1.5 rounded-full" 
                      style={{ width: `${Math.min(100, (item.count / 120) * 150)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Caste distribution */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 border-b border-white/10 pb-2.5">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>Caste Distribution</span>
          </div>
          <div className="space-y-4">
            {loading ? (
              <p className="text-xs text-slate-500">Loading data...</p>
            ) : (
              demographics.complainant_caste.map((item: any, idx: number) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-300">{item.caste}</span>
                    <span className="text-white">{item.count}</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5">
                    <div 
                      className="bg-emerald-500 h-1.5 rounded-full" 
                      style={{ width: `${Math.min(100, (item.count / 120) * 200)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
