/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RecordingState, TranscriptionResult } from '../types.ts';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface TranscriptionDisplayProps {
  state: RecordingState;
  transcription: TranscriptionResult | null;
  recordingDuration: number;
  audioLevel: number;
  errorMessage: string | null;
  onRetry?: () => void;
  selectedLanguage: string;
}

export const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({
  state,
  transcription,
  recordingDuration,
  audioLevel,
  errorMessage,
  onRetry,
}) => {
  // Format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[220px] sm:min-h-[280px] px-2 sm:px-6">
      {/* STATE 1: IDLE */}
      {state === 'idle' && !transcription && (
        <div className="max-w-xl text-center space-y-3">
          <p
            id="empty-state-message"
            className="text-[20px] sm:text-[24px] md:text-[28px] text-[#64748b] font-normal tracking-[-0.01em] leading-relaxed select-none"
          >
            Start speaking to convert your voice into text.
          </p>
          <p className="text-[13px] sm:text-[14px] text-[#94a3b8]">
            Click the record button below to capture audio and generate speech transcription
          </p>
        </div>
      )}

      {/* STATE 2: RECORDING */}
      {state === 'recording' && (
        <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-200">
          {/* Subtle live soundwave / frequency bars */}
          <div className="flex items-center justify-center gap-1.5 h-12 px-4" aria-hidden="true">
            {[40, 75, 100, 60, 85, 45, 90, 65, 30].map((baseHeight, idx) => {
              // Modulate dynamically based on microphone input level
              const dynamicHeight = Math.max(
                12,
                Math.min(48, Math.round(baseHeight * (0.35 + audioLevel * 0.9)))
              );
              return (
                <span
                  key={idx}
                  className="w-1.5 rounded-full bg-[#0f172a] transition-all duration-75"
                  style={{
                    height: `${dynamicHeight}px`,
                    opacity: 0.75 + (idx % 3) * 0.1,
                  }}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="text-[15px] font-medium text-[#0f172a] tracking-tight">
              Listening...
            </span>
            <span className="text-[14px] font-mono text-[#64748b] bg-[#f1f5f9] px-2.5 py-0.5 rounded-md">
              {formatTime(recordingDuration)}
            </span>
          </div>
          <p className="text-[13px] text-[#94a3b8] max-w-sm text-center">
            Speak clearly into your microphone. Click Stop when finished.
          </p>
        </div>
      )}

      {/* STATE 3: PROCESSING */}
      {state === 'processing' && (
        <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-200">
          <div className="w-12 h-12 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center text-[#0f172a]">
            <Loader2 className="w-6 h-6 animate-spin text-[#0f172a]" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-[18px] sm:text-[20px] font-medium text-[#0f172a]">
              Transcribing...
            </p>
            <p className="text-[13px] text-[#64748b]">
              Converting your voice recording into accurate text
            </p>
          </div>
        </div>
      )}

      {/* STATE 4: COMPLETED / HAS TRANSCRIPTION */}
      {(state === 'completed' || (state === 'idle' && transcription)) && transcription && (
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center space-y-4 animate-in fade-in duration-300">
          {/* Main transcription display typography */}
          <div className="relative group w-full">
            <p
              id="transcription-result-text"
              lang={transcription.language.slice(0, 2)}
              className="text-[24px] sm:text-[28px] md:text-[34px] lg:text-[36px] font-normal text-[#0f172a] leading-[1.4] sm:leading-[1.45] tracking-[-0.015em] break-words"
              style={{
                fontFamily:
                  "'Noto Sans Tamil', 'Noto Sans Devanagari', 'Inter', -apple-system, sans-serif",
              }}
            >
              {transcription.text}
            </p>
          </div>

          {/* Subtle metadata tag */}
          <div className="flex items-center gap-2 text-[12px] sm:text-[13px] text-[#64748b] pt-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#475569] font-medium">
              {transcription.languageLabel}
            </span>
            <span aria-hidden="true">•</span>
            <span>{transcription.durationSeconds}s audio</span>
            {transcription.confidence && (
              <>
                <span aria-hidden="true">•</span>
                <span>{Math.round(transcription.confidence * 100)}% accuracy</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* STATE 5: ERROR */}
      {state === 'error' && (
        <div
          role="alert"
          className="max-w-md w-full bg-red-50/70 border border-red-200/80 rounded-2xl p-5 text-center flex flex-col items-center space-y-3 animate-in fade-in duration-200"
        >
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-[15px] font-medium text-red-900">Recording Error</p>
            <p className="text-[13px] text-red-700 leading-normal">
              {errorMessage || 'Microphone access is required to record audio.'}
            </p>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-800 text-[13px] font-medium rounded-full shadow-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
