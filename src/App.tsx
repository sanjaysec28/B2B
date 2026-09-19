/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RecordingState, LessonSegment, ImportantWord } from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { SpeechWorkspace } from './components/SpeechWorkspace.tsx';
import { learningService, SAMPLE_LESSONS } from './services/learningService.ts';
import { X, CheckCircle2, GraduationCap, Sparkles } from 'lucide-react';

export default function App() {
  // Primary lesson state: defaults to first real-life classroom scenario
  const [currentLesson, setCurrentLesson] = useState<LessonSegment>(SAMPLE_LESSONS[0]);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(
    SAMPLE_LESSONS[0].importantWords[0]?.id || null
  );

  const [state, setState] = useState<RecordingState>('idle');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<'contact' | 'dashboard' | null>(null);

  // Audio recording references
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Stop audio streams & cleanup
  const stopAudioStreams = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  useEffect(() => {
    return () => {
      stopAudioStreams();
    };
  }, [stopAudioStreams]);

  // Audio visualizer loop for responsive frequency levels
  const startAudioVisualizer = (stream: MediaStream) => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(1, Math.max(0, avg / 128));
        setAudioLevel(normalized);

        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch {
      // Gentle subtle simulated wave fallback
      const simulatedWave = () => {
        setAudioLevel(0.3 + Math.sin(Date.now() / 200) * 0.25);
        animationFrameRef.current = requestAnimationFrame(simulatedWave);
      };
      simulatedWave();
    }
  };

  // Start recording action
  const handleStartRecording = async () => {
    setErrorMessage(null);

    if (!navigator?.mediaDevices?.getUserMedia) {
      setState('error');
      setErrorMessage(
        'Microphone access is not supported by your browser environment.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      audioChunksRef.current = [];

      let mimeType = 'audio/webm';
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        }
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });

        // Set state to "Understanding..." processing state
        setState('processing');

        try {
          // Process audio through the learning pipeline
          const nextLesson = await learningService.processAudioLesson(audioBlob);
          setCurrentLesson(nextLesson);
          setSelectedWordId(nextLesson.importantWords[0]?.id || null);
          setState('completed');
        } catch {
          setState('error');
          setErrorMessage('Failed to process classroom audio. Please try again.');
        }
      };

      recorder.start(250);
      setState('recording');
      setRecordingDuration(0);

      // Start duration counter
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      startAudioVisualizer(stream);
    } catch (err: unknown) {
      stopAudioStreams();
      setState('error');

      const error = err as { name?: string; message?: string };
      if (
        error.name === 'NotAllowedError' ||
        error.name === 'PermissionDeniedError'
      ) {
        setErrorMessage(
          'Microphone access is required to listen to English lessons. Please allow microphone permissions.'
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
          error.message || 'Microphone access is required to listen to lessons.'
        );
      }
    }
  };

  // Stop recording action
  const handleStopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
    }
    stopAudioStreams();
  };

  // Reset lesson state
  const handleReset = () => {
    stopAudioStreams();
    setCurrentLesson(SAMPLE_LESSONS[0]);
    setSelectedWordId(SAMPLE_LESSONS[0].importantWords[0]?.id || null);
    setState('idle');
    setErrorMessage(null);
    setRecordingDuration(0);
  };

  // Switch between lesson scenarios
  const handleSwitchLesson = (index: number) => {
    const lesson = learningService.getLessonByIndex(index);
    setCurrentLesson(lesson);
    setSelectedWordId(lesson.importantWords[0]?.id || null);
    setState('idle');
    setErrorMessage(null);
  };

  // Selected word reference
  const selectedWord: ImportantWord | null =
    currentLesson?.importantWords.find((w) => w.id === selectedWordId) ||
    currentLesson?.importantWords[0] ||
    null;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 relative selection:bg-slate-200 font-sans">
      {/* Top Navigation */}
      <Navbar
        onContactClick={() => setActiveModal('contact')}
        onDashboardClick={() => setActiveModal('dashboard')}
      />

      {/* Main 3-Panel Learning Workspace */}
      <SpeechWorkspace
        state={state}
        currentLesson={currentLesson}
        selectedWord={selectedWord}
        selectedWordId={selectedWordId}
        onSelectWord={setSelectedWordId}
        recordingDuration={recordingDuration}
        audioLevel={audioLevel}
        errorMessage={errorMessage}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onReset={handleReset}
        onRetry={handleStartRecording}
        onSwitchLesson={handleSwitchLesson}
        allLessons={SAMPLE_LESSONS}
      />

      {/* Minimal Bottom Educational Brand Line */}
      <footer className="w-full py-4 text-center text-[12px] text-slate-400 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 border-t border-slate-200/60 mt-auto">
        <span className="flex items-center gap-1.5 font-medium text-slate-600">
          <GraduationCap className="w-3.5 h-3.5 text-slate-800" />
          <span>Vaani Education AI</span>
        </span>
        <span aria-hidden="true" className="hidden sm:inline">•</span>
        <span>Listen in English, Understand in Tamil</span>
        <span aria-hidden="true" className="hidden sm:inline">•</span>
        <span>Tamil-Medium Classroom Companion</span>
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
