import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { Search, Eye, Share2, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

export const FIRManagement: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialSearch = params.get('search') || '';

  const [searchVal, setSearchVal] = useState(initialSearch);
  const [district, setDistrict] = useState('');
  const [majorHead, setMajorHead] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Build filter endpoint query
  const queryParts = [
    `limit=${limit}`,
    `offset=${(page - 1) * limit}`,
    searchVal ? `search=${encodeURIComponent(searchVal)}` : '',
    district ? `district_id=${district}` : '',
    majorHead ? `major_head_id=${majorHead}` : '',
    status ? `status_id=${status}` : ''
  ].filter(Boolean);

  const endpoint = `/cases?${queryParts.join('&')}`;

  const { data: casesResponse, loading } = useApi(endpoint, { items: [], total: 0 }, [endpoint]);

  // Handle URL search change
  useEffect(() => {
    const s = params.get('search');
    if (s !== null) {
      setSearchVal(s);
    }
  }, [location.search]);

  const totalPages = Math.ceil((casesResponse.total || 0) / limit);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold font-heading text-white tracking-wide">FIR Records Management</h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Official Database & Investigation Registry</p>
      </div>

      {/* Advanced Filters */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Filter className="w-4 h-4 text-blue-500" />
          <span>Search & Filter Console</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Case details..."
              className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
              value={searchVal}
              onChange={(e) => { setSearchVal(e.target.value); setPage(1); }}
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          </div>

          <div>
            <select
              value={district}
              onChange={(e) => { setDistrict(e.target.value); setPage(1); }}
              className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50"
            >
              <option value="">All Districts</option>
              <option value="1">Bengaluru City</option>
              <option value="2">Mysuru</option>
              <option value="3">Hubballi-Dharwad</option>
              <option value="4">Mangaluru</option>
              <option value="5">Belagavi</option>
              <option value="6">Kalaburagi</option>
              <option value="7">Shimoga</option>
            </select>
          </div>

          <div>
            <select
              value={majorHead}
              onChange={(e) => { setMajorHead(e.target.value); setPage(1); }}
              className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50"
            >
              <option value="">All Crime Categories</option>
              <option value="1">Crimes Against Body</option>
              <option value="2">Property Crimes</option>
              <option value="3">White Collar Crimes</option>
              <option value="4">Cyber Crimes</option>
              <option value="5">Narcotic Crimes</option>
              <option value="6">Crimes Against Public Order</option>
            </select>
          </div>

          <div>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50"
            >
              <option value="">All Case Statuses</option>
              <option value="1">Under Investigation</option>
              <option value="2">Charge Sheeted</option>
              <option value="3">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Database Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <th className="py-4 px-6">Crime / Case No</th>
                <th className="py-4 px-6">Reg Date</th>
                <th className="py-4 px-6">Major Head</th>
                <th className="py-4 px-6">Police Station</th>
                <th className="py-4 px-6">Investigating Officer</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
                      <span>Loading records from database...</span>
                    </div>
                  </td>
                </tr>
              ) : casesResponse.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">No cases matched the search criteria.</td>
                </tr>
              ) : (
                casesResponse.items.map((c: any) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">
                      <p>{c.crime_no}</p>
                      <span className="text-[10px] text-slate-500">Case: {c.case_no}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-400">{c.registered_date}</td>
                    <td className="py-4 px-6">
                      <p>{c.major_head}</p>
                      <span className="text-[10px] text-slate-500">{c.minor_head}</span>
                    </td>
                    <td className="py-4 px-6">{c.station_name}</td>
                    <td className="py-4 px-6 font-medium text-slate-400">{c.officer_name}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        c.status === 'Under Investigation' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        c.status === 'Charge Sheeted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <Link
                        to={`/cases/${c.id}`}
                        className="inline-flex items-center space-x-1.5 bg-blue-600/15 border border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white px-2.5 py-1.5 rounded text-[10px] font-semibold transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </Link>
                      <Link
                        to={`/network?case_id=${c.id}`}
                        className="inline-flex items-center space-x-1.5 bg-orange-600/15 border border-orange-500/30 text-orange-400 hover:bg-orange-600 hover:text-white px-2.5 py-1.5 rounded text-[10px] font-semibold transition-all"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Network</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-900/60 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Showing page {page} of {totalPages} ({casesResponse.total} cases total)
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-slate-950 border border-white/10 rounded-lg hover:bg-white/5 text-slate-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 bg-slate-950 border border-white/10 rounded-lg hover:bg-white/5 text-slate-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
