/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ImportantWord, GlossaryMatch } from '../types.ts';
import { Copy, Check, BookOpen, Layers, Sparkles, Database } from 'lucide-react';

interface TamilMeaningPanelProps {
  tamilMeaning: string;
  tanglishMeaning: string;
  selectedWord: ImportantWord | null;
  preservedKeywords?: string[];
  glossaryMatches?: GlossaryMatch[];
  onSelectWord?: (wordId: string) => void;
}

export const TamilMeaningPanel: React.FC<TamilMeaningPanelProps> = ({
  tamilMeaning,
  tanglishMeaning,
  selectedWord,
  preservedKeywords = [],
  glossaryMatches = [],
  onSelectWord,
}) => {
  const [copiedSentence, setCopiedSentence] = useState(false);
  const [activeGlossaryTab, setActiveGlossaryTab] = useState<number>(0);

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

  // Helper to render Tamil sentence with highlighted preserved English keywords
  const renderTamilWithPreservedKeywords = () => {
    if (!tamilMeaning) return null;
    if (!preservedKeywords || preservedKeywords.length === 0) {
      return <span>{tamilMeaning}</span>;
    }

    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(
      `(${preservedKeywords.map((k) => escapeRegExp(k)).join('|')})`,
      'gi'
    );
    const parts = tamilMeaning.split(pattern);

    return parts.map((part, idx) => {
      const isKeyword = preservedKeywords.some(
        (k) => k.toLowerCase() === part.toLowerCase()
      );
      if (isKeyword) {
        return (
          <span
            key={idx}
            className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md bg-indigo-50 border border-indigo-200/80 font-semibold text-indigo-900 text-[14px]"
            title="Preserved English technical keyword"
          >
            {part}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  // Effective glossary matches to show
  const displayGlossaryMatches: GlossaryMatch[] =
    glossaryMatches && glossaryMatches.length > 0
      ? glossaryMatches
      : selectedWord?.glossaryTopic
      ? [
          {
            topicNumber: 0,
            topic: selectedWord.glossaryTopic,
            matchedKeyword: selectedWord.word,
            similarityScore: selectedWord.similarityScore || 0.85,
            englishDefinition: selectedWord.englishDefinition || selectedWord.explanation,
            englishExplanation: selectedWord.englishExplanation || '',
            tamilDefinition: selectedWord.tamilDefinition || selectedWord.tamilMeaning,
            tamilExplanation: selectedWord.tamilExplanation || '',
          },
        ]
      : [];

  const currentGlossaryItem =
    displayGlossaryMatches[activeGlossaryTab] || displayGlossaryMatches[0];

  return (
    <div className="w-full flex flex-col h-full overflow-hidden">
      {/* Panel Header */}
      <div className="pb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-semibold text-slate-900 tracking-tight font-['Noto_Sans_Tamil',sans-serif]">
              தமிழில் புரிந்துகொள்வோம்
            </h2>
            {displayGlossaryMatches.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-2 py-0.5 rounded-full">
                <Database className="w-3 h-3" />
                DBMS Glossary
              </span>
            )}
          </div>

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
        <p className="text-[12px] text-slate-400 mt-0.5">
          Locked Keywords & Tamil Translation with Embedding Similarity
        </p>
      </div>

      {/* Internal Content Area with Custom Scrollbar */}
      <div className="flex-1 min-h-0 my-2.5 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-3.5">
        {/* ===================================================================== */}
        {/* SECTION 1: வாக்கியப் பொருள் (Locked Keywords + Tamil Translation) */}
        {/* ===================================================================== */}
        <div className="flex flex-col gap-1.5 shrink-0 bg-slate-50/60 rounded-2xl p-3.5 border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-['Noto_Sans_Tamil',sans-serif]">
              வாக்கியப் பொருள் (Tamil Translation)
            </span>
            {preservedKeywords.length > 0 && (
              <span className="text-[10px] text-indigo-700 font-medium bg-white px-2 py-0.5 rounded-full border border-indigo-100">
                {preservedKeywords.length} Locked {preservedKeywords.length === 1 ? 'Keyword' : 'Keywords'}
              </span>
            )}
          </div>

          {tamilMeaning ? (
            <div className="space-y-2 pt-1">
              <p
                id="tamil-sentence-meaning"
                className="text-[15.5px] sm:text-[16.5px] leading-[1.6] font-normal text-slate-900 font-['Noto_Sans_Tamil',sans-serif]"
              >
                {renderTamilWithPreservedKeywords()}
              </p>

              {/* Preserved Keywords tags */}
              {preservedKeywords.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10.5px] text-slate-500 font-medium">Locked:</span>
                  {preservedKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-white text-indigo-900 border border-indigo-200 shadow-2xs"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}

              {tanglishMeaning && (
                <div className="pt-1.5 border-t border-slate-200/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Tanglish Bridge
                  </span>
                  <p className="text-[12px] text-slate-500 italic leading-relaxed">
                    "{tanglishMeaning}"
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[13px] text-slate-400 py-1 italic">
              Speak or pick a lesson sentence to generate Tamil translation with locked keywords.
            </p>
          )}
        </div>

        {/* ===================================================================== */}
        {/* SECTION 2: DBMS GLOSSARY MATCHES & EMBEDDING SIMILARITY */}
        {/* ===================================================================== */}
        {displayGlossaryMatches.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                DBMS Glossary Embedding Match
              </span>
              <span className="text-[10.5px] text-slate-400 font-mono">
                Cosine Similarity
              </span>
            </div>

            {/* Keyword Tabs if multiple glossary items matched */}
            {displayGlossaryMatches.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {displayGlossaryMatches.map((m, idx) => {
                  const isActive = idx === activeGlossaryTab;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveGlossaryTab(idx)}
                      className={`px-2.5 py-1 rounded-full text-[11.5px] font-medium transition-all shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {m.topic}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Active Glossary Detail Card */}
            {currentGlossaryItem && (
              <div className="space-y-3 bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs animate-in fade-in duration-150">
                {/* Topic Header & Cosine Similarity Score */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">
                        {currentGlossaryItem.topic}
                      </h3>
                      {currentGlossaryItem.topicNumber > 0 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          #{currentGlossaryItem.topicNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Matched from sentence: <span className="font-semibold text-indigo-700">"{currentGlossaryItem.matchedKeyword}"</span>
                    </p>
                  </div>

                  {/* Cosine Similarity Pill */}
                  <div className="shrink-0 flex flex-col items-end">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {Math.round(currentGlossaryItem.similarityScore * 100)}% Match
                    </span>
                    <span className="text-[9.5px] text-slate-400 mt-0.5">
                      gemini-embedding
                    </span>
                  </div>
                </div>

                {/* English Description */}
                <div className="space-y-1.5 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-slate-500" />
                    English Description
                  </span>
                  <p className="text-[12.5px] font-semibold text-slate-900 leading-snug">
                    {currentGlossaryItem.englishDefinition}
                  </p>
                  {currentGlossaryItem.englishExplanation && (
                    <p className="text-[12px] text-slate-600 leading-relaxed pt-1 border-t border-slate-200/50">
                      {currentGlossaryItem.englishExplanation}
                    </p>
                  )}
                </div>

                {/* Tamil Explanation */}
                <div className="space-y-1.5 bg-indigo-50/40 p-3 rounded-xl border border-indigo-100/70">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1 font-['Noto_Sans_Tamil',sans-serif]">
                    <Layers className="w-3 h-3 text-indigo-600" />
                    தமிழ் விளக்கம் (Tamil Definition & Explanation)
                  </span>
                  <p className="text-[13px] font-medium text-slate-900 leading-relaxed font-['Noto_Sans_Tamil',sans-serif]">
                    {currentGlossaryItem.tamilDefinition}
                  </p>
                  {currentGlossaryItem.tamilExplanation && (
                    <p className="text-[12.5px] text-slate-700 leading-relaxed font-['Noto_Sans_Tamil',sans-serif] pt-1 border-t border-indigo-100/80">
                      {currentGlossaryItem.tamilExplanation}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : selectedWord ? (
          /* Standard Selected Word Details */
          <div className="flex flex-col gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Selected Word Learning
            </span>

            <div className="space-y-3 animate-in fade-in duration-150">
              <div>
                <h3 className="text-[16px] font-semibold text-slate-900 tracking-tight">
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

              {/* Simple Meaning */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Simple Meaning
                </span>
                <p className="text-[12.5px] text-slate-700 leading-relaxed">
                  {selectedWord.explanation}
                </p>
                <p className="text-[12px] text-slate-800 leading-relaxed font-['Noto_Sans_Tamil',sans-serif] pt-0.5">
                  {selectedWord.tamilExplanation}
                </p>
              </div>

              {/* Real-Life Example */}
              <div className="space-y-1 bg-slate-50/90 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Real-Life Example
                </span>
                <p className="text-[12px] text-slate-800 leading-relaxed font-medium">
                  "{selectedWord.example}"
                </p>
                <p className="text-[12px] text-slate-600 leading-relaxed font-['Noto_Sans_Tamil',sans-serif] pt-0.5">
                  "{selectedWord.tamilExample}"
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-slate-400">
            <p className="text-[13px] font-medium text-slate-500">No keyword selected</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
              Click any highlighted keyword in the classroom sentence to explore its DBMS glossary definition and Tamil explanation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
