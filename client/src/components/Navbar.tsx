import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Bell,
  Sun,
  Moon,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Calendar,
  X,
  Flame,
  CheckCircle2,
  Menu,
  Award,
  PanelLeft,
  PanelLeftClose,
  Radio,
} from 'lucide-react';

interface NavbarProps {
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu }) => {
  const {
    role,
    setRole,
    currentUser,
    searchQuery,
    setSearchQuery,
    isDarkMode,
    toggleDarkMode,
    complaints,
    setSelectedComplaint,
    setIsDetailOpen,
    setActiveTab,
    setIsScorecardOpen,
    isSidebarOpen,
    toggleSidebar,
  } = useApp();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Critical complaints that need administrative attention
  const criticalComplaints = complaints.filter(
    (c) => c.status !== 'Resolved' && c.urgencyScore >= 4
  );

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-40 w-full h-16 border-b border-slate-200/80 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md transition-colors">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Sidebar Toggle Menu & Search */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
            aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            title={isSidebarOpen ? 'Collapse sidebar (Full Screen Mode)' : 'Expand sidebar menu'}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-5 h-5 text-slate-500 hover:text-slate-900 dark:hover:text-white" />
            ) : (
              <PanelLeft className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse-subtle" />
            )}
          </button>

          {/* Mini logo when sidebar is collapsed */}
          {!isSidebarOpen && (
            <div
              onClick={() => setActiveTab('overview')}
              className="hidden sm:flex items-center gap-1.5 cursor-pointer shrink-0 font-extrabold text-xs tracking-tight text-slate-900 dark:text-white mr-1"
            >
              <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white">
                <Radio className="w-3.5 h-3.5" />
              </div>
              <span>CAMPUS CARE</span>
            </div>
          )}

          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search complaints by ID, title, facility..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 transition outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Current Date */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium px-2.5 py-1.5 rounded-lg bg-slate-100/50 dark:bg-slate-800/50">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{todayFormatted}</span>
          </div>

          {/* Code Crack 3.0 Scorecard Button */}
          <button
            onClick={() => setIsScorecardOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition shadow-sm"
            title="Open Official Evaluation Scorecard"
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Contest Scorecard</span>
            <span className="font-mono text-[10px] bg-amber-500 text-white px-1.5 py-0.2 rounded-full">100 pts</span>
          </button>

          {/* Quick Role Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => setRole('student')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                role === 'student'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Student</span>
            </button>
            <button
              onClick={() => setRole('admin')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                role === 'admin'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle Dark Mode"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen((prev) => !prev)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {criticalComplaints.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-elevated border border-slate-200 dark:border-slate-800 p-4 space-y-3 animate-fade-in z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 font-semibold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                    <Flame className="w-4 h-4 text-rose-500" />
                    Urgent Campus Alerts ({criticalComplaints.length})
                  </div>
                  <button
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {criticalComplaints.length > 0 ? (
                    criticalComplaints.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedComplaint(c);
                          setIsDetailOpen(true);
                          setIsNotificationsOpen(false);
                        }}
                        className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/70 dark:bg-slate-800/60 dark:hover:bg-slate-800 cursor-pointer transition border border-slate-200/60 dark:border-slate-800"
                      >
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                            #{c.id} - {c.category}
                          </span>
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">
                            Urgency {c.urgencyScore}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                          {c.title}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Waiting for {c.hoursPending} hours ({Math.floor(c.hoursPending / 24)}d)
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5 opacity-80" />
                      All campus emergencies are under control!
                    </div>
                  )}
                </div>

                {role === 'admin' && (
                  <button
                    onClick={() => {
                      setActiveTab('priority-queue');
                      setIsNotificationsOpen(false);
                    }}
                    className="w-full text-center py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline border-t border-slate-100 dark:border-slate-800"
                  >
                    Open Smart Priority Queue →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/20"
            />
            <div className="hidden lg:block text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-slate-400 font-medium block">
                {role === 'admin' ? 'Campus Admin' : currentUser.roll}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

