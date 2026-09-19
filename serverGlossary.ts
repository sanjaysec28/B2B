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
        // Fallback to gemini-embedding-2-preview if needed
        try {
          const fallbackEmbed = await ai.models.embedContent({
            model: 'gemini-embedding-2-preview',
            contents: kw,
          });
          const kwVec = fallbackEmbed.embeddings?.[0]?.values;
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
        } catch {
          // Keep best heuristic match if embeddings are temporarily unavailable
        }
      }

      // If direct match was found, ensure it gets priority
      const targetItem = directItem || (highestSimilarity >= 0.55 ? bestItem : null);
      if (targetItem && !glossaryMatches.some((g) => g.topicNumber === targetItem.number)) {
        const score = directItem ? Math.max(highestSimilarity, 0.85) : highestSimilarity;
        glossaryMatches.push({
          topicNumber: targetItem.number,
          topic: targetItem.topic,
          matchedKeyword: kw,
          similarityScore: Math.round(score * 100) / 100,
          englishDefinition: targetItem.englishDefinition,
          englishExplanation: targetItem.englishExplanation,
          tamilDefinition: targetItem.tamilDefinition,
          tamilExplanation: targetItem.tamilExplanation,
        });
      }
    }

const COMMON_DBMS_TAMIL_TERMS: Record<string, string> = {
  'foreign key': 'வெளிப்புற விசை',
  'primary key': 'முதன்மை சாவி',
  'candidate key': 'வேட்பாளர் சாவி',
  'super key': 'சிறப்பு சாவி',
  'composite key': 'கூட்டுச் சாவி',
  'alternate key': 'மாற்றுச் சாவி',
  'table': 'அட்டவணை',
  'database': 'தரவுத்தளம்',
  'rdbms': 'உறவுநிலை தரவுத்தள மேலாண்மை அமைப்பு',
  'dbms': 'தரவுத்தள மேலாண்மை அமைப்பு',
  'row': 'வரிசை',
  'rows': 'வரிசைகள்',
  'column': 'நெடுவரிசை',
  'columns': 'நெடுவரிசைகள்',
  'record': 'பதிவு',
  'records': 'பதிவுகள்',
  'attribute': 'பண்புக்கூறு',
  'attributes': 'பண்புக்கூறுகள்',
  'tuple': 'வரிசை / பதிவு',
  'relation': 'தொடர்பு / அட்டவணை',
  'query': 'வினவல்',
  'sql': 'கட்டமைக்கப்பட்ட வினவல் மொழி',
  'schema': 'கட்டமைப்பு / திட்டம்',
  'index': 'குறியீடு',
  'view': 'காட்சி',
  'normalization': 'இயல்பாக்கம்',
  'transaction': 'பரிவர்த்தனை',
  'acid': 'ACID பண்புகள்',
  'atomicity': 'முழுமைத்தன்மை',
  'consistency': 'நிலையான தன்மை',
  'isolation': 'தனிமைப்படுத்தல்',
  'durability': 'நீடித்து நிலைக்கும் தன்மை',
  'join': 'இணைப்பு',
  'constraint': 'கட்டுப்பாடு',
  'constraints': 'கட்டுப்பாடுகள்',
  'trigger': 'தூண்டுதல்',
  'deadlock': 'முட்டுக்கட்டை',
  'concurrency': 'ஒரே நேரத்தில் நிகழ்தல்',
  'connects': 'இணைக்கிறது / தொடர்புபடுத்துகிறது',
  'key': 'சாவி / விசை',
  'keys': 'சாவிகள்',
};

    // Step 4: Generate a clear natural Tamil explanation and keyword meanings using Gemini
    const protectedKeywordsList = glossaryMatches.length > 0
      ? glossaryMatches.map((g) => g.matchedKeyword)
      : matchedKeywords;

    const prompt = `You are an expert bilingual teacher explaining classroom lectures naturally to Tamil-medium college students hearing the concept for the first time.
Teacher's spoken sentence: "${cleanSentence}"

CRITICAL INSTRUCTION FOR TAMIL EXPLANATION:
Do NOT give a direct or word-by-word translation of the English sentence.
Do NOT give a textbook-style formal definition (e.g. avoid "...என்பது ...ஐ குறைக்கும் முறையாகும்").
Instead, explain the meaning of the ACTUAL spoken sentence naturally in simple spoken Tamil, as if an engaging teacher is explaining the concept to a Tamil-medium student.

EXPLANATION STYLE GUIDELINES:
1. Start naturally, such as "இந்த sentence-ல சொல்ல வருவது என்னனா..." or "இங்க ஆசிரியர் என்ன சொல்றாங்கன்னா..." when appropriate.
2. Explain what the sentence actually means in real terms using simple, conversational spoken Tamil.
3. Preserve important technical English terms (e.g. Normalization, database, foreign key, primary key, table, data redundancy) as English words, because they are commonly used in Tamil classrooms and exams.
4. Avoid overly formal literary Tamil and avoid robotic word-by-word translations.
5. Make it immediately crystal clear to a Tamil-medium student listening to this lecture.

CONCRETE EXAMPLES:
- Teacher: "Normalization reduces unnecessary data redundancy."
  tamilExplanation: "இந்த sentence-ல சொல்ல வருவது என்னனா, database-ல ஒரே தகவல் தேவையில்லாமல் பல முறை சேமிக்கப்படுவதை Normalization குறைக்கிறது."

- Teacher: "A foreign key connects one table with another table."
  tamilExplanation: "இந்த sentence-ல ஆசிரியர் என்ன சொல்றாருன்னா, ஒரு table-ஐ இன்னொரு table-கூட link பண்ணி relationship உருவாக்க Foreign key பயன்படுது."

- Teacher: "Every primary key is a candidate key."
  tamilExplanation: "இந்த sentence-ல சொல்ல வருவது என்னனா, table-ல தனித்துவமா identify பண்ண தகுதியுள்ள candidate keys-ல இருந்துதான் ஒரு முக்கியமான primary key-ஐ தேர்ந்தெடுக்கிறோம், அதனால எல்லா primary key-உம் அடிப்படையில் ஒரு candidate key தான்."

IMPORTANT WORDS:
Extract the 2 to 5 important technical English keywords from the sentence with their direct Tamil meaning (e.g. foreign key → வெளிப்புற விசை, table → அட்டவணை, primary key → முதன்மை சாவி, candidate key → வேட்பாளர் சாவி).

Respond ONLY with valid JSON matching this schema:
{
  "topic": "string (e.g. DBMS • Relational Model)",
  "tamilExplanation": "string (Natural teacher explanation in spoken Tamil starting with 'இந்த sentence-ல சொல்ல வருவது என்னனா...' or similar)",
  "tanglishMeaning": "string",
  "preservedKeywords": ${JSON.stringify(protectedKeywordsList)},
  "importantWords": [
    {
      "word": "string (English keyword from speech, e.g. 'foreign key')",
      "tamilMeaning": "string (Direct Tamil meaning/translation, e.g. 'வெளிப்புற விசை')",
      "tanglish": "string",
      "partOfSpeech": "string",
      "explanation": "string (Simple 1-sentence English explanation)",
      "tamilExplanation": "string (Simple 1-sentence Tamil explanation)",
      "example": "string",
      "tamilExample": "string"
    }
  ]
}`;

    let translationData: any = {};
    const candidateModels = [
      'gemini-flash-latest',
      'gemini-3.1-flash-lite',
      'gemini-3.6-flash',
      'gemini-3.8-flash',
    ];

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
        if (translationData.tamilExplanation) {
          break;
        }
      } catch (err: any) {
        // If a model is unavailable (503) or rate-limited (429), try next model gracefully
        const isTemporary = err?.message?.includes('503') || err?.message?.includes('429');
        if (isTemporary) {
          console.log(`[GlossaryManager] Model ${modelName} temporarily busy, falling back to next candidate.`);
        } else {
          console.warn(`[GlossaryManager] Error with model ${modelName}:`, err?.message || err);
        }
      }
    }

    if (!translationData.tamilExplanation) {
      // Fallback rule-based translation preserving natural spoken explanation
      let fallbackTamil = cleanSentence;
      const lower = cleanSentence.toLowerCase();
      if (lower.includes('foreign key') && lower.includes('table')) {
        fallbackTamil = 'இந்த sentence-ல ஆசிரியர் என்ன சொல்றாருன்னா, ஒரு table-ஐ இன்னொரு table-கூட link பண்ணி relationship உருவாக்க Foreign key பயன்படுது.';
      } else if (lower.includes('primary key') && lower.includes('candidate key')) {
        fallbackTamil = 'இந்த sentence-ல சொல்ல வருவது என்னனா, table-ல தனித்துவமா identify பண்ண தகுதியுள்ள candidate keys-ல இருந்துதான் ஒரு முக்கியமான primary key-ஐ தேர்ந்தெடுக்கிறோம், அதனால எல்லா primary key-உம் அடிப்படையில் ஒரு candidate key தான்.';
      } else if (lower.includes('normalization') && (lower.includes('redundancy') || lower.includes('reduces'))) {
        fallbackTamil = 'இந்த sentence-ல சொல்ல வருவது என்னனா, database-ல ஒரே தகவல் தேவையில்லாமல் பல முறை சேமிக்கப்படுவதை Normalization குறைக்கிறது.';
      } else if (lower.includes('acid')) {
        fallbackTamil = 'இந்த sentence-ல ஆசிரியர் என்ன சொல்றாருன்னா, டேட்டாபேஸ் பரிவர்த்தனைகள் நம்பகத்தன்மையோட எந்த பிழையும் இல்லாம நடக்க ACID பண்புகளை கட்டாயம் பின்பற்ற வேண்டும்.';
      } else {
        fallbackTamil = `இந்த sentence-ல சொல்ல வருவது என்னனா, ${cleanSentence} என்பது ${protectedKeywordsList.join(', ')} தொடர்பான முக்கியமான கருத்து ஆகும்.`;
      }

      translationData = {
        topic: 'DBMS • Database Management System',
        tamilExplanation: fallbackTamil,
        tanglishMeaning: cleanSentence,
        preservedKeywords: protectedKeywordsList,
        importantWords: protectedKeywordsList.map((kw) => ({
          word: kw,
          tamilMeaning: COMMON_DBMS_TAMIL_TERMS[kw.toLowerCase()] || kw,
          tanglish: kw,
          partOfSpeech: 'database term',
          explanation: `Important database concept: ${kw}`,
          tamilExplanation: `${kw} என்பது முக்கியமான டேட்டாபேஸ் கருத்து ஆகும்.`,
          example: `In databases, ${kw} plays an essential role.`,
          tamilExample: `டேட்டாபேஸில் ${kw} முக்கிய பங்கு வகிக்கிறது.`,
        })),
      };
    }

    // Process important words and ensure genuine Tamil meanings
    const rawWords = translationData.importantWords || [];
    const mergedWords = rawWords.map((w: any) => {
      const lowerWord = (w.word || '').toLowerCase();
      let bestTamilMeaning = w.tamilMeaning;
      if (COMMON_DBMS_TAMIL_TERMS[lowerWord]) {
        bestTamilMeaning = COMMON_DBMS_TAMIL_TERMS[lowerWord];
      }

      // Check if this keyword matches any glossary topic
      const matchedGlossary = glossaryMatches.find(
        (g) => g.matchedKeyword.toLowerCase() === lowerWord || g.topic.toLowerCase() === lowerWord
      );

      return {
        ...w,
        tamilMeaning: bestTamilMeaning,
        glossaryTopic: matchedGlossary?.topic,
        topicNumber: matchedGlossary?.topicNumber,
        similarityScore: matchedGlossary?.similarityScore,
        englishDefinition: matchedGlossary?.englishDefinition,
        englishExplanation: matchedGlossary?.englishExplanation,
        tamilDefinition: matchedGlossary?.tamilDefinition,
        tamilExplanation: w.tamilExplanation || matchedGlossary?.tamilExplanation,
      };
    });

    // Ensure any matched glossary items not yet in mergedWords are added
    for (const match of glossaryMatches) {
      const exists = mergedWords.some(
        (w: any) => w.word.toLowerCase() === match.matchedKeyword.toLowerCase() ||
                    w.word.toLowerCase() === match.topic.toLowerCase()
      );

      if (!exists) {
        const lowerKeyword = match.matchedKeyword.toLowerCase();
        const tamilTerm = COMMON_DBMS_TAMIL_TERMS[lowerKeyword] ||
                          COMMON_DBMS_TAMIL_TERMS[match.topic.toLowerCase()] ||
                          match.topic;

        mergedWords.push({
          id: `glossary-${match.topicNumber}`,
          word: match.matchedKeyword,
          glossaryTopic: match.topic,
          topicNumber: match.topicNumber,
          similarityScore: match.similarityScore,
          tamilMeaning: tamilTerm,
          tanglish: `${match.matchedKeyword} (${match.topic})`,
          partOfSpeech: 'database term',
          explanation: `${match.englishDefinition} ${match.englishExplanation}`,
          tamilExplanation: `${match.tamilDefinition} ${match.tamilExplanation}`,
          example: `In SQL databases, every table should have a well-defined ${match.topic}.`,
          tamilExample: `SQL டேட்டாபேஸில் ஒவ்வொரு டேபிளுக்கும் முறையான ${match.topic} அமைப்பது அவசியமாகும்.`,
        });
      }
    }

    return {
      topic: translationData.topic || 'DBMS • Database Management System',
      englishSentence: cleanSentence,
      tamilMeaning: translationData.tamilExplanation || translationData.lockedTamilTranslation || '',
      tanglishMeaning: translationData.tanglishMeaning || translationData.tanglishTranslation || '',
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
