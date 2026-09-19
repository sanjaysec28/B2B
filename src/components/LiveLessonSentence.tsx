/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ImportantWord, RecordingState } from '../types.ts';
import { Copy, Check, Sparkles, Volume2 } from 'lucide-react';

interface LiveLessonSentenceProps {
  sentence: string;
  topic?: string;
  importantWords: ImportantWord[];
  selectedWordId: string | null;
  onSelectWord: (wordId: string) => void;
  state: RecordingState;
  audioDuration?: number;
  audioLevel?: number;
}

export const LiveLessonSentence: React.FC<LiveLessonSentenceProps> = ({
  sentence,
  topic,
  importantWords,
  selectedWordId,
  onSelectWord,
  state,
  audioDuration = 0,
  audioLevel = 0,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (!sentence) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(sentence);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  /**
   * Tokenize sentence to highlight only important vocabulary with clean neutral styling.
   */
  const renderSentenceWithHighlights = () => {
    if (!sentence) return null;
    if (importantWords.length === 0) {
      return <span>{sentence}</span>;
    }

    // Sort words by length descending to match phrases like "chemical energy" before "energy"
    const sortedWords = [...importantWords].sort(
      (a, b) => b.word.length - a.word.length
    );

    const escapeRegExp = (string: string) =>
      string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const pattern = new RegExp(
      `(${sortedWords.map((w) => escapeRegExp(w.word)).join('|')})`,
      'gi'
    );

    const parts = sentence.split(pattern);

    return parts.map((part, index) => {
      const matchedWord = sortedWords.find(
        (w) => w.word.toLowerCase() === part.toLowerCase()
      );

      if (!matchedWord) {
        return <span key={index}>{part}</span>;
      }

      const isSelected = selectedWordId === matchedWord.id;

      return (
        <button
          key={index}
          type="button"
          onClick={() => onSelectWord(matchedWord.id)}
          title={`Click to view details for "${matchedWord.word}"`}
          aria-label={`Vocabulary: ${matchedWord.word}. Click for Tamil explanation`}
          className={`inline-block mx-1 px-2.5 py-0.5 rounded-lg cursor-pointer transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
            isSelected
              ? 'bg-slate-900 text-white shadow-xs underline decoration-white/40 underline-offset-4'
              : 'bg-slate-100 hover:bg-slate-200/90 text-slate-900 border-b border-slate-300'
          }`}
        >
          {part}
        </button>
      );
    });
  };

  return (
    <div className="w-full flex flex-col justify-between min-h-[560px]">
      {/* 8. CENTER PANEL HEADER (Compact) */}
      <div className="pb-3 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-[14px] font-semibold text-slate-900 tracking-tight">
            Live Lesson
          </h2>
          {topic && (
            <span className="text-[11px] font-medium text-slate-500 bg-slate-100/90 px-2.5 py-0.5 rounded-full border border-slate-200/60">
              {topic}
            </span>
          )}
        </div>

        {/* Right Status Indicator & Copy Action */}
        <div className="flex items-center gap-2">
          {state === 'recording' ? (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200/70 text-red-700 text-[11px] font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span>Listening</span>
              <span className="font-mono text-red-800 text-[11px]">
                {Math.floor(audioDuration / 60)}:{(audioDuration % 60).toString().padStart(2, '0')}
              </span>
            </div>
          ) : state === 'processing' ? (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Understanding...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Live Classroom</span>
            </div>
          )}

          {sentence && (
            <button
              type="button"
              onClick={handleCopy}
              title="Copy English sentence"
              aria-label="Copy English sentence"
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* 5 & 6. HERO LESSON CANVAS: English Sentence Vertically Centered */}
      <div className="flex-1 flex flex-col justify-center items-center text-center py-8 sm:py-12 px-4 max-w-2xl mx-auto w-full">
        {sentence ? (
          <div className="space-y-6 animate-in fade-in duration-200 w-full">
            <p
              id="live-english-sentence"
              className="text-slate-900 break-words"
              style={{
                fontSize: 'clamp(30px, 3vw, 48px)',
                fontWeight: 500,
                lineHeight: 1.25,
                letterSpacing: '-0.025em',
              }}
            >
              {renderSentenceWithHighlights()}
            </p>

            <p className="text-[13px] text-slate-400 font-normal">
              Click any highlighted word to view its Tamil meaning and real-life example.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-w-md mx-auto text-slate-400">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-[20px] font-medium text-slate-700">
              Teacher speaks in English
            </p>
            <p className="text-[13px] text-slate-400 leading-relaxed">
              Vaani listens in real time, segments sentences, and breaks down terminology for Tamil-medium learners.
            </p>
          </div>
        )}
      </div>

      {/* Live Audio Activity Meter (when recording) */}
      {state === 'recording' ? (
        <div className="mt-2 py-2 px-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-slate-700" />
            <span>Teacher voice active</span>
          </div>
          <div className="flex items-center gap-1 h-3">
            {[30, 60, 100, 75, 45, 90, 40].map((h, i) => (
              <span
                key={i}
                className="w-1 bg-slate-900 rounded-full transition-all duration-75"
                style={{
                  height: `${Math.max(4, Math.round(h * (0.3 + audioLevel * 0.7)) * 0.12)}px`,
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="h-2 shrink-0" />
      )}
    </div>
  );
};
