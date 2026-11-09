import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { LiveClockWidget } from '../components/LiveClockWidget';
import { OfficeStayWidget } from '../components/OfficeStayWidget';
import { StatusBadge } from '../components/StatusBadge';
import {
  LogIn,
  LogOut,
  Coffee,
  Play,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Building,
  UserCheck,
  Calendar,
  Search,
  Users,
} from 'lucide-react';

export const PunchClockView: React.FC = () => {
  const {
    employees,
    selectedEmployeeId,
    setSelectedEmployeeId,
    selectedEmployee,
    todayDate,
    getEmployeeTodayRecord,
    punchIn,
    punchOut,
    startBreak,
    endBreak,
    attendanceRecords,
  } = useAttendance();

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [punchLocation, setPunchLocation] = useState('Natton HQ - Floor 4');
  const [punchNotes, setPunchNotes] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');

  // Dynamic real-time date display
  const todayDisplay = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  if (!selectedEmployee || employees.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-lg mx-auto shadow-sm space-y-4 my-8">
        <Users className="w-12 h-12 text-blue-600 mx-auto opacity-70" />
        <h3 className="text-base font-bold text-slate-800">No Staff Members Registered</h3>
        <p className="text-xs text-slate-500">
          Add employees in the Staff Directory to enable dynamic punch in/out and live office stay calculations.
        </p>
      </div>
    );
  }

  const todayRecord = getEmployeeTodayRecord(selectedEmployee.id);
  const isPunchedIn = Boolean(todayRecord && todayRecord.inTime);
  const isPunchedOut = Boolean(todayRecord && todayRecord.outTime);
  const isBreakActive = Boolean(todayRecord && todayRecord.breakStartTime);

  const handlePunchIn = () => {
    const res = punchIn(selectedEmployee.id, punchNotes, punchLocation);
    if (res.success) {
      setNotification({ type: 'success', message: res.message });
      setPunchNotes('');
    } else {
      setNotification({ type: 'error', message: res.message });
    }
  };

  const handlePunchOut = () => {
    const res = punchOut(selectedEmployee.id);
    if (res.success) {
      setNotification({ type: 'success', message: res.message });
    } else {
      setNotification({ type: 'error', message: res.message });
    }
  };

  const handleStartBreak = () => {
    const res = startBreak(selectedEmployee.id);
    if (res.success) {
      setNotification({ type: 'success', message: res.message });
    } else {
      setNotification({ type: 'error', message: res.message });
    }
  };

  const handleEndBreak = () => {
    const res = endBreak(selectedEmployee.id);
    if (res.success) {
      setNotification({ type: 'success', message: res.message });
    } else {
      setNotification({ type: 'error', message: res.message });
    }
  };

  const employeeHistory = attendanceRecords
    .filter((r) => r.employeeId === selectedEmployee.id)
    .slice(0, 5);

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      e.id.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      e.department.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-4">
      {/* Top Banner Notice - Mobile Responsive */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-blue-800">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 bg-blue-500/20 rounded-xl border border-blue-400/30 flex-shrink-0">
            <Building className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs sm:text-sm tracking-wide">Natton Staff Kiosk</span>
              <span className="text-[9px] sm:text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.2 rounded-full font-semibold">
                Live Dynamic Engine
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
              Shift: 09:30 AM – 06:00 PM • Sunday Weekly Off • Dynamic Office Stay Tracking
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-blue-200">
          <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span>Natton HQ Geo-fence: Verified</span>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-3 sm:p-4 rounded-xl border flex items-center justify-between animate-fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 flex-shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-semibold">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs font-bold underline opacity-75 hover:opacity-100 ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Live Clock Widget */}
      <LiveClockWidget shiftStart={selectedEmployee.shiftStart} shiftEnd={selectedEmployee.shiftEnd} />

      {/* Main Kiosk Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column: Staff Selection & Profile (4 cols) */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          {/* Employee Selector Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                Select Staff
              </h3>
              <span className="text-xs text-slate-500 font-mono">{employees.length} Staff</span>
            </div>

            {/* Quick search input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search staff..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Employee List */}
            <div className="max-h-48 sm:max-h-60 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
              {filteredEmployees.map((emp) => {
                const isSelected = emp.id === selectedEmployee.id;
                const rec = getEmployeeTodayRecord(emp.id);
                return (
                  <button
                    key={emp.id}
                    onClick={() => setSelectedEmployeeId(emp.id)}
                    className={`w-full text-left p-2 sm:p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 shadow-sm'
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: emp.avatarColor || '#2563EB' }}
                      >
                        {(emp.name || 'Staff')
                          .trim()
                          .split(/\s+/)
                          .filter(Boolean)
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2) || 'ST'}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 truncate">{emp.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {emp.id} • {emp.department}
                        </div>
                      </div>
                    </div>
                    <div>
                      {rec?.status ? (
                        <StatusBadge status={rec.status} size="sm" showIcon={false} />
                      ) : (
                        <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">Pending</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Staff Profile Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white text-sm sm:text-base font-bold shadow-md flex-shrink-0"
                style={{ backgroundColor: selectedEmployee.avatarColor || '#2563EB' }}
              >
                {(selectedEmployee.name || 'Staff')
                  .trim()
                  .split(/\s+/)
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2) || 'ST'}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{selectedEmployee.name}</h4>
                <p className="text-[11px] sm:text-xs text-blue-600 font-medium truncate">{selectedEmployee.role}</p>
                <p className="text-[10px] sm:text-[11px] text-slate-400">{selectedEmployee.department}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block text-[9px] sm:text-[10px]">Staff ID</span>
                <span className="font-mono font-bold text-slate-800 text-[11px] sm:text-xs">{selectedEmployee.id}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block text-[9px] sm:text-[10px]">Assigned Shift</span>
                <span className="font-semibold text-slate-800 text-[11px] sm:text-xs">09:30 – 18:00</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block text-[9px] sm:text-[10px]">Location</span>
                <span className="font-semibold text-slate-800 truncate block text-[11px] sm:text-xs">{selectedEmployee.workLocation}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block text-[9px] sm:text-[10px]">Weekly Off</span>
                <span className="font-semibold text-emerald-700 text-[11px] sm:text-xs">Sunday</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Punch Action & Stay (8 cols) */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          {/* Punch Station Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 sm:pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Today's Live Station</h3>
                <p className="text-xs text-slate-500">
                  Date: <span className="font-semibold text-slate-800">{todayDisplay}</span> • Shift: 09:30 AM to 06:00 PM
                </p>
              </div>

              <div>
                {todayRecord ? (
                  <StatusBadge status={todayRecord.status} size="md" />
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    Not Punched Today
                  </span>
                )}
              </div>
            </div>

            {/* Big Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Punch In Button */}
              <button
                onClick={handlePunchIn}
                disabled={isPunchedIn}
                className={`flex flex-col items-center justify-center p-5 sm:p-6 rounded-2xl border-2 transition-all ${
                  isPunchedIn
                    ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-75'
                    : 'bg-emerald-600 hover:bg-emerald-700 border-emerald-500 text-white shadow-lg shadow-emerald-500/20 active:scale-98 cursor-pointer'
                }`}
              >
                <div
                  className={`p-3 rounded-full mb-2 sm:mb-3 ${
                    isPunchedIn ? 'bg-slate-200 text-slate-500' : 'bg-white/20 text-white'
                  }`}
                >
                  <LogIn className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div className="text-sm sm:text-base font-bold">
                  {isPunchedIn ? `Punched In at ${todayRecord?.inTime}` : 'Punch In (09:30 Shift)'}
                </div>
                <div className="text-xs mt-0.5 opacity-90">
                  {isPunchedIn
                    ? 'Arrival recorded successfully'
                    : 'Record dynamic arrival timestamp'}
                </div>
              </button>

              {/* Punch Out Button */}
              <button
                onClick={handlePunchOut}
                disabled={!isPunchedIn || isPunchedOut}
                className={`flex flex-col items-center justify-center p-5 sm:p-6 rounded-2xl border-2 transition-all ${
                  !isPunchedIn || isPunchedOut
                    ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-75'
                    : 'bg-blue-600 hover:bg-blue-700 border-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-98 cursor-pointer'
                }`}
              >
                <div
                  className={`p-3 rounded-full mb-2 sm:mb-3 ${
                    !isPunchedIn || isPunchedOut ? 'bg-slate-200 text-slate-500' : 'bg-white/20 text-white'
                  }`}
                >
                  <LogOut className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div className="text-sm sm:text-base font-bold">
                  {isPunchedOut
                    ? `Punched Out at ${todayRecord?.outTime}`
                    : isPunchedIn
                    ? 'Punch Out (Calculate Stay)'
                    : 'Punch Out'}
                </div>
                <div className="text-xs mt-0.5 opacity-90">
                  {isPunchedOut
                    ? `Stay completed: ${todayRecord?.workHours} hrs`
                    : 'Finalize daily office stay duration'}
                </div>
              </button>
            </div>

            {/* Break Control Bar */}
            {isPunchedIn && !isPunchedOut && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-lg flex-shrink-0">
                    <Coffee className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-900">Break Management</div>
                    <div className="text-xs text-amber-700">
                      {isBreakActive
                        ? `Break in progress since ${todayRecord?.breakStartTime}`
                        : `Break logged: ${todayRecord?.breakMinutes || 0} minutes`}
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-auto">
                  {isBreakActive ? (
                    <button
                      onClick={handleEndBreak}
                      className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Resume Work (End Break)
                    </button>
                  ) : (
                    <button
                      onClick={handleStartBreak}
                      className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Coffee className="w-3.5 h-3.5" />
                      Take Break (Pause Stay)
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Optional Punch Inputs */}
            {!isPunchedIn && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Check-in Location</label>
                  <select
                    value={punchLocation}
                    onChange={(e) => setPunchLocation(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 font-medium text-slate-800"
                  >
                    <option value="Natton HQ - Floor 4">Natton HQ - Floor 4 (Main)</option>
                    <option value="Natton HQ - Floor 3">Natton HQ - Floor 3 (Design Lab)</option>
                    <option value="Natton HQ - Floor 2">Natton HQ - Floor 2 (HR & Admin)</option>
                    <option value="Remote (Natton Tech Lab)">Remote (Natton Tech Lab)</option>
                    <option value="Client Site / Field Visit">Client Site / Field Visit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Shift Notes (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Client visit, traffic delay..."
                    value={punchNotes}
                    onChange={(e) => setPunchNotes(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 font-medium text-slate-800"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Live Office Stay Widget */}
          <OfficeStayWidget
            inTime={todayRecord?.inTime}
            outTime={todayRecord?.outTime}
            shiftStart={selectedEmployee.shiftStart}
            breakMinutes={todayRecord?.breakMinutes || 0}
            isBreakActive={isBreakActive}
          />

          {/* Recent Attendance Logs for Selected Employee */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Recent Attendance History ({selectedEmployee.name})
            </h4>

            {employeeHistory.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No past records for this staff member yet. Punch in above to generate dynamic logs!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                      <th className="py-2">Date</th>
                      <th className="py-2">Punch In</th>
                      <th className="py-2">Punch Out</th>
                      <th className="py-2">Net Work</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {employeeHistory.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50">
                        <td className="py-2.5 font-medium text-slate-800">{rec.date}</td>
                        <td className="py-2.5 text-slate-600">{rec.inTime || '—'}</td>
                        <td className="py-2.5 text-slate-600">{rec.outTime || '—'}</td>
                        <td className="py-2.5 font-bold text-slate-800">
                          {rec.workHours > 0 ? `${rec.workHours}h` : '—'}
                        </td>
                        <td className="py-2.5 font-sans">
                          <StatusBadge status={rec.status} size="sm" />
                        </td>
                        <td className="py-2.5 font-sans text-slate-500 max-w-[160px] truncate">{rec.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
