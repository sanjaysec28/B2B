/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RecordingState, LessonSegment } from '../types.ts';
import { Mic, Square, Loader2, BookMarked, RotateCcw } from 'lucide-react';
import { CopyButton } from './CopyButton.tsx';

interface RecordingControlsProps {
  state: RecordingState;
  recordingDuration: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onReset: () => void;
  onSwitchLesson: (index: number) => void;
  allLessons: LessonSegment[];
  currentLessonId: string;
  combinedTextForCopy: string;
}

export const RecordingControls: React.FC<RecordingControlsProps> = ({
  state,
  recordingDuration,
  onStartRecording,
  onStopRecording,
  onReset,
  onSwitchLesson,
  allLessons,
  currentLessonId,
  combinedTextForCopy,
}) => {
  const isRecording = state === 'recording';
  const isProcessing = state === 'processing';

  // Format timer MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full flex flex-col items-center gap-3 pt-5 border-t border-slate-100 mt-3">
      {/* Primary Action Button Row */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {/* Main Pill Button */}
        {isRecording ? (
          <button
            id="btn-stop-recording"
            type="button"
            onClick={onStopRecording}
            className="group inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-xs active:scale-[0.98] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="text-[14px] font-medium tracking-tight">
              Listening...
            </span>
            <span className="font-mono text-[12px] bg-white/20 px-2 py-0.5 rounded-full">
              {formatTime(recordingDuration)}
            </span>
            <Square className="w-3 h-3 fill-current text-white/90 ml-0.5" />
          </button>
        ) : isProcessing ? (
          <button
            id="btn-processing-lesson"
            type="button"
            disabled
            className="inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 bg-slate-900/90 text-white rounded-full shadow-xs cursor-wait"
          >
            <Loader2 className="w-4 h-4 animate-spin text-white/90" />
            <span className="text-[14px] font-medium tracking-tight">
              Understanding...
            </span>
          </button>
        ) : state === 'completed' || state === 'active' ? (
          <button
            id="btn-resume-lesson"
            type="button"
            onClick={onStartRecording}
            className="group inline-flex items-center gap-2 px-6 sm:px-7 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-xs active:scale-[0.98] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <Mic className="w-4 h-4 text-white/90 transition-transform group-hover:scale-105" />
            <span className="text-[14px] font-medium tracking-tight">
              Resume Lesson
            </span>
          </button>
        ) : (
          <button
            id="btn-start-lesson"
            type="button"
            onClick={onStartRecording}
            className="group inline-flex items-center gap-2 px-6 sm:px-7 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-xs active:scale-[0.98] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <Mic className="w-4 h-4 text-white/90 transition-transform group-hover:scale-105" />
            <span className="text-[14px] font-medium tracking-tight">
              Start Lesson
            </span>
          </button>
        )}

        {/* Circular Copy Button */}
        <CopyButton
          textToCopy={combinedTextForCopy}
          disabled={!combinedTextForCopy || isRecording || isProcessing}
        />

        {/* Reset / Clear Button */}
        <button
          id="btn-reset-lesson"
          type="button"
          onClick={onReset}
          title="Reset lesson workspace"
          aria-label="Reset lesson workspace"
          className="w-11 h-11 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all duration-150 active:scale-95 shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Classroom Lesson Scenarios Switcher */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[12px] text-slate-500">
        <div className="flex items-center gap-1.5 text-slate-400">
          <BookMarked className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Try Scenario:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {allLessons.map((lesson, idx) => {
            const isCurrent = lesson.id === currentLessonId;
            return (
              <button
                key={lesson.id}
                type="button"
                disabled={isRecording || isProcessing}
                onClick={() => onSwitchLesson(idx)}
                className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all ${
                  isCurrent
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <span>{lesson.topic.split('•')[0].trim()}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
