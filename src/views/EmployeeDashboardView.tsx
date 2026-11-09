import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { FingerType, LeaveType } from '../types/attendance';
import { OfficeStayWidget } from '../components/OfficeStayWidget';
import { StatusBadge } from '../components/StatusBadge';
import {
  User,
  Fingerprint,
  ShieldCheck,
  Shield,
  Clock,
  Calendar,
  LogOut,
  Coffee,
  CheckCircle2,
  AlertTriangle,
  FileText,
  MapPin,
  Building,
  Mail,
  Phone,
  Plus,
  X,
  TrendingUp,
  UserCheck,
  ExternalLink,
  Printer,
  Key,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';

interface EmployeeDashboardViewProps {
  onLockTerminal: () => void;
  onNavigateToDirectory?: () => void;
}

export const EmployeeDashboardView: React.FC<EmployeeDashboardViewProps> = ({
  onLockTerminal,
  onNavigateToDirectory,
}) => {
  const {
    employees,
    selectedEmployeeId,
    setSelectedEmployeeId,
    activeEmployeeSession,
    selectedEmployee,
    attendanceRecords,
    getEmployeeTodayRecord,
    verifyAndPunchFingerprint,
    registerFingerprint,
    startBreak,
    endBreak,
    leaveRequests,
    submitLeaveRequest,
    logoutEmployeeSession,
    todayDate,
    dispatchedEmails,
    setActiveEmailModal,
    sendVerificationOtp,
    isEmailAlreadyVerified,
    markEmailAsVerified,
    isSuperAdminLoggedIn,
    loginEmployee,
    loginEmployeeDirect,
    verifyAndLoginFingerprint,
  } = useAttendance();

  // Active employee is dynamically derived from authenticated session, or selected employee if Super Admin
  const currentEmp = activeEmployeeSession || selectedEmployee || employees[0];

  // Employee Login Gate States
  const [empLoginIdentifier, setEmpLoginIdentifier] = useState('');
  const [empLoginPassword, setEmpLoginPassword] = useState('');
  const [empShowPassword, setEmpShowPassword] = useState(false);
  const [empLoginError, setEmpLoginError] = useState('');
  const [empLoginTab, setEmpLoginTab] = useState<'PASSWORD' | 'BIOMETRIC'>('PASSWORD');
  const [biometricLoginEmpId, setBiometricLoginEmpId] = useState(employees[0]?.id || '');
  const [biometricLoginFinger, setBiometricLoginFinger] = useState<FingerType>(
    employees[0]?.biometric?.finger || 'Right Index'
  );
  const [biometricFeedback, setBiometricFeedback] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });

  // Punch modal state
  const [showPunchModal, setShowPunchModal] = useState<'IN' | 'OUT' | null>(null);
  const [selectedPunchFinger, setSelectedPunchFinger] = useState<FingerType>(
    currentEmp?.biometric?.finger || 'Right Index'
  );
  const [punchFeedback, setPunchFeedback] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });

  // Dynamically sync punch finger when employee changes
  React.useEffect(() => {
    if (currentEmp?.biometric?.finger) {
      setSelectedPunchFinger(currentEmp.biometric.finger);
      setNewEnrollFinger(currentEmp.biometric.finger);
    }
  }, [currentEmp?.id, currentEmp?.biometric?.finger]);

  // Re-enroll modal
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [newEnrollFinger, setNewEnrollFinger] = useState<FingerType>(
    currentEmp?.biometric?.finger || 'Right Index'
  );
  const [enrollMsg, setEnrollMsg] = useState<string | null>(null);

  // Leave apply modal
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>('Personal Leave');
  const [handoverEmpId, setHandoverEmpId] = useState<string>('');
  const [startDate, setStartDate] = useState(todayDate);
  const [endDate, setEndDate] = useState(todayDate);
  const [reason, setReason] = useState('');
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);

  // Employee Credential Login
  const handleEmployeeCredentialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const res = loginEmployee(empLoginIdentifier, empLoginPassword);
    if (!res.success) {
      setEmpLoginError(res.message);
    } else {
      setEmpLoginError('');
    }
  };

  // Biometric Login Handler
  const handleBiometricLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = verifyAndLoginFingerprint(biometricLoginEmpId, biometricLoginFinger);
    if (res.success) {
      setBiometricFeedback({ status: 'success', message: res.message });
      setTimeout(() => setBiometricFeedback({ status: 'idle', message: '' }), 1500);
    } else {
      setBiometricFeedback({ status: 'error', message: res.message });
    }
  };

  // If no employees registered in system at all
  if (!employees || employees.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 text-center space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-xl space-y-5">
          <div className="w-16 h-16 bg-blue-50 border border-blue-200 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <User className="w-8 h-8 text-blue-600" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Personal Staff Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              No staff members registered yet. Please register your employees in the Staff Directory to view live office stay duration, shift status, and biometric punch history.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                if (onNavigateToDirectory) onNavigateToDirectory();
              }}
              className="py-3 px-6 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Go to Staff Directory</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            Shift: 09:30 AM – 06:00 PM • Pride Icon, 1st Floor, Shop Number 37, Gokul Road
          </div>
        </div>
      </div>
    );
  }

  // Super Admin has universal master bypass; regular users must have active session
  const hasEmployeeAccess = Boolean(activeEmployeeSession) || isSuperAdminLoggedIn;

  // Render Employee Login Gate if not authenticated
  if (!hasEmployeeAccess) {
    return (
      <div className="max-w-xl mx-auto py-8 sm:py-12 px-4 space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto text-blue-600 shadow-sm">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Employee Portal Sign In
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Sign in with your Staff ID, registered Email, or Biometric Fingerprint to access your personal dashboard.
            </p>
          </div>

          {/* Quick 1-Click Fast Staff Login for Instant Testing */}
          <div className="space-y-2 pt-2">
            <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <span>⚡ 1-Click Fast Sign In (Select Profile):</span>
              <span className="text-[10px] text-slate-400 font-normal">Instant Access</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {employees.slice(0, 4).map((emp) => (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => loginEmployeeDirect(emp.id)}
                  className="p-2.5 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-xl text-left transition-all flex items-center gap-2.5 cursor-pointer group"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: emp.avatarColor || '#2563EB' }}
                  >
                    {emp.name.trim().split(/\s+/).filter(Boolean).map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate">
                      {emp.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">
                      {emp.id} • {emp.department}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Selector: Credentials vs Biometric Fingerprint */}
          <div className="flex border-b border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setEmpLoginTab('PASSWORD')}
              className={`flex-1 py-2.5 text-center border-b-2 transition-all flex items-center justify-center gap-2 ${
                empLoginTab === 'PASSWORD'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Staff ID / Email &amp; Password</span>
            </button>
            <button
              type="button"
              onClick={() => setEmpLoginTab('BIOMETRIC')}
              className={`flex-1 py-2.5 text-center border-b-2 transition-all flex items-center justify-center gap-2 ${
                empLoginTab === 'BIOMETRIC'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>Biometric Scanner</span>
            </button>
          </div>

          {empLoginTab === 'PASSWORD' ? (
            <form onSubmit={handleEmployeeCredentialLogin} className="space-y-4 text-xs">
              {empLoginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{empLoginError}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Staff ID or Work Email</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={empLoginIdentifier}
                    onChange={(e) => setEmpLoginIdentifier(e.target.value)}
                    placeholder="e.g. EMP-1001 or email@natton.com"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Password</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={empShowPassword ? 'text' : 'password'}
                    value={empLoginPassword}
                    onChange={(e) => setEmpLoginPassword(e.target.value)}
                    placeholder="natton123 or temporary password"
                    className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setEmpShowPassword(!empShowPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {empShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Default: <span className="font-mono font-bold text-slate-600">natton123</span> or credentials dispatched to your email.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                Sign In to Employee Dashboard
              </button>
            </form>
          ) : (
            <form onSubmit={handleBiometricLoginSubmit} className="space-y-4 text-xs">
              {biometricFeedback.message && (
                <div
                  className={`p-3 rounded-xl flex items-center gap-2 ${
                    biometricFeedback.status === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}
                >
                  {biometricFeedback.status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  )}
                  <span>{biometricFeedback.message}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Your Employee Profile</label>
                <select
                  value={biometricLoginEmpId}
                  onChange={(e) => {
                    setBiometricLoginEmpId(e.target.value);
                    const selected = employees.find(emp => emp.id === e.target.value);
                    if (selected?.biometric?.finger) {
                      setBiometricLoginFinger(selected.biometric.finger);
                    }
                  }}
                  className="w-full p-2 border border-slate-200 rounded-xl font-medium text-slate-800 bg-white"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.id}) • {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Registered Biometric Finger</label>
                <select
                  value={biometricLoginFinger}
                  onChange={(e) => setBiometricLoginFinger(e.target.value as FingerType)}
                  className="w-full p-2 border border-slate-200 rounded-xl font-medium text-slate-800 bg-white"
                >
                  {['Right Index', 'Right Thumb', 'Right Middle', 'Left Index', 'Left Thumb', 'Left Middle'].map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Fingerprint className="w-4 h-4" />
                <span>Verify Fingerprint &amp; Unlock Dashboard</span>
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Shift: 09:30 AM – 06:00 PM</span>
            <span>Pride Icon, Gokul Road</span>
          </div>
        </div>
      </div>
    );
  }

  const todayRecord = getEmployeeTodayRecord(currentEmp.id);
  const isPunchedIn = Boolean(todayRecord && todayRecord.inTime);
  const isPunchedOut = Boolean(todayRecord && todayRecord.outTime);
  const isBreakActive = Boolean(todayRecord && todayRecord.breakStartTime);

  const fingerOptions: FingerType[] = [
    'Right Index',
    'Right Thumb',
    'Right Middle',
    'Left Index',
    'Left Thumb',
    'Left Middle',
  ];

  // Filter records specifically for this particular employee
  const myRecords = attendanceRecords
    .filter((r) => r.employeeId === currentEmp.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const myLeaves = leaveRequests.filter((l) => l.employeeId === currentEmp.id);

  // Compute this employee's stats
  const presentDays = myRecords.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
  const lateDays = myRecords.filter((r) => r.status === 'LATE').length;
  const totalWorkHours = myRecords.reduce((acc, r) => acc + (r.workHours || 0), 0);
  const totalOvertime = myRecords.reduce((acc, r) => acc + (r.overtimeHours || 0), 0);
  const punctualityScore = presentDays > 0 ? Math.round(((presentDays - lateDays) / presentDays) * 100) : 100;

  // Execute biometric verified punch
  const handleConfirmBiometricPunch = () => {
    if (!showPunchModal) return;
    const res = verifyAndPunchFingerprint(currentEmp.id, selectedPunchFinger, showPunchModal);

    if (res.success) {
      setPunchFeedback({ status: 'success', message: res.message });
      setTimeout(() => {
        setShowPunchModal(null);
        setPunchFeedback({ status: 'idle', message: '' });
      }, 1500);
    } else {
      setPunchFeedback({ status: 'error', message: res.message });
    }
  };

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = registerFingerprint(currentEmp.id, newEnrollFinger);
    setEnrollMsg(res.message);
    setTimeout(() => {
      setEnrollMsg(null);
      setShowEnrollModal(false);
    }, 1500);
  };

  const handleApplyLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const handoverColleague = employees.find((e) => e.id === handoverEmpId);
    submitLeaveRequest({
      employeeId: currentEmp.id,
      employeeName: currentEmp.name,
      leaveType,
      startDate,
      endDate,
      reason: reason || `${leaveType} application`,
      handoverEmployeeId: handoverColleague?.id,
      handoverEmployeeName: handoverColleague ? `${handoverColleague.name} (${handoverColleague.id})` : undefined,
    });
    setLeaveSubmitted(true);
    setTimeout(() => {
      setLeaveSubmitted(false);
      setShowLeaveModal(false);
      setReason('');
      setHandoverEmpId('');
    }, 1500);
  };

  const handleLogout = () => {
    logoutEmployeeSession();
    onLockTerminal();
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-8">
      {/* Employee Corporate Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-blue-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl font-black shadow-lg border-2 border-white/20 flex-shrink-0"
            style={{ backgroundColor: currentEmp.avatarColor || '#2563EB' }}
          >
            {(currentEmp.name || 'Staff')
              .trim()
              .split(/\s+/)
              .filter(Boolean)
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2) || 'ST'}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white">{currentEmp.name}</h1>
              <span className="text-[10px] sm:text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Verified Email • Permanent Login Active</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-blue-200 mt-0.5">
              {currentEmp.role} • <span className="text-slate-300">{currentEmp.department}</span> • <span className="font-mono text-cyan-300">{currentEmp.email}</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
              Staff ID: {currentEmp.id} • Shift: 09:30 AM – 06:00 PM • Standard Shift
            </p>
          </div>
        </div>

        {/* Switch Employee Dropdown & Lock Session */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-xl px-2.5 py-1.5 shadow-xs flex-1 sm:flex-none">
            <User className="w-3.5 h-3.5 text-blue-300 flex-shrink-0" />
            <span className="text-[10px] text-blue-200 font-semibold whitespace-nowrap">Staff:</span>
            <select
              value={currentEmp.id}
              onChange={(e) => {
                setSelectedEmployeeId(e.target.value);
              }}
              className="bg-transparent text-xs text-white font-bold focus:outline-none cursor-pointer w-full sm:max-w-[200px] truncate"
              title="Switch Staff Member"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id} className="bg-slate-900 text-white py-1">
                  {emp.name} ({emp.id}) • {emp.department}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black rounded-xl text-xs shadow-md shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer border border-rose-500"
            title="Logout Employee Session & Return to Kiosk"
          >
            <LogOut className="w-4 h-4" />
            <span>🚪 Logout Employee</span>
          </button>
        </div>
      </div>

      {/* Official Natton Technologies Corporate Email & OTP Access Card */}
      {(() => {
        const cleanEmail = currentEmp.email.toLowerCase().trim();
        const latestEmailForEmp = dispatchedEmails.find(
          (m) =>
            (m.recipientEmail && m.recipientEmail.toLowerCase().trim() === cleanEmail) ||
            (m.credentials?.employeeId && m.credentials.employeeId === currentEmp.id)
        );
        const isVerified = isEmailAlreadyVerified(currentEmp.email);

        const handleOpenMyMail = () => {
          if (latestEmailForEmp) {
            setActiveEmailModal(latestEmailForEmp);
          } else {
            const res = sendVerificationOtp(currentEmp.email, currentEmp.name);
            if (res.emailRecord) {
              setActiveEmailModal(res.emailRecord);
            }
          }
        };

        return (
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-blue-900/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-blue-900/80">
              <div className="flex items-center gap-2.5">
                <div className="h-7 flex items-center">
                  <img
                    src="/natton_tech_logo_transparent.png"
                    alt="Natton Technologies"
                    className="h-6 w-auto object-contain filter brightness-110"
                    onError={(e) => {
                      e.currentTarget.src = '/natton_logo.jpg';
                    }}
                  />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wide text-white">
                    Natton Technologies • Corporate Email &amp; OTP
                  </h4>
                  <p className="text-[10px] text-blue-300">
                    Employee ID: <span className="font-mono font-bold text-white">{currentEmp.id}</span> • Registered Mail: <span className="font-mono text-cyan-200">{currentEmp.email}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {isVerified ? (
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Email Verified (Permanent Login Active)</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-700 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Mail className="w-3 h-3 text-amber-400" />
                    <span>OTP Active</span>
                  </span>
                )}
              </div>
            </div>

            {/* OTP & Dispatch Details */}
            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-2 flex-wrap">
                  <span>From: <strong className="text-white">Natton Technologies HR</strong> &lt;onboarding@nattontechnology.com&gt;</span>
                  {latestEmailForEmp?.otpCode && (
                    <span className="bg-blue-600 text-white font-mono font-black px-2 py-0.5 rounded-md text-[11px] shadow-sm">
                      OTP: {latestEmailForEmp.otpCode}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400">
                  Staff ID: <span className="font-mono text-white font-bold">{currentEmp.id}</span> • Password: <span className="font-mono font-bold text-blue-300">{currentEmp.temporaryPassword || 'Natton@2025'}</span> • Biometric: <span className="font-bold text-emerald-300">{currentEmp.biometric?.isEnrolled ? currentEmp.biometric.finger : 'Enroll via Fingerprint Station'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  type="button"
                  onClick={handleOpenMyMail}
                  className="flex-1 md:flex-none px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-[11px] rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  title="Open official verification email & OTP from Natton Technologies"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Open Natton Mail</span>
                </button>

                <a
                  href={`https://mail.google.com/mail/u/0/#search/from%3Anattontechnology.com+or+${encodeURIComponent(currentEmp.email)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-none px-3 py-1.5 bg-slate-700 hover:bg-slate-600 active:scale-98 text-slate-200 font-bold text-[11px] rounded-lg border border-slate-600 flex items-center justify-center gap-1 transition-all"
                  title="Search personal Gmail inbox for Natton Technologies mail"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  <span>Open in Gmail</span>
                </a>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Main Employee Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column: Today's Shift & Biometric Punch Station (7 cols) */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          {/* Today's Shift Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Today's Shift Status
                </h3>
                <p className="text-xs text-slate-500">
                  Date: <span className="font-semibold text-slate-800">{todayDate}</span> • Shift Standard: 09:30 AM – 06:00 PM
                </p>
              </div>

              <div>
                {todayRecord ? (
                  <StatusBadge status={todayRecord.status} size="md" />
                ) : (
                  <span className="text-xs px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-semibold">
                    Not Punched In
                  </span>
                )}
              </div>
            </div>

            {/* Quick Fingerprint Punch Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Biometric Punch In */}
              <button
                type="button"
                onClick={() => {
                  setSelectedPunchFinger(currentEmp.biometric?.finger || 'Right Index');
                  setPunchFeedback({ status: 'idle', message: '' });
                  setShowPunchModal('IN');
                }}
                disabled={isPunchedIn}
                className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                  isPunchedIn
                    ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-75'
                    : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-500 text-emerald-900 shadow-sm cursor-pointer'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl ${
                    isPunchedIn ? 'bg-slate-200 text-slate-400' : 'bg-emerald-600 text-white'
                  }`}
                >
                  <Fingerprint className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold block">
                    {isPunchedIn ? `In at ${todayRecord?.inTime}` : 'Biometric Punch In'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {isPunchedIn ? 'Logged on arrival' : `Verify with ${currentEmp.biometric?.finger}`}
                  </span>
                </div>
              </button>

              {/* Biometric Punch Out */}
              <button
                type="button"
                onClick={() => {
                  setSelectedPunchFinger(currentEmp.biometric?.finger || 'Right Index');
                  setPunchFeedback({ status: 'idle', message: '' });
                  setShowPunchModal('OUT');
                }}
                disabled={!isPunchedIn || isPunchedOut}
                className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                  !isPunchedIn || isPunchedOut
                    ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-75'
                    : 'bg-blue-50 hover:bg-blue-100 border-blue-500 text-blue-900 shadow-sm cursor-pointer'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl ${
                    !isPunchedIn || isPunchedOut ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white'
                  }`}
                >
                  <Fingerprint className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold block">
                    {isPunchedOut ? `Out at ${todayRecord?.outTime}` : 'Biometric Punch Out'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {isPunchedOut ? `${todayRecord?.workHours}h completed` : 'Calculate office stay'}
                  </span>
                </div>
              </button>
            </div>

            {/* Break Management Bar */}
            {isPunchedIn && !isPunchedOut && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-900 font-semibold">
                    {isBreakActive
                      ? `Break active since ${todayRecord?.breakStartTime}`
                      : `Break logged: ${todayRecord?.breakMinutes || 0} mins`}
                  </span>
                </div>

                {isBreakActive ? (
                  <button
                    onClick={() => endBreak(currentEmp.id)}
                    className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg shadow-xs"
                  >
                    Resume Work
                  </button>
                ) : (
                  <button
                    onClick={() => startBreak(currentEmp.id)}
                    className="px-3 py-1.5 bg-amber-600 text-white font-bold rounded-lg shadow-xs"
                  >
                    Take Break
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Dynamic Office Stay Calculator Widget */}
          <OfficeStayWidget
            inTime={todayRecord?.inTime}
            outTime={todayRecord?.outTime}
            shiftStart={currentEmp.shiftStart}
            breakMinutes={todayRecord?.breakMinutes || 0}
            isBreakActive={isBreakActive}
          />

          {/* My Personal Attendance Log Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              My Attendance History ({myRecords.length} Records)
            </h4>

            {myRecords.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No attendance logs found yet. Complete a punch to start recording your shift history.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">In</th>
                      <th className="py-2.5 px-3">Out</th>
                      <th className="py-2.5 px-3">Net Work</th>
                      <th className="py-2.5 px-3">Overtime</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {myRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{r.date}</td>
                        <td className="py-2.5 px-3 text-slate-700">{r.inTime || '—'}</td>
                        <td className="py-2.5 px-3 text-slate-700">{r.outTime || '—'}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {r.workHours > 0 ? `${r.workHours}h` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-emerald-600">
                          {r.overtimeHours > 0 ? `+${r.overtimeHours}h` : '—'}
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          <StatusBadge status={r.status} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Biometric Profile & Personal Leaves (5 cols) */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          {/* Biometric Security Credential Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-emerald-600" />
                Biometric Registration Profile
              </h3>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">
                ENROLLED
              </span>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 border border-slate-200 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Authorized Finger:</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {currentEmp.biometric?.finger || 'Not Enrolled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Biometric Ridge Hash:</span>
                <span className="font-mono text-slate-600 text-[11px]">
                  {currentEmp.biometric?.fingerprintHash || 'NATTON_FP_SECURE'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Enrolled Date:</span>
                <span className="font-mono text-slate-600 text-[11px]">
                  {currentEmp.biometric?.enrolledAt || todayDate}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Only your registered <strong className="text-emerald-700">{currentEmp.biometric?.finger}</strong> is authorized for shift punches and dashboard login.
            </p>

            <button
              onClick={() => setShowEnrollModal(true)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Fingerprint className="w-4 h-4" />
              <span>Change / Re-enroll Authorized Finger</span>
            </button>
          </div>

          {/* My Monthly Summary Scorecards */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              My Monthly Attendance Performance
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                <span className="text-[10px] font-bold text-blue-700 uppercase block">Shifts Attended</span>
                <div className="text-xl font-black font-mono text-blue-950 mt-1">{presentDays}</div>
                <span className="text-[9px] text-blue-600">Standard shift compliant</span>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Punctuality Score</span>
                <div className="text-xl font-black font-mono text-emerald-950 mt-1">{punctualityScore}%</div>
                <span className="text-[9px] text-emerald-600">{lateDays} late arrivals</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold text-slate-600 uppercase block">Total Net Hours</span>
                <div className="text-xl font-black font-mono text-slate-900 mt-1">{totalWorkHours.toFixed(1)}h</div>
                <span className="text-[9px] text-slate-400">Excludes lunch breaks</span>
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl">
                <span className="text-[10px] font-bold text-indigo-700 uppercase block">Overtime Hours</span>
                <div className="text-xl font-black font-mono text-indigo-950 mt-1">+{totalOvertime.toFixed(1)}h</div>
                <span className="text-[9px] text-indigo-600">&gt; 8.0h shift credit</span>
              </div>
            </div>
          </div>

          {/* My Leave Requests Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                My Leave Requests
              </h4>

              <button
                onClick={() => setShowLeaveModal(true)}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg shadow-xs flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Apply</span>
              </button>
            </div>

            {myLeaves.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No active leave requests.</p>
            ) : (
              <div className="space-y-2">
                {myLeaves.map((l) => (
                  <div key={l.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{l.leaveType}</span>
                      <span
                        className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                          l.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : l.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {l.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {l.startDate} to {l.endDate}
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-1">{l.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Biometric Punch Confirmation Modal */}
      {showPunchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-up space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-blue-600" />
                Biometric Punch {showPunchModal === 'IN' ? 'In' : 'Out'} Verification
              </h3>
              <button
                onClick={() => setShowPunchModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                Staff: <strong className="text-slate-900">{currentEmp.name}</strong> ({currentEmp.id})
              </p>
              <p>
                Registered Finger: <strong className="text-emerald-700">{currentEmp.biometric?.finger}</strong>
              </p>
            </div>

            {/* Finger selection on punch */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1 text-xs">
                Select Finger Placed on Scanner Pad:
              </label>
              <select
                value={selectedPunchFinger}
                onChange={(e) => setSelectedPunchFinger(e.target.value as FingerType)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-800 text-xs"
              >
                {fingerOptions.map((f) => (
                  <option key={f} value={f}>
                    {f} {f === currentEmp.biometric?.finger ? '★ (Enrolled Finger)' : '(Other Finger)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Feedback alert */}
            {punchFeedback.message && (
              <div
                className={`p-3 rounded-xl border text-xs ${
                  punchFeedback.status === 'success'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}
              >
                <div className="flex items-start gap-2">
                  {punchFeedback.status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  )}
                  <span>{punchFeedback.message}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPunchModal(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBiometricPunch}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5"
              >
                <Fingerprint className="w-4 h-4" />
                <span>Confirm Scan &amp; Punch</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Re-enroll Finger Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-up space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-blue-600" />
                Re-enroll Biometric Fingerprint
              </h3>
              <button
                onClick={() => setShowEnrollModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {enrollMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{enrollMsg}</span>
              </div>
            )}

            <form onSubmit={handleEnrollSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Select New Finger to Authorize</label>
                <select
                  value={newEnrollFinger}
                  onChange={(e) => setNewEnrollFinger(e.target.value as FingerType)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-800"
                >
                  {fingerOptions.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px]">
                Upon saving, previous fingerprints are revoked and only the selected finger will authenticate punches.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Save New Fingerprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply for Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-up space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Apply for Leave
              </h3>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {leaveSubmitted && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Leave application submitted for admin review!</span>
              </div>
            )}

            <form onSubmit={handleApplyLeaveSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Leave Category</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-800"
                >
                  <option value="Personal Leave">Personal Leave</option>
                  <option value="Sick Leave">Sick Leave / Medical</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Vacation">Vacation / Annual</option>
                  <option value="Emergency">Emergency Leave</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-600 font-semibold flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Work Handover / Coverage Colleague</span>
                  </label>
                  <span className="text-[10px] text-blue-600 font-medium">Registered Staff</span>
                </div>
                <select
                  value={handoverEmpId}
                  onChange={(e) => setHandoverEmpId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-800"
                >
                  <option value="">-- Select Registered Colleague for Handover --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id} disabled={emp.id === currentEmp.id}>
                      {emp.name} ({emp.id}) • {emp.department} • {emp.role} {emp.id === currentEmp.id ? '(You)' : ''}
                    </option>
                  ))}
                </select>
                {employees.length <= 1 && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    No other registered colleagues available yet.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Reason for Leave</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the reason for leave..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Session Logout Banner */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs mt-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-600/20 text-rose-400 rounded-xl border border-rose-500/30 flex-shrink-0">
            <LogOut className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-sm sm:text-base">
              Active Employee Session: {currentEmp.name}
            </div>
            <p className="text-[11px] text-slate-400">
              Staff ID: <span className="font-mono text-cyan-300 font-bold">{currentEmp.id}</span> • Registered Mail: <span className="font-mono text-blue-300">{currentEmp.email}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full sm:w-auto px-6 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer border border-rose-500"
          title="Logout Employee Dashboard & Return to Kiosk"
        >
          <LogOut className="w-4 h-4" />
          <span>🚪 Logout Employee Dashboard</span>
        </button>
      </div>
    </div>
  );
};
