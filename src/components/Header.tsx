import React, { useState, useEffect } from 'react';
import {
  Fingerprint,
  User,
  Clock,
  Calendar,
  Shield,
  Users,
  FileSpreadsheet,
  Award,
  RotateCcw,
  CheckCircle2,
  Lock,
  Menu,
  X,
  Trash2,
  ChevronRight,
  Mail,
  Cloud,
  LogOut,
} from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';

export type TabType =
  | 'TOUCH_SCREEN'
  | 'MY_DASHBOARD'
  | 'LOGS'
  | 'REPORTS'
  | 'EMPLOYEES'
  | 'HOLIDAYS'
  | 'ADMIN'
  | 'SUPER_ADMIN';

interface HeaderProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab }) => {
  const {
    isCloudConnected,
    isAdminLoggedIn,
    isSuperAdminLoggedIn,
    resetAllData,
    clearAttendanceLogs,
    employees,
    selectedEmployeeId,
    setSelectedEmployeeId,
    activeEmployeeSession,
    logoutEmployeeSession,
    logoutSuperAdmin,
    logoutAdmin,
    dispatchedEmails,
    setActiveEmailModal,
  } = useAttendance();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setCurrentDateStr(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    {
      id: 'TOUCH_SCREEN' as TabType,
      label: 'Finger Touch Kiosk',
      icon: Fingerprint,
      badge: 'Biometric',
    },
    {
      id: 'MY_DASHBOARD' as TabType,
      label: activeEmployeeSession?.name
        ? `${activeEmployeeSession.name.trim().split(/\s+/)[0]}'s Dashboard`
        : 'Employee Dashboard',
      icon: User,
      highlight: Boolean(activeEmployeeSession),
      badge: activeEmployeeSession ? 'Unlocked' : 'Protected',
    },
    { id: 'LOGS' as TabType, label: 'Attendance Matrix', icon: FileSpreadsheet },
    { id: 'REPORTS' as TabType, label: 'Analytics & Reports', icon: Award },
    { id: 'EMPLOYEES' as TabType, label: 'Staff Directory', icon: Users, count: employees.length },
    { id: 'HOLIDAYS' as TabType, label: 'Holidays & Leaves', icon: Calendar },
    {
      id: 'ADMIN' as TabType,
      label: 'Admin Portal',
      icon: isAdminLoggedIn ? CheckCircle2 : Lock,
      highlight: isAdminLoggedIn,
    },
    {
      id: 'SUPER_ADMIN' as TabType,
      label: 'Super Admin',
      icon: Shield,
      highlight: isSuperAdminLoggedIn,
    },
  ];

  const handleTabClick = (tab: TabType) => {
    setCurrentTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Main Top Bar */}
          <div className="flex items-center justify-between py-2 sm:py-2.5 border-b border-slate-800/80">
            {/* Logo & Corporate Title */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0">
              <div
                className="h-8 sm:h-11 flex items-center justify-center flex-shrink-0 cursor-pointer transition-transform hover:scale-102"
                onClick={() => handleTabClick('TOUCH_SCREEN')}
                title="Natton Technologies - Biometric Touch Kiosk"
              >
                <img
                  src="/natton_tech_logo_transparent.png"
                  alt="Natton Technologies"
                  className="h-6 sm:h-9 w-auto object-contain max-w-[105px] sm:max-w-[180px] filter brightness-110 drop-shadow-sm"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('natton_logo.jpg')) {
                      target.src = '/natton_logo.jpg';
                    }
                  }}
                />
              </div>

              {/* Desktop Corporate Title & Policy */}
              <div className="hidden sm:block min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-xs sm:text-base font-bold text-white tracking-tight truncate">
                    Natton Technologies
                  </h1>
                  <span className="hidden md:inline-flex text-[10px] font-semibold text-blue-400 bg-blue-950/80 border border-blue-800 px-2 py-0.2 rounded-full">
                    Biometric Shift System
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      isCloudConnected
                        ? 'text-emerald-300 bg-emerald-950/70 border-emerald-700/80'
                        : 'text-amber-300 bg-amber-950/70 border-amber-700/80'
                    }`}
                    title="All employee data, punches, leaves, and emails are synchronized across all devices in real-time via Cloud Firestore"
                  >
                    <Cloud className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span>{isCloudConnected ? 'Cloud Synced' : 'Connecting...'}</span>
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1.5 truncate">
                  <span className="text-emerald-400 font-medium">09:30 AM – 06:00 PM</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">Sunday Off</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="text-cyan-400 font-mono">Finger Touch Scanner</span>
                </p>
              </div>

              {/* Mobile Compact Live Cloud Indicator */}
              <div className="sm:hidden flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                <span className={`w-2 h-2 rounded-full ${isCloudConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-[9px] font-mono text-emerald-300">Live</span>
              </div>
            </div>

            {/* Right Side: Controls, Mailbox, Logout & Mobile Menu Toggle */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
              {/* Dynamic Live Clock Card (desktop only) */}
              <div className="hidden lg:flex items-center gap-2.5 bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200">
                <Clock className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                <div className="text-right">
                  <div className="text-white font-mono text-xs font-bold">{currentTime || '09:30:00 AM'}</div>
                  <div className="text-[10px] text-slate-400 font-sans">{currentDateStr}</div>
                </div>
              </div>

              {/* Staff Switcher Dropdown (Tablet & Desktop only; on mobile, available in Menu & Dashboard) */}
              {employees.length > 0 ? (
                <div className="hidden md:flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 px-2.5 py-1 rounded-lg">
                  <User className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span className="text-[10px] text-slate-400 font-medium">Staff:</span>
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer max-w-[150px] truncate"
                    title="Select Active Staff Member"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id} className="bg-slate-900 text-white py-1">
                        {emp.name} ({emp.id}) • {emp.department}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <button
                  onClick={() => handleTabClick('EMPLOYEES')}
                  className="hidden md:flex items-center gap-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors"
                  title="No staff registered yet. Click to register new employee"
                >
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>+ Register Staff</span>
                </button>
              )}

              {/* Corporate Dispatched Mailbox Button */}
              {dispatchedEmails.length > 0 && (
                <button
                  onClick={() => setActiveEmailModal(dispatchedEmails[0])}
                  className="relative p-1.5 sm:p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg border border-slate-700 transition-colors flex items-center justify-center cursor-pointer flex-shrink-0"
                  title={`View Dispatched Corporate Emails (${dispatchedEmails.length} sent: OTPs & Credentials)`}
                >
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white font-bold text-[8px] sm:text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {dispatchedEmails.length}
                  </span>
                </button>
              )}

              {/* Context-Aware Logout Action */}
              {(() => {
                if (currentTab === 'SUPER_ADMIN' && isSuperAdminLoggedIn) {
                  return (
                    <button
                      onClick={() => {
                        logoutSuperAdmin();
                        setCurrentTab('TOUCH_SCREEN');
                      }}
                      className="flex items-center gap-1 sm:gap-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer border border-rose-500 whitespace-nowrap flex-shrink-0"
                      title="Logout Super Admin Console & Return to Kiosk"
                    >
                      <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span className="hidden sm:inline">Logout Super Admin</span>
                      <span className="sm:hidden">Logout</span>
                    </button>
                  );
                }

                if (currentTab === 'ADMIN' && isAdminLoggedIn) {
                  return (
                    <button
                      onClick={() => {
                        logoutAdmin();
                        setCurrentTab('TOUCH_SCREEN');
                      }}
                      className="flex items-center gap-1 sm:gap-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer border border-rose-500 whitespace-nowrap flex-shrink-0"
                      title="Logout Admin Portal & Return to Kiosk"
                    >
                      <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span className="hidden sm:inline">Logout Admin</span>
                      <span className="sm:hidden">Logout</span>
                    </button>
                  );
                }

                if (activeEmployeeSession || currentTab === 'MY_DASHBOARD') {
                  return (
                    <button
                      onClick={() => {
                        logoutEmployeeSession();
                        setCurrentTab('TOUCH_SCREEN');
                      }}
                      className="flex items-center gap-1 sm:gap-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer border border-rose-500 whitespace-nowrap flex-shrink-0"
                      title="Logout Employee Session & Return to Kiosk"
                    >
                      <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span className="hidden sm:inline">
                        Logout {activeEmployeeSession?.name ? activeEmployeeSession.name.trim().split(/\s+/)[0] : 'Staff'}
                      </span>
                      <span className="sm:hidden">Logout</span>
                    </button>
                  );
                }

                return null;
              })()}

              {/* Clear / Reset Actions (Desktop only) */}
              <div className="hidden lg:flex items-center gap-1">
                <button
                  onClick={() => {
                    if (window.confirm('Clear all attendance logs to start fresh?')) {
                      clearAttendanceLogs();
                    }
                  }}
                  title="Clear Attendance Logs"
                  className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('Reset system to default settings and staff?')) {
                      resetAllData();
                    }
                  }}
                  title="Reset System"
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-1.5 text-slate-300 hover:text-white bg-slate-800 rounded-lg border border-slate-700 flex-shrink-0"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Desktop Navigation Tabs Bar */}
          <nav className="hidden md:flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 relative ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  } ${item.highlight && !isActive ? 'border border-cyan-500/40 text-cyan-300' : ''}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold border ${
                        item.id === 'TOUCH_SCREEN'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                          : item.badge === 'Unlocked'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-slate-300 font-mono">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 py-3 space-y-2 animate-fade-in shadow-2xl">
            {/* Live Clock info on mobile */}
            <div className="flex items-center justify-between p-2.5 bg-slate-800/80 rounded-xl text-xs border border-slate-700">
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4 text-blue-400 animate-pulse" />
                <span className="font-mono font-bold text-white">{currentTime}</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold">{currentDateStr}</span>
            </div>

            {/* Mobile Staff Switcher */}
            {employees.length > 0 && (
              <div className="p-2.5 bg-slate-800/90 rounded-xl border border-slate-700 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                  <User className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span>Active Staff:</span>
                </div>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="bg-slate-900 text-xs text-white font-bold p-1.5 rounded-lg border border-slate-700 focus:outline-none max-w-[170px] truncate"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.id})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </button>
              );
            })}

            {/* Quick Logout if session active in mobile drawer */}
            {(activeEmployeeSession || isSuperAdminLoggedIn || isAdminLoggedIn) && (
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                {activeEmployeeSession && (
                  <button
                    onClick={() => {
                      logoutEmployeeSession();
                      handleTabClick('TOUCH_SCREEN');
                    }}
                    className="w-full py-2.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout Employee ({activeEmployeeSession.name.trim().split(/\s+/)[0]})</span>
                  </button>
                )}
                {isSuperAdminLoggedIn && (
                  <button
                    onClick={() => {
                      logoutSuperAdmin();
                      handleTabClick('TOUCH_SCREEN');
                    }}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-900/50 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Exit Super Admin Session</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Mobile Fixed Bottom Navigation Bar - Perfectly spaced 5 buttons */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 py-1.5 px-1 flex items-center justify-around text-slate-400 shadow-2xl">
        <button
          onClick={() => handleTabClick('TOUCH_SCREEN')}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors ${
            currentTab === 'TOUCH_SCREEN' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Fingerprint className="w-4 h-4 flex-shrink-0" />
          <span className="text-[10px] mt-0.5 truncate max-w-full font-medium">Scanner</span>
        </button>

        <button
          onClick={() => handleTabClick('MY_DASHBOARD')}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors ${
            currentTab === 'MY_DASHBOARD' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <User className="w-4 h-4 flex-shrink-0" />
          <span className="text-[10px] mt-0.5 truncate max-w-full font-medium">Dashboard</span>
        </button>

        <button
          onClick={() => handleTabClick('EMPLOYEES')}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors ${
            currentTab === 'EMPLOYEES' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Users className="w-4 h-4 flex-shrink-0" />
          <span className="text-[10px] mt-0.5 truncate max-w-full font-medium">Staff</span>
        </button>

        <button
          onClick={() => handleTabClick('SUPER_ADMIN')}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors ${
            currentTab === 'SUPER_ADMIN' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Shield className="w-4 h-4 flex-shrink-0" />
          <span className="text-[10px] mt-0.5 truncate max-w-full font-medium">Admin</span>
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors ${
            isMobileMenuOpen ? 'text-white font-bold' : 'text-slate-400'
          }`}
        >
          <Menu className="w-4 h-4 flex-shrink-0" />
          <span className="text-[10px] mt-0.5 truncate max-w-full font-medium">Menu</span>
        </button>
      </div>
    </>
  );
};
