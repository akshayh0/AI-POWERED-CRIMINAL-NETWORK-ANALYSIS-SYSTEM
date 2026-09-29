import React from 'react';
import { useApi } from '../hooks/useApi';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

const CHART_COLORS = ['#3b82f6', '#f97316', '#10b981', '#a855f7', '#06b6d4', '#eab308', '#ec4899'];

export const CrimeAnalytics: React.FC = () => {
  const { data: trends } = useApi('/cases/trends', { monthly: [], yearly: [] });
  const { data: districts } = useApi('/cases/districts', []);
  const { data: categories } = useApi('/cases/categories', { categories: [], subcategories: [] });
  const { data: demographics } = useApi('/cases/demographics', {
    victim_gender: [], victim_age: [], accused_age: [],
    complainant_occupation: [], complainant_religion: [], complainant_caste: []
  });

  // Map gender IDs to labels
  const formattedVictimGender = demographics.victim_gender.map((item: any) => ({
    name: item.gender_id === 1 ? 'Male' : item.gender_id === 2 ? 'Female' : 'Transgender',
    value: item.count
  }));

  // Format complainant statistics
  const occupationData = demographics.complainant_occupation.map((item: any) => ({ name: item.occupation, value: item.count }));
  const religionData = demographics.complainant_religion.map((item: any) => ({ name: item.religion, value: item.count }));
  const casteData = demographics.complainant_caste.map((item: any) => ({ name: item.caste, value: item.count }));

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold font-heading text-white tracking-wide">Crime Analytics</h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Advanced Statistical & Demographic Insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Monthly Crime Trend */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Monthly Crime trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends.monthly}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#475569" fontSize={10} />
                <YAxis stroke="#475569" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="count" name="FIR Count" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorTrend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Crime by District */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Crime by District</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districts}>
                <XAxis dataKey="district" stroke="#475569" fontSize={10} />
                <YAxis stroke="#475569" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
                <Bar dataKey="count" name="FIR Count" radius={[4, 4, 0, 0]}>
                  {districts.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Crime Head & Sub-Heads */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Crime Sub-Head Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories.subcategories} layout="vertical">
                <XAxis type="number" stroke="#475569" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#475569" fontSize={10} width={90} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
                <Bar dataKey="count" name="FIR Count" radius={[0, 4, 4, 0]}>
                  {categories.subcategories.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Victim Demographics (Gender) */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Victim Gender Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formattedVictimGender}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {formattedVictimGender.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complainant Occupation */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Complainant Occupation</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupationData}>
                <XAxis dataKey="name" stroke="#475569" fontSize={9} />
                <YAxis stroke="#475569" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
                <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]} fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complainant Religion & Caste */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Complainant Religion</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={religionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {religionData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[(index + 2) % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
