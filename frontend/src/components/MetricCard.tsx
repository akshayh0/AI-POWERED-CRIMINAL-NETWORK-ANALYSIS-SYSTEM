import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  color?: 'blue' | 'orange' | 'green' | 'red' | 'purple';
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  subtext, 
  trend, 
  trendType = 'neutral',
  color = 'blue'
}) => {
  const colorMap = {
    blue: {
      iconBg: 'bg-blue-50 border-blue-200 text-blue-700',
      borderAccent: 'border-l-4 border-l-blue-600'
    },
    green: {
      iconBg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      borderAccent: 'border-l-4 border-l-emerald-600'
    },
    orange: {
      iconBg: 'bg-amber-50 border-amber-200 text-amber-700',
      borderAccent: 'border-l-4 border-l-amber-600'
    },
    red: {
      iconBg: 'bg-rose-50 border-rose-200 text-rose-700',
      borderAccent: 'border-l-4 border-l-rose-600'
    },
    purple: {
      iconBg: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      borderAccent: 'border-l-4 border-l-indigo-600'
    }
  };

  const currentColors = colorMap[color] || colorMap.blue;

  return (
    <div 
      className={`bg-white rounded-lg border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between ${currentColors.borderAccent}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-md border ${currentColors.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tight leading-none mb-1.5">
          {value}
        </h3>
        <div className="flex items-center space-x-2 mt-2">
          {trend && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              trendType === 'positive' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
              trendType === 'negative' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
              'bg-slate-100 text-slate-600 border border-slate-200'
            }`}>
              {trend}
            </span>
          )}
          {subtext && (
            <span className="text-[11px] text-slate-500 font-medium truncate">{subtext}</span>
          )}
        </div>
      </div>
    </div>
  );
};
