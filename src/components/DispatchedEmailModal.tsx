import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import {
  Mail,
  X,
  CheckCircle2,
  Copy,
  Check,
  Fingerprint,
  Key,
  Shield,
  Building,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const DispatchedEmailModal: React.FC = () => {
  const {
    activeEmailModal,
    setActiveEmailModal,
    setEnrollmentModalEmployeeId,
    setSelectedEmployeeId,
    employees,
    markEmailAsVerified,
    isEmailAlreadyVerified,
  } = useAttendance();

  const [copied, setCopied] = useState(false);

  if (!activeEmailModal) return null;

  const matchedEmp = employees.find(
    (e) =>
      (activeEmailModal.credentials?.employeeId && e.id === activeEmailModal.credentials.employeeId) ||
      (e.email && e.email.toLowerCase().trim() === activeEmailModal.recipientEmail.toLowerCase().trim())
  );
  const employeeId = activeEmailModal.credentials?.employeeId || matchedEmp?.id;
  const isVerified = isEmailAlreadyVerified(activeEmailModal.recipientEmail);

  const emailBodyText =
    activeEmailModal.type === 'VERIFICATION_OTP'
      ? `============================================================\n🏢 NATTON TECHNOLOGIES — OFFICIAL CORPORATE DISPATCH\n============================================================\nCompany: Natton Technologies\nAddress: Pride Icon, 1st Floor, Shop Number 37, Gokul Road, Beside South Indian Shopping Mall\nFrom: Natton Technologies Human Resources <onboarding@nattontechnology.com>\n============================================================\n\nDear ${activeEmailModal.recipientName || 'Team Member'},\n\nThis is an official verification email from Natton Technologies.\n\nYour 6-Digit Email Verification Code (OTP) is:\n\n👉  ${activeEmailModal.otpCode}  👈\n\nThis verification code expires in 10 minutes. Please enter this code in the Natton Technologies Staff Registration form to activate your corporate account.\n\nIf you did not request this verification, please contact Natton HR Security immediately.\n\nWarm regards,\nNatton Technologies Human Resources Team\nPride Icon, 1st Floor, Shop Number 37, Gokul Road, Beside South Indian Shopping Mall`
      : `============================================================\n🏢 NATTON TECHNOLOGIES — OFFICIAL CORPORATE DISPATCH\n============================================================\nCompany: Natton Technologies\nAddress: Pride Icon, 1st Floor, Shop Number 37, Gokul Road, Beside South Indian Shopping Mall\nFrom: Natton Technologies Human Resources <onboarding@nattontechnology.com>\n============================================================\n\nDear ${activeEmailModal.recipientName || 'Team Member'},\n\nWelcome to Natton Technologies! Your corporate staff account has been provisioned.\n\nYOUR CORPORATE LOGIN CREDENTIALS:\n• Company Name: Natton Technologies\n• Employee ID: ${activeEmailModal.credentials?.employeeId || employeeId}\n• Corporate Email: ${activeEmailModal.credentials?.email || activeEmailModal.recipientEmail}\n• Temporary Password: ${activeEmailModal.credentials?.password || 'Natton@2025'}\n• Work Shift: ${activeEmailModal.credentials?.shift || '09:30 AM – 06:00 PM standard'}\n• Office Location: ${activeEmailModal.credentials?.location || 'Pride Icon, 1st Floor, Shop Number 37, Gokul Road'}\n\nNEXT MANDATORY STEP: BIOMETRIC REGISTRATION\nPlease login at the Natton Technologies touch screen kiosk to enroll your authorized fingerprint for daily attendance tracking.\n\nWarm regards,\nNatton Technologies Management\nPride Icon, 1st Floor, Shop Number 37, Gokul Road, Beside South Indian Shopping Mall`;

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    activeEmailModal.recipientEmail
  )}&su=${encodeURIComponent(activeEmailModal.subject)}&body=${encodeURIComponent(emailBodyText)}`;

  const mailtoUrl = `mailto:${encodeURIComponent(
    activeEmailModal.recipientEmail
  )}?subject=${encodeURIComponent(activeEmailModal.subject)}&body=${encodeURIComponent(emailBodyText)}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartFingerprintRegistration = () => {
    const targetId = activeEmailModal.credentials?.employeeId || employeeId;
    if (targetId) {
      setSelectedEmployeeId(targetId);
      setEnrollmentModalEmployeeId(targetId);
      setActiveEmailModal(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Email Client Header Bar */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-600/30 border border-blue-500/40 text-blue-400 rounded-lg">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Natton Technologies</span>
                <span className="text-[9px] bg-blue-500/30 text-blue-300 border border-blue-400/40 px-1.5 py-0.2 rounded font-mono">
                  CORPORATE DISPATCH
                </span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">
                  LIVE DELIVERED
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                To: <span className="text-slate-200 font-mono">{activeEmailModal.recipientEmail}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveEmailModal(null)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Close Email"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Meta Envelope */}
        <div className="bg-slate-50 px-4 sm:px-6 py-3 border-b border-slate-200 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-600 text-[11px]">
            <span>
              <strong>From:</strong> Natton Technologies (HR Onboarding) &lt;onboarding@nattontechnology.com&gt;
            </span>
            <span className="font-mono text-slate-400">{activeEmailModal.sentAt}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600 text-[11px] flex-wrap gap-1">
            <span>
              <strong>To:</strong> {activeEmailModal.recipientName || 'Team Member'}{' '}
              &lt;<span className="font-mono text-blue-700 font-semibold">{activeEmailModal.recipientEmail}</span>&gt;
            </span>
            {employeeId && (
              <span className="font-mono text-[10px] bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md font-bold">
                Employee ID: {employeeId}
              </span>
            )}
          </div>
          <div className="text-slate-900 font-bold text-xs sm:text-sm">
            {activeEmailModal.subject}
          </div>
        </div>

        {/* Email Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
          {/* Prominent Company Main Heading Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-blue-900/60 text-center space-y-2.5">
            <div className="inline-flex items-center justify-center py-1 px-2 mx-auto">
              <img
                src="/natton_tech_logo_transparent.png"
                alt="Natton Technologies"
                className="h-9 sm:h-11 w-auto object-contain filter brightness-110 drop-shadow-md"
                onError={(e) => {
                  e.currentTarget.src = '/natton_logo.jpg';
                }}
              />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide text-white uppercase">
                Natton Technologies
              </h2>
              <p className="text-[11px] text-blue-300 font-semibold">
                Official Corporate Employee Registration & Biometric System
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                Pride Icon, 1st Floor, Shop No. 37, Gokul Road, Beside South Indian Shopping Mall
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-medium">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Verified Company Email • Natton Technologies</span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="font-semibold text-slate-900">
              Hello {activeEmailModal.recipientName || 'Valued Team Member'},
            </p>
            <p className="text-slate-600 leading-relaxed text-[11px] sm:text-xs">
              {activeEmailModal.type === 'VERIFICATION_OTP'
                ? 'Thank you for registering with Natton Technologies. Please use the one-time verification code below to confirm your corporate email address.'
                : 'Welcome to Natton Technologies! Your staff account has been provisioned. Please review your login credentials below and register your biometric fingerprint to activate attendance tracking.'}
            </p>
          </div>

          {/* Conditional: OTP Email Box */}
          {activeEmailModal.type === 'VERIFICATION_OTP' && activeEmailModal.otpCode && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 text-center space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                Your Email Verification Code (OTP)
              </span>

              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-black font-mono tracking-widest text-blue-950 bg-white px-5 py-2.5 rounded-xl border border-blue-200 shadow-sm">
                  {activeEmailModal.otpCode}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(activeEmailModal.otpCode!)}
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors"
                  title="Copy OTP"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-300" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              {/* Quick Verify & Fingerprint Link */}
              <div className="flex items-center justify-center gap-2 pt-1">
                {isVerified ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Email Address Verified • Permanent Login Active</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      markEmailAsVerified(activeEmailModal.recipientEmail);
                      if (employeeId) {
                        setEnrollmentModalEmployeeId(employeeId);
                      }
                    }}
                    className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>Verify This Email &amp; Register Fingerprint</span>
                  </button>
                )}
              </div>

              <p className="text-[10px] text-slate-500">
                This verification code expires in 10 minutes. Do not share this code with anyone.
              </p>
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-2.5 text-[11px] text-blue-900 flex items-start gap-2 text-left">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <span className="font-bold">Email Inbox Notice:</span> In preview environments without an external outbound SMTP server, public mailboxes (such as Gmail) can delay or filter unverified domain messages. Use the <strong>Open in Gmail</strong> or <strong>Mail App</strong> buttons below, or copy your code directly.
                </div>
              </div>
            </div>
          )}

          {/* Conditional: Credentials & Fingerprint Setup Email */}
          {activeEmailModal.type === 'CREDENTIALS_WELCOME' && activeEmailModal.credentials && (
            <div className="space-y-4">
              {/* Credentials Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" />
                    Corporate Login Credentials
                  </span>
                  <span className="text-[9px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-mono">
                    CONFIDENTIAL
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Employee ID</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {activeEmailModal.credentials.employeeId}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Corporate Email</span>
                    <span className="font-semibold text-white truncate block">
                      {activeEmailModal.credentials.email}
                    </span>
                  </div>

                  <div className="sm:col-span-2 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Temporary Password</span>
                      <span className="font-mono font-bold text-amber-300 text-sm">
                        {activeEmailModal.credentials.password}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(activeEmailModal.credentials!.password)}
                      className="text-[11px] px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium transition-colors flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span>Shift Policy: {activeEmailModal.credentials.shift}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span className="truncate">{activeEmailModal.credentials.location}</span>
                  </div>
                </div>
              </div>

              {/* Action Banner: Register Fingerprint */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-300 rounded-2xl p-4 sm:p-5 text-center space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <Fingerprint className="w-6 h-6 animate-pulse" />
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    Mandatory Biometric Registration
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Attendance and portal access require an enrolled biometric fingerprint. Register your finger now to activate daily punch tracking.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleStartFingerprintRegistration}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>Register Fingerprint Now</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 text-center">
            Natton Technologies Inc. • Pride Icon, 1st Floor, Shop No. 37, Gokul Road, Beside South Indian Shopping Mall
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="bg-slate-50 px-4 sm:px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <a
              href={gmailComposeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-[11px] shadow-xs transition-colors"
              title="Open prefilled email in Gmail"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Open in Gmail</span>
            </a>

            <a
              href={mailtoUrl}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl text-[11px] transition-colors"
              title="Open prefilled in native email app"
            >
              <Mail className="w-3 h-3" />
              <span>Mail App</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 hidden sm:inline">
              To: <strong className="text-slate-800">{activeEmailModal.recipientEmail}</strong>
            </span>
            <button
              onClick={() => setActiveEmailModal(null)}
              className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
