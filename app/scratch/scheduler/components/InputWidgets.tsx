import React, { useState } from 'react';
import { OperatingHours, ShiftDefinition, Role, StaffCount, CoverageMatrix } from '../types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, Clock } from 'lucide-react';

// --- Shared UI ---

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide block mb-1.5">{children}</label>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}

// --- 1. Business Name Input ---

export function NameInput({ onComplete }: { onComplete: (name: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <div className="flex gap-2 bg-white p-2 rounded-xl border border-neutral-200 shadow-sm">
      <Input
        autoFocus
        placeholder="e.g. Joe's Diner"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && value && onComplete(value)}
      />
      <Button onClick={() => onComplete(value)} disabled={!value} size="sm">
        Next
      </Button>
    </div>
  );
}

// --- 2. Operating Hours Input ---

export function HoursInput({ initial, onComplete }: { initial: OperatingHours, onComplete: (h: OperatingHours) => void }) {
  const [hours, setHours] = useState(initial);

  return (
    <Card className="p-4 w-full bg-white shadow-sm border-neutral-200 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Weekdays Open</Label>
          <Input
            type="time"
            value={hours.weekdays.start}
            onChange={e => setHours({...hours, weekdays: {...hours.weekdays, start: e.target.value}})}
          />
        </div>
        <div>
          <Label>Weekdays Close</Label>
          <Input
            type="time"
            value={hours.weekdays.end}
            onChange={e => setHours({...hours, weekdays: {...hours.weekdays, end: e.target.value}})}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Weekends Open</Label>
          <Input
            type="time"
            value={hours.weekends.start}
            onChange={e => setHours({...hours, weekends: {...hours.weekends, start: e.target.value}})}
          />
        </div>
        <div>
          <Label>Weekends Close</Label>
          <Input
            type="time"
            value={hours.weekends.end}
            onChange={e => setHours({...hours, weekends: {...hours.weekends, end: e.target.value}})}
          />
        </div>
      </div>
      <Button className="w-full" onClick={() => onComplete(hours)}>Confirm Hours</Button>
    </Card>
  );
}

// --- 3. Shift Definitions ---

export function ShiftDefiner({
  hours,
  onComplete
}: {
  hours: OperatingHours,
  onComplete: (shifts: ShiftDefinition[]) => void
}) {
  const [shifts, setShifts] = useState<ShiftDefinition[]>([
    { id: '1', name: 'Morning', start: hours.weekdays.start, end: '14:00' },
    { id: '2', name: 'Evening', start: '14:00', end: hours.weekdays.end },
  ]);

  const addShift = () => {
    const id = Math.random().toString(36).substr(2, 9);
    setShifts([...shifts, { id, name: 'New Shift', start: '09:00', end: '17:00' }]);
  };

  const removeShift = (id: string) => {
    setShifts(shifts.filter(s => s.id !== id));
  };

  const updateShift = (id: string, field: keyof ShiftDefinition, val: string) => {
    setShifts(shifts.map(s => s.id === id ? { ...s, [field]: val } : s));
  };

  return (
    <div className="space-y-3 w-full">
      {shifts.map((shift) => (
        <div key={shift.id} className="flex gap-2 items-center bg-white p-2 rounded-lg border border-neutral-200">
           <Input
             className="w-1/3"
             value={shift.name}
             onChange={e => updateShift(shift.id, 'name', e.target.value)}
             placeholder="Name"
           />
           <Input
             className="w-1/4"
             type="time"
             value={shift.start}
             onChange={e => updateShift(shift.id, 'start', e.target.value)}
           />
           <span className="text-neutral-400">-</span>
           <Input
             className="w-1/4"
             type="time"
             value={shift.end}
             onChange={e => updateShift(shift.id, 'end', e.target.value)}
           />
           <Button variant="ghost" size="icon" onClick={() => removeShift(shift.id)}>
             <Trash2 className="w-4 h-4 text-neutral-400 hover:text-red-500" />
           </Button>
        </div>
      ))}
      <div className="flex gap-2">
        <Button variant="outline" onClick={addShift} className="flex-1">
          <Plus className="w-4 h-4 mr-2" /> Add Shift
        </Button>
        <Button onClick={() => onComplete(shifts)} className="flex-1">
          Done
        </Button>
      </div>
    </div>
  );
}

// --- 4. Role Definitions ---

export function RoleInput({ onComplete }: { onComplete: (roles: Role[]) => void }) {
  const [roles, setRoles] = useState<Role[]>([
    { id: '1', name: 'Server' },
    { id: '2', name: 'Cook' }
  ]);
  const [newRole, setNewRole] = useState('');

  const addRole = () => {
    if (!newRole) return;
    setRoles([...roles, { id: Math.random().toString(36).substr(2, 9), name: newRole }]);
    setNewRole('');
  };

  return (
    <Card className="p-4 w-full bg-white shadow-sm border-neutral-200 space-y-4">
      <div className="flex flex-wrap gap-2">
        {roles.map(r => (
          <div key={r.id} className="bg-neutral-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
            {r.name}
            <button onClick={() => setRoles(roles.filter(x => x.id !== r.id))} className="text-neutral-400 hover:text-neutral-600">×</button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={newRole}
          onChange={e => setNewRole(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addRole()}
          placeholder="Add role (e.g. Bartender)"
        />
        <Button variant="outline" onClick={addRole} disabled={!newRole}><Plus className="w-4 h-4" /></Button>
      </div>
      <Button className="w-full" onClick={() => onComplete(roles)} disabled={roles.length === 0}>
        Confirm Roles
      </Button>
    </Card>
  );
}

// --- 5. Staff Counts ---

export function StaffCountInput({ roles, onComplete }: { roles: Role[], onComplete: (counts: StaffCount[]) => void }) {
  const [counts, setCounts] = useState<Record<string, number>>(
    roles.reduce((acc, r) => ({ ...acc, [r.id]: 2 }), {})
  );

  const handleSubmit = () => {
    const result = Object.entries(counts).map(([roleId, count]) => ({ roleId, count }));
    onComplete(result);
  };

  return (
    <Card className="p-4 w-full bg-white shadow-sm border-neutral-200 space-y-4">
      {roles.map(role => (
        <div key={role.id} className="flex items-center justify-between">
          <span className="text-sm font-medium">{role.name}s</span>
          <div className="flex items-center gap-3">
             <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCounts(c => ({ ...c, [role.id]: Math.max(0, c[role.id] - 1) }))}>-</Button>
             <span className="w-8 text-center">{counts[role.id]}</span>
             <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCounts(c => ({ ...c, [role.id]: c[role.id] + 1 }))}>+</Button>
          </div>
        </div>
      ))}
      <Button className="w-full" onClick={handleSubmit}>Next</Button>
    </Card>
  );
}

// --- 6. Coverage Matrix ---

export function CoverageInput({
  shifts,
  roles,
  onComplete
}: {
  shifts: ShiftDefinition[],
  roles: Role[],
  onComplete: (matrix: CoverageMatrix) => void
}) {
  // shiftId -> roleId -> count
  const [matrix, setMatrix] = useState<CoverageMatrix>({});

  const update = (shiftId: string, roleId: string, delta: number) => {
    setMatrix(prev => {
      const shiftData = prev[shiftId] || {};
      const current = shiftData[roleId] || 1; // Default to 1 needed
      return {
        ...prev,
        [shiftId]: {
          ...shiftData,
          [roleId]: Math.max(0, current + delta)
        }
      };
    });
  };

  const getVal = (s: string, r: string) => (matrix[s] && matrix[s][r] !== undefined) ? matrix[s][r] : 1;

  return (
    <div className="space-y-4 w-full">
      {shifts.map(shift => (
        <Card key={shift.id} className="p-4 bg-white border-neutral-200">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-neutral-400" />
            <h3 className="font-medium text-sm">{shift.name} ({shift.start} - {shift.end})</h3>
          </div>
          <div className="space-y-3">
            {roles.map(role => (
              <div key={role.id} className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">{role.name}s needed:</span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => update(shift.id, role.id, -1)}>-</Button>
                  <span className="w-4 text-center font-medium">{getVal(shift.id, role.id)}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => update(shift.id, role.id, 1)}>+</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
      <Button className="w-full" onClick={() => onComplete(matrix)}>Generate Schedule</Button>
    </div>
  );
}
