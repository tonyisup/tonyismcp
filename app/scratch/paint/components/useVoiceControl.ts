import { useState, useEffect, useRef, useCallback } from 'react';
import { Action } from '../types';

// Type definitions for Web Speech API (Simplified)
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

export function useVoiceControl(dispatch: React.Dispatch<Action>) {
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const processIntent = useCallback((transcript: string) => {
    const text = transcript.toLowerCase();

    // Change Color
    if (text.includes('red')) dispatch({ type: 'SELECT_COLOR', payload: 'red', source: 'voice' });
    else if (text.includes('blue')) dispatch({ type: 'SELECT_COLOR', payload: 'blue', source: 'voice' });
    else if (text.includes('green')) dispatch({ type: 'SELECT_COLOR', payload: 'green', source: 'voice' });
    else if (text.includes('yellow')) dispatch({ type: 'SELECT_COLOR', payload: 'yellow', source: 'voice' });
    else if (text.includes('black')) dispatch({ type: 'SELECT_COLOR', payload: 'black', source: 'voice' });
    else if (text.includes('white')) dispatch({ type: 'SELECT_COLOR', payload: 'white', source: 'voice' });

    // Brush Size
    else if (text.includes('bigger') || text.includes('increase') || text.includes('larger')) {
        dispatch({ type: 'ADJUST_BRUSH_SIZE', payload: 'increase', source: 'voice' });
    }
    else if (text.includes('smaller') || text.includes('decrease') || text.includes('thinner')) {
        dispatch({ type: 'ADJUST_BRUSH_SIZE', payload: 'decrease', source: 'voice' });
    }

    // Tools
    else if (text.includes('eraser')) dispatch({ type: 'SELECT_TOOL', payload: 'eraser', source: 'voice' });
    else if (text.includes('brush') || text.includes('pen')) dispatch({ type: 'SELECT_TOOL', payload: 'brush', source: 'voice' });

    // Actions
    else if (text.includes('undo')) dispatch({ type: 'UNDO', source: 'voice' });
    else if (text.includes('clear') || text.includes('trash')) dispatch({ type: 'CLEAR', source: 'voice' });

    // Modes
    else if (text.includes('tool mode') || text.includes('select tool') || text.includes('menu')) {
        dispatch({ type: 'SET_MODE', payload: 'ToolSelect', source: 'voice' });
    }
    else if (text.includes('paint') || text.includes('draw') || text.includes('resume')) {
        dispatch({ type: 'SET_MODE', payload: 'Paint', source: 'voice' });
    }

  }, [dispatch]);

  useEffect(() => {
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
          setLastTranscript(transcript);
          processIntent(transcript);
        };

        recognition.onend = () => {
             // Auto-restart if we want continuous listening, but browsers might block it.
             // For now, let's just update state.
             setIsListening(false);
        };

        recognitionRef.current = recognition;

        // Auto-start for prototype convenience
        try {
            recognition.start();
            setIsListening(true);
        } catch(e) {
            console.warn("Auto-start voice failed", e);
        }
      }
    }

    return () => {
      recognitionRef.current?.abort();
    };
  }, [processIntent]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;
    if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
    } else {
        try {
            recognitionRef.current.start();
            setIsListening(true);
        } catch(e) {
            console.error(e);
        }
    }
  }, [isListening]);

  return { isListening, lastTranscript, toggleListening };
}
