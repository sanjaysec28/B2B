/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, LiveServerMessage, Modality, AudioTranscriptionConfigMode } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { SAMPLE_LESSONS } from './src/services/sampleLessons.ts';
import { glossaryManager } from './serverGlossary.ts';

dotenv.config();

const app = express();
const PORT = 3000;
const server = http.createServer(app);

app.use(express.json());

// 1. Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: Date.now(),
  });
});

// 2. DBMS Glossary Topics Endpoint
app.get('/api/glossary-topics', (req, res) => {
  res.json(glossaryManager.getTopics());
});

// 3. Fallback lesson analyzer if offline or matching sample
function getFallbackAnalysis(englishText: string) {
  const normalized = englishText.trim().toLowerCase();
  const matched = SAMPLE_LESSONS.find(
    (s) =>
      normalized.includes(s.englishText.toLowerCase()) ||
      s.englishText.toLowerCase().includes(normalized)
  );

  if (matched) {
    return {
      topic: matched.topic,
      tamilMeaning: matched.tamilMeaning,
      tanglishMeaning: matched.tanglishMeaning,
      importantWords: matched.importantWords,
    };
  }

  // Extract candidate vocabulary words (words > 4 letters)
  const candidateWords = englishText
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 4)
    .slice(0, 3);

  const fallbackWords = candidateWords.map((w, i) => ({
    id: `word-${w.toLowerCase()}-${i}`,
    word: w,
    tamilMeaning: 'முக்கிய சொல்',
    tanglish: `${w} - mukkiya soll`,
    partOfSpeech: 'noun',
    explanation: `Key academic term in the sentence: ${w}.`,
    tamilExplanation: `இந்த வாக்கியத்தில் பயன்படுத்தப்பட்டுள்ள முக்கிய சொல் ${w}.`,
    example: `Understand the usage of ${w} in this context.`,
    tamilExample: `${w} என்பதன் பயன்பாட்டை சூழலுடன் புரிந்து கொள்ளவும்.`,
  }));

  return {
    topic: 'Classroom English • Live Transcription',
    tamilMeaning: 'ஆசிரியர் வகுப்பறையில் கற்பிக்கும் பாடம் தமிழில் நேரலையாக மொழிபெயர்க்கப்படுகிறது.',
    tanglishMeaning: 'Teacher sollra English lesson ungalukku puriyura maadhiri Tamil-la translate aagudhu.',
    importantWords: fallbackWords.length > 0 ? fallbackWords : SAMPLE_LESSONS[0].importantWords,
  };
}

// 4. Educational Sentence Analysis Endpoint (Gemini-powered with DBMS Glossary & Embedding Matching)
app.post(['/api/analyze-sentence', '/api/analyze-lesson'], async (req, res) => {
  const englishText = req.body?.englishSentence || req.body?.englishText || '';

  if (!englishText || typeof englishText !== 'string' || !englishText.trim()) {
    return res.status(400).json({ error: 'Sentence is required for educational analysis' });
  }

  const cleanSentence = englishText.trim();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Provide a structured fallback when API key is missing so the lesson UI does not crash
    return res.json(getFallbackAnalysis(cleanSentence));
  }

  try {
    const analysis = await glossaryManager.analyzeAndTranslate(cleanSentence, apiKey);
    return res.json(analysis);
  } catch (err) {
    console.error('Error in glossary analysis, falling back:', err);
    return res.json(getFallbackAnalysis(cleanSentence));
  }
});

// 4. WebSocket Server for Gemini Live Real-Time Transcription
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url || '', `http://${request.headers.host}`);
  if (url.pathname === '/api/live-transcribe') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    // Other websocket paths
    socket.destroy();
  }
});

wss.on('connection', async (clientWs: WebSocket, request: http.IncomingMessage) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    clientWs.send(
      JSON.stringify({
        type: 'error',
        message: 'GEMINI_API_KEY environment variable is not configured on the server. Please add your Gemini API key in Settings > Secrets to enable live Gemini transcription.',
      })
    );
    clientWs.close();
    return;
  }

  // Parse query parameters for active lesson topic or custom vocabulary hints
  const reqUrl = new URL(request?.url || '', `http://${request?.headers.host || 'localhost'}`);
  const activeTopic = reqUrl.searchParams.get('topic') || '';

  // Build dynamic classroom vocabulary based on DBMS glossary topics and active topic
  const vocabSet = new Set<string>();

  // High-priority core technical terms from DBMS curriculum
  const coreDbmsTerms = [
    'Normalization',
    'database',
    'data redundancy',
    'unnecessary data redundancy',
    'redundancy',
    'table',
    'tables',
    'relation',
    'relations',
    'relational database',
    'foreign key',
    'primary key',
    'candidate key',
    'super key',
    'composite key',
    'alternate key',
    'tuple',
    'tuples',
    'attribute',
    'attributes',
    'schema',
    'SQL',
    'DDL',
    'DML',
    'DCL',
    'TCL',
    'ACID properties',
    'atomicity',
    'consistency',
    'isolation',
    'durability',
    'transaction',
    'query',
    'index',
    'indexing',
    'view',
    'join',
    'inner join',
    'outer join',
    'left join',
    'right join',
    '1NF',
    '2NF',
    '3NF',
    'BCNF',
    'functional dependency',
    'cardinality',
    'degree',
    'ER diagram',
    'entity',
    'DBMS',
    'RDBMS',
  ];

  for (const term of coreDbmsTerms) {
    vocabSet.add(term);
  }

  // Also include topics from loaded glossary manager items
  try {
    const glossaryTopics = glossaryManager.getTopics();
    for (const item of glossaryTopics) {
      if (item.topic) {
        const clean = item.topic.replace(/\s*\([^)]*\)/g, '').trim();
        if (clean) vocabSet.add(clean);
      }
    }
  } catch (err) {
    console.warn('[Gemini Live] Could not extract glossary topics for vocabulary:', err);
  }

  // Add words from active topic if provided
  if (activeTopic) {
    vocabSet.add(activeTopic);
    const words = activeTopic.split(/[\s•\-_/]+/).map((w) => w.trim()).filter((w) => w.length > 2);
    for (const w of words) {
      vocabSet.add(w);
    }
  }

  const customVocabulary = Array.from(vocabSet).slice(0, 100);
  console.log(`[Gemini Live] Initializing speech session with ${customVocabulary.length} vocabulary hints. Active topic: "${activeTopic || 'Default'}"`);

  let liveSession: Awaited<ReturnType<InstanceType<typeof GoogleGenAI>['live']['connect']>> | null =
    null;
  let isClosing = false;
  const earlyAudioQueue: string[] = [];

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Connect to Gemini Live Transcription API with gemini-3.5-transcribe-live
    // Rigorously configured for English classroom speech recognition
    liveSession = await ai.live.connect({
      model: 'gemini-3.5-transcribe-live',
      config: {
        responseModalities: [Modality.TEXT],
        inputAudioTranscription: {
          languageCodes: ['en-US'],
          mode: AudioTranscriptionConfigMode.SMART,
          customVocabulary,
        },
      },
      callbacks: {
        onopen: () => {
          console.log('Gemini connected');
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'ready' }));
          }
          // Flush any early audio chunks queued while connecting
          if (liveSession && earlyAudioQueue.length > 0) {
            console.log(`Flushing ${earlyAudioQueue.length} queued early audio chunks to Gemini Live`);
            while (earlyAudioQueue.length > 0) {
              const chunk = earlyAudioQueue.shift()!;
              try {
                liveSession.sendRealtimeInput({
                  media: {
                    data: chunk,
                    mimeType: 'audio/pcm;rate=16000',
                  },
                  audio: {
                    data: chunk,
                    mimeType: 'audio/pcm;rate=16000',
                  },
                });
                console.log('audio chunk sent');
              } catch (e) {
                console.error('Gemini errors sending queued audio:', e);
              }
            }
          }
        },
        onmessage: (msg: LiveServerMessage) => {
          if (clientWs.readyState !== WebSocket.OPEN) return;

          // Interim low-latency transcription as teacher speaks
          if (msg.serverContent?.interimInputTranscription?.text) {
            console.log('interim transcript received:', msg.serverContent.interimInputTranscription.text);
            clientWs.send(
              JSON.stringify({
                type: 'interim',
                text: msg.serverContent.interimInputTranscription.text,
                languageCode: msg.serverContent.interimInputTranscription.languageCode || 'en',
              })
            );
          }

          // Finalized segment transcription
          if (msg.serverContent?.inputTranscription?.text) {
            console.log('final transcript received:', msg.serverContent.inputTranscription.text);
            clientWs.send(
              JSON.stringify({
                type: 'final',
                text: msg.serverContent.inputTranscription.text,
                languageCode: msg.serverContent.inputTranscription.languageCode || 'en',
                finished: msg.serverContent.inputTranscription.finished ?? true,
              })
            );
          }
        },
        onerror: (err: unknown) => {
          console.error('Gemini errors:', err);
          if (clientWs.readyState === WebSocket.OPEN) {
            const message =
              err instanceof Error ? err.message : 'Error in Gemini Live transcription session';
            clientWs.send(JSON.stringify({ type: 'error', message }));
          }
        },
        onclose: (event: unknown) => {
          if (!isClosing && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'closed', details: event }));
          }
        },
      },
    });

    clientWs.on('message', (rawData: Buffer | string) => {
      try {
        let base64Audio = '';
        let isStop = false;

        if (typeof rawData === 'string') {
          if (rawData.startsWith('{')) {
            const parsed = JSON.parse(rawData);
            if (parsed.type === 'audio' && parsed.data) {
              base64Audio = parsed.data;
            } else if (parsed.type === 'stop') {
              isStop = true;
            }
          }
        } else if (Buffer.isBuffer(rawData)) {
          const str = rawData.toString();
          if (str.startsWith('{')) {
            const parsed = JSON.parse(str);
            if (parsed.type === 'audio' && parsed.data) {
              base64Audio = parsed.data;
            } else if (parsed.type === 'stop') {
              isStop = true;
            }
          } else {
            base64Audio = rawData.toString('base64');
          }
        }

        if (isStop) {
          isClosing = true;
          if (liveSession) {
            liveSession.close();
          }
          clientWs.close();
          return;
        }

        if (base64Audio) {
          if (!liveSession) {
            // Buffer early audio while connection is establishing
            earlyAudioQueue.push(base64Audio);
            return;
          }

          liveSession.sendRealtimeInput({
            media: {
              data: base64Audio,
              mimeType: 'audio/pcm;rate=16000',
            },
            audio: {
              data: base64Audio,
              mimeType: 'audio/pcm;rate=16000',
            },
          });
          console.log('audio chunk sent');
        }
      } catch (err) {
        console.error('Gemini errors:', err);
      }
    });

    clientWs.on('close', () => {
      isClosing = true;
      if (liveSession) {
        try {
          liveSession.close();
        } catch {
          // Ignore
        }
        liveSession = null;
      }
    });

    clientWs.on('error', (err) => {
      console.error('Client WebSocket error:', err);
      if (liveSession) {
        try {
          liveSession.close();
        } catch {
          // Ignore
        }
        liveSession = null;
      }
    });
  } catch (err: unknown) {
    console.error('Failed to initialize Gemini Live session:', err);
    if (clientWs.readyState === WebSocket.OPEN) {
      const message =
        err instanceof Error ? err.message : 'Failed to connect to Gemini Live transcription.';
      clientWs.send(JSON.stringify({ type: 'error', message }));
      clientWs.close();
    }
  }
});

// 5. Mount Vite middleware for development or serve dist in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Vaani server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
