import { SchedulerData } from './types';

export interface AssignedShift {
  shiftId: string;
  roleId: string;
  employeeId: string;
  employeeName: string;
}

export interface DailySchedule {
  day: string; // "Monday", etc.
  assignments: AssignedShift[];
}

export type GeneratedSchedule = DailySchedule[];

export function generateSchedule(data: SchedulerData): GeneratedSchedule {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // 1. Expand Employees
  const employees: { id: string; name: string; roleId: string; shiftsAssigned: number }[] = [];
  data.roles.forEach(role => {
    const count = data.staffCounts.find(c => c.roleId === role.id)?.count || 0;
    for (let i = 1; i <= count; i++) {
      employees.push({
        id: `${role.id}-${i}`,
        name: `${role.name} ${i}`,
        roleId: role.id,
        shiftsAssigned: 0,
      });
    }
  });

  const schedule: GeneratedSchedule = [];

  // 2. Iterate Days
  days.forEach(day => {
    const dailyAssignments: AssignedShift[] = [];

    // Track who is working today to prevent double shifts (basic rule)
    const workingToday = new Set<string>();

    // 3. Iterate Shifts
    data.shifts.forEach(shift => {
      // 4. Iterate Roles needed for this shift
      data.roles.forEach(role => {
        // How many needed?
        // logic: coverage[shiftId][roleId] -> number
        const needed = (data.coverage[shift.id] && data.coverage[shift.id][role.id])
          ? data.coverage[shift.id][role.id]
          : 1; // Default to 1 if not specified (though UI defaults to 1)

        let assignedCount = 0;

        // 5. Find candidates
        // Filter by role, not working today
        const candidates = employees.filter(e =>
          e.roleId === role.id &&
          !workingToday.has(e.id)
        );

        // 6. Sort by fairness (shiftsAssigned asc)
        candidates.sort((a, b) => a.shiftsAssigned - b.shiftsAssigned);

        // 7. Assign
        for (const candidate of candidates) {
          if (assignedCount >= needed) break;

          dailyAssignments.push({
            shiftId: shift.id,
            roleId: role.id,
            employeeId: candidate.id,
            employeeName: candidate.name,
          });

          workingToday.add(candidate.id);
          candidate.shiftsAssigned++;
          assignedCount++;
        }
      });
    });

    schedule.push({
      day,
      assignments: dailyAssignments
    });
  });

  return schedule;
}
