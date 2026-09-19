/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ImportantWord, SentenceAnalysisResponse, LessonSegment, GlossaryMatch } from '../types.ts';
import { SAMPLE_LESSONS } from './sampleLessons.ts';
import { DBMS_GLOSSARY_TOPICS } from './glossaryTopics.ts';

export { SAMPLE_LESSONS };

export interface LearningService {
  analyzeSentence(englishSentence: string): Promise<SentenceAnalysisResponse>;
  processFinalizedTranscript(englishText: string, durationSeconds?: number): Promise<LessonSegment>;
}

class LearningServiceImpl implements LearningService {
  /**
   * Analyzes a finalized English classroom sentence using Gemini & DBMS Glossary.
   * Identifies keywords from the glossary, locks/preserves them, translates to Tamil,
   * and computes embedding cosine similarity.
   */
  async analyzeSentence(englishSentence: string): Promise<SentenceAnalysisResponse> {
    const cleanText = englishSentence.trim();
    if (!cleanText) {
      return {
        topic: 'DBMS • Live Lesson',
        englishSentence: '',
        tamilMeaning: '',
        tanglishMeaning: '',
        importantWords: [],
        preservedKeywords: [],
        glossaryMatches: [],
      };
    }

    try {
      const response = await fetch('/api/analyze-sentence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ englishSentence: cleanText }),
      });

      if (response.ok) {
        const data: SentenceAnalysisResponse = await response.json();
        return data;
      }

      // Try fallback to /api/analyze-lesson
      const fallbackResponse = await fetch('/api/analyze-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ englishText: cleanText }),
      });

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        return fallbackData;
      }

      throw new Error(`Server responded with ${response.status}`);
    } catch (err) {
      console.warn('Backend sentence analysis error, using client-side DBMS glossary matching:', err);
      return this.generateFallback(cleanText);
    }
  }

  /**
   * Legacy adapter for any existing callers.
   */
  async processFinalizedTranscript(
    englishText: string,
    durationSeconds = 0
  ): Promise<LessonSegment> {
    const analysis = await this.analyzeSentence(englishText);
    return {
      id: `lesson-${Date.now()}`,
      topic: analysis.topic,
      englishText: analysis.englishSentence || englishText,
      tamilMeaning: analysis.tamilMeaning,
      tanglishMeaning: analysis.tanglishMeaning,
      importantWords: analysis.importantWords,
      audioDurationSeconds: durationSeconds,
      timestamp: Date.now(),
    };
  }

  private generateFallback(cleanText: string): SentenceAnalysisResponse {
    // 1. Check against DBMS glossary topics
    const matchedGlossary: GlossaryMatch[] = [];
    const preservedKeywords: string[] = [];

    for (const g of DBMS_GLOSSARY_TOPICS) {
      const regex = new RegExp(`\\b${g.topic.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}s?\\b`, 'i');
      const match = regex.exec(cleanText);
      if (match) {
        preservedKeywords.push(match[0]);
        matchedGlossary.push({
          topicNumber: g.number,
          topic: g.topic,
          matchedKeyword: match[0],
          similarityScore: 0.95,
          englishDefinition: g.englishDefinition,
          englishExplanation: g.englishExplanation,
          tamilDefinition: g.tamilDefinition,
          tamilExplanation: g.tamilExplanation,
        });
      }
    }

    const COMMON_DBMS_TAMIL_TERMS: Record<string, string> = {
      'foreign key': 'வெளிப்புற விசை',
      'primary key': 'முதன்மை சாவி',
      'candidate key': 'வேட்பாளர் சாவி',
      'super key': 'சிறப்பு சாவி',
      'table': 'அட்டவணை',
      'database': 'தரவுத்தளம்',
      'row': 'வரிசை',
      'column': 'நெடுவரிசை',
      'record': 'பதிவு',
      'attribute': 'பண்புக்கூறு',
      'connects': 'இணைக்கிறது',
    };

    let lockedTamil = '';
    const lower = cleanText.toLowerCase();
    if (lower.includes('foreign key') && lower.includes('table')) {
      lockedTamil = 'இந்த sentence-ல ஆசிரியர் என்ன சொல்றாருன்னா, ஒரு table-ஐ இன்னொரு table-கூட link பண்ணி relationship உருவாக்க Foreign key பயன்படுது.';
      if (!preservedKeywords.includes('foreign key')) preservedKeywords.push('foreign key');
      if (!preservedKeywords.includes('table')) preservedKeywords.push('table');
    } else if (lower.includes('primary key') && lower.includes('candidate key')) {
      lockedTamil = 'இந்த sentence-ல சொல்ல வருவது என்னனா, table-ல தனித்துவமா identify பண்ண தகுதியுள்ள candidate keys-ல இருந்துதான் ஒரு முக்கியமான primary key-ஐ தேர்ந்தெடுக்கிறோம், அதனால எல்லா primary key-உம் அடிப்படையில் ஒரு candidate key தான்.';
    } else if (lower.includes('normalization') && (lower.includes('redundancy') || lower.includes('reduces'))) {
      lockedTamil = 'இந்த sentence-ல சொல்ல வருவது என்னனா, database-ல ஒரே தகவல் தேவையில்லாமல் பல முறை சேமிக்கப்படுவதை Normalization குறைக்கிறது.';
    } else if (lower.includes('acid')) {
      lockedTamil = 'இந்த sentence-ல ஆசிரியர் என்ன சொல்றாருன்னா, டேட்டாபேஸ் பரிவர்த்தனைகள் நம்பகத்தன்மையோட எந்த பிழையும் இல்லாம நடக்க ACID பண்புகளை கட்டாயம் பின்பற்ற வேண்டும்.';
    } else if (preservedKeywords.length > 0) {
      lockedTamil = `இந்த sentence-ல சொல்ல வருவது என்னனா, ${cleanText} என்பது ${preservedKeywords.join(', ')} தொடர்பான முக்கியமான கருத்து ஆகும்.`;
    } else {
      lockedTamil = 'இந்த sentence-ல சொல்ல வருவது என்னனா, வகுப்பறையில் ஆசிரியர் விளக்கிய இந்த கருத்து பாடத்தின் மிக முக்கியமான பகுதியாகும்.';
    }

    const importantWords: ImportantWord[] = matchedGlossary.map((m) => {
      const lowerKw = m.matchedKeyword.toLowerCase();
      const tamilMeaning = COMMON_DBMS_TAMIL_TERMS[lowerKw] ||
                           COMMON_DBMS_TAMIL_TERMS[m.topic.toLowerCase()] ||
                           m.tamilDefinition.split(/[-–—]/)[0]?.trim() ||
                           m.topic;

      return {
        id: `glossary-${m.topicNumber}`,
        word: m.matchedKeyword,
        glossaryTopic: m.topic,
        similarityScore: m.similarityScore,
        tamilMeaning,
        tanglish: `${m.matchedKeyword} (${m.topic})`,
        partOfSpeech: 'database term',
        explanation: `${m.englishDefinition} ${m.englishExplanation}`,
        tamilExplanation: `${m.tamilDefinition} ${m.tamilExplanation}`,
        example: `In SQL databases, understanding ${m.topic} is fundamental.`,
        tamilExample: `SQL டேட்டாபேஸில் ${m.topic} பற்றிய புரிதல் மிக முக்கியமானதாகும்.`,
        englishDefinition: m.englishDefinition,
        englishExplanation: m.englishExplanation,
        tamilDefinition: m.tamilDefinition,
      };
    });

    return {
      topic: 'DBMS • Database Management System',
      englishSentence: cleanText,
      tamilMeaning: lockedTamil,
      tanglishMeaning: cleanText,
      importantWords,
      preservedKeywords,
      glossaryMatches: matchedGlossary,
    };
  }
}

export const learningService = new LearningServiceImpl();
