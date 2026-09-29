import React from 'react';
import { useApi } from '../hooks/useApi';
import { MetricCard } from '../components/MetricCard';
import { 
  ShieldAlert, FileText, UserX, Users, Building, AlertTriangle, ArrowRight,
  TrendingUp, Radio
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, Cell, CartesianGrid 
} from 'recharts';
import { Link } from 'react-router-dom';

const CHART_COLORS = ['#2563eb', '#f97316', '#10b981', '#7c3aed', '#0891b2', '#d97706'];

export const Dashboard: React.FC = () => {
  const { data: kpis } = useApi('/cases/kpis', {
    total_firs: 0, today_firs: 0, pending_cases: 0, solved_cases: 0,
    charge_sheeted: 0, closed_cases: 0, total_victims: 0, total_accused: 0,
    total_stations: 0, total_districts: 0
  });

  const { data: trends } = useApi('/cases/trends', { monthly: [], yearly: [] });
  const { data: categories } = useApi('/cases/categories', { categories: [], subcategories: [] });
  const { data: districtsRisk } = useApi('/ai/districts-risk', []);
  const { data: recentCases } = useApi('/cases?limit=5', { items: [] });

  const recentAlerts = [
    { id: 1, text: "High probability spike in cyber frauds in Bengaluru District.", type: "critical", time: "Just now" },
    { id: 2, text: "Repeat offender A2 detected in Devaraja PS perimeter.", type: "warning", time: "18m ago" },
    { id: 3, text: "Active burglary gang pattern detected across Mysuru stations.", type: "warning", time: "42m ago" }
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Intelligence Summary Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black font-heading text-slate-900 tracking-tight">Command Center</h1>
            <span className="px-2 py-0.5 text-[10px] font-bold font-mono tracking-wider bg-blue-100 text-blue-800 rounded">
              STATE DIRECTIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Karnataka State Police AI Crime Analytics & Incident Intelligence Overview
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-600">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span className="font-semibold text-slate-700">HQ Feed Active</span>
          </div>
          <Link
            to="/analytics"
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors"
          >
            <span>Full Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Row (TOTAL FIRs, SOLVED CASES, ACTIVE SUSPECTS, JURISDICTION SCOPE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard 
          title="TOTAL FIRs" 
          value={kpis.total_firs ? kpis.total_firs.toLocaleString() : '0'} 
          icon={FileText} 
          subtext="Recorded cases across state" 
          trend={`+${kpis.today_firs} today`}
          trendType="positive"
          color="blue"
        />
        <MetricCard 
          title="SOLVED CASES" 
          value={kpis.solved_cases ? kpis.solved_cases.toLocaleString() : '0'} 
          icon={Users} 
          subtext={`Resolution rate: ${kpis.total_firs ? Math.round((kpis.solved_cases / kpis.total_firs) * 100) : 0}%`}
          trend={`${kpis.charge_sheeted} CS / ${kpis.closed_cases} Cl`}
          trendType="positive"
          color="green"
        />
        <MetricCard 
          title="ACTIVE SUSPECTS" 
          value={kpis.total_accused ? kpis.total_accused.toLocaleString() : '0'} 
          icon={UserX} 
          subtext="Under active surveillance" 
          trend="Recidivists flagged"
          trendType="neutral"
          color="orange"
        />
        <MetricCard 
          title="JURISDICTION SCOPE" 
          value={`${kpis.total_stations} Stations`} 
          icon={Building} 
          subtext={`${kpis.total_districts} Districts monitored`} 
          trend="100% Online"
          trendType="positive"
          color="purple"
        />
      </div>

      {/* Main Grid: Charts (Left) & Intelligence Side Column (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Charts Section (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Monthly Trend Area Chart */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>Monthly Crime Volume</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">FIR registration frequency across previous 12 months</p>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">HISTORICAL TREND</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends.monthly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="crimeColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#e2e8f0', 
                      color: '#0f172a', 
                      borderRadius: '6px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    name="FIR Volume" 
                    stroke="#2563eb" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#crimeColor)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Crime Category Bar Chart */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Top Crime Categories
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Distribution by primary statutory crime head</p>
              </div>
              <Link to="/analytics" className="text-[11px] text-blue-600 hover:underline font-semibold">
                Explore Analytics &rarr;
              </Link>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categories.categories} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#e2e8f0', 
                      color: '#0f172a', 
                      borderRadius: '6px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }} 
                  />
                  <Bar dataKey="count" name="Case Count" radius={[4, 4, 0, 0]}>
                    {categories.categories.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Intelligence Side Column (Right 1 col) */}
        <div className="space-y-6">
          
          {/* Active AI Risk Alerts */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs border-t-4 border-t-amber-500">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-2">
                <ShieldAlert className="w-4.5 h-4.5 text-amber-600" />
                <span>AI Risk Alerts</span>
              </h3>
              <span className="flex items-center space-x-1 text-[10px] bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded-full border border-red-200">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                <span>LIVE</span>
              </span>
            </div>
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-3 rounded-md border flex items-start space-x-2.5 ${
                    alert.type === 'critical'
                      ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                      : 'bg-amber-50/70 border-amber-200 text-amber-900'
                  }`}
                >
                  <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${
                    alert.type === 'critical' ? 'text-rose-600' : 'text-amber-600'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1 rounded ${
                        alert.type === 'critical' ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-800'
                      }`}>
                        {alert.type}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{alert.time}</span>
                    </div>
                    <p className="text-xs font-medium leading-normal text-slate-800">{alert.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* High Risk Districts (District Risk Score) */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                High Risk Districts
              </h3>
              <Link to="/map" className="text-[11px] text-blue-600 hover:underline font-semibold">
                Map View &rarr;
              </Link>
            </div>
            <div className="space-y-3">
              {districtsRisk.slice(0, 4).map((dist: any, index: number) => (
                <div key={dist.district_id || dist.id || dist.district || index} className="flex items-center justify-between p-2 rounded hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{dist.district}</p>
                    <p className="text-[11px] text-slate-500">{dist.crimes_count} cases · Resolution: {dist.resolution_rate}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      dist.risk_score > 70 
                        ? 'bg-rose-50 text-rose-700 border-rose-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      Risk: {dist.risk_score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent FIRs */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Recent Cases</h3>
              <Link to="/firs" className="text-[11px] text-blue-600 hover:underline font-bold">
                VIEW ALL &rarr;
              </Link>
            </div>
            <div className="space-y-2.5">
              {recentCases.items.map((c: any, index: number) => (
                <div key={c.id || c.crime_no || index} className="flex items-center justify-between pb-2.5 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="truncate pr-3">
                    <Link to={`/cases/${c.id}`} className="text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors">
                      FIR No: {c.crime_no}
                    </Link>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{c.major_head} · {c.station_name}</p>
                  </div>
                  <span className="text-[9px] font-mono bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-semibold tracking-wider shrink-0">
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
