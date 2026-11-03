import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import {
  Settings,
  Key,
  Shield,
  Moon,
  Sun,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Cpu,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    role,
    setRole,
    isDarkMode,
    toggleDarkMode,
    geminiApiKey,
    updateGeminiApiKey,
    resetAllData,
    addToast,
  } = useApp();

  const [inputKey, setInputKey] = useState(geminiApiKey);
  const [showKey, setShowKey] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    updateGeminiApiKey(inputKey.trim());
  };

  const handleClearKey = () => {
    setInputKey('');
    updateGeminiApiKey('');
  };

  const testApiKey = async () => {
    if (!inputKey.trim()) {
      addToast({
        type: 'warning',
        title: 'Empty API Key',
        message: 'Please paste a Gemini API Key to test.',
      });
      return;
    }

    setIsTestingKey(true);
    try {
      // Test Gemini API directly with a lightweight ping
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${inputKey.trim()}`);
      if (res.ok) {
        addToast({
          type: 'success',
          title: 'Gemini Key Valid',
          message: 'Connection to Google Generative AI succeeded.',
        });
        updateGeminiApiKey(inputKey.trim());
      } else {
        const errorData = await res.json().catch(() => ({}));
        addToast({
          type: 'error',
          title: 'Invalid Gemini API Key',
          message: errorData.error?.message || 'API rejected the provided key.',
        });
      }
    } catch {
      addToast({
        type: 'info',
        title: 'Offline / Firewall Notice',
        message: 'Could not directly reach Google endpoints. Built-in Rule Engine remains active.',
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            System Preferences
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Application & AI Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure role personas, visual theme, Gemini AI API credentials, and database state.
        </p>
      </div>

      <div className="space-y-6">
        {/* Role Persona Switcher Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              Active Role & Permissions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Switch between student reporter mode and administrative management views.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setRole('student')}
              className={`p-4 rounded-xl border text-left transition flex items-start gap-3.5 ${
                role === 'student'
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold flex items-center gap-2">
                  Student Persona
                  {role === 'student' && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-600 text-white">Active</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Submit tickets, track ongoing repairs, and receive maintenance updates.
                </p>
              </div>
            </button>

            <button
              onClick={() => setRole('admin')}
              className={`p-4 rounded-xl border text-left transition flex items-start gap-3.5 ${
                role === 'admin'
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold flex items-center gap-2">
                  Campus Administrator
                  {role === 'admin' && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-600 text-white">Active</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Full command: Priority queue, AI triage, status workflow, and Recharts analytics.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Gemini AI API Configuration */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Google Gemini API Key
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Supply your Gemini key to empower live LLM categorization and insights generation.
              </p>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
                geminiApiKey
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {geminiApiKey ? 'Gemini 1.5 Active' : 'Fallback Rule Engine Active'}
            </span>
          </div>

          <form onSubmit={handleSaveKey} className="space-y-3">
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="AIzaSy..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="w-full pl-10 pr-24 py-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition active:scale-95"
              >
                Save API Key
              </button>
              <button
                type="button"
                disabled={isTestingKey || !inputKey.trim()}
                onClick={testApiKey}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition disabled:opacity-50"
              >
                {isTestingKey ? 'Verifying...' : 'Test Connection'}
              </button>
              {geminiApiKey && (
                <button
                  type="button"
                  onClick={handleClearKey}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 hover:underline"
                >
                  Clear Key (Switch to Rule Engine)
                </button>
              )}
            </div>
          </form>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <strong>Graceful Fallback Guarantee:</strong> When the API key is not supplied, the system automatically uses our deterministic NLP keyword tokenizer, which provides instant category classification, keyword tagging, and actionable campus solutions without calling external services.
          </div>
        </div>

        {/* Visual Appearance / Dark Mode */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {isDarkMode ? <Moon className="w-4 h-4 text-blue-500" /> : <Sun className="w-4 h-4 text-amber-500" />}
              Interface Appearance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Toggle between high-contrast Dark theme and clean SaaS Light theme.
            </p>
          </div>

          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </button>
        </div>

        {/* Reset Initial Sample Data */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-500" />
                Contest Dataset Management
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Switch between the official Code Crack 3.0 problem statement 4-record set and the extended 8-record set.
              </p>
            </div>
            <button
              onClick={() => resetAllData('booklet')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
            >
              Load Official 4 Records (C01–C04)
            </button>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => resetAllData('booklet')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
              Reset to Official 4 Complaints (C01–C04)
            </button>

            <button
              onClick={() => resetAllData('extended')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
              Load Extended 8 Records Demo
            </button>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isResetDialogOpen}
        title="Reset Sample Data?"
        message="This will reload the initial canonical sample complaints (C01, C02, C03, C04) and reset priority queues and analytics. Continue?"
        confirmLabel="Reset Everything"
        isDestructive={true}
        onConfirm={resetAllData}
        onCancel={() => setIsResetDialogOpen(false)}
      />
    </div>
  );
};

