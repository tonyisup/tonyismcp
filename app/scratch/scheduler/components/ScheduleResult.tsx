import React from 'react';
import { GeneratedSchedule } from '../scheduler';
import { SchedulerData } from '../types';
import { Button } from '@/components/ui/button';
import { Copy, Printer } from 'lucide-react';

// NOTE: AssignedShift and GeneratedSchedule are currently in scheduler.ts.
// I should move them to types.ts to avoid circular deps if I used types inside scheduler.
// For now, I'll assume they are exported from scheduler.ts and I can import them.
// Wait, I didn't export them from types.ts, I defined them in scheduler.ts.
// Let's import them from '../scheduler'.

interface ScheduleResultProps {
  schedule: GeneratedSchedule;
  data: SchedulerData;
  onReset: () => void;
}

export function ScheduleResult({ schedule, data, onReset }: ScheduleResultProps) {

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    // Generate text representation
    let text = `Schedule for ${data.businessName}\n\n`;
    schedule.forEach(day => {
      text += `--- ${day.day} ---\n`;
      const shifts = Array.from(new Set(day.assignments.map(a => a.shiftId)));
      shifts.forEach(shiftId => {
        const shiftName = data.shifts.find(s => s.id === shiftId)?.name || 'Shift';
        const workers = day.assignments
          .filter(a => a.shiftId === shiftId)
          .map(a => `${a.employeeName} (${data.roles.find(r => r.id === a.roleId)?.name})`)
          .join(', ');

        text += `${shiftName}: ${workers}\n`;
      });
      text += '\n';
    });

    navigator.clipboard.writeText(text);
    alert('Schedule copied to clipboard!');
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between no-print">
        <h2 className="text-2xl font-bold tracking-tight">Your Schedule</h2>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={handleCopy}>
             <Copy className="w-4 h-4 mr-2" /> Copy Text
           </Button>
           <Button variant="outline" size="sm" onClick={handlePrint}>
             <Printer className="w-4 h-4 mr-2" /> Print / PDF
           </Button>
        </div>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm print:border-black print:shadow-none">
         <div className="overflow-x-auto">
           <table className="w-full text-sm text-left">
             <thead className="bg-muted border-b border-border print:bg-white print:border-black">
               <tr>
                 <th className="p-4 font-semibold text-foreground w-32 border-r border-border">Shift</th>
                 {schedule.map(day => (
                   <th key={day.day} className="p-4 font-semibold text-foreground min-w-[140px]">
                     {day.day}
                   </th>
                 ))}
               </tr>
             </thead>
             <tbody className="divide-y divide-border">
               {data.shifts.map(shift => (
                 <tr key={shift.id}>
                   <td className="p-4 font-medium text-muted-foreground bg-muted/50 border-r border-border print:text-black">
                     <div className="text-foreground">{shift.name}</div>
                     <div className="text-xs">{shift.start} - {shift.end}</div>
                   </td>
                   {schedule.map(day => {
                     const assignments = day.assignments.filter(a => a.shiftId === shift.id);
                     return (
                       <td key={day.day + shift.id} className="p-4 align-top">
                         {assignments.length === 0 ? (
                           <span className="text-muted-foreground/30 italic text-xs">Empty</span>
                         ) : (
                           <div className="space-y-1">
                             {assignments.map((a, i) => (
                               <div key={i} className="flex flex-col">
                                 <span className="font-medium text-foreground">{a.employeeName}</span>
                                 <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                   {data.roles.find(r => r.id === a.roleId)?.name}
                                 </span>
                               </div>
                             ))}
                           </div>
                         )}
                       </td>
                     );
                   })}
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      </div>

      <div className="flex justify-center pt-8 no-print">
        <Button variant="ghost" onClick={onReset} className="text-muted-foreground hover:text-destructive">
          Start Over
        </Button>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .print-container { padding: 0; margin: 0; }
        }
      `}</style>
    </div>
  );
}
