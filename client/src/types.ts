export type ComplaintCategory = 
  | 'Wi-Fi'
  | 'Hostel'
  | 'Classroom'
  | 'Laboratory'
  | 'Electricity'
  | 'Cleanliness'
  | 'Infrastructure'
  | 'Other';

export type ComplaintStatus = 'Raised' | 'In Progress' | 'Resolved';

export type UserRole = 'student' | 'admin';

export interface Complaint {
  id: string;
  title: string;
  category: ComplaintCategory;
  description: string;
  location: string;
  status: ComplaintStatus;
  hoursPending: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolutionHours?: number;
  studentName: string;
  studentEmail: string;
  studentRoll: string;
  imageUrl?: string;
  urgencyScore: number;
  categoryWeight: number;
  reason?: string;
  assignedDepartment?: string;
  notes?: string[];
  duplicateWarnings?: DuplicateMatch[];
}

export interface DuplicateMatch {
  matchedComplaintId: string;
  matchedTitle: string;
  matchedCategory: ComplaintCategory;
  matchedLocation: string;
  status: ComplaintStatus;
  similarityScore: number;
  reason: string;
}

export interface AIAnalysisResult {
  suggestedCategory: ComplaintCategory;
  summary: string;
  keywords: string[];
  suggestedSolutions: string[];
  confidence: number;
  engineUsed: 'gemini-api' | 'rule-engine';
  note?: string;
}

export interface AIInsightSuggestion {
  title: string;
  description: string;
  impact: 'Critical' | 'High' | 'Medium';
  estimatedCost: 'Low' | 'Medium' | 'High' | 'Minimal';
  category: ComplaintCategory;
}

export interface AIInsightsData {
  mostFrequentCategory: string;
  mostFrequentCount: number;
  trendingCategories: { category: string; count: number; trend: string }[];
  avgResolutionTimeHours: number;
  suggestions: AIInsightSuggestion[];
  engineUsed: 'gemini-api' | 'rule-engine';
}

export interface AnalyticsSummary {
  total: number;
  raised: number;
  inProgress: number;
  resolved: number;
  critical: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  categoryPieData: { name: string; value: number }[];
  statusData: { status: string; count: number; fill: string }[];
  weeklyTrends: { day: string; newComplaints: number; resolvedComplaints: number }[];
  resolutionData: { category: string; avgHours: number }[];
  problematicFacilities: { facility: string; count: number }[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

