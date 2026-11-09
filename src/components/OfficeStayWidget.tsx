import React from 'react';
import { calculateStayDuration, OfficeStayResult } from '../types/attendance';
import { Clock, Hourglass, Coffee, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface OfficeStayWidgetProps {
  inTime?: string | null;
  outTime?: string | null;
  shiftStart?: string;
  breakMinutes?: number;
  isBreakActive?: boolean;
}

export const OfficeStayWidget: React.FC<OfficeStayWidgetProps> = ({
  inTime,
  outTime,
  shiftStart = '09:30',
  breakMinutes = 0,
  isBreakActive = false,
}) => {
  const [stayResult, setStayResult] = React.useState<OfficeStayResult>(() =>
    calculateStayDuration(inTime, outTime, shiftStart, breakMinutes)
  );

  // Recalculate if still punched in
  React.useEffect(() => {
    const update = () => {
      if (inTime && !outTime) {
        // use current time as outTime for live progress
        const now = new Date();
        const nowStr = now.toTimeString().split(' ')[0];
        setStayResult(calculateStayDuration(inTime, nowStr, shiftStart, breakMinutes));
      } else {
        setStayResult(calculateStayDuration(inTime, outTime, shiftStart, breakMinutes));
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [inTime, outTime, shiftStart, breakMinutes]);

  // Target net hours is 8.0
  const progressPercent = Math.min(100, Math.round((stayResult.netHours / 8.0) * 100));

  if (!inTime) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center">
        <Hourglass className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
        <p className="text-sm font-semibold text-slate-700">Office Stay Duration Pending</p>
        <p className="text-xs text-slate-500 mt-1">
          Punch in to begin automatic live office stay tracking against the 09:30 AM – 06:00 PM shift.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      {/* Top summary header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Office Stay Calculation
            </h4>
            <div className="text-base font-bold text-slate-900">
              {outTime ? 'Completed Office Shift' : 'Live Stay in Progress'}
            </div>
          </div>
        </div>
        <div className="text-right">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
              stayResult.netHours >= 8.0
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : stayResult.netHours >= 4.0
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {stayResult.netHours >= 8.0 ? (
              <CheckCircle className="w-3.5 h-3.5" />
            ) : (
              <Hourglass className="w-3.5 h-3.5" />
            )}
            {stayResult.complianceText}
          </span>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Gross Stay */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
          <div className="text-[11px] font-medium text-slate-500 uppercase flex items-center justify-between">
            <span>Gross Office Time</span>
            <Hourglass className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-lg font-bold font-mono text-slate-900 mt-1">
            {stayResult.grossFormatted}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Since in-time ({inTime})
          </div>
        </div>

        {/* Break Deductions */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
          <div className="text-[11px] font-medium text-slate-500 uppercase flex items-center justify-between">
            <span>Break Deductions</span>
            <Coffee className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-lg font-bold font-mono text-amber-700 mt-1 flex items-center gap-1.5">
            <span>{breakMinutes} mins</span>
            {isBreakActive && (
              <span className="text-[10px] font-sans px-1.5 py-0.2 bg-amber-200 text-amber-800 rounded font-semibold animate-pulse">
                Paused
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Excluded from net shift
          </div>
        </div>

        {/* Net Work Hours */}
        <div className="bg-blue-50/60 border border-blue-200/70 rounded-lg p-3">
          <div className="text-[11px] font-medium text-blue-700 uppercase flex items-center justify-between">
            <span>Net Work Hours</span>
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-lg font-bold font-mono text-blue-900 mt-1">
            {stayResult.netFormatted}
          </div>
          <div className="text-[10px] text-blue-600 mt-0.5">
            {stayResult.overtimeHours > 0
              ? `+${stayResult.overtimeHours}h Overtime applied`
              : `${(8.0 - stayResult.netHours).toFixed(1)}h remaining for 8.0h shift`}
          </div>
        </div>
      </div>

      {/* Progress bar towards shift completion */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1.5">
          <span>Shift Target Progress (8.0 Net Hours)</span>
          <span className="font-mono text-blue-600">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progressPercent >= 100
                ? 'bg-emerald-500'
                : progressPercent >= 50
                ? 'bg-blue-600'
                : 'bg-amber-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
          <span>09:30 AM (Start)</span>
          <span>01:30 PM (Half Day - 4h)</span>
          <span>06:00 PM (Target - 8h)</span>
        </div>
      </div>

      {/* Late notice if applicable */}
      {stayResult.isLate && (
        <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            Arrived {stayResult.lateMinutes} minutes past shift grace period (09:40 AM cutoff).
            Late arrival flagged on record.
          </span>
        </div>
      )}
    </div>
  );
};
