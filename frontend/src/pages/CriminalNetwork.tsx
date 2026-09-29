import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { NetworkGraph } from '../components/NetworkGraph';
import { Share2, Users, Shield, Landmark, Info } from 'lucide-react';

export const CriminalNetwork: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const caseId = searchParams.get('case_id') || '';
  const accusedId = searchParams.get('accused_id') || '';

  // Load select options list
  const { data: casesData } = useApi('/cases?limit=200', { items: [] });
  const { data: accusedData } = useApi('/cases/accused', []);

  // Build query
  const queryParts = [
    caseId ? `case_id=${caseId}` : '',
    accusedId ? `accused_id=${accusedId}` : ''
  ].filter(Boolean);

  const endpoint = `/ai/network?${queryParts.join('&')}`;

  const { data: graphData, loading } = useApi(endpoint, { nodes: [], edges: [] }, [endpoint]);

  // Handle selected Node detailing
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const handleNodeClick = (event: React.MouseEvent, node: any) => {
    setSelectedNode(node.data);
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold font-heading text-white tracking-wide">Criminal Linkage Network</h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">AI-Derived Relationship & Modus Operandi Graph</p>
      </div>

      {/* Control Panel to select Case/Accused */}
      <div className="glass-card p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Isolate Case Network</label>
          <select 
            value={caseId} 
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                setSearchParams({ case_id: val });
              } else {
                setSearchParams({});
              }
              setSelectedNode(null);
            }}
            className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="">Select Case...</option>
            {casesData.items?.map((c: any) => (
              <option key={c.id} value={c.id}>{c.case_no} ({c.minor_head})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Isolate Suspect Network</label>
          <select 
            value={accusedId} 
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                setSearchParams({ accused_id: val });
              } else {
                setSearchParams({});
              }
              setSelectedNode(null);
            }}
            className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="">Select Suspect...</option>
            {accusedData.map((a: any) => (
              <option key={a.person_id} value={a.person_id}>{a.person_id} - {a.name}</option>
            ))}
          </select>
        </div>

        <div>
          <button 
            onClick={() => { setSearchParams({}); setSelectedNode(null); }}
            className="w-full bg-slate-900 border border-white/10 text-white rounded-lg py-2.5 text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center space-x-2"
          >
            <span>Reset to Global Network</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Graph Visualizer (Left Column) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-card p-4 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Share2 className="w-4 h-4 text-orange-500 animate-pulse" />
              <span className="font-semibold text-slate-300">Interactive Link Map</span>
            </div>
            <div className="flex space-x-4 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> <span>Accused</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> <span>Victim</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> <span>Officer</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-[#06b6d4]"></span> <span>Case</span></span>
            </div>
          </div>

          {loading ? (
            <div className="w-full h-[600px] bg-slate-950/60 border border-white/10 rounded-xl flex items-center justify-center text-xs text-slate-500">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping mr-2"></span>
              <span>Generating link network...</span>
            </div>
          ) : (
            <NetworkGraph nodes={graphData.nodes} edges={graphData.edges} onNodeClick={handleNodeClick} />
          )}
        </div>

        {/* Node Detail Side Panel (Right Column) */}
        <div className="space-y-6">
          <div className="glass-card p-6 min-h-[400px] flex flex-col">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 pb-2 border-b border-white/10 mb-4 flex items-center space-x-2">
              <Info className="w-4.5 h-4.5 text-blue-500" />
              <span>Inspector Panel</span>
            </h3>

            {!selectedNode ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
                <Users className="w-8 h-8 text-slate-700 mb-2" />
                <p>Click any node in the graph layout to view relational profile facts, details, and linkages.</p>
              </div>
            ) : (
              <div className="space-y-4 flex-1">
                <div>
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 uppercase font-bold tracking-widest">
                    {selectedNode.type}
                  </span>
                  <h4 className="text-lg font-bold text-white mt-2 leading-snug">{selectedNode.label}</h4>
                </div>

                <div className="space-y-2 text-xs text-slate-400 border-t border-white/5 pt-3">
                  {selectedNode.type === 'accused' && (
                    <>
                      <p><span className="font-bold text-slate-500">Suspect ID:</span> {selectedNode.person_id}</p>
                      <p><span className="font-bold text-slate-500">Age:</span> {selectedNode.age}</p>
                      <p className="mt-4 text-[10px] text-orange-400 font-bold bg-orange-500/10 p-2 rounded border border-orange-500/20">
                        Recommendation: Trace accomplice logs.
                      </p>
                      <button
                        onClick={() => {
                          setSearchParams({ accused_id: selectedNode.person_id });
                          setSelectedNode(null);
                        }}
                        className="w-full mt-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-lg py-2.5 text-xs font-bold transition-colors uppercase tracking-wider"
                      >
                        Isolate Suspect Network
                      </button>
                    </>
                  )}

                  {selectedNode.type === 'case' && (
                    <>
                      <p><span className="font-bold text-slate-500">Case ID:</span> {selectedNode.case_no}</p>
                      <p><span className="font-bold text-slate-500">Date:</span> {selectedNode.date}</p>
                      {selectedNode.id && (
                        <button
                          onClick={() => {
                            setSearchParams({ case_id: selectedNode.id.toString() });
                            setSelectedNode(null);
                          }}
                          className="w-full mt-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg py-2.5 text-xs font-bold transition-colors uppercase tracking-wider"
                        >
                          Isolate Case Network
                        </button>
                      )}
                    </>
                  )}

                  {selectedNode.type === 'officer' && (
                    <>
                      <p><span className="font-bold text-slate-500">KGID:</span> {selectedNode.kgid}</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
