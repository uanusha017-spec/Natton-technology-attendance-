/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AttendanceProvider } from './context/AttendanceContext';
import { Header, TabType } from './components/Header';
import { BiometricTouchScreen } from './views/BiometricTouchScreen';
import { EmployeeDashboardView } from './views/EmployeeDashboardView';
import { AttendanceLogView } from './views/AttendanceLogView';
import { EmployeeReportView } from './views/EmployeeReportView';
import { EmployeeDirectoryView } from './views/EmployeeDirectoryView';
import { HolidaysLeavesView } from './views/HolidaysLeavesView';
import { AdminPortalView } from './views/AdminPortalView';
import { SuperAdminView } from './views/SuperAdminView';
import { DispatchedEmailModal } from './components/DispatchedEmailModal';
import { BiometricEnrollmentModal } from './components/BiometricEnrollmentModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ShieldCheck, MapPin } from 'lucide-react';

function AppContent() {
  // Direct dashboard is not shown initially; touch screen kiosk is the entry point
  const [currentTab, setCurrentTab] = useState<TabType>('TOUCH_SCREEN');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased">
      {/* Corporate Header */}
      <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Area - with bottom padding on mobile for the fixed bottom bar */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
        {currentTab === 'TOUCH_SCREEN' && (
          <BiometricTouchScreen
            onUnlockDashboard={() => setCurrentTab('MY_DASHBOARD')}
            onNavigateToDirectory={() => setCurrentTab('EMPLOYEES')}
          />
        )}
        {currentTab === 'MY_DASHBOARD' && (
          <EmployeeDashboardView
            onLockTerminal={() => setCurrentTab('TOUCH_SCREEN')}
            onNavigateToDirectory={() => setCurrentTab('EMPLOYEES')}
          />
        )}
        {currentTab === 'LOGS' && <AttendanceLogView />}
        {currentTab === 'REPORTS' && <EmployeeReportView />}
        {currentTab === 'EMPLOYEES' && (
          <EmployeeDirectoryView onNavigateToReport={() => setCurrentTab('REPORTS')} />
        )}
        {currentTab === 'HOLIDAYS' && <HolidaysLeavesView />}
        {currentTab === 'ADMIN' && (
          <AdminPortalView
            onNavigateToSuperAdmin={() => setCurrentTab('SUPER_ADMIN')}
            onNavigateToEmployeeDashboard={() => setCurrentTab('MY_DASHBOARD')}
            onExit={() => setCurrentTab('TOUCH_SCREEN')}
          />
        )}
        {currentTab === 'SUPER_ADMIN' && (
          <ErrorBoundary fallbackTitle="Super Admin Live Console">
            <SuperAdminView
              onExit={() => setCurrentTab('TOUCH_SCREEN')}
              onNavigateToAdmin={() => setCurrentTab('ADMIN')}
              onNavigateToEmployeeDashboard={() => setCurrentTab('MY_DASHBOARD')}
            />
          </ErrorBoundary>
        )}
      </main>

      {/* Live Corporate Email Dispatcher Modal (Verification OTP & Credentials) */}
      <DispatchedEmailModal />

      {/* Biometric Fingerprint Enrollment Station (triggered via Email link) */}
      <BiometricEnrollmentModal onCompleted={() => setCurrentTab('MY_DASHBOARD')} />

      {/* Corporate Footer with Address */}
      <footer className="bg-white border-t border-slate-200 py-4 sm:py-6 pb-20 md:pb-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 sm:space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-slate-500">
            {/* Logo & Company Name */}
            <div className="flex items-center gap-2.5">
              <div className="h-8 flex items-center">
                <img
                  src="/natton_tech_logo_transparent.png"
                  alt="Natton Technologies"
                  className="h-7 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/natton_logo.jpg';
                  }}
                />
              </div>
              <div>
                <span className="font-bold text-slate-800 text-sm">Natton Technologies</span>
                <span className="mx-1.5 text-slate-300">•</span>
                <span className="text-slate-500">Dynamic Staff Attendance &amp; Biometric System</span>
              </div>
            </div>

            {/* Shift & Policy Badges */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-slate-700 font-semibold bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                09:30 AM – 06:00 PM Shift Policy
              </span>
              <span className="text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                Sunday Weekly Off
              </span>
              <span className="text-slate-600 font-medium bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
                Dynamic Calculations
              </span>
            </div>
          </div>

          {/* Corporate Address Banner */}
          <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-start sm:items-center gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div className="text-xs">
                <span className="font-bold text-slate-800">Office Address:</span>{' '}
                <span className="text-slate-600 font-medium">
                  Pride Icon, 1st Floor, Shop Number 37, Gokul Road, Beside South Indian Shopping Mall
                </span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Hubballi • Karnataka, India
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AttendanceProvider>
      <AppContent />
    </AttendanceProvider>
  );
}
