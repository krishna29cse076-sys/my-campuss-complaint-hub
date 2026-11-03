import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Complaint, UserRole, ToastMessage } from '../types';
import { api, getStoredGeminiKey, saveStoredGeminiKey } from '../services/api';

export type NavTab = 
  | 'landing' 
  | 'overview' 
  | 'submit' 
  | 'my-complaints' 
  | 'all-complaints' 
  | 'priority-queue' 
  | 'ai-insights' 
  | 'analytics' 
  | 'settings';

interface UserProfile {
  name: string;
  email: string;
  roll: string;
  role: UserRole;
  avatar: string;
}

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: UserProfile;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  complaints: Complaint[];
  loading: boolean;
  refreshComplaints: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedComplaint: Complaint | null;
  setSelectedComplaint: (c: Complaint | null) => void;
  isDetailOpen: boolean;
  setIsDetailOpen: (open: boolean) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  geminiApiKey: string;
  updateGeminiApiKey: (key: string) => void;
  isScorecardOpen: boolean;
  setIsScorecardOpen: (open: boolean) => void;
  currentDatasetMode: 'booklet' | 'extended';
  resetAllData: (mode?: 'booklet' | 'extended') => Promise<void>;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('campus_care_role') as UserRole) || 'admin';
  });

  const [activeTab, setActiveTabState] = useState<NavTab>('overview');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isScorecardOpen, setIsScorecardOpen] = useState<boolean>(false);
  const [currentDatasetMode, setCurrentDatasetMode] = useState<'booklet' | 'extended'>('booklet');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [geminiApiKey, setGeminiApiKey] = useState<string>(getStoredGeminiKey());

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('campus_care_sidebar');
    if (saved !== null) return saved === 'open';
    return window.innerWidth >= 1024;
  });

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem('campus_care_sidebar', next ? 'open' : 'closed');
      return next;
    });
  };

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('campus_care_theme') === 'dark';
  });

  // Apply dark mode class to root HTML
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('campus_care_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('campus_care_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('campus_care_role', newRole);
    addToast({
      type: 'info',
      title: `Switched to ${newRole === 'admin' ? 'Administrator' : 'Student'} View`,
      message: newRole === 'admin' 
        ? 'Access granted to Priority Queue, Analytics, and AI Insights.'
        : 'Access student complaint submission & personal tracking.',
    });
  };

  const currentUser: UserProfile = role === 'student'
    ? {
        name: 'Alex Rivera',
        email: 'alex.rivera@campus.edu',
        roll: 'CS-2023-042',
        role: 'student',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      }
    : {
        name: 'Dr. Sarah Jenkins',
        email: 'sarah.jenkins@campus.edu',
        roll: 'Chief Facilities & IT Administrator',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      };

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getComplaints();
      setComplaints(res.complaints);
    } catch {
      addToast({
        type: 'error',
        title: 'Error loading complaints',
        message: 'Could not fetch records.',
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    refreshComplaints();
  }, [refreshComplaints]);

  const updateGeminiApiKey = (key: string) => {
    setGeminiApiKey(key);
    saveStoredGeminiKey(key);
    addToast({
      type: 'success',
      title: key ? 'Gemini API Key Saved' : 'Gemini API Key Cleared',
      message: key ? 'AI features will now use Google Gemini API directly.' : 'Using built-in intelligent rule engine.',
    });
  };

  const resetAllData = async (mode: 'booklet' | 'extended' = 'booklet') => {
    setLoading(true);
    try {
      const reset = await api.resetData(mode);
      setComplaints(reset);
      setCurrentDatasetMode(mode);
      addToast({
        type: 'success',
        title: mode === 'extended' ? 'Loaded Extended Demo (8 Records)' : 'Loaded Official Contest Records (C01–C04)',
        message: mode === 'extended'
          ? 'Full campus demo dataset loaded with rich category diversity.'
          : 'Official Code Crack 3.0 test cases (C01, C02, C03, C04) active.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Reset Failed',
        message: 'Failed to reset database.',
      });
    } finally {
      setLoading(false);
    }
  };

  const setActiveTab = (tab: NavTab) => {
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentUser,
        activeTab,
        setActiveTab,
        complaints,
        loading,
        refreshComplaints,
        searchQuery,
        setSearchQuery,
        selectedComplaint,
        setSelectedComplaint,
        isDetailOpen,
        setIsDetailOpen,
        isDarkMode,
        toggleDarkMode,
        toasts,
        addToast,
        removeToast,
        geminiApiKey,
        updateGeminiApiKey,
        resetAllData,
        isScorecardOpen,
        setIsScorecardOpen,
        currentDatasetMode,
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

