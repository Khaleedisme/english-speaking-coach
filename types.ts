export interface BilingualText {
  en: string;
  az: string;
}

export interface PronunciationIssue {
  error: string;
  example: string;
}

export interface GrammarError {
  original: string;
  correction: string;
  explanation: BilingualText;
}

export interface VocabularyItem {
  phrase: string;
  betterAlternative: string;
  reason: BilingualText;
}

export interface AnalysisResult {
  overallAssessment: {
    summary: BilingualText;
    clarityRating: 'Clear' | 'Mostly Clear' | 'Needs Work';
    mainStrength: BilingualText;
    priorityFocus: BilingualText;
  };
  pronunciation: {
    issues: PronunciationIssue[];
    suggestions: BilingualText[];
    score: number; // 1-10
  };
  grammar: {
    errors: GrammarError[];
    patterns: string[];
    score: number; // 1-10
  };
  vocabulary: {
    issues: VocabularyItem[];
    excellentUsage: string[];
    suggestions: BilingualText[];
    score: number; // 1-10
  };
  fluency: {
    assessment: BilingualText;
    score: number; // 1-10
  };
  correctedVersion: string;
  actionItems: BilingualText[];
  transcription: string;
  timestamp: string;
}

export interface HistoryItem {
  id: string;
  date: string;
  summary: string; // Keep simple string for list view (usually EN)
  priorityFocus: string; // For context
  scores: {
    pronunciation: number;
    grammar: number;
    vocabulary: number;
    fluency: number;
  };
}