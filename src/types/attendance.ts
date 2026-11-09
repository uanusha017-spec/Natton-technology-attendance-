export type AttendanceStatus =
  | 'PRESENT'
  | 'LATE'
  | 'HALF_DAY'
  | 'ABSENT'
  | 'HOLIDAY'
  | 'ON_LEAVE';

export type PunchType = 'IN' | 'OUT' | 'BREAK_START' | 'BREAK_END';

export type FingerType =
  | 'Right Thumb'
  | 'Right Index'
  | 'Right Middle'
  | 'Left Thumb'
  | 'Left Index'
  | 'Left Middle';

export interface BiometricProfile {
  finger: FingerType;
  enrolledAt: string;
  fingerprintHash: string;
  isEnrolled: boolean;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  shiftName: string;
  shiftStart: string; // "09:30"
  shiftEnd: string;   // "18:00"
  workLocation: string;
  phone: string;
  joinDate: string;
  avatarColor: string;
  isActive: boolean;
  biometric?: BiometricProfile;
  temporaryPassword?: string;
  isEmailVerified?: boolean;
}

export interface DispatchedEmail {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  type: 'VERIFICATION_OTP' | 'CREDENTIALS_WELCOME';
  otpCode?: string;
  credentials?: {
    employeeId: string;
    email: string;
    password: string;
    shift: string;
    location: string;
  };
  sentAt: string;
  status: 'SENT';
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  inTime: string | null;  // HH:mm:ss
  outTime: string | null; // HH:mm:ss
  status: AttendanceStatus;
  workHours: number;
  overtimeHours: number;
  locationType: string;
  notes: string;
  breakMinutes: number;
  breakStartTime?: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface Holiday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  type: 'Public Holiday' | 'National Holiday' | 'Sunday Weekly Holiday' | 'Natton Company Holiday';
  isMandatory: boolean;
}

export type LeaveType =
  | 'Personal Leave'
  | 'Sick Leave'
  | 'Casual Leave'
  | 'Vacation'
  | 'Emergency'
  | 'Maternity/Paternity';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  handoverEmployeeId?: string;
  handoverEmployeeName?: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  appliedAt: string;
}

export type EventCategory =
  | 'ATTENDANCE_AUTO'
  | 'COMPANY_ANNOUNCEMENT'
  | 'HOLIDAY_NOTICE'
  | 'ADMIN_AUDIT'
  | 'SYSTEM_ALERT';

export type EventSeverity = 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';

export interface SystemEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  severity: EventSeverity;
  timestamp: string;
  targetDepartment: string;
  author: string;
}

export interface OfficeStayResult {
  grossHours: number;
  grossFormatted: string;
  breakMinutes: number;
  netHours: number;
  netFormatted: string;
  overtimeHours: number;
  isLate: boolean;
  lateMinutes: number;
  complianceText: string;
}

export function timeToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().split(' ')[0];
  const parts = clean.split(':');
  const h = parseInt(parts[0] || '0', 10);
  const m = parseInt(parts[1] || '0', 10);
  const s = parseInt(parts[2] || '0', 10);
  return h * 3600 + m * 60 + s;
}

export function secondsToTime(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function calculateStayDuration(
  inTime: string | null | undefined,
  outTime: string | null | undefined,
  shiftStart = '09:30',
  breakMinutes = 0
): OfficeStayResult {
  if (!inTime || !outTime) {
    return {
      grossHours: 0,
      grossFormatted: '0 hrs 0 mins',
      breakMinutes,
      netHours: 0,
      netFormatted: '0 hrs 0 mins',
      overtimeHours: 0,
      isLate: false,
      lateMinutes: 0,
      complianceText: inTime ? 'Punched in (Shift active)' : 'Pending Punch Completion',
    };
  }

  const inSec = timeToSeconds(inTime);
  const outSec = timeToSeconds(outTime);
  const grossSec = outSec >= inSec ? outSec - inSec : outSec + 86400 - inSec;
  const grossHours = Math.round((grossSec / 3600) * 100) / 100;
  const grossH = Math.floor(grossSec / 3600);
  const grossM = Math.floor((grossSec % 3600) / 60);

  const netSec = Math.max(0, grossSec - breakMinutes * 60);
  const netHours = Math.round((netSec / 3600) * 10) / 10;
  const netH = Math.floor(netSec / 3600);
  const netM = Math.floor((netSec % 3600) / 60);

  const shiftStartSec = timeToSeconds(shiftStart);
  // Grace period 10 minutes (09:40)
  const lateMinutes = inSec > shiftStartSec + 600 ? Math.floor((inSec - shiftStartSec) / 60) : 0;
  const isLate = lateMinutes > 0;

  // 8.0 hours net shift standard
  const overtimeHours = netHours > 8.0 ? Math.round((netHours - 8.0) * 10) / 10 : 0.0;

  let complianceText = 'Under minimum shift duration';
  if (netHours >= 8.0 && overtimeHours > 0) {
    complianceText = `Met 9:30-6:00 Shift (+${overtimeHours}h OT)`;
  } else if (netHours >= 8.0) {
    complianceText = 'Met Natton 9:30-6:00 Shift Standard';
  } else if (netHours >= 4.0) {
    complianceText = `Half Day / Partial Shift (${(8.0 - netHours).toFixed(1)}h shortfall)`;
  }

  return {
    grossHours,
    grossFormatted: `${grossH} hrs ${grossM} mins`,
    breakMinutes,
    netHours,
    netFormatted: `${netH} hrs ${netM} mins`,
    overtimeHours,
    isLate,
    lateMinutes,
    complianceText,
  };
}
