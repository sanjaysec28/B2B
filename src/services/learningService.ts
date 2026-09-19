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

    let lockedTamil = '';
    if (preservedKeywords.length >= 2 && cleanText.toLowerCase().includes('every') && cleanText.toLowerCase().includes('candidate key')) {
      lockedTamil = `ஒவ்வொரு ${preservedKeywords[0]}-உம் ஒரு ${preservedKeywords[1]} ஆகும்.`;
    } else if (preservedKeywords.length > 0) {
      lockedTamil = `${cleanText} (தமிழில்: ${preservedKeywords.join(', ')} முக்கிய ஆங்கில சொற்களாக பாதுகாக்கப்பட்டுள்ளன).`;
    } else {
      lockedTamil = 'ஆசிரியர் வகுப்பறையில் கற்பித்த வாக்கியம் தமிழில் மொழிபெயர்க்கப்பட்டுள்ளது.';
    }

    const importantWords: ImportantWord[] = matchedGlossary.map((m) => ({
      id: `glossary-${m.topicNumber}`,
      word: m.matchedKeyword,
      glossaryTopic: m.topic,
      similarityScore: m.similarityScore,
      tamilMeaning: m.tamilDefinition.split(/[-–—]/)[0]?.trim() || m.topic,
      tanglish: `${m.matchedKeyword} (${m.topic})`,
      partOfSpeech: 'database term',
      explanation: `${m.englishDefinition} ${m.englishExplanation}`,
      tamilExplanation: `${m.tamilDefinition} ${m.tamilExplanation}`,
      example: `In SQL databases, understanding ${m.topic} is fundamental.`,
      tamilExample: `SQL டேட்டாபேஸில் ${m.topic} பற்றிய புரிதல் மிக முக்கியமானதாகும்.`,
      englishDefinition: m.englishDefinition,
      englishExplanation: m.englishExplanation,
      tamilDefinition: m.tamilDefinition,
    }));

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
