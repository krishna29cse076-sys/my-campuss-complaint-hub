import React from 'react';
import { useApp, NavTab } from '../context/AppContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  ListTodo,
  Sparkles,
  BarChart3,
  Settings,
  Flame,
  Home,
  CheckCircle2,
  X,
  Radio,
  Cpu,
  PanelLeftClose,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen: propIsOpen, onClose: propOnClose }) => {
  const { activeTab, setActiveTab, role, geminiApiKey, isSidebarOpen, toggleSidebar } = useApp();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isSidebarOpen;
  const handleClose = propOnClose || toggleSidebar;

  const handleNav = (tab: NavTab) => {
    setActiveTab(tab);
    // On mobile, auto close after nav
    if (window.innerWidth < 1024) {
      handleClose();
    }
  };

  interface NavItem {
    id: NavTab;
    label: string;
    icon: React.ReactNode;
    roles: ('student' | 'admin')[];
    badge?: string;
  }

  const navItems: NavItem[] = [
    {
      id: 'landing',
      label: 'Home & Features',
      icon: <Home className="w-4 h-4" />,
      roles: ['student', 'admin'],
    },
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
      roles: ['student', 'admin'],
    },
    {
      id: 'submit',
      label: 'Submit Complaint',
      icon: <PlusCircle className="w-4 h-4" />,
      roles: ['student', 'admin'],
      badge: 'AI Assisted',
    },
    {
      id: 'my-complaints',
      label: 'My Complaints',
      icon: <FileText className="w-4 h-4" />,
      roles: ['student'],
    },
    {
      id: 'all-complaints',
      label: 'All Complaints',
      icon: <ListTodo className="w-4 h-4" />,
      roles: ['admin'],
    },
    {
      id: 'priority-queue',
      label: 'Priority Queue',
      icon: <Flame className="w-4 h-4 text-rose-500" />,
      roles: ['admin'],
      badge: 'Smart AI',
    },
    {
      id: 'ai-insights',
      label: 'AI Insights',
      icon: <Sparkles className="w-4 h-4 text-blue-500" />,
      roles: ['admin'],
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
      roles: ['admin'],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      roles: ['student', 'admin'],
    },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={handleClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden animate-fade-in"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-slate-800/80 flex items-center justify-between">
          <div
            onClick={() => handleNav('overview')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:bg-blue-500 transition">
              <Radio className="w-5 h-5 animate-pulse-subtle" />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                CAMPUS CARE
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                Smart Operations Hub
              </p>
            </div>
          </div>

          {/* Close / Collapse Button (Universal on Desktop & Mobile) */}
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Collapse sidebar for full-screen view"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Button */}
        <div className="p-4 pb-2">
          <button
            onClick={() => handleNav('submit')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-900/40 hover:shadow-lg transition-all active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            Submit New Complaint
          </button>
        </div>

        {/* Role Pill Banner */}
        <div className="px-4 py-2">
          <div className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">Active Persona:</span>
            <span className="font-semibold text-blue-400 capitalize flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {role === 'admin' ? 'Campus Admin' : 'Student'}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      isActive
                        ? 'bg-blue-700 text-blue-100'
                        : 'bg-slate-800 text-blue-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Intelligence Status Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                AI Inference Mode
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  geminiApiKey
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-blue-950 text-blue-300 border border-blue-800'
                }`}
              >
                {geminiApiKey ? 'Gemini 1.5' : 'Rule Engine'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              {geminiApiKey
                ? 'Direct API active with high-accuracy categorizations.'
                : 'Deterministic NLP rule engine running locally with zero latency.'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

