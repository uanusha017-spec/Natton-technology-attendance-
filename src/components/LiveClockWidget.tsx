import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, Sun, Moon } from 'lucide-react';

interface LiveClockWidgetProps {
  shiftStart?: string;
  shiftEnd?: string;
}

export const LiveClockWidget: React.FC<LiveClockWidgetProps> = ({
  shiftStart = '09:30',
  shiftEnd = '18:00',
}) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const isPM = hours >= 12;
  const formattedHours = hours % 12 || 12;

  // Check shift active
  const currentTotalM = hours * 60 + minutes;
  const [sH, sM] = shiftStart.split(':').map(Number);
  const [eH, eM] = shiftEnd.split(':').map(Number);
  const shiftStartTotal = sH * 60 + sM;
  const shiftEndTotal = eH * 60 + eM;
  const isDuringShift = currentTotalM >= shiftStartTotal && currentTotalM <= shiftEndTotal;

  // Format date
  const dateFormatted = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-700/60 relative overflow-hidden">
      {/* Background glow & subtle pattern */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
        {/* Left: Live Digital Clock */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap justify-center md:justify-start">
            <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Clock className="w-3.5 h-3.5 animate-pulse text-blue-400" />
              Official Office Clock
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-mono">Dynamic HQ Sync</span>
          </div>

          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <div className="font-mono text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-sm">
              <span>{String(formattedHours).padStart(2, '0')}</span>
              <span className="animate-pulse text-blue-400">:</span>
              <span>{String(minutes).padStart(2, '0')}</span>
              <span className="text-blue-400 text-xl sm:text-3xl font-light">:{String(seconds).padStart(2, '0')}</span>
            </div>
            <div className="flex flex-col text-[10px] sm:text-xs font-bold text-slate-300">
              <span className={`px-1.5 py-0.5 rounded ${isPM ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'}`}>
                {isPM ? 'PM' : 'AM'}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm font-medium text-slate-300 mt-1.5 flex items-center gap-2 flex-wrap justify-center md:justify-start">
            <span>{dateFormatted}</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-emerald-400 font-semibold">Standard Shift</span>
          </p>
        </div>

        {/* Right: Shift Status & Metrics */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex items-center gap-4 w-full sm:w-auto">
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              {isDuringShift ? <Sun className="w-6 h-6 text-amber-400" /> : <Moon className="w-6 h-6 text-slate-400" />}
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Natton Working Hours
              </div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>09:30 AM – 06:00 PM</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${isDuringShift ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                <span className={isDuringShift ? 'text-emerald-300 font-medium' : 'text-slate-400'}>
                  {isDuringShift ? 'Shift in Progress' : 'Outside Core Shift'}
                </span>
                <span className="text-slate-500">• 10m Grace Period</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex items-center gap-4 w-full sm:w-auto">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Policy Parameters
              </div>
              <div className="text-sm font-bold text-white">8.5h Shift Standard</div>
              <div className="text-xs text-slate-400 mt-0.5">8.0h Net • 45m Break • OT &gt; 8h</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
