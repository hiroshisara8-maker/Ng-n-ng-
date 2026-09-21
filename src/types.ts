export type TabId = 
  | 'spelling' 
  | 'improve' 
  | 'writing' 
  | 'vocab' 
  | 'pronunciation' 
  | 'foreign' 
  | 'speaking' 
  | 'tracker' 
  | 'gamification';

export interface TabItem {
  id: TabId;
  label: string;
  shortDesc: string;
  iconName: string;
  badge?: string;
}

export interface SpellingError {
  original: string;
  suggestion: string;
  reason: string;
  rule: string;
  type: string;
}

export interface SpellingResult {
  correctedText: string;
  errorCount: number;
  summary: string;
  errors: SpellingError[];
}

export interface SentenceSuggestion {
  originalSentence: string;
  improvedSentence: string;
  explanation: string;
  improvementType: string;
}

export interface SentenceImproveResult {
  improvedText: string;
  alternatives: string[];
  suggestions: SentenceSuggestion[];
  literaryTips: string[];
}

export interface WritingScores {
  structure: number;
  vocabulary: number;
  flow: number;
  depth: number;
}

export interface WritingFeedbackResult {
  overallScore: number;
  scores: WritingScores;
  generalCritique: string;
  strengths: string[];
  improvements: string[];
  sentenceAnalysis: Array<{
    original: string;
    praiseOrFix: string;
    suggestedRevision: string;
  }>;
  revisedExemplaryVersion: string;
}

export interface VocabResult {
  word: string;
  partOfSpeech: string;
  definition: string;
  etymology: string;
  synonyms: Array<{ term: string; distinction: string }>;
  antonyms: string[];
  nuance: string;
  examples: string[];
  literaryQuote?: string;
  relatedIdioms: string[];
}

export interface PronunciationResult {
  markedText: string;
  tempoAdvice: string;
  challengingWords: Array<{
    word: string;
    phoneticHint: string;
    commonMistake: string;
  }>;
  toneAndBreathingTips: string[];
  emotionGuide: string;
}

export interface ForeignHelperResult {
  topic: string;
  explanationEn: string;
  explanationVi: string;
  toneBreakdown: Array<{
    word: string;
    toneName: string;
    pitchDescription: string;
    soundLike: string;
  }>;
  practicalPhrases: Array<{
    vietnamese: string;
    english: string;
    context: string;
  }>;
  shortDialogue: Array<{
    speaker: string;
    vi: string;
    en: string;
  }>;
  culturalNote: string;
  pronounTip: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  feedback?: {
    isGrammarCorrect?: boolean;
    betterWayToSay?: string;
    commentOnToneAndDiction?: string;
    vocabularyPraise?: string;
  };
}

export interface SavedMistake {
  id: string;
  original: string;
  suggestion: string;
  reason: string;
  type: string;
  sourceContext?: string;
  createdAt: number;
  practicedCount: number;
  isMastered: boolean;
}

export interface ExerciseQuestion {
  id: number;
  type: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface GeneratedExercise {
  title: string;
  encouragement: string;
  questions: ExerciseQuestion[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: {
    current: number;
    target: number;
  };
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  badgeTitle: string;
  points: number;
  streakDays: number;
  isCurrentUser?: boolean;
}
