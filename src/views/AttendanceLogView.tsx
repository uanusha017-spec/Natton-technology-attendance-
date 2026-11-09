import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { StatusBadge } from '../components/StatusBadge';
import { AttendanceRecord, AttendanceStatus, calculateStayDuration } from '../types/attendance';
import {
  Search,
  Download,
  Calendar,
  Plus,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Coffee,
  X,
  FileSpreadsheet,
  Trash2,
  Printer,
} from 'lucide-react';

export const AttendanceLogView: React.FC = () => {
  const { attendanceRecords, employees, addAttendanceRecord, clearAttendanceLogs, todayDate } = useAttendance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form for manual record entry
  const [modalEmployeeId, setModalEmployeeId] = useState(employees[0]?.id || 'EMP-1001');
  const [modalDate, setModalDate] = useState(todayDate);
  const [modalInTime, setModalInTime] = useState('09:25:00');
  const [modalOutTime, setModalOutTime] = useState('18:05:00');
  const [modalStatus, setModalStatus] = useState<AttendanceStatus>('PRESENT');
  const [modalNotes, setModalNotes] = useState('Dynamic shift log');

  // Filtered records
  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter((rec) => {
      const emp = employees.find((e) => e.id === rec.employeeId);
      if (selectedDept !== 'ALL' && emp?.department !== selectedDept) return false;

      if (selectedStatus !== 'ALL' && rec.status !== selectedStatus) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = rec.employeeName.toLowerCase().includes(q);
        const matchesId = rec.employeeId.toLowerCase().includes(q);
        const matchesNotes = rec.notes.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesNotes) return false;
      }

      if (dateFilter === 'TODAY') {
        if (rec.date !== todayDate) return false;
      } else if (dateFilter === 'MONTH') {
        const currentMonthPrefix = todayDate.substring(0, 7);
        if (!rec.date.startsWith(currentMonthPrefix)) return false;
      }

      return true;
    });
  }, [attendanceRecords, employees, selectedDept, selectedStatus, searchQuery, dateFilter, todayDate]);

  // Aggregate statistics
  const stats = useMemo(() => {
    let presentCount = 0;
    let lateCount = 0;
    let halfDayCount = 0;
    let holidayCount = 0;
    let leaveCount = 0;
    let absentCount = 0;
    let totalWorkHours = 0;
    let workedRecordsCount = 0;

    for (const r of filteredRecords) {
      if (r.status === 'PRESENT') presentCount++;
      if (r.status === 'LATE') lateCount++;
      if (r.status === 'HALF_DAY') halfDayCount++;
      if (r.status === 'HOLIDAY') holidayCount++;
      if (r.status === 'ON_LEAVE') leaveCount++;
      if (r.status === 'ABSENT') absentCount++;

      if (r.workHours > 0) {
        totalWorkHours += r.workHours;
        workedRecordsCount++;
      }
    }

    const avgHours = workedRecordsCount > 0 ? (totalWorkHours / workedRecordsCount).toFixed(1) : '0.0';

    return {
      total: filteredRecords.length,
      presentCount,
      lateCount,
      halfDayCount,
      holidayCount,
      leaveCount,
      absentCount,
      avgHours,
    };
  }, [filteredRecords]);

  // CSV Export
  const exportToCSV = () => {
    if (filteredRecords.length === 0) {
      alert('No records available to export.');
      return;
    }

    const headers = [
      'Date',
      'Employee ID',
      'Employee Name',
      'In Time',
      'Out Time',
      'Work Hours (Net)',
      'Overtime Hours',
      'Status',
      'Location',
      'Notes',
    ];

    const rows = filteredRecords.map((r) => [
      r.date,
      r.employeeId,
      `"${r.employeeName}"`,
      r.inTime || '',
      r.outTime || '',
      r.workHours,
      r.overtimeHours,
      r.status,
      `"${r.locationType}"`,
      `"${r.notes}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `natton_attendance_report_${todayDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmp = employees.find((emp) => emp.id === modalEmployeeId);
    if (!targetEmp) return;

    const stay = calculateStayDuration(modalInTime, modalOutTime, targetEmp.shiftStart, 45);

    addAttendanceRecord({
      employeeId: targetEmp.id,
      employeeName: targetEmp.name,
      date: modalDate,
      inTime: modalInTime || null,
      outTime: modalOutTime || null,
      status: modalStatus,
      workHours: stay.netHours,
      overtimeHours: stay.overtimeHours,
      locationType: targetEmp.workLocation,
      notes: modalNotes || 'Manual shift entry',
      breakMinutes: 45,
      latitude: 37.7749,
      longitude: -122.4194,
    });

    setShowAddModal(false);
  };

  const departments = ['ALL', 'Engineering', 'Design', 'Management', 'Human Resources', 'Finance', 'Quality Assurance'];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-6">
      {/* Printable Corporate Header */}
      <div className="hidden print:block mb-5 border-b border-slate-300 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Natton Technologies Private Limited</h1>
            <p className="text-[10px] text-slate-600 font-medium">
              Pride Icon, 1st Floor, Shop Number 37, Gokul Road, Beside South Indian Shopping Mall, Hubballi
            </p>
            <p className="text-[9px] text-slate-500 font-mono mt-0.5">
              Shift Standard: 09:30 AM – 06:00 PM • Automatic Office Stay Matrix
            </p>
          </div>
          <div className="text-right text-[10px] text-slate-600 font-mono">
            <div className="font-bold text-slate-800">Master Attendance Ledger</div>
            <div>Date: {todayDate}</div>
            <div>Printed: {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 print:hidden">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            Attendance Matrix &amp; Logs
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dynamic attendance logging with automatic office stay durations and shift compliance tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => window.print()}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
            title="Print Attendance Matrix"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manual Entry</span>
          </button>
          <button
            onClick={exportToCSV}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Bar - Mobile Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Total Records</span>
          <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 mt-0.5">{stats.total}</div>
          <span className="text-[9px] text-slate-400">Dynamic logs</span>
        </div>

        <div className="bg-white border border-emerald-200 bg-emerald-50/30 p-3 rounded-xl shadow-sm">
          <span className="text-[10px] font-semibold text-emerald-700 uppercase flex items-center justify-between">
            <span>Present</span>
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          </span>
          <div className="text-lg sm:text-xl font-bold font-mono text-emerald-700 mt-0.5">{stats.presentCount}</div>
          <span className="text-[9px] text-emerald-600">On time</span>
        </div>

        <div className="bg-white border border-amber-200 bg-amber-50/30 p-3 rounded-xl shadow-sm">
          <span className="text-[10px] font-semibold text-amber-700 uppercase flex items-center justify-between">
            <span>Late Arrivals</span>
            <AlertTriangle className="w-3 h-3 text-amber-600" />
          </span>
          <div className="text-lg sm:text-xl font-bold font-mono text-amber-700 mt-0.5">{stats.lateCount}</div>
          <span className="text-[9px] text-amber-600">After grace</span>
        </div>

        <div className="bg-white border border-purple-200 bg-purple-50/30 p-3 rounded-xl shadow-sm">
          <span className="text-[10px] font-semibold text-purple-700 uppercase flex items-center justify-between">
            <span>On Leave</span>
            <Coffee className="w-3 h-3 text-purple-600" />
          </span>
          <div className="text-lg sm:text-xl font-bold font-mono text-purple-700 mt-0.5">{stats.leaveCount}</div>
          <span className="text-[9px] text-purple-600">Approved leaves</span>
        </div>

        <div className="bg-white border border-blue-200 bg-blue-50/30 p-3 rounded-xl shadow-sm">
          <span className="text-[10px] font-semibold text-blue-700 uppercase flex items-center justify-between">
            <span>Holidays</span>
            <Calendar className="w-3 h-3 text-blue-600" />
          </span>
          <div className="text-lg sm:text-xl font-bold font-mono text-blue-700 mt-0.5">{stats.holidayCount}</div>
          <span className="text-[9px] text-blue-600">Sunday / Public</span>
        </div>

        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
          <span className="text-[10px] font-semibold text-slate-500 uppercase flex items-center justify-between">
            <span>Avg Work Stay</span>
            <TrendingUp className="w-3 h-3 text-blue-600" />
          </span>
          <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 mt-0.5">{stats.avgHours} hrs</div>
          <span className="text-[9px] text-slate-400">Net daily average</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 p-3.5 sm:p-4 rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by staff name, ID, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 sm:py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Quick Date Filters */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto scrollbar-none">
            <button
              onClick={() => setDateFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap ${
                dateFilter === 'ALL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => setDateFilter('TODAY')}
              className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap ${
                dateFilter === 'TODAY' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('MONTH')}
              className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap ${
                dateFilter === 'MONTH' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        {/* Second row of filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium text-[11px]">Dept:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 font-semibold text-slate-800 text-[11px]"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium text-[11px]">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 font-semibold text-slate-800 text-[11px]"
            >
              <option value="ALL">All</option>
              <option value="PRESENT">Present</option>
              <option value="LATE">Late Arrival</option>
              <option value="HALF_DAY">Half Day</option>
              <option value="ABSENT">Absent</option>
              <option value="HOLIDAY">Holiday</option>
              <option value="ON_LEAVE">On Leave</option>
            </select>
          </div>

          {(selectedDept !== 'ALL' || selectedStatus !== 'ALL' || searchQuery || dateFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSelectedDept('ALL');
                setSelectedStatus('ALL');
                setSearchQuery('');
                setDateFilter('ALL');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 underline font-medium ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card - Fully Scrollable and Mobile Optimized */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Attendance Records Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No dynamic records match your criteria. Punch in from the Staff Kiosk or click Manual Entry to add a dynamic shift log.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
            >
              Add First Dynamic Record
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">In Time</th>
                  <th className="py-2.5 px-3">Out Time</th>
                  <th className="py-2.5 px-3">Net Stay</th>
                  <th className="py-2.5 px-3">Overtime</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((rec) => {
                  const emp = employees.find((e) => e.id === rec.employeeId);
                  const isSunday = new Date(rec.date + 'T00:00:00').getDay() === 0;

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-800 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span>{rec.date}</span>
                          {isSunday && (
                            <span className="text-[9px] px-1 py-0.2 bg-blue-100 text-blue-800 rounded font-sans font-bold">
                              SUN
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                            style={{ backgroundColor: emp?.avatarColor || '#2563EB' }}
                          >
                            {(rec.employeeName || 'Staff')
                              .trim()
                              .split(/\s+/)
                              .filter(Boolean)
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2) || 'ST'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block truncate max-w-[130px]">
                              {rec.employeeName}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {rec.employeeId}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 font-mono">
                        {rec.inTime ? (
                          <span
                            className={
                              rec.status === 'LATE' ? 'text-amber-600 font-bold' : 'text-slate-800 font-medium'
                            }
                          >
                            {rec.inTime}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 font-mono">
                        {rec.outTime ? (
                          <span className="text-slate-800 font-medium">{rec.outTime}</span>
                        ) : rec.inTime ? (
                          <span className="text-blue-600 font-semibold animate-pulse text-[11px]">In Session</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 font-mono">
                        {rec.workHours > 0 ? (
                          <span className="font-bold text-slate-900">{rec.workHours}h</span>
                        ) : (
                          <span className="text-slate-400">0.0</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 font-mono">
                        {rec.overtimeHours > 0 ? (
                          <span className="font-bold text-emerald-600">+{rec.overtimeHours}h</span>
                        ) : (
                          <span className="text-slate-400">0.0</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <StatusBadge status={rec.status} size="sm" />
                      </td>

                      <td className="py-2.5 px-3 text-slate-600 text-[11px] truncate max-w-[110px]">
                        {rec.locationType}
                      </td>

                      <td className="py-2.5 px-3 text-slate-500 text-[11px] max-w-[160px] truncate">
                        {rec.notes}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Entry Modal - Mobile friendly */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                Add / Adjust Attendance Record
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualAdd} className="space-y-3.5 pt-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Employee</label>
                <select
                  value={modalEmployeeId}
                  onChange={(e) => setModalEmployeeId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 font-medium"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.id}) • {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Date</label>
                <input
                  type="date"
                  value={modalDate}
                  onChange={(e) => setModalDate(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">In Time (HH:mm:ss)</label>
                  <input
                    type="text"
                    value={modalInTime}
                    onChange={(e) => setModalInTime(e.target.value)}
                    placeholder="09:30:00"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Out Time (HH:mm:ss)</label>
                  <input
                    type="text"
                    value={modalOutTime}
                    onChange={(e) => setModalOutTime(e.target.value)}
                    placeholder="18:00:00"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Status</label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value as AttendanceStatus)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 font-medium"
                >
                  <option value="PRESENT">Present</option>
                  <option value="LATE">Late Arrival</option>
                  <option value="HALF_DAY">Half Day</option>
                  <option value="ABSENT">Absent</option>
                  <option value="HOLIDAY">Holiday</option>
                  <option value="ON_LEAVE">On Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Notes / Reason</label>
                <input
                  type="text"
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="Reason for dynamic shift log..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
