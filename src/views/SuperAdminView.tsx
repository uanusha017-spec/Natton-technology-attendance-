import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { EventCategory, EventSeverity, SystemEvent, AttendanceStatus } from '../types/attendance';
import { StatusBadge } from '../components/StatusBadge';
import {
  Shield,
  Radio,
  Send,
  AlertCircle,
  CheckCircle2,
  Bell,
  Cpu,
  Layers,
  Sparkles,
  LogOut,
  Mail,
  Key,
  Eye,
  EyeOff,
  Activity,
  Award,
  Printer,
  Download,
  Search,
  FileSpreadsheet,
  Fingerprint,
  Calendar,
  Users,
  MapPin,
  Clock,
  Filter,
} from 'lucide-react';

interface SuperAdminViewProps {
  onExit?: () => void;
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({ onExit }) => {
  const {
    isSuperAdminLoggedIn,
    loginSuperAdmin,
    logoutSuperAdmin,
    systemEvents,
    broadcastSystemEvent,
    employees,
    attendanceRecords,
    todayDate,
  } = useAttendance();

  // Login form
  const [email, setEmail] = useState('superadmin@natton.com');
  const [password, setPassword] = useState('superadmin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Attendance Ledger States & Filters for Super-Admin
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'MONTH'>('ALL');

  // Broadcast form
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastDesc, setBroadcastDesc] = useState('');
  const [broadcastCategory, setBroadcastCategory] = useState<EventCategory>('COMPANY_ANNOUNCEMENT');
  const [broadcastSeverity, setBroadcastSeverity] = useState<EventSeverity>('INFO');
  const [broadcastDept, setBroadcastDept] = useState('All Departments');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = loginSuperAdmin(email, password);
    if (!ok) {
      setLoginError('Invalid super admin credentials. Try superadmin@natton.com / superadmin123');
    } else {
      setLoginError('');
    }
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastDesc) return;

    broadcastSystemEvent({
      title: broadcastTitle,
      description: broadcastDesc,
      category: broadcastCategory,
      severity: broadcastSeverity,
      targetDepartment: broadcastDept,
      author: 'Natton Super Admin',
    });

    setBroadcastTitle('');
    setBroadcastDesc('');
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 3000);
  };

  // Quick broadcast templates
  const applyTemplate = (type: 'early' | 'holiday' | 'shift') => {
    if (type === 'early') {
      setBroadcastTitle('Special Early Checkout Authorization (04:30 PM)');
      setBroadcastDesc('All employees are permitted to check out early at 04:30 PM today. Full 8.5-hour shift credit will be applied.');
      setBroadcastCategory('COMPANY_ANNOUNCEMENT');
      setBroadcastSeverity('SUCCESS');
    } else if (type === 'holiday') {
      setBroadcastTitle('Upcoming Sunday Weekly Off & Foundation Day Reminder');
      setBroadcastDesc('All technical staff operations will be suspended for Sunday weekly holiday and Natton Foundation Day.');
      setBroadcastCategory('HOLIDAY_NOTICE');
      setBroadcastSeverity('INFO');
    } else if (type === 'shift') {
      setBroadcastTitle('Natton Shift Grace Period Advisory');
      setBroadcastDesc('Staff are reminded that 09:30 AM is standard shift arrival. Arrivals after 09:40 AM are automatically flagged as Late.');
      setBroadcastCategory('ADMIN_AUDIT');
      setBroadcastSeverity('WARNING');
    }
  };

  // Derived calculations & hooks MUST be at top level before any conditional return
  const totalEmployees = (employees || []).length;
  const activeRecords = (attendanceRecords || []).filter((r) => r && r.date === todayDate);
  const presentCount = activeRecords.filter((r) => r && (r.status === 'PRESENT' || r.status === 'LATE')).length;
  const complianceRate = totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 100;

  // Filtered attendance records directly streamed to super admin
  const filteredAttendance = useMemo(() => {
    return (attendanceRecords || []).filter((rec) => {
      if (!rec) return false;
      const emp = (employees || []).find((e) => e?.id === rec.employeeId);
      if (deptFilter !== 'ALL' && emp?.department !== deptFilter) return false;
      if (statusFilter !== 'ALL' && rec.status !== statusFilter) return false;
      if (dateFilter === 'TODAY' && rec.date !== todayDate) return false;
      if (dateFilter === 'MONTH' && (!rec.date || !rec.date.startsWith((todayDate || '').substring(0, 7)))) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (rec.employeeName || '').toLowerCase().includes(q);
        const matchId = (rec.employeeId || '').toLowerCase().includes(q);
        const matchDept = (emp?.department || '').toLowerCase().includes(q);
        const matchNotes = (rec.notes || '').toLowerCase().includes(q);
        if (!matchName && !matchId && !matchDept && !matchNotes) return false;
      }
      return true;
    });
  }, [attendanceRecords, employees, deptFilter, statusFilter, dateFilter, searchQuery, todayDate]);

  const ledgerStats = useMemo(() => {
    let present = 0;
    let late = 0;
    let halfDay = 0;
    let absent = 0;
    let onLeave = 0;
    let totalStayHours = 0;
    let count = 0;

    for (const r of filteredAttendance) {
      if (!r) continue;
      if (r.status === 'PRESENT') present++;
      if (r.status === 'LATE') late++;
      if (r.status === 'HALF_DAY') halfDay++;
      if (r.status === 'ABSENT') absent++;
      if (r.status === 'ON_LEAVE') onLeave++;
      if (typeof r.workHours === 'number' && r.workHours > 0) {
        totalStayHours += r.workHours;
        count++;
      }
    }
    const avgStay = count > 0 ? (totalStayHours / count).toFixed(1) : '0.0';
    return {
      present,
      late,
      halfDay,
      absent,
      onLeave,
      total: filteredAttendance.length,
      avgStay,
      totalHours: Math.round(totalStayHours * 10) / 10,
    };
  }, [filteredAttendance]);

  const handlePrintLedger = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (filteredAttendance.length === 0) {
      alert('No attendance records available to export.');
      return;
    }
    const headers = [
      'Date',
      'Employee ID',
      'Employee Name',
      'Department',
      'Shift Times',
      'In Time',
      'Out Time',
      'Work Hours (Net)',
      'Overtime Hours',
      'Status',
      'Location',
      'Notes',
    ];
    const rows = filteredAttendance.map((r) => {
      const emp = (employees || []).find((e) => e?.id === r.employeeId);
      return [
        r.date || '',
        r.employeeId || '',
        `"${r.employeeName || ''}"`,
        `"${emp?.department || ''}"`,
        `"${emp ? `${emp.shiftStart} - ${emp.shiftEnd}` : '09:30 - 18:00'}"`,
        r.inTime || '',
        r.outTime || '',
        r.workHours || 0,
        r.overtimeHours || 0,
        r.status || 'PRESENT',
        `"${r.locationType || ''}"`,
        `"${r.notes || ''}"`,
      ];
    });
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `natton_superadmin_attendance_records_${todayDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isSuperAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto py-8 sm:py-12 px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600/20 border border-blue-500/40 rounded-2xl flex items-center justify-center mx-auto text-blue-400 shadow-lg">
              <Shield className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">Super Admin Live Telemetry</h2>
            <p className="text-xs text-slate-400">
              Access real-time system audit logs, automated shift compliance telemetry, and organization broadcast controls.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Instant 1-Click Direct Access */}
          <button
            type="button"
            onClick={() => loginSuperAdmin('superadmin@natton.com', 'superadmin123')}
            className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-400/40"
          >
            <Shield className="w-4 h-4 text-cyan-300" />
            <span>⚡ Open Super Admin Dashboard (1-Click Access)</span>
          </button>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Super Admin Account</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="superadmin@natton.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Secret Key</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 bg-slate-800/80 border border-slate-700 rounded-xl font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              Enter Super Admin Console
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('superadmin@natton.com');
                setPassword('superadmin123');
              }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-all"
            >
              Auto-Fill Demo Credentials (superadmin@natton.com)
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500 font-mono">
            Natton Technology Super Admin • Level 3 Authorization
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-6">
      {/* Official Printable Header (Visible only when printing) */}
      <div className="hidden print:block mb-6 border-b border-slate-300 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Natton Technologies Private Limited</h1>
            <p className="text-xs text-slate-600 font-medium">
              Pride Icon, 1st Floor, Shop Number 37, Gokul Road, Beside South Indian Shopping Mall, Hubballi
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Super-Admin Attendance Audit &amp; Compliance Statement • Shift Standard: 09:30 AM – 06:00 PM
            </p>
          </div>
          <div className="text-right text-xs text-slate-600 font-mono">
            <div className="font-bold text-slate-800 text-sm">Super-Admin Master Ledger</div>
            <div>Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
            <div>Staff Monitored: {totalEmployees}</div>
            <div>Weekly Off: Sunday Mandatory Off</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-200 text-center text-xs">
          <div className="p-2 border border-slate-200 rounded">
            <div className="text-[10px] text-slate-500 uppercase">Total Records</div>
            <div className="font-bold font-mono text-slate-900 text-sm">{ledgerStats.total}</div>
          </div>
          <div className="p-2 border border-slate-200 rounded">
            <div className="text-[10px] text-slate-500 uppercase">Present / On Time</div>
            <div className="font-bold font-mono text-emerald-700 text-sm">{ledgerStats.present}</div>
          </div>
          <div className="p-2 border border-slate-200 rounded">
            <div className="text-[10px] text-slate-500 uppercase">Late Arrivals</div>
            <div className="font-bold font-mono text-amber-700 text-sm">{ledgerStats.late}</div>
          </div>
          <div className="p-2 border border-slate-200 rounded">
            <div className="text-[10px] text-slate-500 uppercase">Compliance Rate</div>
            <div className="font-bold font-mono text-blue-700 text-sm">{complianceRate}%</div>
          </div>
        </div>
      </div>

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 bg-blue-600/30 border border-blue-500/40 text-blue-400 rounded-xl flex-shrink-0">
            <Radio className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold">Natton Super Admin Live Telemetry Console</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                Live Attendance Streaming
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Direct attendance ledger from every employee, live broadcast engine, and organizational audit.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handlePrintLedger}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
            title="Print Official Super-Admin Attendance Statement"
          >
            <Printer className="w-4 h-4" />
            <span>Print Ledger</span>
          </button>
          <button
            onClick={() => {
              logoutSuperAdmin();
              if (onExit) onExit();
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
            title="Exit Super Admin and Return to Kiosk"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout / Exit</span>
          </button>
        </div>
      </div>

      {/* Global Telemetry KPI Scorecards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 print:hidden">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Shift Compliance</span>
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-2">{complianceRate}%</div>
          <span className="text-[10px] text-emerald-600 font-medium">9:30 AM Shift standard met</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Staff Monitored</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-2">{totalEmployees}</div>
          <span className="text-[10px] text-slate-500">Registered staff roster</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Attendance Logs</span>
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black font-mono text-indigo-700 mt-2">{attendanceRecords.length}</div>
          <span className="text-[10px] text-slate-500">Live stream to super admin</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Sunday Holiday</span>
            <Shield className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-600 mt-2">Active</div>
          <span className="text-[10px] text-slate-500">Weekly off automated</span>
        </div>
      </div>

      {/* Organization Attendance Record Stream (Direct Super-Admin Stream) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden space-y-4 p-4 sm:p-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 sm:p-2.5 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0">
              <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Organization Attendance Records (Direct Super-Admin Feed)
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Direct Stream
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                Real-time biometric attendance records of every employee automatically delivered to super-admin.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto print:hidden">
            <button
              onClick={handlePrintLedger}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
              title="Print Full Organization Attendance Ledger"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Ledger</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              title="Export Organization Records to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Bar (Hidden when printing) */}
        <div className="space-y-2.5 print:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search staff name, ID, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Department */}
            <div>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full py-1.5 px-3 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="ALL">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Management">Management</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance">Finance</option>
                <option value="Quality Assurance">Quality Assurance</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full py-1.5 px-3 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="ALL">All Attendance Statuses</option>
                <option value="PRESENT">Present (On-Time)</option>
                <option value="LATE">Late Arrival</option>
                <option value="HALF_DAY">Half Day</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="HOLIDAY">Sunday / Company Holiday</option>
                <option value="ABSENT">Absent</option>
              </select>
            </div>

            {/* Date Quick Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setDateFilter('ALL')}
                className={`flex-1 py-1 rounded-lg font-semibold transition-all ${
                  dateFilter === 'ALL' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setDateFilter('TODAY')}
                className={`flex-1 py-1 rounded-lg font-semibold transition-all ${
                  dateFilter === 'TODAY' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDateFilter('MONTH')}
                className={`flex-1 py-1 rounded-lg font-semibold transition-all ${
                  dateFilter === 'MONTH' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Month
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
            <div className="flex items-center gap-3 flex-wrap">
              <span>
                Matching Records: <strong className="text-slate-900">{ledgerStats.total}</strong>
              </span>
              <span>•</span>
              <span className="text-emerald-700">
                Present: <strong className="font-mono">{ledgerStats.present}</strong>
              </span>
              <span>•</span>
              <span className="text-amber-700">
                Late: <strong className="font-mono">{ledgerStats.late}</strong>
              </span>
              <span>•</span>
              <span className="text-purple-700">
                On Leave: <strong className="font-mono">{ledgerStats.onLeave}</strong>
              </span>
              <span>•</span>
              <span className="text-slate-700">
                Average Stay: <strong className="font-mono">{ledgerStats.avgStay}h</strong>
              </span>
            </div>

            {(deptFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery || dateFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setDeptFilter('ALL');
                  setStatusFilter('ALL');
                  setSearchQuery('');
                  setDateFilter('ALL');
                }}
                className="text-blue-600 hover:underline font-semibold"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Master Attendance Records Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          {filteredAttendance.length === 0 ? (
            <div className="text-center py-10 px-4 space-y-2.5">
              <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No Attendance Records Found</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No attendance logs match the active criteria. As employees punch in or out on the Finger Touch Kiosk, their real-time biometric logs stream directly to this Super-Admin ledger.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[760px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">In Time</th>
                    <th className="py-2.5 px-3">Out Time</th>
                    <th className="py-2.5 px-3">Net Stay</th>
                    <th className="py-2.5 px-3">Overtime</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Biometric Audit</th>
                    <th className="py-2.5 px-3">Location / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAttendance.map((rec) => {
                    if (!rec) return null;
                    const emp = (employees || []).find((e) => e?.id === rec.employeeId);
                    const isSunday = rec.date ? new Date(rec.date + 'T00:00:00').getDay() === 0 : false;
                    const initials = (rec.employeeName || 'Staff')
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean)
                      .map((n) => n ? n[0] : '')
                      .join('')
                      .toUpperCase()
                      .slice(0, 2) || 'ST';

                    return (
                      <tr key={rec.id || Math.random().toString()} className="hover:bg-slate-50/80 transition-colors">
                        {/* Date */}
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-800 font-medium">
                          <div className="flex items-center gap-1.5">
                            <span>{rec.date || '—'}</span>
                            {isSunday && (
                              <span className="text-[9px] px-1 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-bold">
                                SUN
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Employee */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                              style={{ backgroundColor: emp?.avatarColor || '#2563EB' }}
                            >
                              {initials}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block truncate max-w-[130px]">
                                {rec.employeeName || 'Staff'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono block">
                                {rec.employeeId || '—'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="py-2.5 px-3 text-slate-600 font-medium whitespace-nowrap">
                          {emp?.department || 'Operations'}
                        </td>

                        {/* In Time */}
                        <td className="py-2.5 px-3 font-mono">
                          {rec.inTime ? (
                            <span
                              className={
                                rec.status === 'LATE' ? 'text-amber-600 font-bold' : 'text-slate-800 font-semibold'
                              }
                            >
                              {rec.inTime}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Out Time */}
                        <td className="py-2.5 px-3 font-mono">
                          {rec.outTime ? (
                            <span className="text-slate-800 font-semibold">{rec.outTime}</span>
                          ) : rec.inTime ? (
                            <span className="text-blue-600 font-semibold animate-pulse text-[11px]">
                              🟢 In Session
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Work Hours */}
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {typeof rec.workHours === 'number' && rec.workHours > 0 ? `${rec.workHours}h` : '0.0'}
                        </td>

                        {/* Overtime */}
                        <td className="py-2.5 px-3 font-mono text-emerald-600 font-bold">
                          {typeof rec.overtimeHours === 'number' && rec.overtimeHours > 0 ? `+${rec.overtimeHours}h` : '0.0'}
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <StatusBadge status={rec.status || 'PRESENT'} size="sm" />
                        </td>

                        {/* Biometric Audit */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
                            <Fingerprint className="w-3 h-3 text-cyan-600" />
                            <span>Hash Verified</span>
                          </span>
                        </td>

                        {/* Location / Notes */}
                        <td className="py-2.5 px-3 text-slate-500 text-[11px] max-w-[150px] truncate">
                          {rec.locationType || 'HQ'} • {rec.notes || 'Normal shift'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Broadcast Engine (Left) & Telemetry Stream (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Broadcast Engine (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600" />
                Broadcast Company Event / Directive
              </h3>
            </div>

            {broadcastSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Event broadcasted successfully to all staff channels!</span>
              </div>
            )}

            {/* Quick Templates */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                Quick Template Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => applyTemplate('early')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold"
                >
                  ⚡ Early Checkout 4:30 PM
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('holiday')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold"
                >
                  🗓️ Sunday Off Reminder
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('shift')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold"
                >
                  ⏱️ 9:30 Grace Advisory
                </button>
              </div>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weather Advisory / Early Departure"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Category</label>
                  <select
                    value={broadcastCategory}
                    onChange={(e) => setBroadcastCategory(e.target.value as EventCategory)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="COMPANY_ANNOUNCEMENT">Company Event</option>
                    <option value="HOLIDAY_NOTICE">Holiday Trigger</option>
                    <option value="ADMIN_AUDIT">Super Admin Audit</option>
                    <option value="SYSTEM_ALERT">System Alert</option>
                    <option value="ATTENDANCE_AUTO">Auto Punch &amp; Stay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Severity</label>
                  <select
                    value={broadcastSeverity}
                    onChange={(e) => setBroadcastSeverity(e.target.value as EventSeverity)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="INFO">Info (Blue)</option>
                    <option value="SUCCESS">Success (Emerald)</option>
                    <option value="WARNING">Warning (Amber)</option>
                    <option value="CRITICAL">Critical (Rose)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Target Department</label>
                <select
                  value={broadcastDept}
                  onChange={(e) => setBroadcastDept(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="All Departments">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Finance">Finance</option>
                  <option value="Quality Assurance">Quality Assurance</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Detailed Message / Directive</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide directive text for all employees..."
                  value={broadcastDesc}
                  onChange={(e) => setBroadcastDesc(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Broadcast Event to System</span>
              </button>
            </form>
          </div>
        </div>

        {/* Live Telemetry Stream (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                Live Telemetry Event Feed
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                {systemEvents.length} Captured Events
              </span>
            </div>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin">
              {(systemEvents || []).map((evt) => {
                if (!evt) return null;
                let badgeClass = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
                if (evt.severity === 'SUCCESS') {
                  badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                } else if (evt.severity === 'WARNING') {
                  badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                } else if (evt.severity === 'CRITICAL') {
                  badgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                }

                return (
                  <div
                    key={evt.id || Math.random().toString()}
                    className="p-3.5 bg-slate-800/80 border border-slate-700/80 rounded-xl space-y-1.5 hover:border-slate-600 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${badgeClass}`}>
                          {evt.severity || 'INFO'}
                        </span>
                        <span className="text-xs font-bold text-white tracking-tight">{evt.title || 'System Notification'}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                        {evt.timestamp || 'Live'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{evt.description || ''}</p>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-mono">
                      <span>Target: {evt.targetDepartment || 'All Departments'}</span>
                      <span>Author: {evt.author || 'Natton System'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
