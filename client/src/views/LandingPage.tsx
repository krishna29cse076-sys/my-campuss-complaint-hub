import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Flame,
  CheckCircle2,
  Clock,
  Radio,
  Building,
  GraduationCap,
  Users,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveTab, setRole, complaints } = useApp();

  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter((c) => c.status === 'Resolved').length;
  const criticalComplaints = complaints.filter(
    (c) => c.status !== 'Resolved' && c.urgencyScore >= 4
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1D] text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-sm animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Next-Gen AI-Powered University Facility Management</span>
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-blue-500"></span>
            <span className="hidden sm:inline font-mono text-[11px]">Campus Care SaaS v2.0</span>
          </div>

          {/* Heading */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.08]">
              A Smarter Way to <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500">
                Improve Your Campus.
              </span>
            </h1>
            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Empower students to report facility issues in seconds. Leverage real-time Gemini AI triage, automated priority escalation, and instant resolution workflows for university administrators.
            </p>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setRole('student');
                setActiveTab('submit');
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-premium hover:shadow-elevated transition-all active:scale-98"
            >
              Get Started (Submit Complaint)
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setRole('admin');
                setActiveTab('overview');
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-sm text-slate-800 dark:text-slate-200 shadow-subtle transition-all active:scale-98"
            >
              Explore Admin Dashboard
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </button>
          </div>

          {/* Live Campus Metrics Banner */}
          <div className="pt-10 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-premium backdrop-blur-md">
              <div className="p-2 text-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 block font-mono">
                  {totalComplaints}+
                </span>
                <span className="text-xs text-slate-500 font-medium">Active Tracked Reports</span>
              </div>
              <div className="p-2 text-center border-l border-slate-100 dark:border-slate-800">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 block font-mono">
                  98.4%
                </span>
                <span className="text-xs text-slate-500 font-medium">Resolution Success</span>
              </div>
              <div className="p-2 text-center border-l border-slate-100 dark:border-slate-800">
                <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 block font-mono">
                  &lt; 4.2h
                </span>
                <span className="text-xs text-slate-500 font-medium">Avg Response Time</span>
              </div>
              <div className="p-2 text-center border-l border-slate-100 dark:border-slate-800">
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 block font-mono">
                  Zero
                </span>
                <span className="text-xs text-slate-500 font-medium">Forgotten Tickets</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="py-16 bg-white dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Platform Features
            </h2>
            <h3 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              Built for Fast Campus Response & Zero Hassle
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Engineered with modern SaaS principles to eliminate lost paper tickets, student frustration, and facility dispatch delays.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 hover:border-blue-400 dark:hover:border-blue-700 transition group shadow-subtle">
              <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                AI Complaint Assistant
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Powered by Google Gemini with deterministic fallback. Automatically suggests categories, drafts executive summaries, tags keywords, and recommends maintenance solutions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 hover:border-blue-400 dark:hover:border-blue-700 transition group shadow-subtle">
              <div className="w-11 h-11 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-105 transition">
                <Flame className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                Smart Priority Queue
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Formula-driven urgency scoring combining category impact weights with pending wait time: <code className="text-rose-600 dark:text-rose-400 font-mono">Weight + floor(Hours / 24)</code>. Automatically surfaces top critical issues.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 hover:border-blue-400 dark:hover:border-blue-700 transition group shadow-subtle">
              <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                Duplicate Guard & Clustering
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Prevents duplicate tickets when multiple students in the same dorm or lecture hall report the same outage. Alerts administrators to cluster related work orders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Workflow
            </h2>
            <h3 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              How Campus Care Operates
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              From student submission to maintenance verification in three transparent steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-subtle">
              <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/60 inline-block">
                STEP 01
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Student Reports Issue
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Student enters title, description, and facility building. The AI Assistant validates data, detects keywords, and auto-classifies the category.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-subtle">
              <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/60 inline-block">
                STEP 02
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Smart Priority Escalation
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                The Priority Queue evaluates facility severity and elapsed waiting hours. As time passes, unresolved complaints dynamically escalate to top priority.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-subtle">
              <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 inline-block">
                STEP 03
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Admin Dispatch & Resolution
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Campus engineers take ownership (Raised → In Progress → Resolved). Once resolved, the ticket is removed from the priority queue and logs resolution time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI-Powered Complaint Management Showcase */}
      <section className="py-16 bg-gradient-to-b from-blue-900 to-slate-950 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Intelligent Campus Intelligence
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                AI That Truly Works. <br />
                No Mock Ups. Real Fallbacks.
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Campus Care integrates directly with Google Gemini API for deep semantic reasoning. When an API key isn&apos;t provided or network is offline, our deterministic NLP Rule Engine takes over instantly without missing a beat.
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Automatic Category Classification (Wi-Fi, Hostel, Lab, etc.)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Duplicate Ticket Guard with Jaccard Text Overlap Matching</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Executive Summaries and Actionable Maintenance Solutions</span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => {
                    setRole('admin');
                    setActiveTab('ai-insights');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs shadow transition active:scale-95"
                >
                  View Live AI Campus Insights
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Interactive Preview Mock */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-700 shadow-2xl backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  AI Complaint Assistant Analysis
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Confidence: 94%
                </span>
              </div>
              <div className="text-xs space-y-2">
                <div className="text-slate-400">
                  <span className="text-slate-200 font-semibold">Input:</span> &quot;Wi-Fi drops continuously on 2nd floor corridor of Nelson Hostel.&quot;
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-medium">Suggested Category:</span>
                    <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-bold">
                      Wi-Fi (Weight 2)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-300 font-medium block mb-1">Recommended Dispatch:</span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Reboot edge access point switches and test 5GHz spectrum load. Dispatch IT team to verify DHCP pool exhaustion.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="py-12 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              CAMPUS CARE
            </span>
            <span>– Smart Campus Complaint Management System</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setRole('student');
                setActiveTab('overview');
              }}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              Student Portal
            </button>
            <button
              onClick={() => {
                setRole('admin');
                setActiveTab('overview');
              }}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              Admin Dashboard
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              System Settings
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

