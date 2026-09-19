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
  vocabulary?: ImportantWord[];
  selectedWord: ImportantWord | null;
  preservedKeywords?: string[];
  glossaryMatches?: GlossaryMatch[];
  onSelectWord?: (wordId: string) => void;
}

export const TamilMeaningPanel: React.FC<TamilMeaningPanelProps> = ({
  tamilMeaning,
  tanglishMeaning,
  vocabulary = [],
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
            className="inline-flex items-center px-1.5 py-0.2 mx-0.5 rounded bg-indigo-50/90 border border-indigo-200/80 font-semibold text-indigo-950 underline decoration-indigo-300 decoration-1 underline-offset-2"
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

  // Effective words list for "Important Words: keyword → தமிழ் அர்த்தம்"
  const effectiveWordsList = vocabulary.length > 0
    ? vocabulary
    : selectedWord
    ? [selectedWord]
    : [];

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
          Spoken lesson explanation and important keywords in Tamil
        </p>
      </div>

      {/* Internal Content Area with Custom Scrollbar */}
      <div className="flex-1 min-h-0 my-2.5 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-3.5">
        {/* ===================================================================== */}
        {/* SECTION 1: TAMIL EXPLANATION (தமிழ் விளக்கம்) */}
        {/* Slightly BOLDER text for better readability without increasing size */}
        {/* ===================================================================== */}
        <div className="flex flex-col gap-1.5 shrink-0 bg-slate-50/70 rounded-2xl p-3.5 border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 font-['Noto_Sans_Tamil',sans-serif]">
              Tamil Explanation:
            </span>
            {preservedKeywords.length > 0 && (
              <span className="text-[10px] text-indigo-700 font-medium bg-white px-2 py-0.5 rounded-full border border-indigo-100">
                {preservedKeywords.length} Keywords
              </span>
            )}
          </div>

          {tamilMeaning ? (
            <div className="space-y-2 pt-1">
              <p
                id="tamil-sentence-meaning"
                className="text-[15.5px] sm:text-[16.5px] leading-[1.65] font-semibold text-slate-900 font-['Noto_Sans_Tamil',sans-serif]"
              >
                {renderTamilWithPreservedKeywords()}
              </p>

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
              Speak or pick a lesson sentence to generate Tamil explanation.
            </p>
          )}
        </div>

        {/* ===================================================================== */}
        {/* SECTION 2: IMPORTANT WORDS (English keyword → தமிழ் அர்த்தம்) */}
        {/* ===================================================================== */}
        {effectiveWordsList.length > 0 && (
          <div className="flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 font-['Noto_Sans_Tamil',sans-serif]">
                Important Words:
              </span>
              <span className="text-[10.5px] text-slate-400">
                {effectiveWordsList.length} {effectiveWordsList.length === 1 ? 'word' : 'words'}
              </span>
            </div>

            <div className="flex flex-col gap-1.5" role="list">
              {effectiveWordsList.map((item) => {
                const isSelected = selectedWord?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectWord && onSelectWord(item.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        onSelectWord && onSelectWord(item.id);
                      }
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-white text-slate-900 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`text-[13.5px] font-semibold tracking-tight ${
                        isSelected ? 'text-white' : 'text-slate-900'
                      }`}>
                        {item.word}
                      </span>
                      {item.partOfSpeech && (
                        <span className={`text-[9.5px] px-1.5 py-0.2 rounded font-normal ${
                          isSelected ? 'bg-white/15 text-white/90' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {item.partOfSpeech}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[13px] ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                        →
                      </span>
                      <span className={`text-[13.5px] font-semibold font-['Noto_Sans_Tamil',sans-serif] ${
                        isSelected ? 'text-amber-200' : 'text-slate-900'
                      }`}>
                        {item.tamilMeaning}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* SECTION 3: DETAILED LEARNING / GLOSSARY EXPLANATION (Clean & Unobtrusive) */}
        {/* ===================================================================== */}
        {selectedWord && (
          <div className="space-y-2 bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                Word Explanation: {selectedWord.word}
              </span>
              {selectedWord.glossaryTopic && (
                <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  {selectedWord.glossaryTopic}
                </span>
              )}
            </div>

            {selectedWord.explanation && (
              <p className="text-[12.5px] text-slate-700 leading-relaxed font-normal">
                {selectedWord.explanation}
              </p>
            )}

            {selectedWord.tamilExplanation && (
              <p className="text-[12.5px] font-medium text-slate-900 leading-relaxed font-['Noto_Sans_Tamil',sans-serif] pt-1 border-t border-slate-100">
                {selectedWord.tamilExplanation}
              </p>
            )}

            {selectedWord.example && (
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                <p className="text-[11.5px] text-slate-600 italic">
                  "{selectedWord.example}"
                </p>
                {selectedWord.tamilExample && (
                  <p className="text-[11.5px] text-slate-700 font-['Noto_Sans_Tamil',sans-serif] mt-0.5">
                    "{selectedWord.tamilExample}"
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
