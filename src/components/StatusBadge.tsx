import React from 'react';
import { AttendanceStatus } from '../types/attendance';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Calendar, Coffee } from 'lucide-react';

interface StatusBadgeProps {
  status: AttendanceStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  let label = status;
  let bg = 'bg-slate-100 text-slate-700 border-slate-300';
  let Icon = Clock;

  switch (status) {
    case 'PRESENT':
      label = 'Present';
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      Icon = CheckCircle2;
      break;
    case 'LATE':
      label = 'Late Arrival';
      bg = 'bg-amber-50 text-amber-700 border-amber-200';
      Icon = Clock;
      break;
    case 'HALF_DAY':
      label = 'Half Day';
      bg = 'bg-orange-50 text-orange-700 border-orange-200';
      Icon = AlertTriangle;
      break;
    case 'ABSENT':
      label = 'Absent';
      bg = 'bg-rose-50 text-rose-700 border-rose-200';
      Icon = XCircle;
      break;
    case 'HOLIDAY':
      label = 'Holiday';
      bg = 'bg-blue-50 text-blue-700 border-blue-200';
      Icon = Calendar;
      break;
    case 'ON_LEAVE':
      label = 'On Leave';
      bg = 'bg-purple-50 text-purple-700 border-purple-200';
      Icon = Coffee;
      break;
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${bg} ${sizeClasses[size]} transition-all`}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{label}</span>
    </span>
  );
};
