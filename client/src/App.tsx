import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/ToastContainer';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';
import { CodeCrackScorecardModal } from './components/CodeCrackScorecardModal';

// Views
import { LandingPage } from './views/LandingPage';
import { StudentDashboard } from './views/StudentDashboard';
import { AdminDashboard } from './views/AdminDashboard';
import { ComplaintForm } from './views/ComplaintForm';
import { PriorityQueueView } from './views/PriorityQueueView';
import { AiInsightsView } from './views/AiInsightsView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsView } from './views/SettingsView';

const MainContent: React.FC = () => {
  const { activeTab, role, isSidebarOpen, toggleSidebar } = useApp();

  // Keyboard shortcut: '[' or 'Ctrl+B' toggles sidebar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(
          (document.activeElement?.tagName || '')
        )
      ) {
        return;
      }
      if (e.key === '[' || (e.ctrlKey && e.key === 'b')) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  // If on landing page, display landing view directly without shell clutter,
  // but still allow full navigation!
  if (activeTab === 'landing') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F1D]">
        <Navbar />
        <Sidebar />
        <LandingPage />
        <ComplaintDetailModal />
        <CodeCrackScorecardModal />
        <ToastContainer />
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return role === 'admin' ? <AdminDashboard /> : <StudentDashboard />;
      case 'submit':
        return <ComplaintForm />;
      case 'my-complaints':
        return <StudentDashboard />;
      case 'all-complaints':
        return <AdminDashboard />;
      case 'priority-queue':
        return <PriorityQueueView />;
      case 'ai-insights':
        return <AiInsightsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return role === 'admin' ? <AdminDashboard /> : <StudentDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F1D] flex transition-colors">
      {/* Sidebar Navigation (Closable on Desktop & Mobile) */}
      <Sidebar />

      {/* Main Content Area: dynamically expands to full width when sidebar is closed */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'lg:pl-64' : 'pl-0'
        }`}
      >
        <Navbar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <ComplaintDetailModal />
      <CodeCrackScorecardModal />
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

export default App;

