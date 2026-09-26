import React, { useState } from 'react';
import { TimetableSession, UserProfile, TimetableDay } from '../types';
import { ACADEMIC_DAYS, parseTimeToMinutes, exportToICalendar, getCampusNow } from '../utils/scheduleLogic';
import { OFFICIAL_METADATA } from '../data/timetable';
import { BrandLogo } from './BrandLogo';
import { X, Copy, Check, Printer, Calendar, Download, ExternalLink, Share2 } from 'lucide-react';

interface ShareTimetableModalProps {
  sessions: TimetableSession[];
  profile: UserProfile;
  onClose: () => void;
}

export const ShareTimetableModal: React.FC<ShareTimetableModalProps> = ({
  sessions,
  profile,
  onClose,
}) => {
  const campus = getCampusNow();
  const [copied, setCopied] = useState(false);
  const [calDownloaded, setCalDownloaded] = useState(false);
  const [shareScope, setShareScope] = useState<'today' | 'week'>(
    campus.isAcademicDay ? 'today' : 'week'
  );

  const activeDay = campus.isAcademicDay ? (campus.day as TimetableDay) : 'Monday';

  const generateShareText = () => {
    const studentLabel = profile.preferredName
      ? `${profile.preferredName}'s Schedule (${profile.level}L ${profile.departmentId})`
      : `FUNAAB ${profile.level}L Schedule`;

    if (shareScope === 'today') {
      const todaySessions = sessions
        .filter((s) => s.day === activeDay)
        .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

      let text = `*Class Ease — Today's Classes (${activeDay}, ${campus.fullDateStr.split(',')[1]?.trim() || ''})*\n`;
      text += `*${studentLabel} • FUNAAB First Semester*\n\n`;

      if (todaySessions.length === 0) {
        text += `_No official classes scheduled for today (${activeDay}). Enjoy your free study day!_\n\n`;
      } else {
        for (const s of todaySessions) {
          text += `• *${s.startTime} – ${s.endTime}*: *${s.courseCode}* @ ${s.venue} ${s.isPractical ? '[Practical]' : ''}\n`;
        }
        text += '\n';
      }

      text += `Directions: https://funaab.getdirection.xyz\n`;
      text += `_Built with Class Ease by Sisco: https://siscoask.vercel.app_`;
      return text;
    }

    // Full Week
    let text = `*Class Ease Timetable — ${studentLabel}*\n`;
    text += `Federal University of Agriculture, Abeokuta • 2026/2027 First Semester (v${OFFICIAL_METADATA.timetableVersion})\n\n`;

    for (const day of ACADEMIC_DAYS) {
      const daySessions = sessions
        .filter((s) => s.day === day)
        .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

      if (daySessions.length > 0) {
        text += `*== ${day.toUpperCase()} ==*\n`;
        for (const s of daySessions) {
          text += `• ${s.startTime} – ${s.endTime}: *${s.courseCode}* @ ${s.venue} ${s.isPractical ? '[Practical]' : ''}\n`;
        }
        text += '\n';
      }
    }

    text += `_Built with Class Ease by Sisco — Your academic day, simplified._\nhttps://siscoask.vercel.app`;
    return text;
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleDirectWhatsApp = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadICS = () => {
    const icsContent = exportToICalendar(sessions, profile.preferredName || 'FUNAAB Student');
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `funaab-timetable-${profile.level}L-${Date.now()}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setCalDownloaded(true);
    setTimeout(() => setCalDownloaded(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Share & Sync Timetable
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Export to your phone's calendar, send directly to WhatsApp, or print.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Scope Segmented Switcher */}
        <div className="px-4 sm:px-5 pt-3 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Share Scope:
          </span>
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
            <button
              onClick={() => setShareScope('today')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                shareScope === 'today'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Today Only ({activeDay.slice(0, 3)})
            </button>
            <button
              onClick={() => setShareScope('week')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                shareScope === 'week'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Entire Week (Mon–Fri)
            </button>
          </div>
        </div>

        {/* Share Card Preview */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 scrollbar-thin">
          {/* Calendar Sync Banner */}
          <div className="p-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Sync with Phone Calendar (.ics)
              </span>
              <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80 mt-0.5">
                Import into Google Calendar or Apple Calendar with weekly recurring alerts.
              </p>
            </div>
            <button
              onClick={handleDownloadICS}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shrink-0 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{calDownloaded ? 'Downloaded!' : 'Export .ics'}</span>
            </button>
          </div>

          <div
            id="shareable-card"
            className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-stone-50/80 dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs space-y-3"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <BrandLogo size="sm" showTagline={true} />
              <div className="text-right text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span>{OFFICIAL_METADATA.academicYear} • Sem 1</span>
                <span className="block font-bold text-indigo-600 dark:text-indigo-400">v{OFFICIAL_METADATA.timetableVersion} TIMTEC</span>
              </div>
            </div>

            {/* Profile banner */}
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Student</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {profile.preferredName ? profile.preferredName : 'FUNAAB Student'} ({profile.level}L {profile.departmentId})
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Scope</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {shareScope === 'today' ? `${activeDay}'s Classes` : `${sessions.length} weekly classes`}
                </span>
              </div>
            </div>

            {/* Schedule Overview */}
            <div className="space-y-3 pt-2">
              {(shareScope === 'today' ? [activeDay] : ACADEMIC_DAYS).map((day) => {
                const daySessions = sessions
                  .filter((s) => s.day === day)
                  .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

                if (daySessions.length === 0) {
                  if (shareScope === 'today') {
                    return (
                      <div key={day} className="text-xs text-slate-400 italic p-3 text-center">
                        No classes scheduled for {day}.
                      </div>
                    );
                  }
                  return null;
                }

                return (
                  <div key={day} className="text-xs space-y-1">
                    <div className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center justify-between">
                      <span>{day}</span>
                      <span className="text-[10px] font-normal text-slate-400">
                        {daySessions.length} {daySessions.length === 1 ? 'class' : 'classes'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {daySessions.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 text-[11px]"
                        >
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {s.courseCode}
                            {s.isPractical && <span className="font-normal text-emerald-600 ml-1">(Practical)</span>}
                          </div>
                          <div className="font-mono text-slate-500">
                            {s.startTime} – {s.endTime} • {s.venue}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Card Footer with requested credits format */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
              <div>
                Designed & built by <strong className="text-slate-800 dark:text-slate-200">Sisco</strong>
              </div>
              <div className="text-[10px]">
                Sholuade AbdulRasak Akorede • Cyber Security Student, COLCOMPS
              </div>
              <div className="pt-0.5">
                <a
                  href="https://siscoask.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5 text-[10px]"
                >
                  <span>siscoask.vercel.app</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDirectWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp App</span>
            </button>

            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Copied Text!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
