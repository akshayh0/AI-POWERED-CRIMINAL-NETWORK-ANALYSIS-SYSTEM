import React, { useMemo } from 'react';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background, 
  Handle, 
  Position 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Shield, User, FileText, Landmark, Gavel, FileCode } from 'lucide-react';

// Custom node component to render beautiful icons based on node type
const CustomNode = ({ data }: any) => {
  const typeStyles: Record<string, { bg: string, border: string, text: string, icon: any }> = {
    accused: { bg: 'bg-rose-950/80', border: 'border-rose-500/50', text: 'text-rose-400', icon: User },
    victim: { bg: 'bg-emerald-950/80', border: 'border-emerald-500/50', text: 'text-emerald-400', icon: User },
    officer: { bg: 'bg-blue-950/80', border: 'border-blue-500/50', text: 'text-blue-400', icon: Shield },
    station: { bg: 'bg-indigo-950/80', border: 'border-indigo-500/50', text: 'text-indigo-400', icon: Landmark },
    court: { bg: 'bg-amber-950/80', border: 'border-amber-500/50', text: 'text-amber-400', icon: Gavel },
    district: { bg: 'bg-purple-950/80', border: 'border-purple-500/50', text: 'text-purple-400', icon: Landmark },
    case: { bg: 'bg-cyan-950/80', border: 'border-cyan-500/50', text: 'text-cyan-400', icon: FileText },
    act: { bg: 'bg-slate-900', border: 'border-slate-500/50', text: 'text-slate-300', icon: FileCode },
    section: { bg: 'bg-slate-900', border: 'border-slate-500/50', text: 'text-slate-300', icon: FileCode },
    crime_head: { bg: 'bg-teal-950/80', border: 'border-teal-500/50', text: 'text-teal-400', icon: FileText },
  };

  const style = typeStyles[data.type] || typeStyles.case;
  const Icon = style.icon;

  return (
    <div className={`px-4 py-2.5 rounded-lg border shadow-xl flex items-center space-x-2.5 backdrop-blur-md min-w-[140px] ${style.bg} ${style.border}`}>
      <Handle type="target" position={Position.Top} className="w-1.5 h-1.5 bg-slate-600" />
      
      <div className={`p-1.5 rounded bg-white/5 border border-white/10 ${style.text}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{data.type}</p>
        <p className="text-xs font-semibold text-white truncate max-w-[110px]">{data.label}</p>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-1.5 h-1.5 bg-slate-600" />
    </div>
  );
};

interface NetworkGraphProps {
  nodes: any[];
  edges: any[];
  onNodeClick?: (event: React.MouseEvent, node: any) => void;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ nodes, edges, onNodeClick }) => {
  const nodeTypes = useMemo(() => ({ customNode: CustomNode }), []);

  return (
    <div className="w-full h-[600px] bg-slate-950/60 rounded-xl border border-white/10 overflow-hidden relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        onNodeClick={onNodeClick}
      >
        <Background color="#ffffff" opacity={0.03} gap={16} size={1.5} />
        <Controls className="bg-slate-900 border border-white/10 text-white rounded fill-current" />
        <MiniMap 
          nodeColor={(node) => {
            const colors: Record<string, string> = {
              accused: '#ef4444',
              victim: '#10b981',
              officer: '#3b82f6',
              case: '#06b6d4',
            };
            return colors[node.data?.type] || '#475569';
          }}
          maskColor="rgba(10, 13, 20, 0.75)"
          className="bg-slate-900 border border-white/10 rounded"
        />
      </ReactFlow>
    </div>
  );
};
