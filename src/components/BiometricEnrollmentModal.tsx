import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { FingerType } from '../types/attendance';
import {
  Fingerprint,
  ShieldCheck,
  CheckCircle2,
  X,
  User,
  Sparkles,
  ArrowRight,
  Building,
} from 'lucide-react';

interface BiometricEnrollmentModalProps {
  onCompleted?: () => void;
}

export const BiometricEnrollmentModal: React.FC<BiometricEnrollmentModalProps> = ({
  onCompleted,
}) => {
  const {
    employees,
    enrollmentModalEmployeeId,
    setEnrollmentModalEmployeeId,
    registerFingerprint,
    setSelectedEmployeeId,
  } = useAttendance();

  const [selectedFinger, setSelectedFinger] = useState<FingerType>('Right Index');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [enrollSuccess, setEnrollSuccess] = useState<string | null>(null);

  if (!enrollmentModalEmployeeId) return null;

  const targetEmp = employees.find((e) => e.id === enrollmentModalEmployeeId);
  if (!targetEmp) return null;

  const fingerOptions: FingerType[] = [
    'Right Index',
    'Right Thumb',
    'Right Middle',
    'Left Index',
    'Left Thumb',
    'Left Middle',
  ];

  const handleStartScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setScanProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        const res = registerFingerprint(targetEmp.id, selectedFinger);
        if (res.success) {
          setEnrollSuccess(res.message);
          setSelectedEmployeeId(targetEmp.id);
          setTimeout(() => {
            setEnrollSuccess(null);
            setEnrollmentModalEmployeeId(null);
            if (onCompleted) onCompleted();
          }, 1800);
        }
      }
    }, 130);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 rounded-xl">
              <Fingerprint className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Biometric Fingerprint Enrollment
                </h3>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono font-bold">
                  STEP 2 OF 2
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Authorized registration link from corporate onboarding email
              </p>
            </div>
          </div>

          <button
            onClick={() => setEnrollmentModalEmployeeId(null)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Staff Member Info Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-base font-bold shadow-sm flex-shrink-0"
              style={{ backgroundColor: targetEmp.avatarColor || '#2563EB' }}
            >
              {(targetEmp.name || 'Staff')
                .trim()
                .split(/\s+/)
                .filter(Boolean)
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) || 'ST'}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 text-sm truncate">{targetEmp.name}</div>
              <div className="text-[11px] text-slate-500 font-mono">
                Staff ID: {targetEmp.id} • {targetEmp.role}
              </div>
              <div className="text-[10px] text-blue-600 font-medium truncate">
                {targetEmp.email} • {targetEmp.phone}
              </div>
            </div>
          </div>

          {/* Success Banner */}
          {enrollSuccess ? (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-center space-y-2 animate-scale-up">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
              <h4 className="font-bold text-emerald-950 text-sm">Fingerprint Enrolled Successfully!</h4>
              <p className="text-xs text-emerald-800">{enrollSuccess}</p>
              <p className="text-[10px] text-emerald-700 font-semibold">
                Activating your personal Employee Dashboard now...
              </p>
            </div>
          ) : (
            <>
              {/* Step A: Select which finger to enroll */}
              <div className="space-y-2">
                <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  1. Select Finger to Authorize for Login &amp; Logout
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {fingerOptions.map((f) => {
                    const isSelected = selectedFinger === f;
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setSelectedFinger(f)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold shadow-xs ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="text-xs">{f}</span>
                        <Fingerprint className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step B: Optical Touch Scanner */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-white space-y-4 relative overflow-hidden shadow-xl">
                {/* Laser scan line */}
                {isScanning && (
                  <div
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] transition-all duration-100 pointer-events-none"
                    style={{ top: `${scanProgress}%` }}
                  />
                )}

                <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 block font-semibold">
                  Optical Touch Sensor Pad
                </span>

                {/* Big Interactive Scanner Pad */}
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={handleStartScan}
                    disabled={isScanning}
                    className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center mx-auto border-4 transition-all duration-300 relative group cursor-pointer ${
                      isScanning
                        ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_35px_rgba(34,211,238,0.5)] scale-105'
                        : 'border-emerald-500/60 bg-emerald-950/20 hover:border-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] active:scale-95'
                    }`}
                  >
                    <Fingerprint
                      className={`w-14 h-14 sm:w-16 sm:h-16 transition-all ${
                        isScanning ? 'text-cyan-400 animate-pulse' : 'text-emerald-400 group-hover:text-emerald-300'
                      }`}
                    />
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-300 mt-1 font-semibold">
                      {isScanning ? `${scanProgress}%` : 'Touch Sensor'}
                    </span>
                  </button>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">
                    {isScanning
                      ? `Scanning [${selectedFinger}] ridges...`
                      : `Touch pad to register [${selectedFinger}]`}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Hold finger firmly on the sensor until scan reaches 100%.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleStartScan}
                  disabled={isScanning}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>{isScanning ? 'Registering...' : `Scan & Authorize [${selectedFinger}]`}</span>
                </button>
              </div>

              {/* Policy note */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  Strict Biometric Enforcement
                </span>
                <p className="text-amber-800">
                  Once registered, only this enrolled finger will be accepted at the Natton Touch Screen. Any other finger will trigger an unauthorized mismatch error.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
