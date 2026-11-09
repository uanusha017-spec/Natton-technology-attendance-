import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { FingerType } from '../types/attendance';
import { LiveClockWidget } from '../components/LiveClockWidget';
import {
  Fingerprint,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  UserCheck,
  ArrowRight,
  LogIn,
  LogOut,
  RefreshCw,
  Sparkles,
  Building,
  Users,
} from 'lucide-react';

interface BiometricTouchScreenProps {
  onUnlockDashboard: () => void;
  onNavigateToDirectory?: () => void;
}

export const BiometricTouchScreen: React.FC<BiometricTouchScreenProps> = ({
  onUnlockDashboard,
  onNavigateToDirectory,
}) => {
  const {
    employees,
    selectedEmployeeId,
    setSelectedEmployeeId,
    selectedEmployee,
    verifyAndLoginFingerprint,
    verifyAndPunchFingerprint,
    registerFingerprint,
    getEmployeeTodayRecord,
    todayDate,
  } = useAttendance();

  // Biometric scanner states
  const [selectedFinger, setSelectedFinger] = useState<FingerType>(
    selectedEmployee?.biometric?.finger || 'Right Index'
  );
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    action?: 'LOGIN' | 'PUNCH_IN' | 'PUNCH_OUT';
  }>({ status: 'idle', message: '' });

  // Enrollment modal
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollFinger, setEnrollFinger] = useState<FingerType>(
    selectedEmployee?.biometric?.finger || 'Right Index'
  );
  const [enrollSuccessNotice, setEnrollSuccessNotice] = useState<string | null>(null);

  // Dynamically synchronize selected finger whenever employee selection changes
  React.useEffect(() => {
    if (selectedEmployee?.biometric?.finger) {
      setSelectedFinger(selectedEmployee.biometric.finger);
      setEnrollFinger(selectedEmployee.biometric.finger);
    }
    setScanResult({ status: 'idle', message: '' });
  }, [selectedEmployeeId, selectedEmployee]);

  if (!selectedEmployee || employees.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 text-center space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-xl space-y-5">
          <div className="w-16 h-16 bg-blue-50 border border-blue-200 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <Fingerprint className="w-8 h-8 text-blue-600" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Biometric Touch Screen Online
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              No staff members registered yet. Register your real employees in the Staff Directory using Indian phone (+91) and dynamic email OTP verification to enable biometric fingerprint tracking.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                if (onNavigateToDirectory) {
                  onNavigateToDirectory();
                }
              }}
              className="py-3 px-6 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Go to Staff Directory &amp; Register First Employee</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            Shift: 09:30 AM – 06:00 PM • Pride Icon, 1st Floor, Shop Number 37, Gokul Road
          </div>
        </div>
      </div>
    );
  }

  const todayRecord = getEmployeeTodayRecord(selectedEmployee.id);
  const isPunchedIn = Boolean(todayRecord && todayRecord.inTime);
  const isPunchedOut = Boolean(todayRecord && todayRecord.outTime);

  const fingerOptions: FingerType[] = [
    'Right Index',
    'Right Thumb',
    'Right Middle',
    'Left Index',
    'Left Thumb',
    'Left Middle',
  ];

  // Trigger biometric touch scan
  const handleTouchScan = (intendedAction: 'LOGIN' | 'PUNCH_IN' | 'PUNCH_OUT') => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    setScanResult({ status: 'idle', message: 'Scanning biometric ridges on touch sensor...' });

    // Animated progress simulation
    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setScanProgress(current);

      if (current >= 100) {
        clearInterval(interval);
        setIsScanning(false);

        // Verification logic
        if (intendedAction === 'LOGIN') {
          const res = verifyAndLoginFingerprint(selectedEmployee.id, selectedFinger);
          if (res.success) {
            setScanResult({
              status: 'success',
              message: res.message,
              action: 'LOGIN',
            });
            setTimeout(() => {
              onUnlockDashboard();
            }, 800);
          } else {
            setScanResult({
              status: 'error',
              message: res.message,
              action: 'LOGIN',
            });
          }
        } else {
          const punchType = intendedAction === 'PUNCH_IN' ? 'IN' : 'OUT';
          const res = verifyAndPunchFingerprint(selectedEmployee.id, selectedFinger, punchType);
          if (res.success) {
            setScanResult({
              status: 'success',
              message: `${res.message} • Only registered [${selectedEmployee.biometric?.finger}] authenticated.`,
              action: intendedAction,
            });
          } else {
            setScanResult({
              status: 'error',
              message: res.message,
              action: intendedAction,
            });
          }
        }
      }
    }, 120);
  };

  const handleEnrollFingerprint = (e: React.FormEvent) => {
    e.preventDefault();
    const res = registerFingerprint(selectedEmployee.id, enrollFinger);
    setSelectedFinger(enrollFinger);
    setEnrollSuccessNotice(res.message);
    setTimeout(() => {
      setEnrollSuccessNotice(null);
      setShowEnrollModal(false);
    }, 1500);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto pb-8">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/30 border border-blue-500/40 text-blue-400 rounded-xl flex-shrink-0">
            <Fingerprint className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Natton Biometric Touch Kiosk
              </h2>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-semibold">
                Biometric Sensor Online
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict Finger Match Enforced • Only Registered Finger Authorized for Login &amp; Logout
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right text-xs">
          <span className="text-emerald-400 font-semibold block text-[11px]">Shift: 09:30 AM – 06:00 PM</span>
          <span className="text-slate-400 text-[10px]">Sunday Weekly Offs Enforced</span>
        </div>
      </div>

      {/* Live Clock Widget */}
      <LiveClockWidget shiftStart={selectedEmployee.shiftStart} shiftEnd={selectedEmployee.shiftEnd} />

      {/* Main Touch Screen Biometric Terminal */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-xl space-y-6">
        {/* Terminal Header & Staff Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Step 1: Identify Employee Profile
            </span>
            <div className="flex items-center gap-2 w-full">
              <select
                value={selectedEmployeeId}
                onChange={(e) => {
                  setSelectedEmployeeId(e.target.value);
                  setScanResult({ status: 'idle', message: '' });
                }}
                className="w-full sm:max-w-md text-xs sm:text-sm font-bold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 truncate"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.id}) • {emp.role} • {emp.department}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Registered Finger Badge & Re-enroll action */}
          <div className="flex flex-col sm:items-end text-xs">
            <span className="text-slate-400 text-[11px] block">Officially Enrolled Biometric:</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {selectedEmployee.biometric?.finger || 'Not Enrolled'}
              </span>
              <button
                onClick={() => setShowEnrollModal(true)}
                className="text-blue-600 hover:text-blue-800 underline font-semibold text-xs"
              >
                Change / Register Finger
              </button>
            </div>
          </div>
        </div>

        {/* Step 2: Interactive Finger Selection to Place on Scanner */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Fingerprint className="w-4 h-4 text-blue-600" />
              Step 2: Choose Finger to Place on Sensor Pad
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Target: <span className="text-emerald-700 font-bold">{selectedEmployee.biometric?.finger}</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {fingerOptions.map((f) => {
              const isEnrolledMatch = f === selectedEmployee.biometric?.finger;
              const isSelected = selectedFinger === f;

              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => {
                    setSelectedFinger(f);
                    setScanResult({ status: 'idle', message: '' });
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 shadow-sm ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Fingerprint className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    {isEnrolledMatch && (
                      <span className="text-[8px] px-1 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">
                        REGISTERED
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-800">{f}</span>
                  <span className="text-[9px] text-slate-400">
                    {isEnrolledMatch ? 'Match' : 'Different finger'}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-500 italic">
            Test both: Select <strong className="text-emerald-700 font-semibold">{selectedEmployee.biometric?.finger}</strong> for successful biometric login/logout, or select any other finger to observe the security rejection!
          </p>
        </div>

        {/* Step 3: Biometric Touch Screen Sensor Pad */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center text-white relative overflow-hidden shadow-2xl">
          {/* Scanning sweep laser line animation */}
          {isScanning && (
            <div
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-pulse transition-all duration-100 pointer-events-none"
              style={{ top: `${scanProgress}%` }}
            />
          )}

          <div className="max-w-md mx-auto space-y-4">
            <span className="text-xs uppercase font-mono tracking-widest text-blue-400 block font-semibold">
              Biometric Optical Touch Sensor
            </span>

            {/* Big Interactive Fingerprint Scanner Pad */}
            <div className="relative inline-block my-2">
              <button
                type="button"
                onClick={() => handleTouchScan('LOGIN')}
                disabled={isScanning}
                className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center mx-auto border-4 transition-all duration-300 relative group cursor-pointer ${
                  isScanning
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_35px_rgba(34,211,238,0.5)] scale-105'
                    : scanResult.status === 'success'
                    ? 'border-emerald-500 bg-emerald-950/40 shadow-[0_0_35px_rgba(16,185,129,0.5)]'
                    : scanResult.status === 'error'
                    ? 'border-rose-500 bg-rose-950/40 shadow-[0_0_35px_rgba(244,63,94,0.5)]'
                    : 'border-blue-500/60 bg-blue-950/20 hover:border-blue-400 hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] active:scale-95'
                }`}
              >
                <Fingerprint
                  className={`w-16 h-16 sm:w-20 sm:h-20 transition-all ${
                    isScanning
                      ? 'text-cyan-400 animate-pulse'
                      : scanResult.status === 'success'
                      ? 'text-emerald-400'
                      : scanResult.status === 'error'
                      ? 'text-rose-400'
                      : 'text-blue-400 group-hover:text-blue-300'
                  }`}
                />
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 mt-1 font-semibold">
                  {isScanning ? `${scanProgress}%` : 'Touch Sensor'}
                </span>
              </button>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                {isScanning
                  ? 'Analyzing Ridge Pattern & Micro-Features...'
                  : `Scan [${selectedFinger}] for ${selectedEmployee.name}`}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Press the touch pad to verify fingerprint and unlock your dedicated Employee Dashboard.
              </p>
            </div>

            {/* Scan Result Feedback Alert */}
            {scanResult.message && (
              <div
                className={`p-4 rounded-2xl border text-xs text-left animate-fade-in ${
                  scanResult.status === 'success'
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                    : scanResult.status === 'error'
                    ? 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  {scanResult.status === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : scanResult.status === 'error' ? (
                    <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Fingerprint className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <div className="font-bold">{scanResult.message}</div>
                    {scanResult.status === 'error' && (
                      <div className="text-[11px] text-rose-300 opacity-90">
                        Security Rule: Unregistered fingers are blocked from login and punch operations. Please switch finger to <strong className="underline">{selectedEmployee.biometric?.finger}</strong>.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Action Buttons for Fingerprint Touch */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              {/* Scan & Login into Employee Dashboard */}
              <button
                type="button"
                onClick={() => handleTouchScan('LOGIN')}
                disabled={isScanning}
                className="py-3 px-4 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Fingerprint className="w-4 h-4" />
                <span>Verify &amp; Open Dashboard</span>
              </button>

              {/* Scan & Punch In */}
              <button
                type="button"
                onClick={() => handleTouchScan('PUNCH_IN')}
                disabled={isScanning || isPunchedIn}
                className={`py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                  isPunchedIn
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white shadow-lg shadow-emerald-600/30'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>{isPunchedIn ? 'Already In' : 'Scan & Punch In'}</span>
              </button>

              {/* Scan & Punch Out */}
              <button
                type="button"
                onClick={() => handleTouchScan('PUNCH_OUT')}
                disabled={isScanning || !isPunchedIn || isPunchedOut}
                className={`py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                  !isPunchedIn || isPunchedOut
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white shadow-lg shadow-indigo-600/30'
                }`}
              >
                <LogOut className="w-4 h-4" />
                <span>{isPunchedOut ? 'Shift Done' : 'Scan & Punch Out'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Biometric Status Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 pt-2">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-400" />
            <span>Natton HQ Terminal #01 • Pride Icon, 1st Floor, Shop #37, Gokul Road</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Hash: {selectedEmployee.biometric?.fingerprintHash || 'UNENROLLED'}
          </div>
        </div>
      </div>

      {/* Enroll / Register Finger Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-up space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-blue-600" />
                Register Official Fingerprint
              </h3>
              <button
                onClick={() => setShowEnrollModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {enrollSuccessNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{enrollSuccessNotice}</span>
              </div>
            )}

            <form onSubmit={handleEnrollFingerprint} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Staff Member</label>
                <input
                  type="text"
                  disabled
                  value={`${selectedEmployee.name} (${selectedEmployee.id})`}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-100 font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Select Finger to Enroll as Authorized
                </label>
                <select
                  value={enrollFinger}
                  onChange={(e) => setEnrollFinger(e.target.value as FingerType)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-bold text-slate-800"
                >
                  {fingerOptions.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Once registered, only this finger will be accepted during biometric login and shift punch out.
                </p>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs space-y-1">
                <span className="font-bold block">Biometric Enrollment Rule</span>
                <p className="text-[11px] text-blue-800">
                  Any other finger placed on the scanner will trigger a mismatch alert and prevent unauthorized access.
                </p>
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Register Fingerprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
