/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { ImportantWord, SentenceAnalysisResponse, GlossaryMatch } from '../types.ts';

export interface UseLessonStoreReturn {
  finalizedTranscript: string;
  interimTranscript: string;
  currentSentence: string;
  topic: string;
  tamilMeaning: string;
  tanglishMeaning: string;
  vocabulary: ImportantWord[];
  selectedWordId: string | null;
  selectedWord: ImportantWord | null;
  preservedKeywords: string[];
  glossaryMatches: GlossaryMatch[];
  isAnalyzing: boolean;
  updateInterim: (interim: string) => void;
  appendFinalized: (segment: string) => void;
  applyAnalysis: (analysis: SentenceAnalysisResponse) => void;
  selectWord: (wordId: string) => void;
  resetLesson: () => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  setDirectSentence: (sentence: string, topic?: string) => void;
}

/**
 * Lesson state hook coordinating the live transcription, accumulated vocabulary,
 * and Tamil explanations across all three cards.
 */
export function useLessonStore(): UseLessonStoreReturn {
  const [finalizedTranscript, setFinalizedTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [currentSentence, setCurrentSentence] = useState<string>('');
  const [topic, setTopic] = useState<string>('Classroom English • Live Lesson');
  const [tamilMeaning, setTamilMeaning] = useState<string>('');
  const [tanglishMeaning, setTanglishMeaning] = useState<string>('');
  const [vocabulary, setVocabulary] = useState<ImportantWord[]>([]);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [preservedKeywords, setPreservedKeywords] = useState<string[]>([]);
  const [glossaryMatches, setGlossaryMatches] = useState<GlossaryMatch[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Update live interim transcription
  const updateInterim = useCallback((interim: string) => {
    setInterimTranscript(interim);
  }, []);

  // Append a finalized sentence segment to the transcript
  const appendFinalized = useCallback((segment: string) => {
    const trimmed = segment.trim();
    if (!trimmed) return;

    setFinalizedTranscript((prev) => {
      if (!prev) return trimmed;
      return `${prev} ${trimmed}`;
    });
    setCurrentSentence(trimmed);
    setInterimTranscript('');
  }, []);

  // Directly set a sentence (e.g. from a quick curriculum sample)
  const setDirectSentence = useCallback((sentence: string, newTopic?: string) => {
    const trimmed = sentence.trim();
    setFinalizedTranscript(trimmed);
    setCurrentSentence(trimmed);
    setInterimTranscript('');
    if (newTopic) {
      setTopic(newTopic);
    }
  }, []);

  // Apply educational sentence analysis from Gemini
  const applyAnalysis = useCallback((analysis: SentenceAnalysisResponse) => {
    if (analysis.topic) setTopic(analysis.topic);
    if (analysis.tamilMeaning) setTamilMeaning(analysis.tamilMeaning);
    if (analysis.tanglishMeaning) setTanglishMeaning(analysis.tanglishMeaning);
    if (Array.isArray(analysis.preservedKeywords)) {
      setPreservedKeywords(analysis.preservedKeywords);
    }
    if (Array.isArray(analysis.glossaryMatches)) {
      setGlossaryMatches(analysis.glossaryMatches);
    }

    // Merge vocabulary without duplicates (matching lowercase word)
    if (Array.isArray(analysis.importantWords) && analysis.importantWords.length > 0) {
      setVocabulary((prev) => {
        const existingWordsLower = new Set(prev.map((w) => w.word.toLowerCase()));
        const newWords = analysis.importantWords.filter(
          (w) => !existingWordsLower.has(w.word.toLowerCase())
        );
        return [...prev, ...newWords];
      });

      // Auto-select the first newly analyzed word or glossary term
      setSelectedWordId(() => {
        if (analysis.importantWords.length > 0) {
          return analysis.importantWords[0].id;
        }
        return null;
      });
    }
  }, []);

  // Select an important word to synchronize Center, Left, and Right cards
  const selectWord = useCallback((wordId: string) => {
    setSelectedWordId(wordId);
  }, []);

  // Reset entire lesson
  const resetLesson = useCallback(() => {
    setFinalizedTranscript('');
    setInterimTranscript('');
    setCurrentSentence('');
    setTopic('Classroom English • Live Lesson');
    setTamilMeaning('');
    setTanglishMeaning('');
    setVocabulary([]);
    setSelectedWordId(null);
    setPreservedKeywords([]);
    setGlossaryMatches([]);
    setIsAnalyzing(false);
  }, []);

  // Current selected word object
  const selectedWord = vocabulary.find((w) => w.id === selectedWordId) || null;

  return {
    finalizedTranscript,
    interimTranscript,
    currentSentence,
    topic,
    tamilMeaning,
    tanglishMeaning,
    vocabulary,
    selectedWordId,
    selectedWord,
    preservedKeywords,
    glossaryMatches,
    isAnalyzing,
    updateInterim,
    appendFinalized,
    applyAnalysis,
    selectWord,
    resetLesson,
    setIsAnalyzing,
    setDirectSentence,
  };
}
