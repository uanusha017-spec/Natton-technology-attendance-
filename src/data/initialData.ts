import { Employee, Holiday, LeaveRequest, AttendanceRecord, SystemEvent } from '../types/attendance';

// Zero dummy data: staff directory starts clean and is purely dynamic
export const INITIAL_EMPLOYEES: Employee[] = [];

// Official Company Holidays & Sunday Weekly Off Policy
export const INITIAL_HOLIDAYS: Holiday[] = [
  { id: 'HOL-01', name: "New Year's Day", date: `${new Date().getFullYear()}-01-01`, type: 'Public Holiday', isMandatory: true },
  { id: 'HOL-02', name: 'Republic Day', date: `${new Date().getFullYear()}-01-26`, type: 'National Holiday', isMandatory: true },
  { id: 'HOL-03', name: 'May Day', date: `${new Date().getFullYear()}-05-01`, type: 'Public Holiday', isMandatory: true },
  { id: 'HOL-04', name: 'Independence Day', date: `${new Date().getFullYear()}-08-15`, type: 'National Holiday', isMandatory: true },
  { id: 'HOL-05', name: 'Gandhi Jayanti', date: `${new Date().getFullYear()}-10-02`, type: 'National Holiday', isMandatory: true },
  { id: 'HOL-06', name: 'Natton Foundation Day', date: `${new Date().getFullYear()}-10-15`, type: 'Natton Company Holiday', isMandatory: true },
  { id: 'HOL-07', name: 'Karnataka Rajyotsava', date: `${new Date().getFullYear()}-11-01`, type: 'Public Holiday', isMandatory: true },
  { id: 'HOL-08', name: 'Diwali Festival', date: `${new Date().getFullYear()}-11-08`, type: 'Public Holiday', isMandatory: true },
  { id: 'HOL-09', name: 'Christmas Day', date: `${new Date().getFullYear()}-12-25`, type: 'Public Holiday', isMandatory: true },
];

export const INITIAL_LEAVES: LeaveRequest[] = [];

export const INITIAL_EVENTS: SystemEvent[] = [
  {
    id: 'EVT-001',
    title: 'Natton Dynamic Attendance Protocol Active',
    description: 'System online for live shift tracking (09:30 AM – 06:00 PM) at Pride Icon, Gokul Road.',
    category: 'SYSTEM_ALERT',
    severity: 'SUCCESS',
    timestamp: new Date().toLocaleTimeString(),
    targetDepartment: 'All Departments',
    author: 'Natton System',
  },
  {
    id: 'EVT-002',
    title: 'Sunday Weekly Off & Calendar Holidays Sync',
    description: 'Official weekly off policy and regional holidays registered in matrix.',
    category: 'HOLIDAY_NOTICE',
    severity: 'INFO',
    timestamp: new Date().toLocaleTimeString(),
    targetDepartment: 'All Departments',
    author: 'Super Admin',
  },
];

// No static dummy past loop records; records are dynamically populated through live punches or manual admin entries
export function generateInitialAttendanceRecords(): AttendanceRecord[] {
  return [];
}
