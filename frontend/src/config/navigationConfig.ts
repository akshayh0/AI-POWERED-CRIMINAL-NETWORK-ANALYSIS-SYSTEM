import {
  LayoutDashboard,
  BarChart3,
  Map,
  FileText,
  Users,
  UserX,
  UserCheck,
  ShieldAlert,
  Network,
  BrainCircuit,
  MessageSquare,
  FileDown,
  Settings as SettingsIcon,
  ShieldCheck,
  UserCog,
  Shield
} from 'lucide-react';
import { normalizeRole } from '../types/auth';

export interface NavItemConfig {
  id: string;
  name: string;
  shortName?: string;
  path: string;
  icon: any;
  roles: string[];
  description: string;
  action?: 'navigate' | 'modal';
}

export interface NavCategoryConfig {
  id: string;
  title: string;
  icon: any;
  isDirectLink?: boolean;
  directPath?: string;
  items: NavItemConfig[];
}

export const NAVIGATION_CATEGORIES: NavCategoryConfig[] = [
  {
    id: 'command',
    title: 'COMMAND',
    icon: LayoutDashboard,
    isDirectLink: true,
    directPath: '/',
    items: [
      {
        id: 'executive',
        name: 'Executive / Command Center',
        shortName: 'Command Center',
        path: '/',
        icon: LayoutDashboard,
        roles: ['admin', 'police_officer', 'investigation_officer', 'crime_analyst', 'district_superintendent'],
        description: 'Live crime metrics, high-level KPIs, and real-time state alerts'
      }
    ]
  },
  {
    id: 'users',
    title: 'USERS',
    icon: UserCog,
    items: [
      {
        id: 'user-approval',
        name: 'User Approval',
        shortName: 'Approval',
        path: '/approval',
        icon: ShieldCheck,
        roles: ['admin'],
        description: 'Authorize or reject pending officer accounts'
      },
      {
        id: 'user-management',
        name: 'User Management',
        shortName: 'Officers List',
        path: '/users',
        icon: UserCog,
        roles: ['admin'],
        description: 'Manage police personnel roles, districts, and status'
      }
    ]
  },
  {
    id: 'crime',
    title: 'CRIME RECORDS',
    icon: FileText,
    items: [
      {
        id: 'firs',
        name: 'FIR Management',
        shortName: 'FIRs',
        path: '/firs',
        icon: FileText,
        roles: ['admin', 'police_officer', 'investigation_officer'],
        description: 'Registered First Information Reports, dossiers, and status'
      },
      {
        id: 'victims',
        name: 'Victim Analytics',
        shortName: 'Victims',
        path: '/victims',
        icon: Users,
        roles: ['admin', 'investigation_officer', 'crime_analyst'],
        description: 'Victim demographics, impact assessments, and support tracking'
      },
      {
        id: 'accused',
        name: 'Accused Analytics',
        shortName: 'Accused',
        path: '/accused',
        icon: UserX,
        roles: ['admin', 'investigation_officer', 'crime_analyst'],
        description: 'Suspect profiling, recidivism indicators, and custody status'
      },
      {
        id: 'complainants',
        name: 'Complainant Analytics',
        shortName: 'Complainants',
        path: '/complainants',
        icon: UserCheck,
        roles: ['admin', 'investigation_officer', 'crime_analyst'],
        description: 'Citizen grievances, report distribution, and follow-ups'
      }
    ]
  },
  {
    id: 'map',
    title: 'MAP',
    icon: Map,
    isDirectLink: true,
    directPath: '/map',
    items: [
      {
        id: 'interactive-map',
        name: 'Interactive Crime Map',
        shortName: 'Crime Map',
        path: '/map',
        icon: Map,
        roles: ['admin', 'police_officer', 'crime_analyst', 'district_superintendent'],
        description: 'Geospatial crime heatmaps and police jurisdictional boundaries'
      }
    ]
  },
  {
    id: 'ai',
    title: 'AI INTELLIGENCE',
    icon: BrainCircuit,
    items: [
      {
        id: 'crime-analytics',
        name: 'Crime Analytics',
        shortName: 'Analytics',
        path: '/analytics',
        icon: BarChart3,
        roles: ['admin', 'police_officer', 'crime_analyst', 'district_superintendent'],
        description: 'Spatiotemporal crime pattern analysis, hot-spots, and trends'
      },
      {
        id: 'ai-predictions',
        name: 'Predictive Analytics',
        shortName: 'Predictions',
        path: '/ai-predictions',
        icon: BrainCircuit,
        roles: ['admin', 'police_officer', 'investigation_officer', 'crime_analyst', 'district_superintendent'],
        description: 'Machine learning crime forecasting and repeat offender risk scoring'
      },
      {
        id: 'ai-chat',
        name: 'AI Investigation Assistant',
        shortName: 'AI Dossier Chat',
        path: '/ai-chat',
        icon: MessageSquare,
        roles: ['admin', 'police_officer', 'investigation_officer', 'crime_analyst', 'district_superintendent'],
        description: 'Conversational investigation assistant for legal & case analysis'
      },
      {
        id: 'network',
        name: 'Criminal Network',
        shortName: 'Gang Syndicate',
        path: '/network',
        icon: Network,
        roles: ['admin', 'investigation_officer', 'crime_analyst'],
        description: 'Organized crime relationships, co-accused links, and syndicate graphs'
      }
    ]
  },
  {
    id: 'operations',
    title: 'OPERATIONS',
    icon: ShieldAlert,
    items: [
      {
        id: 'officers',
        name: 'Officer Performance',
        shortName: 'Performance',
        path: '/officers',
        icon: ShieldAlert,
        roles: ['admin', 'district_superintendent'],
        description: 'Investigating officer workload, disposal rates, and station efficiency'
      },
      {
        id: 'reports',
        name: 'Reports Center',
        shortName: 'Reports',
        path: '/reports',
        icon: FileDown,
        roles: ['admin', 'district_superintendent', 'crime_analyst'],
        description: 'Generate and export statutory police intelligence summaries'
      },
      {
        id: 'settings',
        name: 'Settings & Security',
        shortName: 'Security & Audit',
        path: '/settings',
        icon: SettingsIcon,
        roles: ['admin'],
        description: 'Security configurations, user access audits, and system settings'
      }
    ]
  }
];

// Flat list for mobile sidebar compatibility
export const ALL_MENU_ITEMS: NavItemConfig[] = NAVIGATION_CATEGORIES.flatMap(cat => cat.items);

// Helper to filter items and categories by role
export function getFilteredCategories(role: string): NavCategoryConfig[] {
  const normRole = normalizeRole(role);
  const isSuperAdmin = normRole === 'admin';

  return NAVIGATION_CATEGORIES.map(category => {
    const accessibleItems = category.items.filter(item =>
      isSuperAdmin || item.roles.includes(normRole)
    );
    return {
      ...category,
      items: accessibleItems
    };
  }).filter(category => category.items.length > 0);
}

// Helper to check if a specific item path is active
export function isItemActive(itemPath: string, currentPath: string): boolean {
  if (itemPath === '/') {
    return currentPath === '/' || currentPath === '';
  }
  if (itemPath === '/firs') {
    return currentPath === '/firs' || currentPath.startsWith('/cases');
  }
  if (itemPath.startsWith('#')) {
    return false;
  }
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

// Helper to check if any item within a category is active
export function isCategoryActive(category: NavCategoryConfig, currentPath: string): boolean {
  return category.items.some(item => isItemActive(item.path, currentPath));
}
