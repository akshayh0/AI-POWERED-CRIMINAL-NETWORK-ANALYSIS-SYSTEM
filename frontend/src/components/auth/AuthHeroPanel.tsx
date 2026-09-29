import React from 'react';
import { KspShieldEmblem } from '../desktop/Emblems';

export const AuthHeroPanel: React.FC = () => {
  return (
    <div className="lg:col-span-6 bg-[#071738] p-8 sm:p-12 !text-white text-white flex flex-col justify-between relative overflow-hidden select-none min-h-[580px]">
      {/* 1. Deep Midnight Intelligence Gradient Background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(165deg, #0d224d 0%, #081736 40%, #040d1e 100%)'
        }}
      />

      {/* 2. Cyber Dot Grid Background Texture */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(147, 197, 253, 0.45) 1px, transparent 1px)',
          backgroundSize: '22px 22px'
        }}
      />

      {/* 3. Glowing Karnataka State Neural Network Map in Upper Right */}
      <div className="absolute top-2 right-1 sm:right-3 w-56 sm:w-64 h-72 sm:h-80 opacity-40 pointer-events-none">
        <svg viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Subtle Karnataka State Boundary Polygon */}
          <path
            d="M 105 15 
               L 125 22 L 140 40 L 132 58 L 148 78 L 135 105 L 155 125 L 142 155 L 158 185 
               L 135 220 L 115 245 L 85 248 L 68 230 L 62 205 L 42 175 L 35 145 L 48 115 
               L 42 85 L 60 55 L 80 32 Z"
            stroke="url(#kspMapGlow)"
            strokeWidth="1.6"
            strokeDasharray="4 3"
            fill="url(#kspMapFill)"
          />

          {/* AI Neural Network Links across Karnataka */}
          <line x1="125" y1="210" x2="95" y2="230" stroke="#38BDF8" strokeWidth="1.2" strokeOpacity="0.8" />
          <line x1="125" y1="210" x2="80" y2="155" stroke="#38BDF8" strokeWidth="1.2" strokeOpacity="0.8" />
          <line x1="125" y1="210" x2="120" y2="115" stroke="#38BDF8" strokeWidth="1.2" strokeOpacity="0.8" />
          <line x1="80" y1="155" x2="72" y2="95" stroke="#38BDF8" strokeWidth="1.2" strokeOpacity="0.8" />
          <line x1="80" y1="155" x2="55" y2="195" stroke="#38BDF8" strokeWidth="1.2" strokeOpacity="0.8" />
          <line x1="72" y1="95" x2="58" y2="60" stroke="#38BDF8" strokeWidth="1.2" strokeOpacity="0.8" />
          <line x1="72" y1="95" x2="118" y2="52" stroke="#38BDF8" strokeWidth="1.2" strokeOpacity="0.8" />
          <line x1="118" y1="52" x2="112" y2="22" stroke="#38BDF8" strokeWidth="1.2" strokeOpacity="0.8" />
          <line x1="55" y1="195" x2="95" y2="230" stroke="#38BDF8" strokeWidth="1.2" strokeOpacity="0.8" />

          {/* Network Nodes (Key Police HQ & Range Centers) */}
          <circle cx="125" cy="210" r="4.5" fill="#38BDF8" />
          <circle cx="125" cy="210" r="7.5" stroke="#38BDF8" strokeWidth="1" strokeOpacity="0.6" />
          <circle cx="95" cy="230" r="3" fill="#60A5FA" />
          <circle cx="55" cy="195" r="3" fill="#60A5FA" />
          <circle cx="80" cy="155" r="3" fill="#60A5FA" />
          <circle cx="120" cy="115" r="3" fill="#60A5FA" />
          <circle cx="72" cy="95" r="3.5" fill="#38BDF8" />
          <circle cx="58" cy="60" r="3" fill="#60A5FA" />
          <circle cx="118" cy="52" r="3.5" fill="#60A5FA" />
          <circle cx="112" cy="22" r="2.5" fill="#93C5FD" />

          <defs>
            <linearGradient id="kspMapGlow" x1="30" y1="15" x2="160" y2="250" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#2563EB" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="kspMapFill" x1="40" y1="20" x2="150" y2="240" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0B132B" stopOpacity="0.04" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 4. Vidhana Soudha Architectural Silhouette (Lower Backdrop) */}
      <div className="absolute bottom-6 inset-x-0 h-44 sm:h-52 opacity-35 pointer-events-none overflow-hidden">
        <svg viewBox="0 0 500 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-bottom" preserveAspectRatio="xMidYMax meet">
          <defs>
            <linearGradient id="soudhaGrad" x1="250" y1="0" x2="250" y2="200" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#3B82F6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#081736" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="columnGrad" x1="0" y1="94" x2="0" y2="136" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#BAE6FD" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
          </defs>

          {/* Central Ashoka Lion Pinnacle */}
          <path d="M 248 10 H 252 V 22 H 248 Z" fill="url(#soudhaGrad)" />
          <circle cx="250" cy="14" r="3" fill="#FBBF24" />

          {/* Majestic Central Dome (Gumbaz) */}
          <path d="M 228 50 C 228 24 272 24 272 50 Z" fill="url(#soudhaGrad)" />
          {/* Ribs on Dome */}
          <path d="M 238 50 C 238 34 262 34 262 50 Z" fill="none" stroke="#BAE6FD" strokeWidth="1" strokeOpacity="0.4" />
          <line x1="250" y1="24" x2="250" y2="50" stroke="#BAE6FD" strokeWidth="1" strokeOpacity="0.5" />
          {/* Dome Drum & Tiered Base */}
          <rect x="224" y="50" width="52" height="12" fill="url(#soudhaGrad)" />
          <rect x="220" y="62" width="60" height="8" fill="url(#soudhaGrad)" />
          <rect x="216" y="70" width="68" height="6" fill="url(#soudhaGrad)" />

          {/* Central Grand Portico & Pediment */}
          <polygon points="198,88 250,70 302,88" fill="url(#soudhaGrad)" />
          <rect x="198" y="88" width="104" height="6" fill="url(#soudhaGrad)" />

          {/* Grand Front Columns (Dravidian Classical Colonnade) */}
          <rect x="204" y="94" width="4.5" height="42" fill="url(#columnGrad)" />
          <rect x="216" y="94" width="4.5" height="42" fill="url(#columnGrad)" />
          <rect x="228" y="94" width="4.5" height="42" fill="url(#columnGrad)" />
          <rect x="240" y="94" width="4.5" height="42" fill="url(#columnGrad)" />
          <rect x="252" y="94" width="4.5" height="42" fill="url(#columnGrad)" />
          <rect x="264" y="94" width="4.5" height="42" fill="url(#columnGrad)" />
          <rect x="276" y="94" width="4.5" height="42" fill="url(#columnGrad)" />
          <rect x="288" y="94" width="4.5" height="42" fill="url(#columnGrad)" />

          {/* Left Wing Facade */}
          <rect x="56" y="84" width="144" height="52" fill="url(#soudhaGrad)" />
          <rect x="52" y="80" width="152" height="4" fill="url(#soudhaGrad)" />
          {/* Left Wing Corner Tower */}
          <rect x="48" y="62" width="26" height="18" fill="url(#soudhaGrad)" />
          <path d="M 48 62 C 48 46 74 46 74 62 Z" fill="url(#soudhaGrad)" />
          {/* Left Wing Intermediate Chhatri */}
          <path d="M 118 72 C 118 62 136 62 136 72 Z" fill="url(#soudhaGrad)" />
          <rect x="118" y="72" width="18" height="8" fill="url(#soudhaGrad)" />

          {/* Right Wing Facade */}
          <rect x="300" y="84" width="144" height="52" fill="url(#soudhaGrad)" />
          <rect x="296" y="80" width="152" height="4" fill="url(#soudhaGrad)" />
          {/* Right Wing Corner Tower */}
          <rect x="426" y="62" width="26" height="18" fill="url(#soudhaGrad)" />
          <path d="M 426 62 C 426 46 452 46 452 62 Z" fill="url(#soudhaGrad)" />
          {/* Right Wing Intermediate Chhatri */}
          <path d="M 364 72 C 364 62 382 62 382 72 Z" fill="url(#soudhaGrad)" />
          <rect x="364" y="72" width="18" height="8" fill="url(#soudhaGrad)" />

          {/* Stepped Grand Entrance Stairs */}
          <polygon points="170,136 330,136 345,152 155,152" fill="url(#soudhaGrad)" />
          <polygon points="150,152 350,152 365,168 135,168" fill="url(#soudhaGrad)" />
          <polygon points="130,168 370,168 390,185 110,185" fill="url(#soudhaGrad)" />
          <rect x="30" y="185" width="440" height="15" fill="url(#soudhaGrad)" />
        </svg>
      </div>

      {/* 5. Main Foreground Content */}
      <div className="space-y-6 relative z-10">
        {/* Brand Shield & Department Title */}
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/25 to-amber-600/15 border border-amber-400/40 flex items-center justify-center shadow-lg shadow-black/25 shrink-0">
            <KspShieldEmblem className="w-8 h-8" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-wider !text-white text-white drop-shadow-md">
              KSP AI-PORTAL
            </h1>
            <p className="text-[10px] sm:text-[11px] font-bold text-blue-400 tracking-widest uppercase mt-0.5">
              KARNATAKA POLICE AI CRIME INTELLIGENCE CENTER
            </p>
          </div>
        </div>

        {/* Primary Headings */}
        <div className="space-y-3 pt-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold !text-white text-white leading-tight tracking-tight drop-shadow-md">
            Secure Access to Crime <br className="hidden sm:inline" />
            Intelligence Platform
          </h2>
          <p className="text-xs sm:text-sm !text-slate-300 text-slate-300 leading-relaxed max-w-md">
            Authorized personnel only. Access is strictly governed by Departmental Information Security Policies and Subject to Audit.
          </p>
        </div>

        {/* Intelligence Module Feature Glass Card with explicit dark styling */}
        <div 
          className="p-4 rounded-2xl flex items-center space-x-4 shadow-xl backdrop-blur-md transition-all duration-200 group"
          style={{
            backgroundColor: 'rgba(8, 22, 50, 0.72)',
            border: '1px solid rgba(56, 189, 248, 0.3)'
          }}
        >
          {/* 3D Holographic Isometric Neural Stack Icon */}
          <div 
            className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-200"
            style={{
              backgroundColor: 'rgba(15, 34, 74, 0.9)',
              border: '1px solid rgba(56, 189, 248, 0.4)'
            }}
          >
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
              {/* Bottom Holographic Layer (Storage / FIR DB) */}
              <polygon points="24,31 40,23 24,15 8,23" fill="#6366F1" fillOpacity="0.5" stroke="#818CF8" strokeWidth="1.2" />
              <polygon points="8,23 24,31 24,34 8,26" fill="#4338CA" fillOpacity="0.7" stroke="#818CF8" strokeWidth="0.8" />
              <polygon points="40,23 24,31 24,34 40,26" fill="#3730A3" fillOpacity="0.7" stroke="#818CF8" strokeWidth="0.8" />

              {/* Middle Holographic Layer (AI Pattern Analytics) */}
              <polygon points="24,23 40,15 24,7 8,15" fill="#38BDF8" fillOpacity="0.6" stroke="#38BDF8" strokeWidth="1.2" />
              <polygon points="8,15 24,23 24,26 8,18" fill="#0284C7" fillOpacity="0.8" stroke="#38BDF8" strokeWidth="0.8" />
              <polygon points="40,15 24,23 24,26 40,18" fill="#0369A1" fillOpacity="0.8" stroke="#38BDF8" strokeWidth="0.8" />

              {/* Top Tactical Point Light */}
              <circle cx="24" cy="15" r="2.5" fill="#FBBF24" />
              <circle cx="24" cy="15" r="4.5" stroke="#FBBF24" strokeWidth="0.8" strokeOpacity="0.7" />
            </svg>
          </div>

          <div className="text-xs space-y-1">
            <span className="font-bold text-amber-400 block tracking-wider uppercase text-[11px]">
              INTERNAL POLICE INTELLIGENCE CENTER
            </span>
            <p className="!text-slate-300 text-slate-300 text-[11px] leading-snug">
              Real-time case analytics, AI-powered pattern detection, and automated deployment strategy.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Bottom Meta Information Bar */}
      <div className="pt-6 border-t border-white/15 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
        <span className="font-medium tracking-wide">Karnataka State Police</span>
        <span className="font-mono text-amber-400 font-bold tracking-wider">
          Intelligence Ver 2.4.0
        </span>
      </div>
    </div>
  );
};
