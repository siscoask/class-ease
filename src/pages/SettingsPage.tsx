import React, { useState } from 'react';
import { UserProfile, TimetableViewMode } from '../types';
import { VERIFIED_COLLEGES, OFFICIAL_METADATA } from '../data/timetable';
import { PWAInstallButton } from '../components/PWAInstallButton';
import {
  ShieldAlert,
  RotateCcw,
  Check,
  ExternalLink,
  Phone,
  Moon,
  Sun,
  ShieldCheck,
  Sparkles,
  Info,
} from 'lucide-react';

interface SettingsPageProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onResetAllData: () => void;
  onToggleDarkMode: () => void;
  onOpenFeedback: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  userProfile,
  onUpdateProfile,
  onResetAllData,
  onToggleDarkMode,
  onOpenFeedback,
}) => {
  const [name, setName] = useState(userProfile.preferredName);
  const [collegeId, setCollegeId] = useState(userProfile.collegeId || VERIFIED_COLLEGES[0].id);
  const [departmentId, setDepartmentId] = useState(userProfile.departmentId);
  const [level, setLevel] = useState(userProfile.level);
  const [view, setView] = useState<TimetableViewMode>(userProfile.preferredView);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const selectedCollege = VERIFIED_COLLEGES.find((c) => c.id === collegeId) || VERIFIED_COLLEGES[0];
  const departments = selectedCollege?.departments || [];

  const handleSave = () => {
    onUpdateProfile({
      ...userProfile,
      preferredName: name.trim(),
      collegeId: selectedCollege?.id || '',
      departmentId: departmentId || (departments[0]?.code ?? ''),
      level,
      preferredView: view,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleConfirmReset = () => {
    if (window.confirm('Reset all local Class Ease settings, personal events, and enrolled courses on this device?')) {
      onResetAllData();
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-3xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Settings & About
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your local academic preferences, display mode, and review official source data.
        </p>
      </div>

      {/* PWA Banner */}
      <PWAInstallButton variant="banner" />

      {/* 1. Academic Profile Section */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
          Academic Profile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Preferred Name */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Preferred Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tobi"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Level */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Current Academic Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            >
              {['100', '200', '300', '400', '500', '600'].map((l) => (
                <option key={l} value={l}>
                  {l} Level
                </option>
              ))}
            </select>
          </div>

          {/* College */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              College (Verified)
            </label>
            <select
              value={collegeId}
              onChange={(e) => {
                const newCol = e.target.value;
                setCollegeId(newCol);
                const colObj = VERIFIED_COLLEGES.find((c) => c.id === newCol);
                if (colObj && colObj.departments.length > 0) {
                  setDepartmentId(colObj.departments[0].code);
                }
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {VERIFIED_COLLEGES.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.id} — {col.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Department (Verified Mappings)
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {departments.map((dept) => (
                <option key={dept.code} value={dept.code}>
                  {dept.code} — {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Timetable View Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Default Timetable View
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'daily', label: 'Daily' },
              { id: 'weekly', label: 'Weekly' },
              { id: 'agenda', label: 'Agenda' },
              { id: 'compact', label: 'Compact' },
            ].map((v) => {
              const isSelected = view === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setView(v.id as TimetableViewMode)}
                  className={`p-2 rounded-xl border text-xs font-medium text-center transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          {savedSuccess && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Saved successfully</span>
            </span>
          )}
          <div />

          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* 2. Official Timetable Provenance Card */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Official Timetable Data
          </h3>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between font-mono">
            <span className="text-slate-500">Academic Year</span>
            <span className="font-bold text-slate-900 dark:text-white">{OFFICIAL_METADATA.academicYear}</span>
          </div>
          <div className="flex items-center justify-between font-mono">
            <span className="text-slate-500">Semester</span>
            <span className="font-bold text-slate-900 dark:text-white">{OFFICIAL_METADATA.semester}</span>
          </div>
          <div className="flex items-center justify-between font-mono">
            <span className="text-slate-500">Timetable Version</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">Version {OFFICIAL_METADATA.timetableVersion}</span>
          </div>
          <div className="flex items-center justify-between font-mono">
            <span className="text-slate-500">Authority</span>
            <span className="font-bold text-slate-900 dark:text-white">{OFFICIAL_METADATA.committee}</span>
          </div>
        </div>

        {/* TIMTEC Enquiries Contacts */}
        <div className="pt-2 text-xs text-slate-600 dark:text-slate-300 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            TIMTEC Official Enquiries:
          </span>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-700 dark:text-slate-300 font-mono">
            {OFFICIAL_METADATA.timtecContacts.map((c) => (
              <span key={c.role} className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{c.role}: {c.phone}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Independent Status / Disclaimer (Mandatory Requirement) */}
      <div className="p-4 rounded-xl border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Class Ease is built independently and isn't an official FUNAAB platform.</strong> For official academic decisions, always confirm with the university and official TIMTEC releases.
        </p>
      </div>

      {/* 4. Feedback trigger */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
            Have a suggestion or spotted a discrepancy?
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Report incorrect class details or suggest features directly to our WhatsApp hotline.
          </p>
        </div>

        <button
          onClick={onOpenFeedback}
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors shrink-0"
        >
          Send Feedback
        </button>
      </div>

      {/* 5. Credits Section (Mandatory Requirement) */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
          Credits & Origin
        </h3>

        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
          <p className="font-bold text-slate-900 dark:text-white text-sm">
            Class Ease
          </p>
          <div className="pt-0.5 space-y-0.5">
            <p className="font-semibold text-slate-900 dark:text-white">
              Designed & built by <strong className="text-indigo-600 dark:text-indigo-400">Sisco</strong>
            </p>
            <p className="text-slate-800 dark:text-slate-200">
              Sholuade AbdulRasak Akorede
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Cyber Security Student • COLCOMPS (College of Computing)
            </p>
          </div>
          <div className="pt-2">
            <a
              href={OFFICIAL_METADATA.credits.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <span>{OFFICIAL_METADATA.credits.portfolioUrl.replace('https://', '')}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* 6. Danger Zone / Reset */}
      <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={handleConfirmReset}
          className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 dark:hover:text-rose-400 font-semibold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Local Profile & Data</span>
        </button>

        <span className="text-[11px] font-mono text-slate-400">
          Class Ease v1.0.0
        </span>
      </div>
    </div>
  );
};
