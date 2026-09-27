import React, { useState, useMemo } from 'react';
import {
  Settings as SettingsIcon,
  Moon,
  Download,
  RotateCcw,
  Shield,
  Palette,
  Check,
  Cloud,
  Lock,
  LogIn,
  LogOut,
  Sparkles,
  ShieldCheck,
  KeyRound,
  Grid,
  Fingerprint,
  AlertCircle,
  X,
  RefreshCw,
  Clock,
  Bell,
  HardDrive,
  Database,
  Eye,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../firebase/authContext';
import { useAppPin } from '../../context/AppPinContext';
import { PatternLock } from '../auth/PatternLock';
import { Capacitor } from '@capacitor/core';
import { LockMethod } from '../../services/appPinService';
import { NotificationSettingsCard } from '../dashboard/NotificationSettingsCard';

export const SettingsView: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    toggleLowEnergyMode,
    toggleJournalAwareAI,
    resetAllData,
    tasks,
    journalEntries,
    memories,
    dreams,
    events,
    schedules,
    futureLetters,
    syncState,
    triggerManualSync,
    setActiveTab,
    driveAuthState,
    connectDrive,
    disconnectDrive,
  } = useApp();

  const { currentUser, isGuest, openAuthModal, signOutUser } = useAuth();
  const {
    hasPin,
    pinLength,
    hasPattern,
    preferredLockMethod,
    autoLockMinutes,
    changeAutoLockMinutes,
    changeLockMethod,
    setupPin,
    setupPattern,
    verifyCurrentLock,
    lockApp,
  } = useAppPin();

  // Profile form state
  const [name, setName] = useState(userProfile.name);
  const [subtitle, setSubtitle] = useState(userProfile.subtitle);
  const [showSavedNotice, setShowSavedNotice] = useState(false);

  // Sync action state
  const [isSyncingManual, setIsSyncingManual] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Google Drive Connection state
  const [isConnectingDrive, setIsConnectingDrive] = useState(false);
  const [driveErrorNotice, setDriveErrorNotice] = useState<string | null>(null);

  const handleConnectDrive = async () => {
    setIsConnectingDrive(true);
    setDriveErrorNotice(null);
    try {
      await connectDrive(true);
    } catch (err: any) {
      const msg = err?.message || 'Failed to authorize Google Drive.';
      if (msg.includes('closed') || msg.includes('cancel')) {
        setDriveErrorNotice('Google sign-in popup was closed before authorization was completed.');
      } else {
        setDriveErrorNotice(msg);
      }
    } finally {
      setIsConnectingDrive(false);
    }
  };

  const handleDisconnectDrive = async () => {
    try {
      await disconnectDrive();
      setDriveErrorNotice(null);
    } catch (err: any) {
      console.warn('Disconnect drive error:', err);
    }
  };

  // Reset confirmation modal state
  const [showResetModal, setShowResetModal] = useState(false);

  // Security Credential Modal State
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [securityModalTarget, setSecurityModalTarget] = useState<'pin' | 'pattern' | null>(null);
  const [securityStep, setSecurityStep] = useState<'verify-old' | 'input-new' | 'confirm-new'>('verify-old');
  const [oldPinInput, setOldPinInput] = useState('');
  const [oldVerifyType, setOldVerifyType] = useState<'pin' | 'pattern'>('pin');
  const [newPinLength, setNewPinLength] = useState<3 | 4>(4);
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [firstPattern, setFirstPattern] = useState<number[] | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [isSubmittingSecurity, setIsSubmittingSecurity] = useState(false);

  // Handle saving profile name and greeting
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: name.trim() || 'Eleanor',
      subtitle: subtitle.trim() || 'Welcome to your little world.',
    });
    setShowSavedNotice(true);
    setTimeout(() => setShowSavedNotice(false), 2500);
  };

  // Handle manual sync button
  const handleManualSync = async () => {
    setIsSyncingManual(true);
    setSyncFeedback(null);
    try {
      await triggerManualSync();
      setSyncFeedback('Sanctuary synchronized with cloud');
      setTimeout(() => setSyncFeedback(null), 3000);
    } catch {
      setSyncFeedback('Sync failed. Please check internet connection.');
      setTimeout(() => setSyncFeedback(null), 4000);
    } finally {
      setIsSyncingManual(false);
    }
  };

  // Handle JSON export
  const handleExportData = () => {
    const backupData = {
      app: 'Lilverse',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      userProfile,
      tasks,
      journalEntries,
      memories: memories.map((m) => ({
        id: m.id,
        title: m.title,
        date: m.date,
        category: m.category,
        location: m.location,
        caption: m.caption,
        hasImage: Boolean(m.imageSrc),
      })),
      dreams,
      events,
      schedules,
      futureLetters,
    };

    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `my-little-world-backup-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Format last synced timestamp
  const formattedSyncTime = useMemo(() => {
    if (!syncState.lastSyncedAt) return 'Never';
    try {
      const d = new Date(syncState.lastSyncedAt);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return syncState.lastSyncedAt;
    }
  }, [syncState.lastSyncedAt]);

  return (
    <div className="max-w-3xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0E0C18]/90 border border-[#2E2942]/60 shadow-lg backdrop-blur-md space-y-0.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#C084FC]/15 border border-[#C084FC]/30 flex items-center justify-center text-[#C084FC]">
            <SettingsIcon className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-base sm:text-lg font-normal text-[#F3EEFB] tracking-tight">
            Settings & Sanctuary Controls
          </h1>
          <Sparkles className="w-3.5 h-3.5 text-[#C084FC]" />
        </div>
        <p className="text-xs text-[#81789A] font-light">
          Manage your appearance, PIN security lock, notification alerts, cloud synchronization, and personal profile.
        </p>
      </div>

      {/* ================= SECTION 1: APPEARANCE ================= */}
      <section className="p-4 sm:p-5 rounded-2xl bg-[#0E0C18]/90 border border-[#2E2942]/60 shadow-lg backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#2E2942]/50">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#C084FC]" />
            <h2 className="text-xs font-medium text-[#F3EEFB] uppercase tracking-wider">Appearance & Theme</h2>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#161324] border border-[#2E2942] text-[#C084FC]">
            Lilverse Dark & Lavender
          </span>
        </div>

        {/* Theme Palette Display */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-light text-[#81789A]">
            Lilverse Theme Palette
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-light">
            <div className="p-2.5 rounded-xl bg-[#06050B] border border-[#2E2942]/60 space-y-0.5">
              <span className="block text-[#F3EEFB] font-mono">#06050B</span>
              <span className="text-[#81789A]">Main Canvas</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0E0C18] border border-[#2E2942]/60 space-y-0.5">
              <span className="block text-[#F3EEFB] font-mono">#0E0C18</span>
              <span className="text-[#81789A]">Secondary</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#141220] border border-[#2E2942]/60 space-y-0.5">
              <span className="block text-[#F3EEFB] font-mono">#141220</span>
              <span className="text-[#81789A]">Cards</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#161324] border border-[#C084FC]/40 space-y-0.5">
              <span className="block text-[#C084FC] font-mono font-medium">#C084FC</span>
              <span className="text-[#81789A]">Electric Violet</span>
            </div>
          </div>
        </div>

        {/* Low Energy Mode Switch */}
        <div className="pt-1 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Moon className="w-3.5 h-3.5 text-[#C084FC]" />
              <span className="text-xs font-normal text-[#F3EEFB]">Low Energy Mode</span>
            </div>
            <p className="text-[11px] text-[#81789A] font-light max-w-md">
              Paces your interface gently with lower visual density and zero pressure.
            </p>
          </div>

          <button
            type="button"
            onClick={toggleLowEnergyMode}
            className={`min-h-[34px] px-3 py-1 rounded-xl border text-xs font-light transition-colors cursor-pointer ${
              userProfile.lowEnergyMode
                ? 'bg-[#C084FC] text-[#06050B] border-[#C084FC] font-medium'
                : 'bg-[#141220] text-[#81789A] border-[#2E2942]/60 hover:text-[#F3EEFB]'
            }`}
          >
            {userProfile.lowEnergyMode ? 'Active' : 'Disabled'}
          </button>
        </div>

        {/* Personal Presence (Name & Subtitle) */}
        <form onSubmit={handleSaveProfile} className="pt-2.5 border-t border-[#2E2942]/50 space-y-3">
          <span className="block text-xs font-medium text-[#F3EEFB]">Personal Presence</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-light text-[#81789A] mb-1">
                Your Preferred Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#141220] border border-[#2E2942]/60 text-xs text-[#F3EEFB] focus:outline-none focus:border-[#C084FC]/50 min-h-[38px]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-light text-[#81789A] mb-1">
                Greeting Message
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#141220] border border-[#2E2942]/60 text-xs text-[#F3EEFB] focus:outline-none focus:border-[#C084FC]/50 min-h-[38px]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            {showSavedNotice ? (
              <span className="text-xs text-[#C084FC] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Preferences updated</span>
              </span>
            ) : (
              <span className="text-[10px] text-[#81789A] font-light">
                Persisted to your authenticated profile
              </span>
            )}
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#B8A4D8] to-[#C084FC] text-[#06050B] text-xs font-medium hover:scale-102 active:scale-95 transition-all min-h-[34px] cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </form>
      </section>

      {/* ================= SECTION 2: PRIVACY & SECURITY ================= */}
      <section className="p-4 sm:p-5 rounded-2xl bg-[#0E0C18]/90 border border-[#2E2942]/60 shadow-lg backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#2E2942]/50">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#C084FC]" />
            <div>
              <h2 className="text-xs font-medium text-[#F3EEFB] uppercase tracking-wider">Privacy & Security Lock</h2>
              <p className="text-[11px] font-light text-[#81789A] mt-0.5">
                Protect your journal, memories, letters, and private safe with client-side credential verification.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={lockApp}
            className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161324] hover:bg-[#201C34] border border-[#2E2942] text-[#C084FC] text-xs font-light transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Now</span>
          </button>
        </div>

        {/* Auto-Lock After Inactivity */}
        <div className="p-4 rounded-xl bg-[#101012] border border-[#222228] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-xs font-medium text-[#E8E6EB]">
              <Clock className="w-3.5 h-3.5 text-[#B8A4D8]" />
              <span>Auto-Lock After Inactivity</span>
            </div>
            <p className="text-[11px] text-[#929099] font-light">
              Automatically locks the sanctuary when no activity is detected.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={autoLockMinutes}
              onChange={(e) => changeAutoLockMinutes(Number(e.target.value))}
              aria-label="Auto-lock after inactivity duration"
              className="px-3 py-1.5 rounded-xl bg-[#151518] border border-[#27272B] text-xs text-[#E8E6EB] focus:outline-none focus:border-[#B8A4D8] min-h-[38px] cursor-pointer"
            >
              <option value={1}>1 minute</option>
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={0}>Never</option>
            </select>
          </div>
        </div>

        {/* Lock Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* PIN Lock */}
          <div
            className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
              preferredLockMethod === 'pin'
                ? 'bg-[#14141B] border-[#B8A4D8]/50 shadow-sm shadow-[#B8A4D8]/10'
                : 'bg-[#0E0E12] border-[#222228]'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-[#E8E6EB]">
                  <KeyRound className="w-3.5 h-3.5 text-[#B8A4D8]" />
                  <span>Short PIN Lock</span>
                </div>
                {preferredLockMethod === 'pin' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#B8A4D8]/20 text-[#B8A4D8] border border-[#B8A4D8]/30 font-medium">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#929099] font-light">
                3-digit or 4-digit PIN with PBKDF2-SHA256 (100k rounds).
              </p>
              <div className="text-[11px] text-[#B8A4D8] font-mono pt-1">
                Status: {hasPin ? `${pinLength}-digit PIN configured` : 'Not set up'}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#1C1C21]">
              {preferredLockMethod !== 'pin' && hasPin && (
                <button
                  type="button"
                  onClick={() => changeLockMethod('pin')}
                  className="px-2.5 py-1 rounded-lg bg-[#181820] hover:bg-[#20202A] border border-[#2B2B34] text-[11px] text-[#E8E6EB] transition-colors"
                >
                  Set Active
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setSecurityModalTarget('pin');
                  setSecurityStep('verify-old');
                  setOldPinInput('');
                  setOldVerifyType(hasPin ? 'pin' : 'pattern');
                  setNewPinLength(4);
                  setNewPinInput('');
                  setConfirmPinInput('');
                  setModalError(null);
                  setModalSuccess(null);
                  setIsSecurityModalOpen(true);
                }}
                className="px-2.5 py-1 rounded-lg text-[11px] text-[#B8A4D8] hover:bg-[#B8A4D8]/10 transition-colors ml-auto cursor-pointer"
              >
                {hasPin ? 'Change PIN' : 'Set Up PIN'}
              </button>
            </div>
          </div>

          {/* Pattern Lock */}
          <div
            className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
              preferredLockMethod === 'pattern'
                ? 'bg-[#14141B] border-[#B8A4D8]/50 shadow-sm shadow-[#B8A4D8]/10'
                : 'bg-[#0E0E12] border-[#222228]'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-[#E8E6EB]">
                  <Grid className="w-3.5 h-3.5 text-[#B8A4D8]" />
                  <span>Pattern Lock</span>
                </div>
                {preferredLockMethod === 'pattern' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#B8A4D8]/20 text-[#B8A4D8] border border-[#B8A4D8]/30 font-medium">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#929099] font-light">
                Android-style 3×3 dot pattern with salted hash.
              </p>
              <div className="text-[11px] text-[#B8A4D8] font-mono pt-1">
                Status: {hasPattern ? '3×3 Pattern active' : 'Not configured'}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#1C1C21]">
              {preferredLockMethod !== 'pattern' && hasPattern && (
                <button
                  type="button"
                  onClick={() => changeLockMethod('pattern')}
                  className="px-2.5 py-1 rounded-lg bg-[#181820] hover:bg-[#20202A] border border-[#2B2B34] text-[11px] text-[#E8E6EB] transition-colors"
                >
                  Set Active
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setSecurityModalTarget('pattern');
                  setSecurityStep('verify-old');
                  setOldPinInput('');
                  setOldVerifyType(hasPin ? 'pin' : 'pattern');
                  setFirstPattern(null);
                  setModalError(null);
                  setModalSuccess(null);
                  setIsSecurityModalOpen(true);
                }}
                className="px-2.5 py-1 rounded-lg text-[11px] text-[#B8A4D8] hover:bg-[#B8A4D8]/10 transition-colors ml-auto cursor-pointer"
              >
                {hasPattern ? 'Change Pattern' : 'Set Up Pattern'}
              </button>
            </div>
          </div>

          {/* Biometrics */}
          <div
            className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
              preferredLockMethod === 'biometric'
                ? 'bg-[#14141B] border-[#B8A4D8]/50 shadow-sm shadow-[#B8A4D8]/10'
                : 'bg-[#0E0E12] border-[#222228]'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-[#E8E6EB]">
                  <Fingerprint className="w-3.5 h-3.5 text-[#B8A4D8]" />
                  <span>Biometric</span>
                </div>
                {preferredLockMethod === 'biometric' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#B8A4D8]/20 text-[#B8A4D8] border border-[#B8A4D8]/30 font-medium">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#929099] font-light">
                Device biometric authentication with fallback PIN.
              </p>
              <div className="text-[10px] text-[#716E77] pt-1">
                {Capacitor.isNativePlatform() ? 'Native device ready' : 'Web preview: PIN fallback available'}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#1C1C21]">
              {preferredLockMethod !== 'biometric' ? (
                <button
                  type="button"
                  onClick={() => changeLockMethod('biometric')}
                  className="px-2.5 py-1 rounded-lg bg-[#181820] hover:bg-[#20202A] border border-[#2B2B34] text-[11px] text-[#B8A4D8] transition-colors"
                >
                  Set Active
                </button>
              ) : (
                <span className="text-[11px] text-[#929099] font-light">Active</span>
              )}
            </div>
          </div>
        </div>

        {/* AI Journal Privacy Toggle */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#222228]">
          <div className="space-y-0.5">
            <span className="text-xs font-medium text-[#E8E6EB] block">
              AI Journal-Aware Privacy Mode
            </span>
            <p className="text-[11px] text-[#929099] font-light max-w-md">
              When disabled, AI companion Aria has zero access to journal entries. When enabled, Aria can reference recent mood and thoughts for contextual empathy. Photos are never shared.
            </p>
          </div>
          <button
            type="button"
            onClick={toggleJournalAwareAI}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl border text-xs font-light transition-colors self-start sm:self-auto ${
              userProfile.journalAwareAI
                ? 'bg-[#B8A4D8] text-[#080809] border-[#B8A4D8] font-medium'
                : 'bg-[#101012] text-[#929099] border-[#27272B]'
            }`}
          >
            {userProfile.journalAwareAI ? 'Enabled' : 'Disabled (Strict)'}
          </button>
        </div>

        {/* Private Vault Quick Access */}
        <div className="p-3.5 rounded-xl bg-[#101012] border border-[#222228] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-light text-[#929099]">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Private Vault items are protected by zero-knowledge AES-256-GCM encryption.</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('vault')}
            className="px-3 py-1.5 rounded-xl bg-[#1A1A20] hover:bg-[#22222A] border border-[#2E2E38] text-xs text-[#B8A4D8] transition-colors shrink-0 cursor-pointer"
          >
            Open Vault
          </button>
        </div>
      </section>

      {/* ================= SECTION 3: NOTIFICATIONS ================= */}
      <NotificationSettingsCard />

      {/* ================= SECTION 4: ACCOUNT & SYNC ================= */}
      <section className="p-6 rounded-2xl bg-[#151520] border border-[#262438] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#262438]">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-[#B8A4D8]" />
            <div>
              <h2 className="text-sm font-medium text-[#EAE6F2]">Account & Cloud Sync</h2>
              <p className="text-xs font-light text-[#AAA4B8] mt-0.5">
                Firebase Firestore account synchronization with secure user UID isolation.
              </p>
            </div>
          </div>
          {currentUser ? (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border ${
                syncState.status === 'synced'
                  ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-300'
                  : syncState.status === 'syncing'
                  ? 'bg-[#1B1A28] border-[#B8A4D8]/40 text-[#B8A4D8]'
                  : syncState.status === 'offline'
                  ? 'bg-[#101018] border-[#262438] text-[#AAA4B8]'
                  : 'bg-zinc-950/40 border-zinc-900/50 text-zinc-300'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  syncState.status === 'synced'
                    ? 'bg-emerald-400'
                    : syncState.status === 'syncing'
                    ? 'bg-[#B8A4D8] animate-pulse'
                    : syncState.status === 'offline'
                    ? 'bg-[#AAA4B8]'
                    : 'bg-zinc-400'
                }`}
              />
              <span className="capitalize">
                {syncState.status === 'synced'
                  ? 'Synced'
                  : syncState.status === 'syncing'
                  ? 'Syncing...'
                  : syncState.status === 'offline'
                  ? 'Offline Mode'
                  : 'Sync Paused'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1B1A28] border border-[#262438] text-[11px] text-[#AAA4B8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#79738A]" />
              <span>Local Storage</span>
            </div>
          )}
        </div>

        {currentUser ? (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-[#101018] border border-[#262438] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-[#B8A4D8]" />
                  <span className="text-xs font-medium text-[#EAE6F2]">
                    {currentUser.displayName || userProfile.name || 'Sanctuary Keeper'}
                  </span>
                </div>
                <span className="text-xs text-[#AAA4B8] block font-light mt-0.5">
                  {currentUser.email}
                </span>
                <span className="text-[10px] text-[#79738A] font-mono block mt-1">
                  User ID: {currentUser.uid.slice(0, 8)}...{currentUser.uid.slice(-6)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncingManual}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1B1A28] hover:bg-[#252336] border border-[#262438] hover:border-[#3B3654] text-xs text-[#EAE6F2] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#B8A4D8] ${isSyncingManual ? 'animate-spin' : ''}`} />
                  <span>{isSyncingManual ? 'Syncing...' : 'Sync Now'}</span>
                </button>

                <button
                  type="button"
                  onClick={signOutUser}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-900/50 hover:bg-rose-950/20 text-rose-300 text-xs transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Google Drive Integration Sub-card */}
            <div className="p-4 rounded-xl bg-[#101018] border border-[#262438] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-[#C084FC]" />
                    <span className="text-xs font-medium text-[#EAE6F2]">
                      Google Drive Media & File Backup
                    </span>
                    {driveAuthState.status === 'connected' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Google Drive Connected
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#AAA4B8] font-light">
                    Backup photo memories and files to your personal Google Drive under the <code className="text-[#C084FC] font-mono text-[10px]">Lilverse</code> folder.
                  </p>
                  {driveAuthState.status === 'connected' && driveAuthState.user?.email && (
                    <div className="text-[11px] text-[#C084FC] font-light flex items-center gap-1 pt-0.5">
                      <span>Connected Account:</span>
                      <span className="font-medium text-[#EAE6F2]">{driveAuthState.user.email}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {driveAuthState.status === 'connected' ? (
                    <button
                      type="button"
                      onClick={handleDisconnectDrive}
                      className="px-3.5 py-1.5 rounded-xl border border-rose-900/50 hover:bg-rose-950/20 text-rose-300 text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Disconnect Drive</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleConnectDrive}
                      disabled={isConnectingDrive || driveAuthState.status === 'connecting'}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#B8A4D8] via-[#C084FC] to-[#F472B6] text-[#06050B] text-xs font-medium hover:opacity-95 shadow-[0_0_15px_rgba(192,132,252,0.3)] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <HardDrive className={`w-3.5 h-3.5 ${isConnectingDrive || driveAuthState.status === 'connecting' ? 'animate-spin' : ''}`} />
                      <span>
                        {isConnectingDrive || driveAuthState.status === 'connecting'
                          ? 'Connecting...'
                          : 'Connect Google Drive'}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {(driveErrorNotice || driveAuthState.errorMessage) && (
                <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/50 text-xs text-zinc-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0" />
                    <span>{driveErrorNotice || driveAuthState.errorMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDriveErrorNotice(null)}
                    className="text-zinc-400 hover:text-zinc-200 text-xs cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Sync Feedback Message */}
            {syncFeedback && (
              <div className="p-2.5 rounded-xl bg-[#151520] border border-[#B8A4D8]/30 text-xs text-[#B8A4D8] flex items-center gap-2">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{syncFeedback}</span>
              </div>
            )}

            {/* Error or Warning Diagnostic Details */}
            {syncState.status === 'error' && (
              <div className="p-3.5 rounded-xl bg-zinc-950/30 border border-zinc-800/40 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-300">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>
                      {syncState.errorReason === 'quota'
                        ? 'Firestore Quota Limit Reached'
                        : syncState.errorReason === 'network'
                        ? 'Network Connection Offline'
                        : syncState.errorReason === 'auth'
                        ? 'Authentication Session Expired'
                        : syncState.errorReason === 'permission'
                        ? 'Permission Check Required'
                        : 'Cloud Sync Issue'}
                    </span>
                  </div>
                  {syncState.errorCode && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900/40 text-zinc-200 border border-zinc-800/50">
                      {syncState.errorCode}
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-200/90 font-light leading-relaxed">
                  {syncState.errorMessage || 'Cloud sync is temporarily paused. All your local data is completely safe.'}
                </p>

                <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-300/80">
                  <span>Changes are saved locally and will auto-sync when resolved.</span>
                  {syncState.nextRetryMs && (
                    <span className="font-mono">
                      Auto-retry in {Math.max(1, Math.round((syncState.nextRetryMs - Date.now()) / 1000))}s
                    </span>
                  )}
                </div>
              </div>
            )}

            {syncState.status === 'offline' && (
              <div className="p-3 rounded-xl bg-[#101018] border border-[#262438] flex items-center gap-2.5 text-xs text-[#AAA4B8]">
                <Cloud className="w-4 h-4 text-[#79738A] shrink-0" />
                <span>Working in offline mode. Changes are queued locally and will sync once internet connectivity is restored.</span>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-[#AAA4B8] px-1 font-light">
              <span>Last cloud synchronization:</span>
              <span className="font-mono text-[#EAE6F2]">{formattedSyncTime}</span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#101018] border border-[#262438] space-y-3">
            <p className="text-xs text-[#AAA4B8] font-light leading-relaxed">
              You are currently using local storage. Signing in enables non-destructive multi-device sync for your schedule, journal, memories, dreams, and files.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#9680C8] to-[#B8A4D8] text-[#08080C] text-xs font-medium transition-all hover:brightness-105 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Create Account</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ================= SECTION 5: DATA & STORAGE ================= */}
      <section className="p-6 rounded-2xl bg-[#151518] border border-[#27272B] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#222228]">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[#B8A4D8]" />
            <div>
              <h2 className="text-sm font-medium text-[#E8E6EB]">Data & Storage</h2>
              <p className="text-xs font-light text-[#929099] mt-0.5">
                Inspect stored records, export complete backups, or reset sanctuary state.
              </p>
            </div>
          </div>
        </div>

        {/* Storage Count Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-center">
          <div className="p-3 rounded-xl bg-[#101012] border border-[#222228]">
            <span className="text-base font-normal text-[#E8E6EB] block tabular-nums">{schedules.length}</span>
            <span className="text-[10px] text-[#929099] uppercase tracking-wider">Schedules</span>
          </div>
          <div className="p-3 rounded-xl bg-[#101012] border border-[#222228]">
            <span className="text-base font-normal text-[#E8E6EB] block tabular-nums">{journalEntries.length}</span>
            <span className="text-[10px] text-[#929099] uppercase tracking-wider">Journal</span>
          </div>
          <div className="p-3 rounded-xl bg-[#101012] border border-[#222228]">
            <span className="text-base font-normal text-[#E8E6EB] block tabular-nums">{memories.length}</span>
            <span className="text-[10px] text-[#929099] uppercase tracking-wider">Memories</span>
          </div>
          <div className="p-3 rounded-xl bg-[#101012] border border-[#222228]">
            <span className="text-base font-normal text-[#E8E6EB] block tabular-nums">{tasks.length}</span>
            <span className="text-[10px] text-[#929099] uppercase tracking-wider">Tasks</span>
          </div>
          <div className="p-3 rounded-xl bg-[#101012] border border-[#222228]">
            <span className="text-base font-normal text-[#E8E6EB] block tabular-nums">{events.length}</span>
            <span className="text-[10px] text-[#929099] uppercase tracking-wider">Events</span>
          </div>
          <div className="p-3 rounded-xl bg-[#101012] border border-[#222228]">
            <span className="text-base font-normal text-[#E8E6EB] block tabular-nums">{dreams.length}</span>
            <span className="text-[10px] text-[#929099] uppercase tracking-wider">Dreams</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportData}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-[#101012] border border-[#27272B] hover:border-[#B8A4D8]/50 text-xs font-light text-[#E8E6EB] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#B8A4D8]" />
            <span>Export Personal Data (.json)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-[#101012] border border-[#27272B] hover:border-rose-400/50 text-xs font-light text-[#929099] hover:text-rose-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Sample Data</span>
          </button>
        </div>
      </section>

      {/* ================= MODAL 1: SECURITY CREDENTIAL SETUP ================= */}
      {isSecurityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="absolute inset-0"
            onClick={() => {
              if (!isSubmittingSecurity) setIsSecurityModalOpen(false);
            }}
          />
          <div className="relative z-10 w-full max-w-sm bg-[#101014] border border-[#27272B] rounded-2xl p-6 space-y-4 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#222228]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#181820] flex items-center justify-center text-[#B8A4D8]">
                  {securityModalTarget === 'pin' ? <KeyRound className="w-3.5 h-3.5" /> : <Grid className="w-3.5 h-3.5" />}
                </div>
                <h3 className="text-xs font-medium text-[#E8E6EB]">
                  {securityStep === 'verify-old'
                    ? 'Verify Current Credentials'
                    : securityModalTarget === 'pin'
                    ? 'Set Short PIN'
                    : 'Draw New Pattern'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSecurityModalOpen(false)}
                disabled={isSubmittingSecurity}
                className="text-[#929099] hover:text-[#E8E6EB] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error / Success Notices */}
            {modalError && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}
            {modalSuccess && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-900/50 text-emerald-300 text-xs">
                <Check className="w-4 h-4 shrink-0" />
                <span>{modalSuccess}</span>
              </div>
            )}

            {/* STEP 1: Verify Old Credentials */}
            {securityStep === 'verify-old' && (
              <div className="space-y-4">
                <p className="text-xs text-[#929099] font-light leading-relaxed">
                  Please verify your existing {hasPin ? 'PIN' : 'pattern'} before updating your sanctuary security.
                </p>

                {hasPin && hasPattern && (
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setOldVerifyType('pin')}
                      className={`px-2.5 py-1 rounded-lg border ${
                        oldVerifyType === 'pin'
                          ? 'bg-[#1C1C24] border-[#B8A4D8] text-[#B8A4D8]'
                          : 'border-[#27272B] text-[#929099]'
                      }`}
                    >
                      PIN
                    </button>
                    <button
                      type="button"
                      onClick={() => setOldVerifyType('pattern')}
                      className={`px-2.5 py-1 rounded-lg border ${
                        oldVerifyType === 'pattern'
                          ? 'bg-[#1C1C24] border-[#B8A4D8] text-[#B8A4D8]'
                          : 'border-[#27272B] text-[#929099]'
                      }`}
                    >
                      Pattern
                    </button>
                  </div>
                )}

                {oldVerifyType === 'pin' ? (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!oldPinInput) return;
                      setIsSubmittingSecurity(true);
                      setModalError(null);
                      try {
                        const res = await verifyCurrentLock({ type: 'pin', pin: oldPinInput });
                        if (res.success) {
                          setSecurityStep('input-new');
                        } else {
                          setModalError(res.error || 'Incorrect PIN. Please try again.');
                        }
                      } catch {
                        setModalError('Verification failed.');
                      } finally {
                        setIsSubmittingSecurity(false);
                      }
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block text-[11px] font-light text-[#929099] mb-1">
                        Current PIN
                      </label>
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={6}
                        autoFocus
                        value={oldPinInput}
                        onChange={(e) => setOldPinInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••"
                        className="w-full px-3.5 py-2.5 bg-[#141418] border border-[#27272B] focus:border-[#B8A4D8] rounded-xl text-center text-sm font-mono tracking-widest text-[#E8E6EB] focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingSecurity || !oldPinInput}
                      className="w-full py-2.5 rounded-xl bg-[#B8A4D8] hover:bg-[#A691CB] text-[#080809] font-medium text-xs transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmittingSecurity ? 'Verifying...' : 'Verify and Continue'}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-3 flex flex-col items-center">
                    <span className="text-[11px] text-[#929099]">Draw current pattern</span>
                    <PatternLock
                      size={240}
                      onComplete={async (pattern) => {
                        setIsSubmittingSecurity(true);
                        setModalError(null);
                        try {
                          const res = await verifyCurrentLock({ type: 'pattern', pattern });
                          if (res.success) {
                            setSecurityStep('input-new');
                          } else {
                            setModalError(res.error || 'Incorrect pattern.');
                          }
                        } catch {
                          setModalError('Pattern verification failed.');
                        } finally {
                          setIsSubmittingSecurity(false);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Input New Credentials */}
            {securityStep === 'input-new' && (
              <div className="space-y-4">
                {securityModalTarget === 'pin' ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (newPinInput.length !== newPinLength) {
                        setModalError(`Please enter a valid ${newPinLength}-digit PIN.`);
                        return;
                      }
                      if (newPinInput !== confirmPinInput) {
                        setModalError('PINs do not match. Please re-enter.');
                        return;
                      }
                      setIsSubmittingSecurity(true);
                      setModalError(null);
                      setupPin(newPinInput)
                        .then(() => {
                          setModalSuccess(`Your ${newPinLength}-digit PIN has been saved.`);
                          setTimeout(() => setIsSecurityModalOpen(false), 1200);
                        })
                        .catch((err) => {
                          setModalError(err?.message || 'Failed to save PIN.');
                        })
                        .finally(() => setIsSubmittingSecurity(false));
                    }}
                    className="space-y-3.5"
                  >
                    <div>
                      <label className="block text-[11px] font-light text-[#929099] mb-1.5">
                        Choose PIN Length
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setNewPinLength(3);
                            setNewPinInput('');
                            setConfirmPinInput('');
                          }}
                          className={`py-2 rounded-xl text-xs font-light transition-all border ${
                            newPinLength === 3
                              ? 'bg-[#1C1C24] border-[#B8A4D8] text-[#B8A4D8] font-medium'
                              : 'bg-[#141418] border-[#27272B] text-[#929099]'
                          }`}
                        >
                          3-Digit PIN
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNewPinLength(4);
                            setNewPinInput('');
                            setConfirmPinInput('');
                          }}
                          className={`py-2 rounded-xl text-xs font-light transition-all border ${
                            newPinLength === 4
                              ? 'bg-[#1C1C24] border-[#B8A4D8] text-[#B8A4D8] font-medium'
                              : 'bg-[#141418] border-[#27272B] text-[#929099]'
                          }`}
                        >
                          4-Digit PIN
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-light text-[#929099] mb-1">
                        New {newPinLength}-Digit PIN
                      </label>
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={newPinLength}
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                        placeholder={newPinLength === 3 ? '•••' : '••••'}
                        className="w-full px-3.5 py-2.5 bg-[#141418] border border-[#27272B] focus:border-[#B8A4D8] rounded-xl text-center text-sm font-mono tracking-widest text-[#E8E6EB] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-light text-[#929099] mb-1">
                        Confirm {newPinLength}-Digit PIN
                      </label>
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={newPinLength}
                        value={confirmPinInput}
                        onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                        placeholder={newPinLength === 3 ? '•••' : '••••'}
                        className="w-full px-3.5 py-2.5 bg-[#141418] border border-[#27272B] focus:border-[#B8A4D8] rounded-xl text-center text-sm font-mono tracking-widest text-[#E8E6EB] focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={
                        isSubmittingSecurity ||
                        newPinInput.length !== newPinLength ||
                        confirmPinInput.length !== newPinLength
                      }
                      className="w-full py-2.5 rounded-xl bg-[#B8A4D8] hover:bg-[#A691CB] text-[#080809] font-medium text-xs transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmittingSecurity ? 'Saving...' : 'Save New PIN'}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-3 flex flex-col items-center">
                    <span className="text-xs text-[#929099] font-light text-center">
                      Draw your new pattern (connect at least 4 dots)
                    </span>
                    <PatternLock
                      size={240}
                      onComplete={(pattern) => {
                        if (pattern.length < 4) {
                          setModalError('Pattern must connect at least 4 dots.');
                          return;
                        }
                        setFirstPattern(pattern);
                        setSecurityStep('confirm-new');
                        setModalError(null);
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Confirm Pattern */}
            {securityStep === 'confirm-new' && securityModalTarget === 'pattern' && (
              <div className="space-y-3 flex flex-col items-center">
                <span className="text-xs text-[#929099] font-light text-center">
                  Draw pattern again to confirm
                </span>
                <PatternLock
                  size={240}
                  onComplete={async (pattern) => {
                    if (!firstPattern) {
                      setSecurityStep('input-new');
                      return;
                    }
                    const isMatch =
                      pattern.length === firstPattern.length &&
                      pattern.every((val, idx) => val === firstPattern[idx]);

                    if (!isMatch) {
                      setModalError('Patterns did not match. Draw again.');
                      setFirstPattern(null);
                      setSecurityStep('input-new');
                      return;
                    }

                    setIsSubmittingSecurity(true);
                    setModalError(null);
                    try {
                      await setupPattern(pattern);
                      setModalSuccess('Your pattern lock has been saved.');
                      setTimeout(() => setIsSecurityModalOpen(false), 1200);
                    } catch (err: any) {
                      setModalError(err?.message || 'Failed to save pattern.');
                    } finally {
                      setIsSubmittingSecurity(false);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setFirstPattern(null);
                    setSecurityStep('input-new');
                    setModalError(null);
                  }}
                  className="text-xs text-[#B8A4D8] hover:underline"
                >
                  Start Over
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL 2: CONFIRM RESET ================= */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#101014] border border-[#27272B] rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-300">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <h3 className="text-sm font-medium text-[#E8E6EB]">Reset to Sample Data?</h3>
            </div>
            <p className="text-xs text-[#929099] font-light leading-relaxed">
              This will restore sample starter items for your journal, tasks, and sanctuary. Make sure you export a backup first if you want to keep your data.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs text-[#929099] hover:text-[#E8E6EB] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetAllData();
                  setShowResetModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-900/60 hover:bg-rose-900/80 border border-rose-500/50 text-xs font-light text-rose-200 transition-colors cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
