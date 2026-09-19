/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ImportantWord } from '../types.ts';
import { Copy, Check } from 'lucide-react';

interface TamilMeaningPanelProps {
  tamilMeaning: string;
  tanglishMeaning: string;
  selectedWord: ImportantWord | null;
}

export const TamilMeaningPanel: React.FC<TamilMeaningPanelProps> = ({
  tamilMeaning,
  tanglishMeaning,
  selectedWord,
}) => {
  const [copiedSentence, setCopiedSentence] = useState(false);

  const handleCopySentence = async () => {
    if (!tamilMeaning) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${tamilMeaning}\n(${tanglishMeaning})`);
      }
      setCopiedSentence(true);
      setTimeout(() => setCopiedSentence(false), 1800);
    } catch {
      setCopiedSentence(false);
    }
  };

  return (
    <div className="w-full flex flex-col h-full gap-5">
      {/* ===================================================================== */}
      {/* SECTION A: தமிழில் புரிந்துகொள்வோம் (Understand in Tamil) */}
      {/* ===================================================================== */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h2 className="text-[14px] font-semibold text-slate-900 tracking-tight font-['Noto_Sans_Tamil',sans-serif]">
            தமிழில் புரிந்துகொள்வோம்
          </h2>
          {tamilMeaning && (
            <button
              type="button"
              onClick={handleCopySentence}
              title="Copy Tamil explanation"
              aria-label="Copy Tamil explanation"
              className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
            >
              {copiedSentence ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Natural Tamil Sentence Meaning (~18-20px, generous line height) */}
        {tamilMeaning ? (
          <div className="space-y-2 pt-1">
            <p
              id="tamil-sentence-meaning"
              className="text-[18px] sm:text-[19px] leading-[1.65] font-normal text-slate-800 font-['Noto_Sans_Tamil',sans-serif]"
            >
              {tamilMeaning}
            </p>

            {tanglishMeaning && (
              <p className="text-[12px] text-slate-500 italic leading-relaxed pt-1">
                "{tanglishMeaning}"
              </p>
            )}
          </div>
        ) : (
          <p className="text-[13px] text-slate-400 py-3 italic">
            Tamil explanation will appear here when speech starts.
          </p>
        )}
      </div>

      {/* Subtle Divider between Section A and Section B */}
      <div className="h-px bg-slate-100 w-full" />

      {/* ===================================================================== */}
      {/* SECTION B: Selected Word (Clean Information Hierarchy) */}
      {/* ===================================================================== */}
      <div className="flex-1 flex flex-col">
        <div className="pb-2 border-b border-slate-100 mb-3">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Selected Word
          </span>
        </div>

        {selectedWord ? (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Word Header */}
            <div>
              <h3 className="text-[17px] font-semibold text-slate-900 tracking-tight">
                {selectedWord.word}
              </h3>
              <div className="flex items-center gap-2 text-[13px] text-slate-600 mt-0.5">
                <span className="font-medium text-slate-800 font-['Noto_Sans_Tamil',sans-serif]">
                  {selectedWord.tamilMeaning}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-400 italic text-[12px]">
                  {selectedWord.tanglish}
                </span>
              </div>
            </div>

            {/* Simple Meaning Block */}
            <div className="space-y-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Simple Meaning
              </span>
              <p className="text-[13px] text-slate-700 leading-relaxed">
                {selectedWord.explanation}
              </p>
              <p className="text-[13px] text-slate-800 leading-relaxed font-['Noto_Sans_Tamil',sans-serif]">
                {selectedWord.tamilExplanation}
              </p>
            </div>

            {/* Real-Life Example Block */}
            <div className="space-y-1 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Real-Life Example
              </span>
              <p className="text-[13px] text-slate-800 leading-relaxed font-medium">
                "{selectedWord.example}"
              </p>
              <p className="text-[12px] text-slate-600 leading-relaxed font-['Noto_Sans_Tamil',sans-serif]">
                "{selectedWord.tamilExample}"
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-6 text-center text-slate-400">
            <p className="text-[13px] font-medium text-slate-500">Select a word</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
              Click any highlighted term in the lesson to view meaning and examples.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
