/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RecordingState } from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { SpeechWorkspace } from './components/SpeechWorkspace.tsx';
import { learningService } from './services/learningService.ts';
import { speechToTextService } from './services/speechToTextService.ts';
import { useLessonStore } from './services/lessonStore.ts';
import { X, CheckCircle2, GraduationCap, Sparkles } from 'lucide-react';

export default function App() {
  const {
    finalizedTranscript,
    interimTranscript,
    topic,
    tamilMeaning,
    tanglishMeaning,
    vocabulary,
    selectedWordId,
    selectedWord,
    preservedKeywords,
    glossaryMatches,
    updateInterim,
    appendFinalized,
    applyAnalysis,
    selectWord,
    resetLesson,
    setIsAnalyzing,
    setDirectSentence,
  } = useLessonStore();

  const [state, setState] = useState<RecordingState>('idle');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<'contact' | 'dashboard' | null>(null);

  const timerIntervalRef = useRef<number | null>(null);
  const analysisDebounceTimerRef = useRef<number | null>(null);

  // Clean up recording timers & audio resources
  const stopAudioPipeline = useCallback(() => {
    speechToTextService.stop();
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (analysisDebounceTimerRef.current) {
      clearTimeout(analysisDebounceTimerRef.current);
      analysisDebounceTimerRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  useEffect(() => {
    return () => {
      stopAudioPipeline();
    };
  }, [stopAudioPipeline]);

  /**
   * Helper to analyze a finalized classroom sentence using Gemini
   */
  const triggerSentenceAnalysis = useCallback(
    (sentence: string) => {
      const cleanSentence = sentence.trim();
      if (!cleanSentence) return;

      if (analysisDebounceTimerRef.current) {
        clearTimeout(analysisDebounceTimerRef.current);
      }

      analysisDebounceTimerRef.current = window.setTimeout(async () => {
        try {
          setIsAnalyzing(true);
          const analysis = await learningService.analyzeSentence(cleanSentence);
          applyAnalysis(analysis);
        } catch (err) {
          console.warn('Real-time sentence analysis error:', err);
        } finally {
          setIsAnalyzing(false);
        }
      }, 400);
    },
    [applyAnalysis, setIsAnalyzing]
  );

  /**
   * Start real-time Gemini Live Speech-to-Text session
   * Streams 16-bit 16kHz mono PCM audio over WebSocket to gemini-3.5-transcribe-live
   */
  const handleStartRecording = async () => {
    setErrorMessage(null);
    stopAudioPipeline();

    // Reset recording timer
    setRecordingDuration(0);
    setState('recording');

    // Start listening duration timer
    timerIntervalRef.current = window.setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);

    try {
      await speechToTextService.start({
        onReady: () => {
          setState('recording');
        },
        onInterimTranscript: (interim: string) => {
          console.log('interim transcript received:', interim);
          // Show live interim words in Center card without saving to finalized
          updateInterim(interim);
        },
        onFinalTranscript: (finalSegment: string) => {
          console.log('final transcript received:', finalSegment);
          // Append finalized sentence to transcript
          appendFinalized(finalSegment);

          // Trigger Gemini analysis for 2-5 important words, Tamil meaning, & examples
          triggerSentenceAnalysis(finalSegment);
        },
        onAudioLevel: (level: number) => {
          setAudioLevel(level);
        },
        onError: (err: Error) => {
          console.error('Gemini errors:', err);
          stopAudioPipeline();
          setState('error');
          setErrorMessage(
            err.message || 'Unable to connect to Gemini Live transcription. Please try again.'
          );
        },
        onClose: () => {
          if (state === 'recording') {
            handleStopRecording();
          }
        },
      });
    } catch (err: unknown) {
      stopAudioPipeline();
      setState('error');

      const error = err as { name?: string; message?: string };
      if (
        error.name === 'NotAllowedError' ||
        error.name === 'PermissionDeniedError'
      ) {
        setErrorMessage(
          'Microphone access is required to listen to English lessons. Please allow microphone permissions in your browser.'
        );
      } else if (
        error.name === 'NotFoundError' ||
        error.name === 'DevicesNotFoundError'
      ) {
        setErrorMessage(
          'No microphone detected. Please connect an audio input device.'
        );
      } else {
        setErrorMessage(
          error.message || 'Failed to start Gemini Live transcription session.'
        );
      }
    }
  };

  /**
   * Stop recording action
   */
  const handleStopRecording = () => {
    speechToTextService.stop();

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setAudioLevel(0);
    setState('completed');
  };

  /**
   * Reset entire lesson workspace
   */
  const handleReset = () => {
    stopAudioPipeline();
    resetLesson();
    setState('idle');
    setErrorMessage(null);
    setRecordingDuration(0);
    setAudioLevel(0);
  };

  /**
   * Handle selecting a quick curriculum sample prompt
   */
  const handleSelectQuickPrompt = (prompt: string, sampleTopic?: string) => {
    if (state === 'recording') {
      stopAudioPipeline();
    }
    setDirectSentence(prompt, sampleTopic);
    setState('idle');
    setErrorMessage(null);
    setRecordingDuration(0);
    triggerSentenceAnalysis(prompt);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 relative selection:bg-slate-200 font-sans overflow-x-hidden">
      {/* Top Navigation */}
      <Navbar
        onContactClick={() => setActiveModal('contact')}
        onDashboardClick={() => setActiveModal('dashboard')}
      />

      {/* Main 3-Panel Learning Workspace */}
      <SpeechWorkspace
        state={state}
        finalizedSentence={finalizedTranscript}
        interimSentence={interimTranscript}
        topic={topic}
        tamilMeaning={tamilMeaning}
        tanglishMeaning={tanglishMeaning}
        vocabulary={vocabulary}
        selectedWord={selectedWord}
        selectedWordId={selectedWordId}
        preservedKeywords={preservedKeywords}
        glossaryMatches={glossaryMatches}
        onSelectWord={selectWord}
        recordingDuration={recordingDuration}
        audioLevel={audioLevel}
        errorMessage={errorMessage}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onReset={handleReset}
        onRetry={handleStartRecording}
        onSelectQuickPrompt={handleSelectQuickPrompt}
      />

      {/* Minimal Bottom Educational Brand Line */}
      <footer className="w-full py-2.5 text-center text-[11.5px] text-slate-400 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 border-t border-slate-200/60 mt-auto shrink-0">
        <span className="flex items-center gap-1.5 font-medium text-slate-600">
          <GraduationCap className="w-3.5 h-3.5 text-slate-800" />
          <span>Vaani Education AI</span>
        </span>
        <span aria-hidden="true" className="hidden sm:inline">•</span>
        <span>Listen in English, Understand in Tamil</span>
        <span aria-hidden="true" className="hidden sm:inline">•</span>
        <span>Gemini Live Real-Time Transcription</span>
      </footer>

      {/* Modals for Dashboard and Contact */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-[#e2e8f0] relative animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              aria-label="Close dialog"
              className="absolute top-5 right-5 p-1 text-[#64748b] hover:text-[#0f172a] rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {activeModal === 'dashboard' ? (
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-[#0f172a] text-white flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[18px] font-semibold text-[#0f172a]">
                    Vaani Classroom Dashboard
                  </h3>
                  <p className="text-[14px] text-[#64748b] mt-1.5 leading-relaxed">
                    Access school curriculum modules, Tamil-English vocabulary
                    progress, and teacher speech analytics.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="w-full py-2.5 bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-full text-[14px] font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[18px] font-semibold text-[#0f172a]">
                    Connect with Vaani Education
                  </h3>
                  <p className="text-[14px] text-[#64748b] mt-1.5 leading-relaxed">
                    Collaborate with us to bring real-time Tamil speech-to-learning
                    into government and matriculation classrooms across Tamil Nadu.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="w-full py-2.5 bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-full text-[14px] font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
