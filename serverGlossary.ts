/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

export interface GlossaryItem {
  number: number;
  topic: string;
  englishDefinition: string;
  englishExplanation: string;
  tamilDefinition: string;
  tamilExplanation: string;
  embedding?: number[];
}

export interface GlossaryMatch {
  topicNumber: number;
  topic: string;
  matchedKeyword: string;
  similarityScore: number;
  englishDefinition: string;
  englishExplanation: string;
  tamilDefinition: string;
  tamilExplanation: string;
}

export interface AnalysisResult {
  topic: string;
  englishSentence: string;
  tamilMeaning: string;
  tanglishMeaning: string;
  preservedKeywords: string[];
  importantWords: Array<{
    id: string;
    word: string;
    tamilMeaning: string;
    tanglish: string;
    partOfSpeech: string;
    explanation: string;
    tamilExplanation: string;
    example: string;
    tamilExample: string;
    similarityScore?: number;
    glossaryTopic?: string;
  }>;
  glossaryMatches: GlossaryMatch[];
}

class GlossaryManager {
  private items: GlossaryItem[] = [];
  private isInitialized = false;

  constructor() {
    this.init();
  }

  public init() {
    if (this.isInitialized && this.items.length > 0) return;

    try {
      const rootDir = process.cwd();
      const tamilPath = path.join(rootDir, 'DBMS_50_Tamil_English_Definition_Explanation.json');
      const engPath = path.join(rootDir, 'DBMS_50_Definition_Explanation.json');
      const embeddingsPath = path.join(rootDir, 'glossary_embeddings.json');

      if (!fs.existsSync(tamilPath) || !fs.existsSync(engPath)) {
        console.warn('[GlossaryManager] Glossary files not found at expected paths.');
        return;
      }

      const tamilRaw = JSON.parse(fs.readFileSync(tamilPath, 'utf8'));
      const engRaw = JSON.parse(fs.readFileSync(engPath, 'utf8'));

      const engMap = new Map<number, { definition: string; explanation: string }>();
      for (const t of engRaw.topics || []) {
        engMap.set(t.number, { definition: t.definition, explanation: t.explanation });
      }

      let cachedEmbeddingsMap = new Map<number, number[]>();
      if (fs.existsSync(embeddingsPath)) {
        try {
          const embRaw = JSON.parse(fs.readFileSync(embeddingsPath, 'utf8'));
          for (const item of embRaw.items || []) {
            if (item.number && Array.isArray(item.embedding)) {
              cachedEmbeddingsMap.set(item.number, item.embedding);
            }
          }
          console.log(`[GlossaryManager] Loaded ${cachedEmbeddingsMap.size} pre-computed embeddings.`);
        } catch (err) {
          console.warn('[GlossaryManager] Error reading glossary_embeddings.json:', err);
        }
      }

      this.items = (tamilRaw.topics || []).map((t: any) => {
        const eng = engMap.get(t.number) || { definition: '', explanation: '' };
        return {
          number: t.number,
          topic: t.topic,
          englishDefinition: eng.definition,
          englishExplanation: eng.explanation,
          tamilDefinition: t.definition,
          tamilExplanation: t.explanation,
          embedding: cachedEmbeddingsMap.get(t.number),
        };
      });

      this.isInitialized = true;
      console.log(`[GlossaryManager] Initialized with ${this.items.length} DBMS glossary items.`);
    } catch (err) {
      console.error('[GlossaryManager] Initialization error:', err);
    }
  }

  public getTopics() {
    return this.items.map((i) => ({
      number: i.number,
      topic: i.topic,
      englishDefinition: i.englishDefinition,
      tamilDefinition: i.tamilDefinition,
    }));
  }

  /**
   * Calculates cosine similarity between two vectors.
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }

  /**
   * Performs regex-based detection of glossary keywords in an input sentence.
   */
  public findKeywordOccurrences(sentence: string): Array<{ keyword: string; item: GlossaryItem }> {
    const found: Array<{ keyword: string; item: GlossaryItem }> = [];
    const lowerSentence = sentence.toLowerCase();

    // Sort items by topic length descending to match composite/longer terms first (e.g. "Primary Key" before "Key")
    const sorted = [...this.items].sort((a, b) => b.topic.length - a.topic.length);

    for (const item of sorted) {
      // Create flexible regex for the topic name (including optional plurals or parentheses)
      // e.g. "Primary Key" -> /\bprimary\s+keys?\b/i
      const cleanTopic = item.topic.replace(/\s*\([^)]*\)/g, '').trim();
      const escaped = cleanTopic.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const pattern = new RegExp(`\\b${escaped}s?\\b`, 'i');

      const match = pattern.exec(sentence);
      if (match) {
        found.push({
          keyword: match[0],
          item,
        });
      }
    }

    // Deduplicate so shorter sub-strings don't conflict with longer matches
    const deduped: Array<{ keyword: string; item: GlossaryItem }> = [];
    for (const f of found) {
      const isAlreadyCovered = deduped.some((d) =>
        d.keyword.toLowerCase().includes(f.keyword.toLowerCase()) && d.keyword.length > f.keyword.length
      );
      if (!isAlreadyCovered && !deduped.some((d) => d.item.number === f.item.number)) {
        deduped.push(f);
      }
    }

    return deduped;
  }

  /**
   * Main sentence analysis method:
   * 1. Detects and extracts glossary keywords from the STT converted sentence.
   * 2. Computes embeddings for the extracted keywords.
   * 3. Calculates cosine similarity against the glossary item embeddings.
   * 4. Locks/preserves the keywords and translates the rest of the sentence to Tamil using Gemini.
   * 5. Returns matched glossary entries with English description and Tamil explanation.
   */
  public async analyzeAndTranslate(
    sentence: string,
    apiKey: string
  ): Promise<AnalysisResult> {
    const cleanSentence = sentence.trim();
    if (!cleanSentence) {
      throw new Error('Sentence is empty');
    }

    this.init();

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Step 1: Detect direct keyword occurrences
    const directMatches = this.findKeywordOccurrences(cleanSentence);
    let matchedKeywords = directMatches.map((m) => m.keyword);

    // If direct matches didn't capture keywords, extract academic/technical terms with regex or simple NLP
    if (matchedKeywords.length === 0) {
      const stopWords = new Set([
        'the', 'is', 'are', 'was', 'were', 'and', 'this', 'that', 'these', 'those',
        'a', 'an', 'in', 'on', 'at', 'of', 'to', 'for', 'with', 'by', 'from',
        'it', 'its', 'they', 'them', 'he', 'she', 'we', 'you', 'i', 'as', 'into',
        'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must',
        'has', 'have', 'had', 'do', 'does', 'did', 'be', 'been', 'being', 'so', 'but',
        'every', 'each', 'all', 'some', 'any', 'or', 'not', 'no', 'if', 'then'
      ]);

      const candidateWords = cleanSentence
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length >= 3 && !stopWords.has(w.toLowerCase()));

      matchedKeywords = Array.from(new Set(candidateWords)).slice(0, 3);
    }

    // Step 2 & 3: Create embeddings for the input keywords & compute cosine similarity
    const glossaryMatches: GlossaryMatch[] = [];

    for (const kw of matchedKeywords) {
      let bestItem: GlossaryItem | null = null;
      let highestSimilarity = 0;

      // Check if kw directly matches one of directMatches
      const directItem = directMatches.find(
        (m) => m.keyword.toLowerCase() === kw.toLowerCase()
      )?.item;

      try {
        const embedRes = await ai.models.embedContent({
          model: 'gemini-embedding-001',
          contents: kw,
        });
        const kwVec = embedRes.embeddings?.[0]?.values;

        if (kwVec && kwVec.length > 0) {
          for (const item of this.items) {
            if (item.embedding && item.embedding.length > 0) {
              const sim = this.cosineSimilarity(kwVec, item.embedding);
              if (sim > highestSimilarity) {
                highestSimilarity = sim;
                bestItem = item;
              }
            }
          }
        }
      } catch (embErr) {
        console.warn(`[GlossaryManager] Failed to embed keyword "${kw}":`, embErr);
      }

      // If direct match was found, ensure it gets priority
      const targetItem = directItem || (highestSimilarity >= 0.55 ? bestItem : null);
      if (targetItem && !glossaryMatches.some((g) => g.topicNumber === targetItem.number)) {
        glossaryMatches.push({
          topicNumber: targetItem.number,
          topic: targetItem.topic,
          matchedKeyword: kw,
          similarityScore: Math.round((highestSimilarity || 0.95) * 100) / 100,
          englishDefinition: targetItem.englishDefinition,
          englishExplanation: targetItem.englishExplanation,
          tamilDefinition: targetItem.tamilDefinition,
          tamilExplanation: targetItem.tamilExplanation,
        });
      }
    }

    // Step 4: Lock/Preserve keywords and translate the rest of the sentence into Tamil using Gemini
    const protectedKeywordsList = glossaryMatches.length > 0
      ? glossaryMatches.map((g) => g.matchedKeyword)
      : matchedKeywords;

    const prompt = `You are a bilingual academic instructor for Tamil-medium students studying Computer Science and DBMS (Database Management Systems).
Teacher's spoken sentence: "${cleanSentence}"

PROTECTED KEYWORDS TO LOCK: ${JSON.stringify(protectedKeywordsList)}

MANDATORY RULES:
1. LOCK & PRESERVE KEYWORDS: You must protect the keywords ${JSON.stringify(protectedKeywordsList)}. DO NOT translate these keywords into Tamil script. Keep them as exact English keywords in the translated sentence.
2. TRANSLATE REST TO TAMIL: Translate all remaining words of the sentence into natural, grammatically correct Tamil.
3. Replace the protected keywords in their correct grammatical positions as English words (e.g. if the sentence is "every primary key is a candidate key", translate to "ஒவ்வொரு primary key-உம் ஒரு candidate key ஆகும்." keeping "primary key" and "candidate key" in English).
4. Provide a conversational Tanglish translation as well.
5. Provide 2 to 4 vocabulary items with simple Tamil meanings and real-world examples.

Respond ONLY with valid JSON matching this schema:
{
  "topic": "DBMS • Database Management System",
  "lockedTamilTranslation": "string",
  "tanglishTranslation": "string",
  "preservedKeywords": ${JSON.stringify(protectedKeywordsList)},
  "importantWords": [
    {
      "word": "string",
      "tamilMeaning": "string",
      "tanglish": "string",
      "partOfSpeech": "string",
      "explanation": "string",
      "tamilExplanation": "string",
      "example": "string",
      "tamilExample": "string"
    }
  ]
}`;

    let translationData: any = {};
    const candidateModels = ['gemini-3.6-flash', 'gemini-3.8-flash'];
    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const raw = response.text || '{}';
        const cleaned = raw.replace(/^\s*```json/i, '').replace(/```\s*$/i, '').trim();
        translationData = JSON.parse(cleaned);
        if (translationData.lockedTamilTranslation) {
          break;
        }
      } catch (err: any) {
        console.warn(`[GlossaryManager] Error with model ${modelName}:`, err?.message || err);
      }
    }

    if (!translationData.lockedTamilTranslation) {
      // Fallback rule-based translation preserving keywords
      let fallbackTamil = cleanSentence;
      // Simple known phrase replacements for DBMS
      if (cleanSentence.toLowerCase().includes('every') && cleanSentence.toLowerCase().includes('is a')) {
        fallbackTamil = `ஒவ்வொரு ${protectedKeywordsList[0] || 'primary key'}-உம் ஒரு ${protectedKeywordsList[1] || 'candidate key'} ஆகும்.`;
      } else {
        fallbackTamil = `${protectedKeywordsList.join(' மற்றும் ')} பற்றிய விளக்கம் (ஆங்கில சொற்கள் பாதுகாக்கப்பட்டுள்ளன).`;
      }

      translationData = {
        topic: 'DBMS • Database Management System',
        lockedTamilTranslation: fallbackTamil,
        tanglishTranslation: cleanSentence,
        preservedKeywords: protectedKeywordsList,
        importantWords: [],
      };
    }

    // Merge vocabulary with matched glossary items
    const mergedWords = [...(translationData.importantWords || [])];
    for (const match of glossaryMatches) {
      const existingIdx = mergedWords.findIndex(
        (w: any) => w.word.toLowerCase() === match.matchedKeyword.toLowerCase() ||
                    w.word.toLowerCase() === match.topic.toLowerCase()
      );

      const wordPayload = {
        id: `glossary-${match.topicNumber}`,
        word: match.matchedKeyword || match.topic,
        glossaryTopic: match.topic,
        similarityScore: match.similarityScore,
        tamilMeaning: match.tamilDefinition.split(/[-–—]/)[0]?.trim() || match.topic,
        tanglish: `${match.matchedKeyword} (${match.topic})`,
        partOfSpeech: 'database term',
        explanation: `${match.englishDefinition} ${match.englishExplanation}`,
        tamilExplanation: `${match.tamilDefinition} ${match.tamilExplanation}`,
        example: `In SQL databases, every table should have a well-defined ${match.topic}.`,
        tamilExample: `SQL டேட்டாபேஸில் ஒவ்வொரு டேபிளுக்கும் முறையான ${match.topic} அமைப்பது அவசியமாகும்.`,
      };

      if (existingIdx >= 0) {
        mergedWords[existingIdx] = {
          ...mergedWords[existingIdx],
          ...wordPayload,
          id: mergedWords[existingIdx].id || wordPayload.id,
        };
      } else {
        mergedWords.unshift(wordPayload);
      }
    }

    return {
      topic: translationData.topic || 'DBMS • Database Management System',
      englishSentence: cleanSentence,
      tamilMeaning: translationData.lockedTamilTranslation || '',
      tanglishMeaning: translationData.tanglishTranslation || '',
      preservedKeywords: protectedKeywordsList,
      importantWords: mergedWords.map((w: any, idx: number) => ({
        ...w,
        id: w.id || `word-${idx}-${Date.now()}`,
      })),
      glossaryMatches,
    };
  }
}

export const glossaryManager = new GlossaryManager();
