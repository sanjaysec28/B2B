/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ImportantWord } from '../types.ts';
import { BookOpen, Sparkles, ChevronRight } from 'lucide-react';

interface ImportantWordsListProps {
  words: ImportantWord[];
  selectedWordId: string | null;
  onSelectWord: (wordId: string) => void;
  isLive?: boolean;
}

export const ImportantWordsList: React.FC<ImportantWordsListProps> = ({
  words,
  selectedWordId,
  onSelectWord,
}) => {
  return (
    <div className="w-full flex flex-col h-full">
      {/* Fixed Panel Header */}
      <div className="pb-3 border-b border-slate-100 flex items-center justify-between shrink-0 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
            <BookOpen className="w-3 h-3" />
          </span>
          <h2 className="text-[14px] font-semibold text-slate-900 tracking-tight">
            Important Words
          </h2>
        </div>
        {words.length > 0 && (
          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {words.length}
          </span>
        )}
      </div>

      {/* Vocabulary Scroll Area */}
      {words.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-2">
            <Sparkles className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-[13px] font-medium text-slate-600">No active words</p>
          <p className="text-[11px] text-slate-400 mt-1 max-w-[180px]">
            Vocabulary appears when teacher speaks.
          </p>
        </div>
      ) : (
        <div
          role="list"
          aria-label="Important vocabulary words"
          className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1 max-h-[520px] custom-scrollbar"
        >
          {words.map((item) => {
            const isSelected = selectedWordId === item.id;

            return (
              <button
                key={item.id}
                type="button"
                role="listitem"
                onClick={() => onSelectWord(item.id)}
                aria-current={isSelected ? 'true' : 'false'}
                className={`group relative w-full text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
                    : 'bg-white border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/70 text-slate-900'
                }`}
                style={{
                  padding: '14px 14px',
                  borderRadius: '16px',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[14px] font-semibold tracking-tight ${
                          isSelected ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {item.word}
                      </span>
                      {item.partOfSpeech && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-normal ${
                            isSelected
                              ? 'bg-white/15 text-white/90'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.partOfSpeech}
                        </span>
                      )}
                    </div>
                    {/* Tamil meaning */}
                    <p
                      className={`text-[12px] font-medium mt-1 font-['Noto_Sans_Tamil',sans-serif] ${
                        isSelected ? 'text-slate-200' : 'text-slate-700'
                      }`}
                    >
                      {item.tamilMeaning}
                    </p>
                    {/* Tanglish phonetic */}
                    <p
                      className={`text-[11px] italic mt-0.5 ${
                        isSelected ? 'text-slate-400' : 'text-slate-400'
                      }`}
                    >
                      {item.tanglish}
                    </p>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform duration-150 ${
                      isSelected
                        ? 'text-white translate-x-0.5'
                        : 'text-slate-300 group-hover:text-slate-500'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Subtle bottom note */}
      {words.length > 0 && (
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
          <span>Tap to explore explanation</span>
        </div>
      )}
    </div>
  );
};
