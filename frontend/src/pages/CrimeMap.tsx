import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { InteractiveMap } from '../components/InteractiveMap';
import { Sliders, RefreshCw } from 'lucide-react';

export const CrimeMap: React.FC = () => {
  const [districtFilter, setDistrictFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [timeSlider, setTimeSlider] = useState(100); // percentage of cases to display chronologically

  // Fetch full details of cases with coordinates
  const { data: casesData, loading: casesLoading } = useApi(
    `/cases?limit=100`, 
    { items: [] }
  );

  const { data: hotspots } = useApi('/ai/hotspots', []);

  // Filter local state
  const [filteredIncidents, setFilteredIncidents] = useState<any[]>([]);

  useEffect(() => {
    if (!casesData.items) return;

    let result = [...casesData.items];

    // Apply Filters
    if (districtFilter) {
      result = result.filter(c => c.station_name.includes(districtFilter) || (c.district_name && c.district_name.includes(districtFilter)));
    }
    if (categoryFilter) {
      result = result.filter(c => c.major_head === categoryFilter);
    }
    if (statusFilter) {
      result = result.filter(c => c.status === statusFilter);
    }

    // Chronological sort
    result.sort((a, b) => new Date(a.registered_date).getTime() - new Date(b.registered_date).getTime());

    // Apply Timeline Slider (percentage of records)
    const sliceCount = Math.max(1, Math.round((timeSlider / 100) * result.length));
    result = result.slice(0, sliceCount);

    setFilteredIncidents(result);
  }, [casesData, districtFilter, categoryFilter, statusFilter, timeSlider]);

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading text-white tracking-wide">Interactive Spatial Heatmap</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Geospatial Distribution of Crime Incidents</p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="glass-card p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">District</label>
          <select 
            value={districtFilter} 
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="">All Districts</option>
            <option value="Bengaluru City">Bengaluru City</option>
            <option value="Mysuru">Mysuru</option>
            <option value="Hubballi-Dharwad">Hubballi-Dharwad</option>
            <option value="Mangaluru">Mangaluru</option>
            <option value="Belagavi">Belagavi</option>
            <option value="Kalaburagi">Kalaburagi</option>
            <option value="Shimoga">Shimoga</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Crime Head</label>
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="">All Categories</option>
            <option value="Crimes Against Body">Crimes Against Body</option>
            <option value="Property Crimes">Property Crimes</option>
            <option value="Cyber Crimes">Cyber Crimes</option>
            <option value="Narcotic Crimes">Narcotic Crimes</option>
            <option value="Crimes Against Public Order">Crimes Against Public Order</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Case Status</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="">All Statuses</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Charge Sheeted">Charge Sheeted</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div>
          <button 
            onClick={() => { setDistrictFilter(''); setCategoryFilter(''); setStatusFilter(''); setTimeSlider(100); }}
            className="w-full bg-slate-900 border border-white/10 text-white rounded-lg py-2.5 text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Map View */}
      <div className="glass-card p-6 relative z-0 isolate">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Karnataka Crime Density Map</h3>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/40 border border-red-500 animate-pulse"></span>
            <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">AI Hotspots Active</span>
          </div>
        </div>

        <InteractiveMap 
          incidents={filteredIncidents} 
          hotspots={Array.isArray(hotspots) ? hotspots : (hotspots?.hotspots || [])}
          center={[12.9716, 77.5946]}
          zoom={7}
        />

        {/* Timeline Slider Control */}
        <div className="mt-6 p-4 bg-slate-950/60 rounded-lg border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-400">Timeline Slider (Chronological Filter)</span>
            <span className="text-orange-500 font-bold">{timeSlider}% of Cases Shown</span>
          </div>
          <input 
            type="range" 
            min="10" 
            max="100" 
            value={timeSlider} 
            onChange={(e) => setTimeSlider(Number(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500 focus:outline-none"
          />
          <div className="flex justify-between text-[9px] text-slate-600 font-medium uppercase tracking-wider">
            <span>Earliest Records</span>
            <span>Latest Records</span>
          </div>
        </div>
      </div>
    </div>
  );
};
