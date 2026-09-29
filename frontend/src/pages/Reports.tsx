import React from 'react';
import { FileDown, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const Reports: React.FC = () => {
  const reportTemplates = [
    { title: "District Intelligence Report", desc: "Generates risk postures, active crime metrics, and patrol allocations per district.", size: "1.2 MB" },
    { title: "Crime Trend Forecast Report", desc: "6-month prediction logs with seasonality breakups for all majorheads.", size: "850 KB" },
    { title: "Repeat Offender Profiling", desc: "Detailed listing of high-risk suspects, associated cases, and network links.", size: "2.4 MB" },
    { title: "Officer Performance Summary", desc: "Resolution rates, active loads, and performance metrics across divisions.", size: "900 KB" }
  ];

  const handleDownload = (title: string) => {
    // PDF generation trigger
    alert(`Triggering PDF report generation for: "${title}". PDF download starting shortly.`);
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold font-heading text-white tracking-wide">Intelligence Reports Center</h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Automated PDF Intelligence Report Generators</p>
      </div>

      {/* Roster list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        {reportTemplates.map((rep, idx) => (
          <div key={idx} className="glass-card p-6 flex flex-col justify-between hover:border-orange-500/30 transition-all duration-300">
            <div className="space-y-2">
              <span className="text-[9px] bg-blue-500/10 text-blue-400 font-bold px-2 py-0.5 rounded border border-blue-500/20 uppercase tracking-widest">
                OFFICIAL REPORT
              </span>
              <h3 className="text-base font-bold text-white mt-2 leading-tight">{rep.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">{rep.desc}</p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
              <span className="text-[10px] text-slate-500">Doc Size: {rep.size}</span>
              <button
                onClick={() => handleDownload(rep.title)}
                className="inline-flex items-center space-x-1.5 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded text-[10px] font-bold transition-all"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Generate PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
