/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RecordingState, ImportantWord, GlossaryMatch } from '../types.ts';
import { ImportantWordsList } from './ImportantWordsList.tsx';
import { LiveLessonSentence } from './LiveLessonSentence.tsx';
import { TamilMeaningPanel } from './TamilMeaningPanel.tsx';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface SpeechWorkspaceProps {
  state: RecordingState;
  finalizedSentence: string;
  interimSentence: string;
  topic: string;
  tamilMeaning: string;
  tanglishMeaning: string;
  vocabulary: ImportantWord[];
  selectedWord: ImportantWord | null;
  selectedWordId: string | null;
  preservedKeywords?: string[];
  glossaryMatches?: GlossaryMatch[];
  onSelectWord: (wordId: string) => void;
  recordingDuration: number;
  audioLevel: number;
  errorMessage: string | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onReset: () => void;
  onRetry: () => void;
  onSelectQuickPrompt: (prompt: string, topic?: string) => void;
}

export const SpeechWorkspace: React.FC<SpeechWorkspaceProps> = ({
  state,
  finalizedSentence,
  interimSentence,
  topic,
  tamilMeaning,
  tanglishMeaning,
  vocabulary,
  selectedWord,
  selectedWordId,
  preservedKeywords = [],
  glossaryMatches = [],
  onSelectWord,
  recordingDuration,
  audioLevel,
  errorMessage,
  onStartRecording,
  onStopRecording,
  onReset,
  onRetry,
  onSelectQuickPrompt,
}) => {
  const combinedTextForCopy = finalizedSentence
    ? `English: ${finalizedSentence}\n\nTamil: ${tamilMeaning}\nTanglish: ${tanglishMeaning}`
    : '';

  return (
    <main className="w-full flex-1 min-h-0 flex flex-col justify-center items-center py-2 sm:py-3 lg:py-4 px-3 sm:px-6 lg:px-8">
      {/* Container holding the three independent floating cards */}
      <div className="w-full max-w-[1500px] mx-auto flex flex-col gap-3 sm:gap-4 min-h-0">
        {/* Error Banner if mic or state failed */}
        {errorMessage && (
          <div
            role="alert"
            className="w-full bg-red-50 border border-red-200 rounded-2xl p-3 flex items-center justify-between gap-3 text-red-900 text-[13px] shadow-xs animate-in fade-in duration-150 shrink-0"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={onRetry}
              className="shrink-0 inline-flex items-center gap-1 px-3 py-1 bg-white border border-red-200 rounded-full text-[12px] font-medium text-red-800 hover:bg-red-50 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* THREE INDEPENDENT FLOATING CARDS */}
        {/* Desktop: 270px Left | 1fr Center | 330px Right */}
        {/* All cards fit cleanly within the viewport height without page-level vertical overflow */}
        {/* Mobile order: 1. Center -> 2. Right -> 3. Left */}
        {/* ========================================================================= */}
        <div
          id="vaani-workspace-grid"
          className="w-full grid grid-cols-1 lg:grid-cols-[270px_minmax(0,1fr)_330px] xl:grid-cols-[280px_minmax(560px,1fr)_340px] gap-4 sm:gap-5 lg:gap-6 items-stretch"
        >
          {/* ===================================================================== */}
          {/* 1. LEFT CARD: IMPORTANT WORDS */}
          {/* ===================================================================== */}
          <aside
            id="panel-important-words"
            aria-label="Important Vocabulary Words"
            className="order-3 lg:order-1 w-full bg-white border border-slate-200/80 rounded-[28px] p-4 sm:p-5 shadow-[0_4px_24px_rgba(15,23,42,0.03)] flex flex-col h-[480px] lg:h-[calc(100vh-140px)] lg:max-h-[640px] lg:min-h-[500px] overflow-hidden transition-all duration-200 hover:shadow-[0_6px_30px_rgba(15,23,42,0.05)]"
          >
            <ImportantWordsList
              words={vocabulary}
              selectedWordId={selectedWordId}
              onSelectWord={onSelectWord}
              isLive={state === 'recording'}
            />
          </aside>

          {/* ===================================================================== */}
          {/* 2. CENTER CARD: LIVE LESSON SPEECH-TO-TEXT WORKSPACE (HERO) */}
          {/* Fits naturally within viewport, internally scrollable only if transcript is long */}
          {/* ===================================================================== */}
          <section
            id="panel-live-lesson"
            aria-label="Live Speech-to-Text Lesson Workspace"
            className="order-1 lg:order-2 w-full flex-1 min-w-0 bg-white border border-slate-200/80 rounded-[28px] p-4 sm:p-6 lg:p-7 shadow-[0_4px_24px_rgba(15,23,42,0.03)] flex flex-col h-[520px] lg:h-[calc(100vh-140px)] lg:max-h-[640px] lg:min-h-[500px] overflow-hidden transition-all duration-200 hover:shadow-[0_6px_30px_rgba(15,23,42,0.05)]"
          >
            <LiveLessonSentence
              finalizedSentence={finalizedSentence}
              interimSentence={interimSentence}
              topic={topic}
              importantWords={vocabulary}
              selectedWordId={selectedWordId}
              onSelectWord={onSelectWord}
              state={state}
              audioDuration={recordingDuration}
              audioLevel={audioLevel}
              onStartRecording={onStartRecording}
              onStopRecording={onStopRecording}
              onReset={onReset}
              combinedTextForCopy={combinedTextForCopy}
              preservedKeywords={preservedKeywords}
              glossaryMatches={glossaryMatches}
              onSelectQuickPrompt={onSelectQuickPrompt}
            />
          </section>

          {/* ===================================================================== */}
          {/* 3. RIGHT CARD: TAMIL EXPLANATION & UNDERSTANDING */}
          {/* ===================================================================== */}
          <aside
            id="panel-tamil-explanation"
            aria-label="Tamil Lesson Explanation"
            className="order-2 lg:order-3 w-full bg-white border border-slate-200/80 rounded-[28px] p-4 sm:p-5 shadow-[0_4px_24px_rgba(15,23,42,0.03)] flex flex-col h-[480px] lg:h-[calc(100vh-140px)] lg:max-h-[640px] lg:min-h-[500px] overflow-hidden transition-all duration-200 hover:shadow-[0_6px_30px_rgba(15,23,42,0.05)]"
          >
            <TamilMeaningPanel
              tamilMeaning={tamilMeaning}
              tanglishMeaning={tanglishMeaning}
              selectedWord={selectedWord}
              preservedKeywords={preservedKeywords}
              glossaryMatches={glossaryMatches}
              onSelectWord={onSelectWord}
            />
          </aside>
        </div>
      </div>
    </main>
  );
};
