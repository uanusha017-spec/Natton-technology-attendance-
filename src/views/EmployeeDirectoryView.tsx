import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Employee } from '../types/attendance';
import {
  Users,
  Search,
  Plus,
  Mail,
  MapPin,
  Clock,
  Building,
  Edit2,
  FileText,
  X,
  Phone,
  CheckCircle2,
  AlertCircle,
  Key,
  Fingerprint,
  ShieldCheck,
  Send,
  Sparkles,
  ExternalLink,
  Calendar,
  Check,
} from 'lucide-react';

interface EmployeeDirectoryViewProps {
  onNavigateToReport?: () => void;
}

export const EmployeeDirectoryView: React.FC<EmployeeDirectoryViewProps> = ({
  onNavigateToReport,
}) => {
  const {
    employees,
    addEmployee,
    updateEmployee,
    setSelectedEmployeeId,
    sendVerificationOtp,
    verifyOtp,
    registerNewEmployeeWithCredentials,
    setActiveEmailModal,
    dispatchedEmails,
    setEnrollmentModalEmployeeId,
    getEmployeeTodayRecord,
    todayDate,
    leaveRequests,
    isEmailAlreadyVerified,
    markEmailAsVerified,
    verifiedEmails,
  } = useAttendance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENT' | 'LATE' | 'ON_LEAVE' | 'NOT_CHECKED_IN'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [shiftStart, setShiftStart] = useState('09:30');
  const [shiftEnd, setShiftEnd] = useState('18:00');
  const [location, setLocation] = useState('Pride Icon, 1st Floor, Shop Number 37, Gokul Road');
  const [phone, setPhone] = useState('+91 ');
  const [customId, setCustomId] = useState('');

  // Email verification & OTP state
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [lastGeneratedOtp, setLastGeneratedOtp] = useState<string | null>(null);
  const [otpMessage, setOtpMessage] = useState<{ type: 'idle' | 'success' | 'error'; text: string }>({
    type: 'idle',
    text: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  const departments = [
    'ALL',
    'Engineering',
    'Design',
    'Management',
    'Human Resources',
    'Finance',
    'Quality Assurance',
    'Operations',
  ];

  // Real-time Employee Status for Today
  const getEmployeeLiveStatus = (emp: Employee) => {
    // 1. Check for approved leave covering today
    const activeLeave = leaveRequests.find(
      (l) =>
        l.employeeId === emp.id &&
        l.status === 'Approved' &&
        todayDate >= l.startDate &&
        todayDate <= l.endDate
    );
    if (activeLeave) {
      return {
        status: 'ON_LEAVE' as const,
        label: 'On-Leave',
        detail: activeLeave.leaveType || 'Approved Leave',
      };
    }

    // 2. Check today's punch record
    const record = getEmployeeTodayRecord(emp.id);
    if (record && record.inTime) {
      if (record.status === 'LATE') {
        return {
          status: 'LATE' as const,
          label: 'Late',
          detail: `In: ${record.inTime}`,
        };
      }
      if (record.status === 'ON_LEAVE') {
        return {
          status: 'ON_LEAVE' as const,
          label: 'On-Leave',
          detail: 'Leave Approved',
        };
      }
      return {
        status: 'PRESENT' as const,
        label: 'Present',
        detail: `In: ${record.inTime}`,
      };
    }

    return {
      status: 'NOT_CHECKED_IN' as const,
      label: 'Not Checked In',
      detail: `Shift: ${emp.shiftStart || '09:30'}`,
    };
  };

  const statusCounts = employees.reduce(
    (acc, emp) => {
      const s = getEmployeeLiveStatus(emp).status;
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    },
    { PRESENT: 0, LATE: 0, ON_LEAVE: 0, NOT_CHECKED_IN: 0 } as Record<string, number>
  );

  const filteredEmployees = employees.filter((emp) => {
    if (selectedDept !== 'ALL' && emp.department !== selectedDept) return false;
    if (statusFilter !== 'ALL' && getEmployeeLiveStatus(emp).status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = emp.name.toLowerCase().includes(q);
      const matchRole = emp.role.toLowerCase().includes(q);
      const matchId = emp.id.toLowerCase().includes(q);
      const matchEmail = emp.email.toLowerCase().includes(q);
      if (!matchName && !matchRole && !matchId && !matchEmail) return false;
    }
    return true;
  });

  // Format and enforce Indian phone number (+91 XXXXX XXXXX)
  const handlePhoneChange = (inputVal: string) => {
    let clean = inputVal;
    if (!clean.startsWith('+91')) {
      clean = '+91 ' + clean.replace(/^\+?91\s*/, '');
    }
    const digits = clean.substring(3).replace(/\D/g, '').substring(0, 10);
    let formatted = '+91';
    if (digits.length > 0) {
      if (digits.length <= 5) {
        formatted += ' ' + digits;
      } else {
        formatted += ' ' + digits.substring(0, 5) + ' ' + digits.substring(5);
      }
    } else {
      formatted += ' ';
    }
    setPhone(formatted);
  };

  // Open official Natton Technologies email & OTP for any employee
  const handleOpenEmployeeMail = (targetEmp: Employee) => {
    const cleanEmail = targetEmp.email.toLowerCase().trim();
    const existing = dispatchedEmails.find(
      (m) =>
        (m.recipientEmail && m.recipientEmail.toLowerCase().trim() === cleanEmail) ||
        (m.credentials?.employeeId && m.credentials.employeeId === targetEmp.id)
    );
    if (existing) {
      setActiveEmailModal(existing);
    } else {
      const res = sendVerificationOtp(targetEmp.email, targetEmp.name);
      if (res.emailRecord) {
        setActiveEmailModal(res.emailRecord);
      }
    }
  };

  const handleOpenAdd = () => {
    setName('');
    setEmail('');
    setRole('');
    setDepartment('Engineering');
    setShiftStart('09:30');
    setShiftEnd('18:00');
    setLocation('Pride Icon, 1st Floor, Shop Number 37, Gokul Road');
    setPhone('+91 ');
    setCustomId(`EMP-${1000 + employees.length + 1}`);
    setEditingEmp(null);
    setIsEmailVerified(false);
    setOtpInput('');
    setOtpSent(false);
    setOtpMessage({ type: 'idle', text: '' });
    setFormError(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setName(emp.name);
    setEmail(emp.email);
    setRole(emp.role);
    setDepartment(emp.department);
    setShiftStart(emp.shiftStart);
    setShiftEnd(emp.shiftEnd);
    setLocation(emp.workLocation);
    setPhone(emp.phone.startsWith('+91') ? emp.phone : `+91 ${emp.phone.replace(/\D/g, '').slice(-10)}`);
    setCustomId(emp.id);
    setIsEmailVerified(true);
    setOtpSent(false);
    setOtpMessage({ type: 'idle', text: '' });
    setFormError(null);
    setShowAddModal(true);
  };

  // Automatically send OTP when user enters a valid dynamic email
  const handleSendOtp = () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setOtpMessage({ type: 'error', text: 'Please enter a valid corporate or dynamic email address.' });
      return;
    }

    if (isEmailAlreadyVerified(cleanEmail)) {
      setIsEmailVerified(true);
      setOtpSent(false);
      setOtpMessage({
        type: 'success',
        text: '✅ Corporate email is already verified! No OTP required.',
      });
      return;
    }

    const res = sendVerificationOtp(cleanEmail, name || 'New Staff');
    if (res.success) {
      setOtpSent(true);
      if (res.otp) {
        setLastGeneratedOtp(res.otp);
      }
      setOtpMessage({
        type: 'success',
        text: `OTP dispatched to ${cleanEmail}! Use 1-click Auto-Fill or open in Gmail/Mail App to verify.`,
      });
    }
  };

  // 1-Click Auto-Fill OTP
  const handleAutoFillOtp = (forcedCode?: string) => {
    const code = forcedCode || lastGeneratedOtp;
    if (code) {
      setOtpInput(code);
      const res = verifyOtp(email, code);
      if (res.success) {
        setIsEmailVerified(true);
        setOtpMessage({ type: 'success', text: '✅ Email successfully verified with 1-click code!' });
      } else {
        setOtpMessage({ type: 'error', text: res.message });
      }
    }
  };

  // Verify entered OTP
  const handleVerifyOtp = () => {
    if (!otpInput || otpInput.trim().length !== 6) {
      setOtpMessage({ type: 'error', text: 'Please enter the complete 6-digit verification code.' });
      return;
    }

    const res = verifyOtp(email, otpInput.trim());
    if (res.success) {
      setIsEmailVerified(true);
      setOtpMessage({ type: 'success', text: 'Email successfully verified!' });
    } else {
      setOtpMessage({ type: 'error', text: res.message });
    }
  };

  // Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // 1. Validate Indian phone number
    const digitsOnly = phone.replace(/^\+91\s*/, '').replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      setFormError('Please enter a valid 10-digit Indian mobile number starting with +91 (e.g. +91 98765 43210).');
      return;
    }

    // 2. Validate email verification
    const verified = isEmailVerified || isEmailAlreadyVerified(email);
    if (!editingEmp && !verified) {
      setFormError('Please verify your dynamic corporate email address with OTP before registering.');
      return;
    }

    if (editingEmp) {
      updateEmployee(editingEmp.id, {
        name,
        email,
        role,
        department,
        shiftName: `Natton Shift (${shiftStart} - ${shiftEnd})`,
        shiftStart,
        shiftEnd,
        workLocation: location,
        phone,
      });
      setShowAddModal(false);
    } else {
      // Register with automated credentials generation and welcome email dispatch
      registerNewEmployeeWithCredentials(
        {
          name,
          email,
          role,
          department,
          shiftName: `Natton Shift (${shiftStart} - ${shiftEnd})`,
          shiftStart,
          shiftEnd,
          workLocation: location,
          phone,
        },
        customId.trim() || undefined
      );

      setShowAddModal(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              Staff Directory
            </h2>
            <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
              {employees.length} Active Staff
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered team roster • Indian Phone (+91) Verified • Automated Email OTP &amp; Biometric Onboarding
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Dispatched Emails View Button */}
          {dispatchedEmails.length > 0 && (
            <button
              onClick={() => setActiveEmailModal(dispatchedEmails[0])}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
              title="View latest dispatched corporate emails"
            >
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>Dispatched Emails ({dispatchedEmails.length})</span>
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar - Mobile Responsive */}
      <div className="bg-white border border-slate-200 p-3.5 sm:p-4 rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search staff by name, role, email, phone, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 sm:py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium text-xs transition-colors ${
                  selectedDept === dept
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Visual Status Filter Tabs */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
            Status:
          </span>

          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              statusFilter === 'ALL'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>All Staff</span>
            <span className="text-[10px] bg-slate-700/50 text-slate-200 px-1.5 py-0.2 rounded-full font-mono">
              {employees.length}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('PRESENT')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              statusFilter === 'PRESENT'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Present</span>
            <span className="text-[10px] bg-emerald-800/30 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full font-mono">
              {statusCounts.PRESENT}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('LATE')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              statusFilter === 'LATE'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Late</span>
            <span className="text-[10px] bg-amber-800/30 text-amber-800 font-bold px-1.5 py-0.2 rounded-full font-mono">
              {statusCounts.LATE}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('ON_LEAVE')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              statusFilter === 'ON_LEAVE'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            <Calendar className="w-3 h-3 text-purple-600" />
            <span>On-Leave</span>
            <span className="text-[10px] bg-purple-800/30 text-purple-800 font-bold px-1.5 py-0.2 rounded-full font-mono">
              {statusCounts.ON_LEAVE}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('NOT_CHECKED_IN')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              statusFilter === 'NOT_CHECKED_IN'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-300" />
            <span>Not Checked In</span>
            <span className="text-[10px] bg-slate-300/60 text-slate-600 font-bold px-1.5 py-0.2 rounded-full font-mono">
              {statusCounts.NOT_CHECKED_IN}
            </span>
          </button>
        </div>
      </div>

      {/* Employees Grid or Zero Dummy Data Empty State */}
      {filteredEmployees.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm space-y-4 my-4">
          <div className="w-16 h-16 bg-blue-50 border border-blue-200 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Zero Dummy Data • Staff Directory Clean</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              No placeholder staff exists. Click the button below to register your real employees with Indian phone (+91), dynamic corporate email OTP verification, and biometric enrollment.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="py-3 px-6 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredEmployees.map((emp) => {
            const isEnrolled = emp.biometric && emp.biometric.isEnrolled;
            const liveStatus = getEmployeeLiveStatus(emp);

            return (
              <div
                key={emp.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-base font-bold shadow-sm flex-shrink-0"
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
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{emp.name}</h3>
                        <p className="text-[11px] text-blue-600 font-medium truncate">{emp.role}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenEdit(emp)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Employee"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Real-Time Visual Status Badge */}
                  <div className="mb-3">
                    {liveStatus.status === 'PRESENT' && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs w-full justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                          </span>
                          <span className="font-bold text-emerald-950">Present</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-800 bg-white/90 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold flex-shrink-0">
                          {liveStatus.detail}
                        </span>
                      </div>
                    )}

                    {liveStatus.status === 'LATE' && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-xs w-full justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
                          <span className="font-bold text-amber-950">Late</span>
                        </div>
                        <span className="text-[10px] font-mono text-amber-900 bg-white/90 border border-amber-200 px-1.5 py-0.2 rounded font-semibold flex-shrink-0">
                          {liveStatus.detail}
                        </span>
                      </div>
                    )}

                    {liveStatus.status === 'ON_LEAVE' && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-purple-50 text-purple-900 border border-purple-200 shadow-xs w-full justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Calendar className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                          <span className="font-bold text-purple-950">On-Leave</span>
                        </div>
                        <span className="text-[10px] text-purple-800 bg-white/90 border border-purple-200 px-1.5 py-0.2 rounded font-semibold truncate flex-shrink-0">
                          {liveStatus.detail}
                        </span>
                      </div>
                    )}

                    {liveStatus.status === 'NOT_CHECKED_IN' && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200 w-full justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="w-2 h-2 rounded-full bg-slate-300 flex-shrink-0" />
                          <span className="truncate">Not Checked In</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">
                          {liveStatus.detail}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 text-[11px] sm:text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{emp.department}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="font-mono text-slate-700">{emp.phone}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate text-slate-600">{emp.email}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="font-mono">{emp.shiftStart} – {emp.shiftEnd}</span>
                    </div>
                  </div>

                  {/* Biometric Status Badge */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Biometric:</span>
                    {isEnrolled ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        {emp.biometric?.finger}
                      </span>
                    ) : (
                      <button
                        onClick={() => setEnrollmentModalEmployeeId(emp.id)}
                        className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] cursor-pointer"
                      >
                        <Fingerprint className="w-3 h-3 text-amber-600" />
                        Register Finger
                      </button>
                    )}
                  </div>

                  {/* Official Natton Technologies Corporate Email & OTP */}
                  {(() => {
                    const cleanEmail = emp.email.toLowerCase().trim();
                    const latestEmailForEmp = dispatchedEmails.find(
                      (m) =>
                        (m.recipientEmail && m.recipientEmail.toLowerCase().trim() === cleanEmail) ||
                        (m.credentials?.employeeId && m.credentials.employeeId === emp.id)
                    );
                    const isVerified = isEmailAlreadyVerified(emp.email);

                    return (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-semibold flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-blue-600" />
                            <span>Natton Tech Mail &amp; OTP</span>
                          </span>
                          {isVerified ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Verified</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              OTP Active
                            </span>
                          )}
                        </div>

                        <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border border-blue-200 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-2xs">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-black text-blue-950 uppercase tracking-tight">
                                Natton Technologies
                              </span>
                              {latestEmailForEmp?.otpCode && (
                                <span className="bg-blue-600 text-white font-mono font-black text-[10px] px-1.5 py-0.2 rounded shadow-2xs">
                                  OTP: {latestEmailForEmp.otpCode}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
                              {emp.email}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenEmployeeMail(emp)}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-[10px] rounded-lg shadow-xs flex items-center gap-1 transition-all cursor-pointer"
                              title="Open official verification email & OTP from Natton Technologies"
                            >
                              <Mail className="w-3 h-3" />
                              <span>Open Mail</span>
                            </button>

                            {!isVerified && (
                              <button
                                type="button"
                                onClick={() => markEmailAsVerified(emp.email)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-[10px] rounded-lg shadow-xs flex items-center gap-1 transition-all cursor-pointer"
                                title="Mark verified permanently (never asks again)"
                              >
                                <Check className="w-3 h-3" />
                                <span>Verify</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] sm:text-[11px] text-slate-400 font-bold">{emp.id}</span>
                  <button
                    onClick={() => {
                      setSelectedEmployeeId(emp.id);
                      if (onNavigateToReport) onNavigateToReport();
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 rounded-lg text-[10px] sm:text-[11px] font-semibold transition-all flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" />
                    Report
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Register / Edit Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-scale-up max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                {editingEmp ? 'Edit Staff Member' : 'Register New Employee'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Banner */}
            {formError && (
              <div className="my-3 p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 pt-3 text-xs">
              {/* Full Name & Employee ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Employee ID</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingEmp}
                    value={customId}
                    onChange={(e) => setCustomId(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold disabled:bg-slate-100"
                  />
                </div>
              </div>

              {/* Indian Phone Number (Enforced +91) */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1 flex items-center justify-between">
                  <span>Indian Phone Number (Starts with +91)</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">🇮🇳 India Country Code</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Format: +91 followed by 10-digit Indian mobile number.
                </p>
              </div>

              {/* Dynamic Corporate Email & OTP Verification */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 font-bold text-xs">
                    Corporate Email &amp; Verification
                  </label>
                  {isEmailAlreadyVerified(email) || isEmailVerified ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Email Verified (Never Asked Again)
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
                      OTP Required
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    required
                    disabled={(isEmailVerified || isEmailAlreadyVerified(email)) && !editingEmp}
                    placeholder="e.g. employee@company.com"
                    value={email}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEmail(val);
                      if (isEmailAlreadyVerified(val)) {
                        setIsEmailVerified(true);
                        setOtpSent(false);
                        setOtpMessage({ type: 'success', text: '✅ Email is already verified! No OTP needed.' });
                      } else {
                        setIsEmailVerified(false);
                        setOtpSent(false);
                        setOtpMessage({ type: 'idle', text: '' });
                      }
                    }}
                    onBlur={() => {
                      if (!editingEmp && !isEmailAlreadyVerified(email) && !otpSent && email.includes('@') && email.includes('.')) {
                        handleSendOtp();
                      }
                    }}
                    className="flex-1 p-2 border border-slate-200 rounded-xl text-slate-800 bg-white font-medium"
                  />

                  {!isEmailVerified && !isEmailAlreadyVerified(email) && !editingEmp && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[11px] whitespace-nowrap shadow-xs flex items-center justify-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>{otpSent ? 'Resend OTP' : 'Send Verification OTP'}</span>
                    </button>
                  )}
                </div>

                {/* OTP Input Section (When OTP has been dispatched and NOT already verified) */}
                {!editingEmp && !isEmailVerified && !isEmailAlreadyVerified(email) && otpSent && (
                  <div className="pt-2 border-t border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-700 font-semibold block">
                        Enter 6-Digit OTP sent to your email:
                      </span>
                      {lastGeneratedOtp && (
                        <button
                          type="button"
                          onClick={() => handleAutoFillOtp(lastGeneratedOtp)}
                          className="text-[10px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                          title="Click to automatically fill and verify the generated OTP code"
                        >
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          <span>⚡ Auto-Fill Code ({lastGeneratedOtp})</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="e.g. 584912"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').substring(0, 6))}
                        className="w-32 p-2 border border-blue-300 rounded-xl font-mono text-center font-bold tracking-widest text-slate-900 bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer"
                      >
                        Verify OTP
                      </button>

                      <a
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(`[Natton Technologies] Official Employee Verification Code (OTP: ${lastGeneratedOtp || ''})`)}&body=${encodeURIComponent(
                          `============================================================\n🏢 NATTON TECHNOLOGIES — OFFICIAL CORPORATE DISPATCH\n============================================================\nCompany: Natton Technologies\nAddress: Pride Icon, 1st Floor, Shop Number 37, Gokul Road, Beside South Indian Shopping Mall\nFrom: Natton Technologies <onboarding@nattontechnology.com>\n============================================================\n\nDear ${name || 'Team Member'},\n\nThis is an official verification email from Natton Technologies.\n\nYour 6-Digit Email Verification Code (OTP) is:\n\n👉  ${lastGeneratedOtp || ''}  👈\n\nEnter this code into the registration form to verify your corporate email.\n\nWarm regards,\nNatton Technologies Human Resources Team\nPride Icon, 1st Floor, Shop Number 37, Gokul Road, Beside South Indian Shopping Mall`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl font-bold text-[11px] flex items-center gap-1 transition-colors"
                        title="Open in Gmail Web"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open Gmail</span>
                      </a>

                      <a
                        href={`mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(`[Natton Technologies] Official Employee Verification Code (OTP: ${lastGeneratedOtp || ''})`)}&body=${encodeURIComponent(
                          `============================================================\n🏢 NATTON TECHNOLOGIES — OFFICIAL CORPORATE DISPATCH\n============================================================\nCompany: Natton Technologies\nAddress: Pride Icon, 1st Floor, Shop Number 37, Gokul Road, Beside South Indian Shopping Mall\nFrom: Natton Technologies <onboarding@nattontechnology.com>\n============================================================\n\nDear ${name || 'Team Member'},\n\nThis is an official verification email from Natton Technologies.\n\nYour 6-Digit Email Verification Code (OTP) is:\n\n👉  ${lastGeneratedOtp || ''}  👈\n\nEnter this code into the registration form to verify your corporate email.\n\nWarm regards,\nNatton Technologies Human Resources Team\nPride Icon, 1st Floor, Shop Number 37, Gokul Road, Beside South Indian Shopping Mall`
                        )}`}
                        className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-xl font-medium text-[11px] flex items-center gap-1 transition-colors"
                        title="Open in default mail client"
                      >
                        <Mail className="w-3 h-3" />
                        <span>Mail App</span>
                      </a>
                    </div>

                    {lastGeneratedOtp && (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl text-[10px] text-blue-900 leading-snug">
                        <strong>Live OTP Code:</strong> <span className="font-mono font-bold text-blue-950 bg-white px-1.5 py-0.5 rounded border border-blue-300">{lastGeneratedOtp}</span>. If public Gmail filters automated preview emails, click <strong>Auto-Fill Code</strong> to verify instantly.
                      </div>
                    )}
                  </div>
                )}

                {/* OTP feedback message */}
                {otpMessage.text && (
                  <p
                    className={`text-[11px] font-medium ${
                      otpMessage.type === 'success' ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {otpMessage.text}
                  </p>
                )}
              </div>

              {/* Role & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Designation / Role</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Full Stack Developer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl text-slate-800 font-medium"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Management">Management</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance">Finance</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              {/* Shift Timings */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="font-semibold text-slate-800 block text-[11px]">
                  Assigned Shift Standard (09:30 AM – 06:00 PM)
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-500 text-[10px] mb-1">Shift Start</label>
                    <input
                      type="text"
                      value={shiftStart}
                      onChange={(e) => setShiftStart(e.target.value)}
                      placeholder="09:30"
                      className="w-full p-1.5 border border-slate-200 rounded-lg font-mono text-slate-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] mb-1">Shift End</label>
                    <input
                      type="text"
                      value={shiftEnd}
                      onChange={(e) => setShiftEnd(e.target.value)}
                      placeholder="18:00"
                      className="w-full p-1.5 border border-slate-200 rounded-lg font-mono text-slate-800 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Work Location */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Work Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Pride Icon, 1st Floor, Shop Number 37, Gokul Road"
                  className="w-full p-2 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              {/* Note on automated credentials & fingerprint */}
              {!editingEmp && (
                <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-blue-900 text-[11px] space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Automated Credentials &amp; Biometric Link
                  </span>
                  <p className="text-blue-800">
                    Upon clicking Register, a corporate login email with password will be automatically dispatched to <strong className="font-mono">{email || 'your email'}</strong>, containing the link to register your biometric fingerprint!
                  </p>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm flex items-center gap-1.5"
                >
                  <span>{editingEmp ? 'Save Changes' : 'Register & Send Login Email'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
