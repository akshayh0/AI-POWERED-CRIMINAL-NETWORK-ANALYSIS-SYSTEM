import React from 'react';

/**
 * Authentic Karnataka State Government emblem icon placeholder
 */
export const KarnatakaGovEmblem: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg 
    viewBox="0 0 64 64" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    aria-hidden="true"
  >
    {/* Drop shadow filter */}
    <defs>
      <filter id="govEmblemShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.15" />
      </filter>
      <linearGradient id="goldGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FBBF24" />
        <stop offset="50%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
      <linearGradient id="shieldRedGrad" x1="20" y1="20" x2="44" y2="46" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#DC2626" />
        <stop offset="100%" stopColor="#991B1B" />
      </linearGradient>
    </defs>

    <g filter="url(#govEmblemShadow)">
      {/* Top Ashoka Capital Crest */}
      <path d="M30 6H34V11H30V6Z" fill="#FBBF24" />
      <path d="M28 8L32 4L36 8H28Z" fill="#D97706" />
      <circle cx="32" cy="12" r="2.5" fill="#1E3A8A" stroke="#FBBF24" strokeWidth="0.8" />
      <path d="M26 14H38V16H26V14Z" fill="#D97706" />

      {/* Central Escutcheon / Shield */}
      <path 
        d="M23 18H41C41 18 41 33 32 41C23 33 23 18 23 18Z" 
        fill="url(#shieldRedGrad)" 
        stroke="url(#goldGrad)" 
        strokeWidth="1.8" 
      />
      <path 
        d="M25 20H39C39 20 39 31.5 32 38.5C25 31.5 25 20 25 20Z" 
        fill="none" 
        stroke="#FEF3C7" 
        strokeWidth="0.6" 
        strokeDasharray="1.5 1.5"
      />

      {/* Gandaberunda (Two-Headed Bird) inside Shield */}
      {/* Left head and beak */}
      <path d="M28.5 22.5C27 22.5 26.5 24 27.5 25L26 25.5L28.5 26.5V28H30.5L30.5 24.5C30.5 23.5 29.5 22.5 28.5 22.5Z" fill="#FEF3C7" />
      {/* Right head and beak */}
      <path d="M35.5 22.5C37 22.5 37.5 24 36.5 25L38 25.5L35.5 26.5V28H33.5L33.5 24.5C33.5 23.5 34.5 22.5 35.5 22.5Z" fill="#FEF3C7" />
      {/* Central body & outspread wings */}
      <path d="M32 24.5L29 28H35L32 24.5Z" fill="#FBBF24" />
      <path d="M27 27C25 28 24.5 30 25.5 32C27 32 28.5 30 29.5 29L27 27Z" fill="#FBBF24" />
      <path d="M37 27C39 28 39.5 30 38.5 32C37 32 35.5 30 34.5 29L37 27Z" fill="#FBBF24" />
      {/* Tail feathers */}
      <path d="M30.5 31L32 35L33.5 31H30.5Z" fill="#FDE68A" />

      {/* Flanking Sharabha / Mythological Lions (Left & Right) */}
      {/* Left Supporter */}
      <path 
        d="M20 20C20 18 18 18 16 19C14 20 13 22 14 25C15 27 16 29 17 32C18 35 17 38 15 41L18 42C20 39 21 35 20.5 31C21 28 22 25 22 22C21 20 20.5 20 20 20Z" 
        fill="url(#goldGrad)" 
        stroke="#92400E" 
        strokeWidth="0.6"
      />
      {/* Right Supporter */}
      <path 
        d="M44 20C44 18 46 18 48 19C50 20 51 22 50 25C49 27 48 29 47 32C46 35 47 38 49 41L46 42C44 39 43 35 43.5 31C43 28 42 25 42 22C43 20 43.5 20 44 20Z" 
        fill="url(#goldGrad)" 
        stroke="#92400E" 
        strokeWidth="0.6"
      />

      {/* Base Pedestal & Tricolor Banner */}
      <path d="M14 43C14 41 20 40 32 40C44 40 50 41 50 43L48 48C40 47 24 47 16 48L14 43Z" fill="#B45309" />
      <path d="M16 43.5C22 42.5 42 42.5 48 43.5L47 46C41 45 23 45 17 46L16 43.5Z" fill="#FBBF24" />
      {/* Bottom Center Wheel */}
      <circle cx="32" cy="44.5" r="2.5" fill="#1E3A8A" stroke="#FFFFFF" strokeWidth="0.6" />
      {/* Red banner tails */}
      <path d="M12 45L16 43V47L12 45Z" fill="#DC2626" />
      <path d="M52 45L48 43V47L52 45Z" fill="#DC2626" />
    </g>
  </svg>
);

/**
 * Official Police Intelligence Shield Logo
 */
export const KspShieldEmblem: React.FC<{ className?: string }> = ({ className = "w-9 h-9" }) => (
  <svg 
    viewBox="0 0 40 44" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    aria-hidden="true"
  >
    {/* Shield Base */}
    <path 
      d="M20 2L36 7.5V19.5C36 30.5 29.2 38.8 20 42C10.8 38.8 4 30.5 4 19.5V7.5L20 2Z" 
      fill="url(#kspShieldGrad)" 
      stroke="#F59E0B" 
      strokeWidth="2" 
    />
    <path 
      d="M20 5L33 9.5V19.5C33 28.5 27.5 35.8 20 38.5C12.5 35.8 7 28.5 7 19.5V9.5L20 5Z" 
      fill="#0B1A30" 
      stroke="#93C5FD" 
      strokeWidth="0.75" 
      strokeOpacity="0.4"
    />
    
    {/* Central 5-Point Police Star & Crest */}
    <polygon 
      points="20,11 22.4,16.5 28.3,16.8 23.8,20.6 25.3,26.4 20,23.1 14.7,26.4 16.2,20.6 11.7,16.8 17.6,16.5" 
      fill="#F59E0B" 
    />
    <circle cx="20" cy="19" r="2.5" fill="#1E3A8A" />

    {/* Lettering KSP */}
    <text 
      x="20" 
      y="33" 
      textAnchor="middle" 
      fill="#FFFFFF" 
      fontSize="5.5" 
      fontWeight="900" 
      fontFamily="system-ui, sans-serif" 
      letterSpacing="1"
    >
      KSP
    </text>

    {/* Gradient definition */}
    <defs>
      <linearGradient id="kspShieldGrad" x1="20" y1="2" x2="20" y2="42" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1E3A8A" />
        <stop offset="100%" stopColor="#0B1A30" />
      </linearGradient>
    </defs>
  </svg>
);

/**
 * Authentic Indian Government Tricolor Ribbon Stripe
 */
export const IndianTricolorStripe: React.FC = () => (
  <div 
    className="h-[3px] w-full" 
    style={{
      background: 'linear-gradient(90deg, #FF9933 0%, #FF9933 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #138808 66.66%, #138808 100%)'
    }} 
    aria-hidden="true" 
  />
);
