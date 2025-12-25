'use client';

import React, { useState } from 'react';
import { useSchedulerMachine } from './useSchedulerMachine';
import { ConversationContainer } from './components/ConversationContainer';
import {
  NameInput,
  HoursInput,
  ShiftDefiner,
  RoleInput,
  StaffCountInput,
  CoverageInput
} from './components/InputWidgets';
import { ScheduleResult } from './components/ScheduleResult';
import { generateSchedule, GeneratedSchedule } from './scheduler';
import { OperatingHours, ShiftDefinition, Role, StaffCount, CoverageMatrix } from './types';

export default function SchedulerPage() {
  const { state, addMessage, updateData, nextStep, reset, isLoaded } = useSchedulerMachine();
  const [schedule, setSchedule] = useState<GeneratedSchedule | null>(null);

  // Effect to trigger Bot questions when entering a new step
  // We use a ref or flag to prevent double-firing if strict mode is on, though unique IDs in history help.
  // Actually, simpler: The step determines the "Active Widget". The "Bot Question" should have been added *before* the state transition or *during* it.
  // In `useSchedulerMachine`, the history persists.
  // Let's handle the "Next Question" logic in the onComplete handlers to keep it predictable.

  if (!isLoaded) return null; // or loading spinner

  const handleNameComplete = (name: string) => {
    addMessage(name, 'user');
    updateData({ businessName: name });
    setTimeout(() => {
      addMessage(`Great, ${name}. What are your operating hours?`);
      nextStep('HOURS');
    }, 500);
  };

  const handleHoursComplete = (hours: OperatingHours) => {
    const formatTime = (t: {start:string, end:string}) => `${t.start}-${t.end}`;
    addMessage(
      <div className="text-xs space-y-1">
        <div>Weekdays: {formatTime(hours.weekdays)}</div>
        <div>Weekends: {formatTime(hours.weekends)}</div>
      </div>,
      'user'
    );
    updateData({ operatingHours: hours });
    setTimeout(() => {
      addMessage("I've analyzed your hours. Here are some suggested shifts. Feel free to adjust them.");
      nextStep('SHIFTS');
    }, 500);
  };

  const handleShiftsComplete = (shifts: ShiftDefinition[]) => {
    addMessage(
      <div className="flex flex-wrap gap-1">
        {shifts.map(s => <span key={s.id} className="bg-neutral-800 px-2 py-0.5 rounded text-[10px]">{s.name}</span>)}
      </div>,
      'user'
    );
    updateData({ shifts });
    setTimeout(() => {
      addMessage("Got it. Now, what roles do you need to schedule? (e.g. Server, Cook)");
      nextStep('ROLES');
    }, 500);
  };

  const handleRolesComplete = (roles: Role[]) => {
    addMessage(roles.map(r => r.name).join(', '), 'user');
    updateData({ roles });
    setTimeout(() => {
      addMessage("How many employees do you have for each role?");
      nextStep('STAFFING');
    }, 500);
  };

  const handleStaffingComplete = (counts: StaffCount[]) => {
    addMessage(
      <div className="space-y-1 text-xs">
        {counts.map(c => {
          const r = state.data.roles.find(x => x.id === c.roleId);
          return <div key={c.roleId}>{r?.name}: {c.count}</div>;
        })}
      </div>,
      'user'
    );
    updateData({ staffCounts: counts });
    setTimeout(() => {
      addMessage("Almost there. How many people do you need per role, for each shift?");
      nextStep('COVERAGE');
    }, 500);
  };

  const handleCoverageComplete = (matrix: CoverageMatrix) => {
    addMessage("Coverage requirements set.", 'user');
    updateData({ coverage: matrix });

    setTimeout(() => {
      addMessage("Perfect. I'm generating your optimal schedule now...");
      nextStep('GENERATING');

      // Simulate think time then generate
      setTimeout(() => {
        const result = generateSchedule({ ...state.data, coverage: matrix });
        setSchedule(result);
        nextStep('FINISHED');
      }, 1500);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center p-4 md:p-8 font-sans">
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-sm border border-neutral-200 min-h-[600px] h-[85vh] flex flex-col overflow-hidden relative">

        {/* Header */}
        <header className="p-4 border-b border-neutral-100 bg-white z-10 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Scheduler</h1>
            <p className="text-sm text-neutral-500">Minimalist Chat-First Scheduler</p>
          </div>
          {state.currentStep === 'FINISHED' && (
             <button onClick={reset} className="text-xs text-neutral-400 hover:text-neutral-900 underline">
               New Schedule
             </button>
          )}
        </header>

        {/* Main Content */}
        {state.currentStep === 'FINISHED' && schedule ? (
          <main className="flex-1 overflow-y-auto p-6">
             <ScheduleResult schedule={schedule} data={state.data} onReset={reset} />
          </main>
        ) : (
          <ConversationContainer messages={state.history}>
            {state.currentStep === 'INTRO' && <NameInput onComplete={handleNameComplete} />}
            {state.currentStep === 'HOURS' && <HoursInput initial={state.data.operatingHours} onComplete={handleHoursComplete} />}
            {state.currentStep === 'SHIFTS' && <ShiftDefiner hours={state.data.operatingHours} onComplete={handleShiftsComplete} />}
            {state.currentStep === 'ROLES' && <RoleInput onComplete={handleRolesComplete} />}
            {state.currentStep === 'STAFFING' && <StaffCountInput roles={state.data.roles} onComplete={handleStaffingComplete} />}
            {state.currentStep === 'COVERAGE' && <CoverageInput shifts={state.data.shifts} roles={state.data.roles} onComplete={handleCoverageComplete} />}
            {state.currentStep === 'GENERATING' && (
              <div className="flex items-center gap-2 text-neutral-400 text-sm animate-pulse">
                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce delay-75" />
                <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce delay-150" />
              </div>
            )}
          </ConversationContainer>
        )}
      </div>
    </div>
  );
}
