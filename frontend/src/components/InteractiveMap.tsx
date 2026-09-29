import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';

// Fix Leaflet marker pathing issues by overriding default options
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Incident {
  id: number;
  crime_no: string;
  category: string;
  major_head: string;
  status: string;
  brief_facts: string;
  lat: number;
  lng: number;
}

interface Hotspot {
  lat: number;
  lng: number;
  risk_score: number;
  reason: string;
}

interface InteractiveMapProps {
  incidents: Incident[];
  hotspots?: Hotspot[];
  center?: [number, number];
  zoom?: number;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  incidents, 
  hotspots = [], 
  center = [12.9716, 77.5946], // Bengaluru center by default
  zoom = 7 
}) => {
  const hotspotList = Array.isArray(hotspots) ? hotspots : ((hotspots as any)?.hotspots || []);

  return (
    <div className="relative z-0 isolate w-full h-[600px] rounded-xl overflow-hidden border border-white/10 cyber-glow">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        style={{ width: '100%', height: '100%' }}
      >
        {/* OpenStreetMap tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          eventHandlers={{
            tileerror: (error) => {
              console.warn('Map tile failed to load gracefully:', error);
            }
          }}
        />

        {/* Hotspots Predictions (glowing red circles) */}
        {hotspotList.map((hs, idx) => (
          <Circle
            key={`hs-${idx}`}
            center={[hs.lat, hs.lng]}
            radius={20000} // 20km radius
            pathOptions={{
              fillColor: '#ef4444',
              fillOpacity: 0.25,
              color: '#ef4444',
              weight: 1.5,
              dashArray: '5, 5'
            }}
          >
            <Popup>
              <div className="p-2">
                <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/30">
                  AI HOTSPOT (Risk: {hs.risk_score}/100)
                </span>
                <p className="text-xs text-slate-300 mt-2 font-medium">{hs.reason}</p>
                <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Resource Rec: Increase Patrols</span>
                </div>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Incidents Markers */}
        {incidents.map((inc) => {
          if (!inc.lat || !inc.lng) return null;
          return (
            <Marker key={inc.id} position={[inc.lat, inc.lng]}>
              <Popup>
                <div className="p-2 max-w-[240px] text-slate-100">
                  <div className="flex items-center justify-between mb-1 pb-1 border-b border-white/10">
                    <span className="text-[10px] font-bold text-orange-500">{inc.crime_no}</span>
                    <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                      {inc.category}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">{inc.major_head}</h4>
                  <p className="text-[10px] text-slate-400 mb-2 leading-tight">
                    {inc.brief_facts ? inc.brief_facts.slice(0, 80) + '...' : 'No details.'}
                  </p>
                  <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-white/5">
                    <span>Status: {inc.status}</span>
                    <Link 
                      to={`/cases/${inc.id}`}
                      className="text-blue-400 hover:text-white font-bold transition-colors"
                    >
                      View Details &rarr;
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
