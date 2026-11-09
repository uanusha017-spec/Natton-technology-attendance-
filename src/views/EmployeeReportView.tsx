import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { StatusBadge } from '../components/StatusBadge';
import {
  Award,
  Calendar,
  Printer,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
} from 'lucide-react';

export const EmployeeReportView: React.FC = () => {
  const { employees, attendanceRecords } = useAttendance();

  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || 'EMP-1001');
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  const selectedEmployee = employees.find((e) => e.id === selectedEmpId) || employees[0];

  const reportData = useMemo(() => {
    if (!selectedEmployee) return null;

    const empRecords = attendanceRecords
      .filter((r) => r.employeeId === selectedEmployee.id && r.date.startsWith(selectedMonth))
      .sort((a, b) => b.date.localeCompare(a.date));

    let presentDays = 0;
    let lateDays = 0;
    let halfDays = 0;
    let absentDays = 0;
    let holidayDays = 0;
    let leaveDays = 0;
    let totalWorkHours = 0;
    let totalOvertimeHours = 0;
    const inTimesSec: number[] = [];
    const outTimesSec: number[] = [];

    for (const r of empRecords) {
      if (r.status === 'PRESENT') presentDays++;
      else if (r.status === 'LATE') {
        lateDays++;
        presentDays++;
      } else if (r.status === 'HALF_DAY') halfDays++;
      else if (r.status === 'ABSENT') absentDays++;
      else if (r.status === 'HOLIDAY') holidayDays++;
      else if (r.status === 'ON_LEAVE') leaveDays++;

      totalWorkHours += r.workHours || 0;
      totalOvertimeHours += r.overtimeHours || 0;

      if (r.inTime) {
        const parts = r.inTime.split(':').map((v) => parseInt(v, 10));
        const h = parts[0];
        const m = parts[1];
        if (!isNaN(h) && !isNaN(m)) {
          inTimesSec.push(h * 3600 + m * 60);
        }
      }
      if (r.outTime) {
        const parts = r.outTime.split(':').map((v) => parseInt(v, 10));
        const h = parts[0];
        const m = parts[1];
        if (!isNaN(h) && !isNaN(m)) {
          outTimesSec.push(h * 3600 + m * 60);
        }
      }
    }

    const workingDays = presentDays + halfDays + absentDays + leaveDays;
    const attendancePercentage =
      workingDays > 0 ? Math.round(((presentDays + halfDays * 0.5) / workingDays) * 100) : 100;
    const punctualityPercentage =
      presentDays > 0 ? Math.round(((presentDays - lateDays) / presentDays) * 100) : 100;

    const avgInSec = inTimesSec.length > 0 ? inTimesSec.reduce((a, b) => a + b, 0) / inTimesSec.length : 9 * 3600 + 30 * 60;
    const avgOutSec = outTimesSec.length > 0 ? outTimesSec.reduce((a, b) => a + b, 0) / outTimesSec.length : 18 * 3600;

    const formatSec = (sec: number) => {
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const dispH = h % 12 || 12;
      return `${String(dispH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
    };

    return {
      records: empRecords,
      totalLogs: empRecords.length,
      workingDays,
      presentDays,
      lateDays,
      halfDays,
      absentDays,
      holidayDays,
      leaveDays,
      attendancePercentage,
      punctualityPercentage,
      totalWorkHours: Math.round(totalWorkHours * 10) / 10,
      totalOvertimeHours: Math.round(totalOvertimeHours * 10) / 10,
      avgInTime: inTimesSec.length > 0 ? formatSec(avgInSec) : '—',
      avgOutTime: outTimesSec.length > 0 ? formatSec(avgOutSec) : '—',
    };
  }, [selectedEmployee, selectedMonth, attendanceRecords]);

  if (!selectedEmployee || employees.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-lg mx-auto shadow-sm space-y-4 my-8">
        <Users className="w-12 h-12 text-blue-600 mx-auto opacity-70" />
        <h3 className="text-base font-bold text-slate-800">No Staff Registered</h3>
        <p className="text-xs text-slate-500">
          Add an employee to generate dynamic attendance statements and reports.
        </p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-6">
      {/* Controls Bar - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div className="flex items-center gap-2.5">
          <div className="p-2 sm:p-2.5 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0">
            <Award className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Staff Attendance Report</h2>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Shift Standard: 09:30 AM – 06:00 PM • Dynamic Analytics
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Employee Selector */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 font-medium">Staff:</span>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 font-bold text-slate-800"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.id}) • {emp.department}
                </option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 font-medium">Month:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 font-mono font-bold text-slate-800"
            />
          </div>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-sm transition-all ml-auto"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Official Report Card */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm space-y-4 sm:space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Report Corporate Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 sm:pb-6 border-b border-slate-200 gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 sm:h-12 flex items-center">
              <img
                src="/natton_tech_logo_transparent.png"
                alt="Natton Technologies"
                className="h-8 sm:h-10 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/natton_logo.jpg';
                }}
              />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900">Natton Technologies Private Limited</h1>
              <p className="text-[10px] text-slate-600">
                Pride Icon, 1st Floor, Shop Number 37, Gokul Road, Beside South Indian Shopping Mall, Hubballi
              </p>
              <p className="text-[11px] text-blue-700 font-semibold mt-0.5">Corporate Staff Attendance &amp; Shift Compliance Statement</p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs">
            <div className="font-semibold text-slate-800">Period: {selectedMonth}</div>
            <div className="text-slate-500 font-mono text-[11px]">Shift Standard: 09:30 AM – 06:00 PM</div>
            <div className="text-emerald-600 font-semibold text-[11px]">Sunday Weekly Offs Enforced</div>
          </div>
        </div>

        {/* Employee Info Strip */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-500 block text-[9px] sm:text-[10px] uppercase font-semibold">Employee</span>
            <span className="font-bold text-slate-900 text-xs sm:text-sm truncate block">{selectedEmployee.name}</span>
            <span className="text-slate-500 block text-[10px] font-mono">{selectedEmployee.id}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px] sm:text-[10px] uppercase font-semibold">Role / Dept</span>
            <span className="font-semibold text-slate-900 truncate block">{selectedEmployee.role}</span>
            <span className="text-slate-500 block text-[10px]">{selectedEmployee.department}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px] sm:text-[10px] uppercase font-semibold">Shift Timing</span>
            <span className="font-semibold text-slate-900">{selectedEmployee.shiftStart} – {selectedEmployee.shiftEnd}</span>
            <span className="text-slate-500 block text-[10px] truncate">{selectedEmployee.workLocation}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px] sm:text-[10px] uppercase font-semibold">Contact Email</span>
            <span className="font-medium text-slate-900 truncate block">{selectedEmployee.email}</span>
            <span className="text-slate-500 block text-[10px]">{selectedEmployee.phone}</span>
          </div>
        </div>

        {/* Big Metric Scorecards */}
        {reportData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <div className="flex items-center justify-between text-blue-700">
                <span className="text-[10px] sm:text-xs font-bold uppercase">Attendance Rate</span>
                <Award className="w-3.5 h-3.5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-blue-900 mt-1 sm:mt-2">
                {reportData.attendancePercentage}%
              </div>
              <p className="text-[9px] sm:text-[10px] text-blue-600 mt-1">
                {reportData.presentDays} days logged
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <div className="flex items-center justify-between text-emerald-700">
                <span className="text-[10px] sm:text-xs font-bold uppercase">Punctuality</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-900 mt-1 sm:mt-2">
                {reportData.punctualityPercentage}%
              </div>
              <p className="text-[9px] sm:text-[10px] text-emerald-600 mt-1">
                On-time arrivals
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-[10px] sm:text-xs font-bold uppercase">Work Hours</span>
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-1 sm:mt-2">
                {reportData.totalWorkHours}h
              </div>
              <p className="text-[9px] sm:text-[10px] text-slate-500 mt-1">
                Net hours worked
              </p>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <div className="flex items-center justify-between text-emerald-700">
                <span className="text-[10px] sm:text-xs font-bold uppercase">Overtime</span>
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-800 mt-1 sm:mt-2">
                +{reportData.totalOvertimeHours}h
              </div>
              <p className="text-[9px] sm:text-[10px] text-emerald-600 mt-1">
                Beyond 8.0h daily
              </p>
            </div>
          </div>
        )}

        {/* Detailed Daily Table */}
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Recorded Shifts in {selectedMonth}
          </h3>

          {reportData?.records.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No attendance logs recorded for this month yet. Punch in from the Staff Kiosk to track daily hours.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[550px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Punch In</th>
                    <th className="py-2 px-3">Punch Out</th>
                    <th className="py-2 px-3">Net Stay</th>
                    <th className="py-2 px-3">OT</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {reportData?.records.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-slate-800">{rec.date}</td>
                      <td className="py-2 px-3 text-slate-700">{rec.inTime || '—'}</td>
                      <td className="py-2 px-3 text-slate-700">{rec.outTime || '—'}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">
                        {rec.workHours > 0 ? `${rec.workHours}h` : '—'}
                      </td>
                      <td className="py-2 px-3 text-emerald-600 font-semibold">
                        {rec.overtimeHours > 0 ? `+${rec.overtimeHours}h` : '—'}
                      </td>
                      <td className="py-2 px-3 font-sans">
                        <StatusBadge status={rec.status} size="sm" />
                      </td>
                      <td className="py-2 px-3 font-sans text-[11px] text-slate-500 max-w-[160px] truncate">
                        {rec.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
