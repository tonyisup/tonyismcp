'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Palette, Brush, Monitor, Terminal } from 'lucide-react';

type AppMode = 'Paint' | 'ToolSelect';
type BrushColor = 'red' | 'blue' | 'green' | 'yellow' | 'black';

interface AppState {
  color: BrushColor;
  brushSize: number;
  mode: AppMode;
  lastAction: string | null;
}

interface LogEntry {
  id: string;
  timestamp: number;
  text: string;
  type: 'transcript' | 'intent';
  data?: unknown;
}

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: ErrorEvent) => void;
  onend: () => void;
}

export default function VoicePrototype() {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [appState, setAppState] = useState<AppState>({
    color: 'black',
    brushSize: 10,
    mode: 'Paint',
    lastAction: null,
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Helper to add logs - wrapped in useCallback, though state setters are stable.
  const addLog = useCallback((text: string, type: 'transcript' | 'intent', data?: unknown) => {
    setLogs(prev => {
      const newLog = {
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        text,
        type,
        data
      };
      // Keep last 10 items (5 transcripts + 5 intents approx, giving a buffer)
      return [newLog, ...prev].slice(0, 20);
    });
  }, []);

  const processIntent = useCallback((transcript: string) => {
    const text = transcript.toLowerCase();
    let intentFound = false;

    // ChangeColor
    const colors: BrushColor[] = ['red', 'blue', 'green', 'yellow'];
    for (const color of colors) {
      if (text.includes(color)) {
        setAppState(prev => ({ ...prev, color, lastAction: `Changed color to ${color}` }));
        addLog(`ChangeColor: ${color}`, 'intent', { color });
        intentFound = true;
        break;
      }
    }

    if (!intentFound) {
      // AdjustBrushSize
      if (text.includes('bigger') || text.includes('increase size') || text.includes('thicker')) {
        setAppState(prev => ({
          ...prev,
          brushSize: Math.min(prev.brushSize + 5, 50),
          lastAction: 'Increased brush size'
        }));
        addLog('AdjustBrushSize: bigger', 'intent', { direction: 'bigger' });
        intentFound = true;
      } else if (text.includes('smaller') || text.includes('thinner') || text.includes('decrease size')) {
        setAppState(prev => ({
          ...prev,
          brushSize: Math.max(prev.brushSize - 5, 1),
          lastAction: 'Decreased brush size'
        }));
        addLog('AdjustBrushSize: smaller', 'intent', { direction: 'smaller' });
        intentFound = true;
      }
    }

    if (!intentFound) {
      // Undo
      if (text.includes('undo') || text.includes('go back')) {
        setAppState(prev => ({ ...prev, lastAction: 'Undo triggered' }));
        addLog('Undo', 'intent');
        intentFound = true;
      }
    }

    if (!intentFound) {
      // EnterToolMode
      if (text.includes('tool mode') || text.includes('select tools')) {
        setAppState(prev => ({ ...prev, mode: 'ToolSelect', lastAction: 'Entered Tool Mode' }));
        addLog('EnterToolMode', 'intent');
        intentFound = true;
      }
    }

    if (!intentFound) {
      // ExitToolMode
      if (text.includes('resume painting') || text.includes('paint mode')) {
        setAppState(prev => ({ ...prev, mode: 'Paint', lastAction: 'Resumed Painting' }));
        addLog('ExitToolMode', 'intent');
        intentFound = true;
      }
    }

    if (!intentFound) {
      addLog('No matching intent found', 'intent', { parsed: false });
    }
  }, [addLog]);

  useEffect(() => {
    // Initialize Speech Recognition
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const lastResultIndex = event.results.length - 1;
          const transcript = event.results[lastResultIndex][0].transcript;

          addLog(transcript, 'transcript');
          processIntent(transcript);
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setError(`Error: ${event.error}`);
          setIsListening(false);
        };

        recognition.onend = () => {
          // Update state to reflect it stopped
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setError("Web Speech API not supported in this browser.");
      }
    }

    // Cleanup function to abort recognition on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [processIntent, addLog]); // Dependencies are stable (useCallback)

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      // State update happens in onend, but we can optimistically set it here too if we want immediate feedback,
      // though sticking to source of truth (onend) is safer.
      // However, for better UX responsiveness:
      setIsListening(false);
    } else {
      setError(null);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const transcripts = logs.filter(l => l.type === 'transcript').slice(0, 5);
  const intents = logs.filter(l => l.type === 'intent').slice(0, 5);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Voice Command Prototype</h1>
            <p className="text-neutral-400">Control the app state using your voice.</p>
          </div>
          <button
            onClick={toggleListening}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
              isListening
                ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 ring-1 ring-red-500/50'
                : 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400'
            }`}
          >
            {isListening ? <><MicOff size={20} /> Stop Listening</> : <><Mic size={20} /> Start Listening</>}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-800/50 text-red-200 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* App State Visualization */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-neutral-300">
              <Monitor size={20} /> App State
            </h2>

            <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800 space-y-6">

              {/* Mode */}
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Current Mode</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  appState.mode === 'Paint' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                }`}>
                  {appState.mode}
                </span>
              </div>

              {/* Color */}
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 flex items-center gap-2"><Palette size={16} /> Color</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border border-white/20"
                    style={{ backgroundColor: appState.color }}
                  />
                  <span className="capitalize">{appState.color}</span>
                </div>
              </div>

              {/* Brush Size */}
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 flex items-center gap-2"><Brush size={16} /> Size</span>
                <div className="flex items-center gap-3">
                  <div className="h-1 bg-neutral-700 w-24 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neutral-100 transition-all duration-300"
                      style={{ width: `${(appState.brushSize / 50) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right font-mono">{appState.brushSize}</span>
                </div>
              </div>

              {/* Last Action Feedback */}
              <div className="pt-4 border-t border-neutral-800">
                <span className="text-xs uppercase tracking-wider text-neutral-500">Last Action</span>
                <div className="mt-2 text-lg font-medium text-white">
                  {appState.lastAction || <span className="text-neutral-600 italic">Waiting for command...</span>}
                </div>
              </div>

            </div>

            {/* Hint Card */}
            <div className="bg-neutral-900/50 rounded-xl p-6 border border-neutral-800/50 text-sm text-neutral-400">
              <h3 className="font-semibold text-neutral-300 mb-2">Try saying:</h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>&quot;Change color to red&quot;</li>
                <li>&quot;Make brush bigger&quot;</li>
                <li>&quot;Undo that&quot;</li>
                <li>&quot;Switch to tool mode&quot;</li>
              </ul>
            </div>
          </div>

          {/* Debug Console */}
          <div className="space-y-6">
             <h2 className="text-xl font-semibold flex items-center gap-2 text-neutral-300">
              <Terminal size={20} /> Recognition Log
            </h2>

            <div className="space-y-4">
              {/* Transcripts */}
              <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
                <div className="bg-neutral-800/50 px-4 py-2 border-b border-neutral-800 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Raw Transcripts
                </div>
                <div className="p-4 space-y-3 min-h-[160px]">
                  {transcripts.length === 0 && (
                    <div className="text-neutral-600 italic text-center py-4">No speech detected yet</div>
                  )}
                  {transcripts.map((log) => (
                    <div key={log.id} className="text-sm border-l-2 border-blue-500/50 pl-3 py-1">
                      <span className="text-neutral-500 text-xs block mb-0.5">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="text-neutral-200">&quot;{log.text}&quot;</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Intents */}
              <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
                <div className="bg-neutral-800/50 px-4 py-2 border-b border-neutral-800 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Parsed Intents
                </div>
                <div className="p-4 space-y-3 min-h-[160px]">
                  {intents.length === 0 && (
                    <div className="text-neutral-600 italic text-center py-4">No commands recognized yet</div>
                  )}
                  {intents.map((log) => (
                    <div key={log.id} className="text-sm font-mono border-l-2 border-green-500/50 pl-3 py-1">
                      <div className="flex justify-between items-start">
                        <span className="text-green-400 font-bold">{log.text}</span>
                        <span className="text-neutral-600 text-xs">
                           {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      {log.data && (
                        <div className="text-neutral-500 text-xs mt-1">
                          {JSON.stringify(log.data)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
