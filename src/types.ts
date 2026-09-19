/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RecordingState =
  | 'idle'
  | 'recording'
  | 'processing'
  | 'active'
  | 'completed'
  | 'error';

export interface ImportantWord {
  id: string;
  word: string;
  tamilMeaning: string;
  tanglish: string;
  explanation: string;
  tamilExplanation: string;
  example: string;
  tamilExample: string;
  partOfSpeech?: string;
  topicNumber?: number;
  glossaryTopic?: string;
  similarityScore?: number;
  englishDefinition?: string;
  englishExplanation?: string;
  tamilDefinition?: string;
}

export interface GlossaryMatch {
  topicNumber: number;
  topic: string;
  matchedKeyword: string;
  similarityScore: number;
  englishDefinition: string;
  englishExplanation: string;
  tamilDefinition: string;
  tamilExplanation: string;
}

export interface LessonSegment {
  id: string;
  topic: string;
  englishText: string;
  tamilMeaning: string;
  tanglishMeaning: string;
  importantWords: ImportantWord[];
  audioDurationSeconds?: number;
  timestamp?: number;
}

export interface TranscriptionResult {
  text: string;
  language: string;
  languageLabel: string;
  durationSeconds: number;
  confidence?: number;
  timestamp: number;
}

export interface SentenceAnalysisResponse {
  topic: string;
  englishSentence: string;
  tamilMeaning: string;
  tanglishMeaning: string;
  importantWords: ImportantWord[];
  preservedKeywords?: string[];
  glossaryMatches?: GlossaryMatch[];
}

export interface LessonState {
  finalizedTranscript: string;
  interimTranscript: string;
  topic: string;
  tamilMeaning: string;
  tanglishMeaning: string;
  vocabulary: ImportantWord[];
  selectedWordId: string | null;
  preservedKeywords?: string[];
  glossaryMatches?: GlossaryMatch[];
}
