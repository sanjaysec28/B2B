/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TranscriptionResult, LanguageOption } from '../types.ts';

/**
 * Available language profiles for transcription simulations and display.
 * The primary default matches the user's requested reference: Tamil.
 */
export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'ta-IN',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    sampleText: 'ஒரு டெமோவில் ஒரு அற்புதமான உரையை இன்று நாம் பார்க்கலாம்',
  },
  {
    code: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    sampleText: 'कृत्रिम बुद्धिमत्ता की शक्ति से आवाज़ को सटीक रूप में टेक्स्ट में बदलें।',
  },
  {
    code: 'en-IN',
    name: 'English',
    nativeName: 'English',
    sampleText: 'Convert spoken language into accurate text in real-time with modern voice AI.',
  },
  {
    code: 'te-IN',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    sampleText: 'మాట్లాడే స్వరాన్ని తక్షణమే ఖచ్చితమైన వచనంగా మార్చే సాంకేతికత.',
  },
];

export interface SpeechToTextService {
  transcribeAudio(audioBlob: Blob, targetLanguage?: string): Promise<TranscriptionResult>;
}

/**
 * ============================================================================
 * SPEECH-TO-TEXT SERVICE ABSTRACTION
 * ============================================================================
 * 
 * This service encapsulates speech-to-text processing.
 * Currently implemented as a high-fidelity frontend mock to simulate the latency,
 * response format, and lifecycle of a modern AI speech recognition API.
 * 
 * TO CONNECT A REAL SPEECH-TO-TEXT API:
 * ----------------------------------------------------------------------------
 * 1. Replace the mock body inside `transcribeAudio` with your real endpoint call:
 * 
 *    const formData = new FormData();
 *    formData.append('file', audioBlob, 'recording.webm');
 *    formData.append('language_code', targetLanguage || 'ta-IN');
 * 
 *    const response = await fetch('/api/transcribe', {
 *      method: 'POST',
 *      body: formData,
 *    });
 *    const data = await response.json();
 *    return {
 *      text: data.transcript,
 *      language: data.language_code,
 *      languageLabel: data.language_name,
 *      durationSeconds: data.duration,
 *      confidence: data.confidence,
 *      timestamp: Date.now(),
 *    };
 * 
 * 2. Keep frontend UI components unchanged—the UI only consumes this contract.
 * ============================================================================
 */
class MockSpeechToTextService implements SpeechToTextService {
  private samplePoolIndex = 0;

  async transcribeAudio(audioBlob: Blob, targetLanguage = 'ta-IN'): Promise<TranscriptionResult> {
    // Artificial realistic processing delay (1200ms)
    await new Promise((resolve) => setTimeout(resolve, 1250));

    // Approximate duration calculated from blob size
    const estimatedDuration = Math.max(2, Math.round(audioBlob.size / 16000));

    const selectedLang =
      SUPPORTED_LANGUAGES.find((lang) => lang.code === targetLanguage) || SUPPORTED_LANGUAGES[0];

    // Primary sample matching reference screenshot requirement
    const pool = [
      selectedLang.sampleText,
      selectedLang.code === 'ta-IN'
        ? 'செயற்கை நுண்ணறிவு தொழில்நுட்பத்தின் மூலம் குரல் பதிவுகள் துல்லியமாக உரையாக மாற்றப்படுகின்றன.'
        : selectedLang.sampleText,
    ];

    const chosenText = pool[this.samplePoolIndex % pool.length];
    this.samplePoolIndex++;

    return {
      text: chosenText,
      language: selectedLang.code,
      languageLabel: selectedLang.name,
      durationSeconds: estimatedDuration,
      confidence: 0.98,
      timestamp: Date.now(),
    };
  }
}

export const speechToTextService = new MockSpeechToTextService();
