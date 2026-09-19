/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RecordingState, LessonSegment, ImportantWord } from '../types.ts';
import { ImportantWordsList } from './ImportantWordsList.tsx';
import { LiveLessonSentence } from './LiveLessonSentence.tsx';
import { TamilMeaningPanel } from './TamilMeaningPanel.tsx';
import { RecordingControls } from './RecordingControls.tsx';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface SpeechWorkspaceProps {
  state: RecordingState;
  currentLesson: LessonSegment | null;
  selectedWord: ImportantWord | null;
  selectedWordId: string | null;
  onSelectWord: (wordId: string) => void;
  recordingDuration: number;
  audioLevel: number;
  errorMessage: string | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onReset: () => void;
  onRetry: () => void;
  onSwitchLesson: (index: number) => void;
  allLessons: LessonSegment[];
}

export const SpeechWorkspace: React.FC<SpeechWorkspaceProps> = ({
  state,
  currentLesson,
  selectedWord,
  selectedWordId,
  onSelectWord,
  recordingDuration,
  audioLevel,
  errorMessage,
  onStartRecording,
  onStopRecording,
  onReset,
  onRetry,
  onSwitchLesson,
  allLessons,
}) => {
  const combinedTextForCopy = currentLesson
    ? `English: ${currentLesson.englishText}\n\nTamil: ${currentLesson.tamilMeaning}\nTanglish: ${currentLesson.tanglishMeaning}`
    : '';

  return (
    <main className="w-full flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-10 py-5 sm:py-7">
      {/* 1. OUTER APPLICATION SHELL */}
      <section
        id="vaani-learning-workspace"
        aria-label="Vaani AI English Learning Workspace"
        className="w-full bg-[#edf2f7] border border-slate-200/90 shadow-[0_4px_24px_rgba(15,23,42,0.03)] transition-all duration-300"
        style={{
          width: 'min(1500px, calc(100vw - 80px))',
          maxWidth: '1500px',
          margin: '0 auto',
          borderRadius: '32px',
          padding: '28px',
        }}
      >
        {/* INNER WHITE APPLICATION SURFACE */}
        <div
          id="learning-workspace-inner"
          className="w-full bg-white border border-slate-200/70 shadow-xs flex flex-col justify-between"
          style={{
            borderRadius: '24px',
            padding: '28px',
          }}
        >
          {/* Error Banner if mic or state failed */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between gap-3 text-red-900 text-[13px]"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={onRetry}
                className="shrink-0 inline-flex items-center gap-1 px-3 py-1 bg-white border border-red-200 rounded-full text-[12px] font-medium text-red-800 hover:bg-red-50"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* THREE-COLUMN GRID ON DESKTOP / STACKED ON MOBILE (<900px) */}
          {/* Desktop: 260px Left | minmax(0, 1fr) Center | 320px Right */}
          {/* Mobile order: 1. Live Lesson -> 2. Tamil Understanding -> 3. Important Words */}
          {/* ========================================================================= */}
          <div className="flex flex-col lg:grid lg:grid-cols-[260px_minmax(0,1fr)_320px] gap-6 xl:gap-8 items-stretch">
            {/* LEFT PANEL: Important Words (260px) */}
            <div className="order-3 lg:order-1 w-full lg:w-[260px] lg:border-r lg:border-slate-100 lg:pr-6 pt-5 lg:pt-0 border-t lg:border-t-0 border-slate-100 flex flex-col">
              <ImportantWordsList
                words={currentLesson?.importantWords || []}
                selectedWordId={selectedWordId}
                onSelectWord={onSelectWord}
                isLive={state === 'recording'}
              />
            </div>

            {/* CENTER PANEL: Live Lesson Hero (flexible minmax(0, 1fr)) */}
            <div className="order-1 lg:order-2 flex-1 flex flex-col lg:px-4 min-w-0">
              <LiveLessonSentence
                sentence={currentLesson?.englishText || ''}
                topic={currentLesson?.topic}
                importantWords={currentLesson?.importantWords || []}
                selectedWordId={selectedWordId}
                onSelectWord={onSelectWord}
                state={state}
                audioDuration={recordingDuration}
                audioLevel={audioLevel}
              />
            </div>

            {/* RIGHT PANEL: Understand in Tamil (320px) */}
            <div className="order-2 lg:order-3 w-full lg:w-[320px] lg:border-l lg:border-slate-100 lg:pl-6 pt-5 lg:pt-0 border-t lg:border-t-0 border-slate-100 flex flex-col">
              <TamilMeaningPanel
                tamilMeaning={currentLesson?.tamilMeaning || ''}
                tanglishMeaning={currentLesson?.tanglishMeaning || ''}
                selectedWord={selectedWord}
              />
            </div>
          </div>

          {/* UNIFIED BOTTOM RECORDING & LESSON CONTROLS */}
          <RecordingControls
            state={state}
            recordingDuration={recordingDuration}
            onStartRecording={onStartRecording}
            onStopRecording={onStopRecording}
            onReset={onReset}
            onSwitchLesson={onSwitchLesson}
            allLessons={allLessons}
            currentLessonId={currentLesson?.id || ''}
            combinedTextForCopy={combinedTextForCopy}
          />
        </div>
      </section>
    </main>
  );
};
