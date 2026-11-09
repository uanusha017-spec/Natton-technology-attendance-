import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Holiday, LeaveRequest, LeaveType } from '../types/attendance';
import {
  Calendar,
  Coffee,
  Plus,
  ShieldCheck,
  X,
  UserCheck,
  Printer,
  Users,
} from 'lucide-react';

export const HolidaysLeavesView: React.FC = () => {
  const {
    holidays,
    addHoliday,
    leaveRequests,
    submitLeaveRequest,
    updateLeaveStatus,
    employees,
  } = useAttendance();

  const [activeSubTab, setActiveSubTab] = useState<'HOLIDAYS' | 'LEAVES'>('HOLIDAYS');
  const [showAddHolidayModal, setShowAddHolidayModal] = useState(false);
  const [showApplyLeaveModal, setShowApplyLeaveModal] = useState(false);

  // Holiday form
  const [holName, setHolName] = useState('');
  const [holDate, setHolDate] = useState(new Date().toISOString().split('T')[0]);
  const [holType, setHolType] = useState<Holiday['type']>('Public Holiday');

  // Leave form - Defaults to Personal Leave
  const [leaveEmpId, setLeaveEmpId] = useState(employees[0]?.id || '');
  const [leaveType, setLeaveType] = useState<LeaveType>('Personal Leave');
  const [handoverEmpId, setHandoverEmpId] = useState<string>('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');

  const handleCreateHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holName || !holDate) return;
    addHoliday({
      name: holName,
      date: holDate,
      type: holType,
      isMandatory: true,
    });
    setHolName('');
    setShowAddHolidayModal(false);
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmp = employees.find((e) => e.id === leaveEmpId) || employees[0];
    if (!targetEmp) {
      alert('Please register an employee first in the Staff Directory!');
      return;
    }

    const handoverColleague = employees.find((e) => e.id === handoverEmpId);

    submitLeaveRequest({
      employeeId: targetEmp.id,
      employeeName: targetEmp.name,
      leaveType,
      startDate,
      endDate,
      reason: reason || `${leaveType} application`,
      handoverEmployeeId: handoverColleague?.id,
      handoverEmployeeName: handoverColleague ? `${handoverColleague.name} (${handoverColleague.id})` : undefined,
    });

    setReason('');
    setHandoverEmpId('');
    setShowApplyLeaveModal(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-6">
      {/* Top Banner - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            Holidays &amp; Leaves
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Official Natton Calendar, Sunday Weekly Off Protocol, and dynamic leave approvals.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl shadow-xs transition-all print:hidden"
            title="Print Calendar & Leaves"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Print</span>
          </button>
          {activeSubTab === 'HOLIDAYS' ? (
            <button
              onClick={() => setShowAddHolidayModal(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Holiday</span>
            </button>
          ) : (
            <button
              onClick={() => setShowApplyLeaveModal(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Apply for Leave</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub Tabs Bar - Mobile Responsive */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('HOLIDAYS')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'HOLIDAYS'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Official Holidays ({holidays.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('LEAVES')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'LEAVES'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>Leave Requests ({leaveRequests.length})</span>
        </button>
      </div>

      {/* HOLIDAYS VIEW */}
      {activeSubTab === 'HOLIDAYS' && (
        <div className="space-y-4">
          {/* Sunday Policy Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 bg-blue-600 text-white rounded-xl shadow-sm flex-shrink-0">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-blue-950">Official Sunday Weekly Holiday</h3>
                <p className="text-[11px] sm:text-xs text-blue-800/80 mt-0.5">
                  All Sundays are recognized as paid non-working company holidays under Natton policy.
                </p>
              </div>
            </div>
            <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-1 bg-white text-blue-800 rounded-lg border border-blue-200 shadow-xs whitespace-nowrap">
              Standard Policy
            </span>
          </div>

          {/* Holiday List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {holidays
              .slice()
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((hol) => {
                const isCompany = hol.type === 'Natton Company Holiday';
                const isSunday = hol.type === 'Sunday Weekly Holiday';

                return (
                  <div
                    key={hol.id}
                    className={`rounded-2xl p-4 sm:p-5 border shadow-sm transition-all flex flex-col justify-between ${
                      isCompany
                        ? 'bg-gradient-to-br from-indigo-900 to-blue-900 text-white border-blue-700'
                        : isSunday
                        ? 'bg-blue-50/50 border-blue-200 text-slate-800'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <span
                          className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            isCompany
                              ? 'bg-blue-500/30 text-blue-200 border border-blue-400/30'
                              : isSunday
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {hol.type}
                        </span>
                        <span className="text-[11px] font-mono opacity-70">{hol.id}</span>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold tracking-tight">{hol.name}</h4>
                      <p className={`text-xs mt-1 font-mono ${isCompany ? 'text-blue-200' : 'text-slate-500'}`}>
                        {hol.date}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-current/10 flex items-center justify-between text-[11px] font-mono">
                      <span className="opacity-80">Office Off</span>
                      <span className="font-semibold text-emerald-400">Paid Holiday</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* LEAVES VIEW */}
      {activeSubTab === 'LEAVES' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {leaveRequests.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-2">
                <Coffee className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
                <h4 className="text-sm font-bold text-slate-800">No Leave Requests</h4>
                <p className="text-xs text-slate-500">
                  Staff leave applications will appear here for dynamic approval.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">ID</th>
                      <th className="py-2.5 px-3">Staff</th>
                      <th className="py-2.5 px-3">Leave Type</th>
                      <th className="py-2.5 px-3">Work Handover</th>
                      <th className="py-2.5 px-3">Dates</th>
                      <th className="py-2.5 px-3">Reason</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right print:hidden">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leaveRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{req.id}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900 block">{req.employeeName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{req.employeeId}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                              req.leaveType === 'Sick Leave'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : req.leaveType === 'Personal Leave'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {req.leaveType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {req.handoverEmployeeName ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <UserCheck className="w-3 h-3 text-indigo-600 flex-shrink-0" />
                              <span className="truncate max-w-[130px]">{req.handoverEmployeeName}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Self / Unassigned</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-700 text-[11px] whitespace-nowrap">
                          {req.startDate} to {req.endDate}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 max-w-[160px] truncate">{req.reason}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              req.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : req.status === 'Rejected'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right print:hidden">
                          {req.status === 'Pending' ? (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => updateLeaveStatus(req.id, 'Approved')}
                                className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition-all"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => updateLeaveStatus(req.id, 'Rejected')}
                                className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg transition-all"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Holiday Modal */}
      {showAddHolidayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                Add Official Holiday
              </h3>
              <button
                onClick={() => setShowAddHolidayModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHoliday} className="space-y-3 pt-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Holiday Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Labor Day"
                  value={holName}
                  onChange={(e) => setHolName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={holDate}
                  onChange={(e) => setHolDate(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Category</label>
                <select
                  value={holType}
                  onChange={(e) => setHolType(e.target.value as Holiday['type'])}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 font-medium"
                >
                  <option value="Public Holiday">Public Holiday</option>
                  <option value="National Holiday">National Holiday</option>
                  <option value="Natton Company Holiday">Natton Company Holiday</option>
                  <option value="Sunday Weekly Holiday">Sunday Weekly Holiday</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddHolidayModal(false)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  Save Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showApplyLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Coffee className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                Submit Staff Leave Application
              </h3>
              <button
                onClick={() => setShowApplyLeaveModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-3 pt-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Applying Employee</label>
                <select
                  value={leaveEmpId}
                  onChange={(e) => setLeaveEmpId(e.target.value)}
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
                <label className="block text-slate-600 font-semibold mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 font-medium"
                >
                  <option value="Personal Leave">Personal Leave</option>
                  <option value="Sick Leave">Sick Leave / Medical</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Vacation">Vacation / Annual</option>
                  <option value="Emergency">Emergency Leave</option>
                  <option value="Maternity/Paternity">Maternity/Paternity</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-600 font-semibold flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Work Handover (Registered Staff)</span>
                  </label>
                  <span className="text-[10px] text-blue-600 font-medium">Automatic Staff Registry</span>
                </div>
                <select
                  value={handoverEmpId}
                  onChange={(e) => setHandoverEmpId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 font-medium bg-slate-50 focus:bg-white"
                >
                  <option value="">-- Select Registered Colleague for Work Handover --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id} disabled={emp.id === leaveEmpId}>
                      {emp.name} ({emp.id}) • {emp.department} • {emp.role} {emp.id === leaveEmpId ? '(Applying Staff)' : ''}
                    </option>
                  ))}
                </select>
                {employees.length === 0 ? (
                  <p className="text-[10px] text-amber-600 mt-1">
                    No registered employees found. Please register staff in Staff Directory to delegate handover.
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-1">
                    All registered employees are automatically listed. Select who will oversee your responsibilities.
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
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Reason</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detail the reason for leave..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplyLeaveModal(false)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
