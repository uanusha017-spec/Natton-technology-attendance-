import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { StatusBadge } from '../components/StatusBadge';
import { calculateStayDuration } from '../types/attendance';
import {
  Lock,
  Mail,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
  Shield,
  LogOut,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Building,
  Save,
  RotateCcw,
} from 'lucide-react';

interface AdminPortalViewProps {
  onNavigateToSuperAdmin?: () => void;
  onNavigateToEmployeeDashboard?: () => void;
  onExit?: () => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  onNavigateToSuperAdmin,
  onNavigateToEmployeeDashboard,
  onExit,
}) => {
  const {
    isAdminLoggedIn,
    isSuperAdminLoggedIn,
    loginAdmin,
    logoutAdmin,
    employees,
    attendanceRecords,
    addAttendanceRecord,
    todayDate,
    punchIn,
    punchOut,
  } = useAttendance();

  // Login form state
  const [email, setEmail] = useState('admin@natton.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Shift Settings state
  const [shiftStart, setShiftStart] = useState('09:30');
  const [shiftEnd, setShiftEnd] = useState('18:00');
  const [graceMinutes, setGraceMinutes] = useState('10');
  const [shiftSavedNotice, setShiftSavedNotice] = useState(false);

  // Quick punch override state
  const [overrideEmpId, setOverrideEmpId] = useState(employees[0]?.id || 'EMP-1001');
  const [overrideInTime, setOverrideInTime] = useState('09:25:00');
  const [overrideOutTime, setOverrideOutTime] = useState('18:05:00');
  const [overrideStatus, setOverrideStatus] = useState<'PRESENT' | 'LATE'>('PRESENT');
  const [overrideNotes, setOverrideNotes] = useState('Admin override punch');
  const [overrideSuccess, setOverrideSuccess] = useState(false);

  const selectedEmp = employees.find((e) => e.id === overrideEmpId) || employees[0];
  const stayPreview = calculateStayDuration(overrideInTime, overrideOutTime, shiftStart, 45);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = loginAdmin(email, password);
    if (!ok) {
      setErrorMsg('Invalid administrator credentials. Try admin@natton.com / admin123');
    } else {
      setErrorMsg('');
    }
  };

  const handleSaveShiftConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setShiftSavedNotice(true);
    setTimeout(() => setShiftSavedNotice(false), 3000);
  };

  const handleApplyOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    addAttendanceRecord({
      employeeId: selectedEmp.id,
      employeeName: selectedEmp.name,
      date: todayDate,
      inTime: overrideInTime,
      outTime: overrideOutTime,
      status: overrideStatus,
      workHours: stayPreview.netHours,
      overtimeHours: stayPreview.overtimeHours,
      locationType: selectedEmp.workLocation,
      notes: overrideNotes || 'Admin manual reconciliation',
      breakMinutes: 45,
      latitude: 37.7749,
      longitude: -122.4194,
    });

    setOverrideSuccess(true);
    setTimeout(() => setOverrideSuccess(false), 3000);
  };

  // Super Admin has universal master access over Admin Portal
  const hasAccess = isAdminLoggedIn || isSuperAdminLoggedIn;

  // If not logged in, render the login card
  if (!hasAccess) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto text-blue-600 shadow-sm">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Admin Portal Sign In</h2>
            <p className="text-xs text-slate-500">
              Access shift policies, manual attendance reconciliation, and management controls.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1-Click Fast Access */}
          <button
            type="button"
            onClick={() => loginAdmin('admin@natton.com', 'admin123')}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-400"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>⚡ Open Admin Portal (1-Click Access: admin@natton.com)</span>
          </button>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Admin Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@natton.com"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Password</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              Sign In to Admin Portal
            </button>

            {/* Auto-fill demo button */}
            <button
              type="button"
              onClick={() => {
                setEmail('admin@natton.com');
                setPassword('admin123');
              }}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all"
            >
              Auto-Fill Demo Credentials (admin@natton.com)
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
            Natton Technology Official Access Control • Authorized Personnel Only
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard view when logged in
  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-6">
      {/* Official Printable Header */}
      <div className="hidden print:block mb-6 border-b border-slate-300 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Natton Technologies Private Limited</h1>
            <p className="text-xs text-slate-600 font-medium">
              Pride Icon, 1st Floor, Shop Number 37, Gokul Road, Beside South Indian Shopping Mall, Hubballi
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Administrator Shift Policy &amp; Attendance Reconciliation Statement
            </p>
          </div>
          <div className="text-right text-xs text-slate-600 font-mono">
            <div className="font-bold text-slate-800 text-sm">Shift Protocol: 09:30 AM – 06:00 PM</div>
            <div>Date: {todayDate} • Grace Period: 10 mins</div>
            <div>Weekly Off: Sunday Mandatory Off</div>
          </div>
        </div>
      </div>

      {/* Super Admin Master Mode Notice */}
      {isSuperAdminLoggedIn && !isAdminLoggedIn && (
        <div className="bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-blue-500/15 border-2 border-amber-400/50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-500 flex items-center justify-center font-bold text-lg flex-shrink-0">
              👑
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span>Super Admin Master Authorization Active</span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                  Universal Bypass
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                You have master rights to modify shift policies, execute attendance overrides, and inspect staff without admin login.
              </p>
            </div>
          </div>
          {onNavigateToSuperAdmin && (
            <button
              onClick={onNavigateToSuperAdmin}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold rounded-xl border border-amber-400/40 transition-colors cursor-pointer whitespace-nowrap"
            >
              Return to Super Admin Console &rarr;
            </button>
          )}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 bg-emerald-50 text-emerald-600 rounded-xl flex-shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Administrator Console</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                {isSuperAdminLoggedIn ? 'Super Admin Master Access' : 'Logged In (admin@natton.com)'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Shift Policy: 09:30 AM – 06:00 PM • Sunday Off Active • Dynamic Reconciliations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => window.print()}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
            title="Print Shift & Reconciliation Document"
          >
            <span>🖨️ Print Sheet</span>
          </button>
          {isAdminLoggedIn && (
            <button
              onClick={() => {
                logoutAdmin();
                if (onExit) onExit();
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Quick Switchers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:hidden">
        {onNavigateToSuperAdmin && (
          <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-4 rounded-2xl flex items-center justify-between gap-3 shadow-md border border-blue-800">
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              <div>
                <div className="font-bold text-xs text-white">Super Admin Live Console</div>
                <div className="text-[10px] text-blue-200">Live roster, audits &amp; broadcasts</div>
              </div>
            </div>
            <button
              onClick={onNavigateToSuperAdmin}
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              Open &rarr;
            </button>
          </div>
        )}
        {onNavigateToEmployeeDashboard && (
          <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <div className="font-bold text-xs text-slate-900">Personal Staff Dashboard</div>
                <div className="text-[10px] text-slate-500">Live stay duration &amp; punches</div>
              </div>
            </div>
            <button
              onClick={onNavigateToEmployeeDashboard}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              Open &rarr;
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column: Shift Policy Management (5 cols) */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Shift Scheduling Protocol
              </h3>
              <span className="text-xs text-emerald-600 font-semibold">Active</span>
            </div>

            {shiftSavedNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Shift parameters updated across kiosk and database!</span>
              </div>
            )}

            <form onSubmit={handleSaveShiftConfig} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Company Shift Standard</label>
                <input
                  type="text"
                  disabled
                  value="Natton Technology Shift (09:30 AM - 06:00 PM)"
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Shift Start Time</label>
                  <input
                    type="text"
                    value={shiftStart}
                    onChange={(e) => setShiftStart(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono text-slate-800 font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Default 09:30 AM</span>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Shift End Time</label>
                  <input
                    type="text"
                    value={shiftEnd}
                    onChange={(e) => setShiftEnd(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono text-slate-800 font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Default 18:00 (06:00 PM)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Grace Period (Minutes)</label>
                  <input
                    type="number"
                    value={graceMinutes}
                    onChange={(e) => setGraceMinutes(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono text-slate-800 font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Cutoff at 09:40 AM</span>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Standard Break Time</label>
                  <input
                    type="text"
                    disabled
                    value="45 Minutes"
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 font-mono text-slate-800"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Lunch &amp; refreshment</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 space-y-1">
                <span className="font-bold text-[11px] block">Weekly Off Configuration</span>
                <p className="text-[11px] text-blue-800">
                  Sundays are configured as mandatory paid company holidays across all attendance rosters.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Shift Policies</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Attendance Reconciliation & Override (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                Staff Attendance Reconciliation &amp; Manual Override
              </h3>
              <span className="text-xs text-slate-500 font-mono">Date: {todayDate}</span>
            </div>

            {overrideSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Attendance adjustment recorded into company log!</span>
              </div>
            )}

            <form onSubmit={handleApplyOverride} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Select Employee</label>
                <select
                  value={overrideEmpId}
                  onChange={(e) => setOverrideEmpId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg font-bold text-slate-800"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.id}) • {emp.department} • {emp.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Punch In Timestamp</label>
                  <input
                    type="text"
                    value={overrideInTime}
                    onChange={(e) => setOverrideInTime(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Punch Out Timestamp</label>
                  <input
                    type="text"
                    value={overrideOutTime}
                    onChange={(e) => setOverrideOutTime(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono text-slate-800"
                  />
                </div>
              </div>

              {/* Live Stay Calculation Preview */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                  <span>Calculated Shift Stay:</span>
                  <span className="font-mono text-blue-700 font-bold">{stayPreview.netFormatted} net</span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Gross: {stayPreview.grossFormatted} • Break: 45 mins</span>
                  <span className="text-emerald-700 font-semibold">
                    {stayPreview.overtimeHours > 0 ? `+${stayPreview.overtimeHours}h OT` : 'No OT'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Compliance: {stayPreview.complianceText}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Status Override</label>
                  <select
                    value={overrideStatus}
                    onChange={(e) => setOverrideStatus(e.target.value as 'PRESENT' | 'LATE')}
                    className="w-full p-2 border border-slate-200 rounded-lg font-medium text-slate-800"
                  >
                    <option value="PRESENT">Present (Full Day)</option>
                    <option value="LATE">Late Arrival</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Admin Reason</label>
                  <input
                    type="text"
                    value={overrideNotes}
                    onChange={(e) => setOverrideNotes(e.target.value)}
                    placeholder="e.g. Approved shift adjustment"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Record Shift Reconciliation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
