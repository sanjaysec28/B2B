/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ImportantWord, RecordingState, GlossaryMatch } from '../types.ts';
import { Mic, Square, Loader2, RotateCcw, Copy, Check, Sparkles, Database } from 'lucide-react';
import { DBMS_GLOSSARY_TOPICS } from '../services/glossaryTopics.ts';

interface LiveLessonSentenceProps {
  finalizedSentence: string;
  interimSentence: string;
  topic?: string;
  importantWords: ImportantWord[];
  selectedWordId: string | null;
  onSelectWord: (wordId: string) => void;
  state: RecordingState;
  audioDuration: number;
  audioLevel: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onReset: () => void;
  combinedTextForCopy: string;
  preservedKeywords?: string[];
  glossaryMatches?: GlossaryMatch[];
  onSelectQuickPrompt?: (prompt: string, topic?: string) => void;
}

const SAMPLE_PROMPTS = [
  {
    label: 'Normalization',
    topic: 'DBMS • Normalization',
    sentence: 'Normalization reduces unnecessary data redundancy in a database.',
  },
  {
    label: 'Foreign Key & Table',
    topic: 'DBMS • Relational Model',
    sentence: 'A foreign key connects one table with another table.',
  },
  {
    label: 'Primary & Candidate Key',
    topic: 'DBMS • Keys & Constraints',
    sentence: 'Every primary key is a candidate key.',
  },
  {
    label: 'ACID Properties',
    topic: 'DBMS • Transactions',
    sentence: 'Every database transaction must strictly follow ACID properties.',
  },
  {
    label: 'Photosynthesis',
    topic: 'Science • Plant Biology',
    sentence: 'Photosynthesis is the process by which green plants convert light energy into chemical energy.',
  },
];

export const LiveLessonSentence: React.FC<LiveLessonSentenceProps> = ({
  finalizedSentence,
  interimSentence,
  topic,
  importantWords,
  selectedWordId,
  onSelectWord,
  state,
  audioDuration,
  audioLevel,
  onStartRecording,
  onStopRecording,
  onReset,
  combinedTextForCopy,
  preservedKeywords = [],
  glossaryMatches = [],
  onSelectQuickPrompt,
}) => {
  const [copied, setCopied] = React.useState(false);

  const isRecording = state === 'recording';
  const isProcessing = state === 'processing';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = async () => {
    const textToCopy = combinedTextForCopy || finalizedSentence;
    if (!textToCopy) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  /**
   * Tokenize finalized sentence to highlight detected words from the glossary file
   * (DBMS_50_Tamil_English_Definition_Explanation.json) as well as analyzed important words.
   * Highlighted words are underlined and clickable to view definitions on the right panel.
   */
  const renderSentenceWithHighlights = () => {
    if (!finalizedSentence) return null;

    // Collect all candidate phrases: DBMS glossary topics, preserved keywords, and important words
    interface HighlightCandidate {
      term: string;
      id?: string;
      isGlossary: boolean;
    }

    const candidateMap = new Map<string, HighlightCandidate>();

    // 1. From DBMS glossary file topics
    for (const g of DBMS_GLOSSARY_TOPICS) {
      const lower = g.topic.toLowerCase();
      if (!candidateMap.has(lower)) {
        candidateMap.set(lower, {
          term: g.topic,
          id: `glossary-${g.number}`,
          isGlossary: true,
        });
      }
    }

    // 2. From preserved keywords detected by backend
    for (const kw of preservedKeywords) {
      const lower = kw.toLowerCase();
      if (!candidateMap.has(lower)) {
        candidateMap.set(lower, {
          term: kw,
          isGlossary: true,
        });
      }
    }

    // 3. From important words
    for (const w of importantWords) {
      const lower = w.word.toLowerCase();
      candidateMap.set(lower, {
        term: w.word,
        id: w.id,
        isGlossary: Boolean(w.glossaryTopic),
      });
    }

    // Filter candidates that actually appear in the finalized sentence
    const activeCandidates = Array.from(candidateMap.values())
      .filter((c) => {
        const regex = new RegExp(`\\b${c.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}s?\\b`, 'i');
        return regex.test(finalizedSentence);
      })
      // Sort by length descending so longer phrases like "candidate key" match before "key"
      .sort((a, b) => b.term.length - a.term.length);

    if (activeCandidates.length === 0) {
      return <span>{finalizedSentence}</span>;
    }

    const escapeRegExp = (string: string) =>
      string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const pattern = new RegExp(
      `\\b(${activeCandidates.map((c) => escapeRegExp(c.term)).join('|')})\\b`,
      'gi'
    );

    const parts = finalizedSentence.split(pattern);

    return parts.map((part, index) => {
      const matched = activeCandidates.find(
        (c) => c.term.toLowerCase() === part.toLowerCase()
      );

      if (!matched) {
        return <span key={index}>{part}</span>;
      }

      // Check if this matched candidate is selected
      const matchedWord = importantWords.find(
        (w) => w.word.toLowerCase() === part.toLowerCase() || w.id === matched.id
      );
      const targetId = matchedWord?.id || matched.id || `word-${index}`;
      const isSelected = selectedWordId === targetId;

      return (
        <button
          key={index}
          type="button"
          onClick={() => onSelectWord(targetId)}
          title={`DBMS Glossary keyword: "${part}". Click to view English definition & Tamil explanation.`}
          aria-label={`Glossary keyword: ${part}. Click to view Tamil meaning`}
          className={`inline-flex items-center align-baseline mx-1 px-2 py-0.5 rounded cursor-pointer transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 font-medium ${
            isSelected
              ? 'bg-slate-900 text-white shadow-xs underline decoration-indigo-400 decoration-2 underline-offset-3 scale-[1.01]'
              : 'bg-indigo-50/90 hover:bg-indigo-100 text-indigo-950 underline decoration-indigo-500 decoration-2 underline-offset-3 font-semibold'
          }`}
        >
          {part}
        </button>
      );
    });
  };

  // Waveform bars
  const waveformBarCount = 28;
  const waveformHeights = [
    25, 40, 65, 30, 80, 50, 95, 70, 40, 85, 100, 60, 45, 90, 75, 100, 85, 50, 70, 90,
    45, 80, 60, 95, 40, 65, 35, 20,
  ];

  const hasContent = Boolean(finalizedSentence || interimSentence);

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden">
      {/* ========================================================================= */}
      {/* TOP HEADER */}
      {/* ========================================================================= */}
      <div className="pb-3 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-[15px] font-semibold text-slate-900 tracking-tight">
            Live Lesson
          </h2>
          {topic && (
            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60 truncate max-w-[200px] sm:max-w-none">
              {topic}
            </span>
          )}
        </div>

        {/* Right Status Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          {isRecording ? (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200/70 text-red-700 text-[11px] font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span>Listening...</span>
              <span className="font-mono text-red-800 text-[11px]">
                {formatTime(audioDuration)}
              </span>
            </div>
          ) : isProcessing ? (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Understanding...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Gemini Live Ready</span>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN: Live Speech Transcription - Fits naturally, compact 28-34px font, */}
      {/* wraps cleanly, internally scrollable only if long */}
      {/* ========================================================================= */}
      <div className="flex-1 min-h-0 w-full overflow-y-auto custom-scrollbar px-2 sm:px-5 py-4 flex flex-col items-center">
        <div className="my-auto w-full max-w-2xl text-center py-2">
          {hasContent ? (
            <div className="w-full animate-in fade-in duration-150">
              <p
                id="live-english-sentence"
                className="text-slate-900 break-words tracking-tight text-center font-normal sm:font-medium"
                style={{
                  fontSize: 'clamp(20px, 2.1vw, 30px)',
                  lineHeight: 1.45,
                  letterSpacing: '-0.02em',
                }}
              >
                {/* 1. Finalized sentence with detected clickable words */}
                {renderSentenceWithHighlights()}

                {/* 2. Distinct Interim Transcription Display */}
                {interimSentence && (
                  <span className={`text-slate-400 font-normal italic inline-flex items-center gap-1.5 ${finalizedSentence ? 'ml-2' : ''} transition-opacity duration-150`}>
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse inline-block shrink-0" />
                    <span>{interimSentence}</span>
                  </span>
                )}
              </p>
            </div>
          ) : (
            /* CENTER EMPTY STATE */
            <div className="space-y-2 max-w-md mx-auto text-center animate-in fade-in duration-150 py-3">
              <div className="w-9 h-9 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-1.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-[17px] sm:text-[19px] font-medium text-slate-700 tracking-tight">
                {isRecording ? 'Listening to classroom speech...' : 'Start speaking to understand your lesson.'}
              </p>
              <p className="text-[12px] text-slate-400 max-w-xs mx-auto">
                {isRecording
                  ? 'Gemini Live transcription is streaming words as you speak.'
                  : 'Click Start Lesson or speak into your microphone to transcribe and learn in real time.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LOWER PORTION: Waveform & Speech-to-Text Recording Controls */}
      {/* ========================================================================= */}
      <div className="pt-2.5 pb-1 flex flex-col items-center gap-2.5 shrink-0 border-t border-slate-100/80 mt-auto">
        {/* Waveform Display */}
        <div className="flex items-center justify-center gap-1 h-5 w-full max-w-[260px]">
          {waveformHeights.slice(0, waveformBarCount).map((baseHeight, idx) => {
            const dynamicScale = isRecording
              ? Math.max(0.18, (baseHeight / 100) * (0.35 + audioLevel * 0.8))
              : 0.12;

            return (
              <span
                key={idx}
                className={`w-1 rounded-full transition-all duration-100 ${
                  isRecording
                    ? 'bg-slate-900 opacity-90'
                    : 'bg-slate-200 opacity-60'
                }`}
                style={{
                  height: `${Math.round(20 * dynamicScale)}px`,
                  minHeight: '3px',
                }}
              />
            );
          })}
        </div>

        {/* Listening Timer */}
        {isRecording && (
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 -mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            <span>Live Streaming</span>
            <span className="font-mono text-slate-700">{formatTime(audioDuration)}</span>
          </div>
        )}

        {/* Primary Recording & Action Buttons */}
        <div className="flex items-center justify-center gap-3">
          {/* Main Dark Pill Button */}
          {isRecording ? (
            <button
              id="btn-stop-recording"
              type="button"
              onClick={onStopRecording}
              className="group inline-flex items-center gap-2.5 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-xs active:scale-[0.98] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <Square className="w-3.5 h-3.5 fill-current text-white" />
              <span className="text-[13px] font-medium tracking-tight">
                Stop
              </span>
            </button>
          ) : isProcessing ? (
            <button
              id="btn-processing-lesson"
              type="button"
              disabled
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900/90 text-white rounded-full shadow-xs cursor-wait"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              <span className="text-[13px] font-medium tracking-tight">
                Understanding...
              </span>
            </button>
          ) : (
            <button
              id="btn-start-lesson"
              type="button"
              onClick={onStartRecording}
              className="group inline-flex items-center gap-2.5 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-xs active:scale-[0.98] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <Mic className="w-4 h-4 text-white transition-transform group-hover:scale-105" />
              <span className="text-[13px] font-medium tracking-tight">
                Start Lesson
              </span>
            </button>
          )}

          {/* Small Circular Copy Button */}
          <button
            id="btn-copy-transcription"
            type="button"
            disabled={!finalizedSentence || isRecording || isProcessing}
            onClick={handleCopy}
            title={copied ? 'Copied to clipboard' : 'Copy transcription'}
            aria-label="Copy transcription"
            className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all duration-150 active:scale-95 shadow-2xs disabled:opacity-35 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Small Circular Reset Button */}
          <button
            id="btn-reset-lesson"
            type="button"
            onClick={onReset}
            title="Reset lesson workspace"
            aria-label="Reset lesson workspace"
            className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all duration-150 active:scale-95 shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Suggested Classroom Test Phrases */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">Try speaking:</span>
          {SAMPLE_PROMPTS.map((sample) => (
            <button
              key={sample.label}
              type="button"
              disabled={isRecording || isProcessing}
              onClick={() => onSelectQuickPrompt?.(sample.sentence, sample.topic)}
              title={`Analyze: "${sample.sentence}"`}
              className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all active:scale-95 disabled:opacity-50"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
