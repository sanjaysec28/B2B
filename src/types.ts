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

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  sampleText: string;
}
