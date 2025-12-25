import { useState, useEffect, useCallback } from 'react';
import { SchedulerState, Step, SchedulerData } from './types';

const STORAGE_KEY = 'scheduler_state_v1';

const INITIAL_DATA: SchedulerData = {
  businessName: '',
  operatingHours: {
    weekdays: { start: '09:00', end: '17:00' },
    weekends: { start: '10:00', end: '16:00' },
  },
  shifts: [],
  roles: [],
  staffCounts: [],
  coverage: {},
};

const INITIAL_STATE: SchedulerState = {
  currentStep: 'INTRO',
  data: INITIAL_DATA,
  history: [
    {
      id: 'welcome',
      sender: 'bot',
      content: "Hello! Let's build your weekly schedule. To start, what is your business name?",
      timestamp: Date.now(),
    },
  ],
};

export function useSchedulerMachine() {
  const [state, setState] = useState<SchedulerState>(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(parsed);
      } catch (e) {
        console.error('Failed to load scheduler state', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isLoaded]);

  const addMessage = useCallback((content: React.ReactNode, sender: 'user' | 'bot' = 'bot') => {
    setState(prev => ({
      ...prev,
      history: [
        ...prev.history,
        {
          id: Math.random().toString(36).substring(7),
          sender,
          content,
          timestamp: Date.now(),
        },
      ],
    }));
  }, []);

  const updateData = useCallback((updates: Partial<SchedulerData>) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, ...updates },
    }));
  }, []);

  const nextStep = useCallback((next: Step) => {
    setState(prev => ({
      ...prev,
      currentStep: next,
    }));
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    state,
    addMessage,
    updateData,
    nextStep,
    reset,
    isLoaded,
  };
}
