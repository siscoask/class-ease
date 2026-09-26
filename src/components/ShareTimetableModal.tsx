import React, { useState } from 'react';
import { TimetableSession, UserProfile } from '../types';
import { ACADEMIC_DAYS, parseTimeToMinutes } from '../utils/scheduleLogic';
import { OFFICIAL_METADATA } from '../data/timetable';
import { BrandLogo } from './BrandLogo';
import { X, Copy, Check, Printer, Share2 } from 'lucide-react';

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
  const [copied, setCopied] = useState(false);

  const generatePlainText = () => {
    let text = `Class Ease Timetable — ${profile.preferredName ? `${profile.preferredName}'s Schedule` : 'FUNAAB 2026/2027'}\n`;
    text += `${OFFICIAL_METADATA.institution} • ${OFFICIAL_METADATA.academicYear} ${OFFICIAL_METADATA.semester} (v${OFFICIAL_METADATA.timetableVersion})\n\n`;

    for (const day of ACADEMIC_DAYS) {
      const daySessions = sessions
        .filter((s) => s.day === day)
        .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

      if (daySessions.length > 0) {
        text += `== ${day.toUpperCase()} ==\n`;
        for (const s of daySessions) {
          text += `• ${s.startTime} - ${s.endTime}: ${s.courseCode} @ ${s.venue} ${s.isPractical ? '[Practical]' : ''}\n`;
        }
        text += '\n';
      }
    }

    text += `Built with Class Ease — Your academic day, simplified.\nhttps://siscoask.vercel.app`;
    return text;
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generatePlainText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Share Timetable
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clean visual schedule card ready to copy, print, or share.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Card Preview */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <div
            id="shareable-card"
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-stone-50/80 dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs space-y-4"
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
                  {profile.preferredName ? profile.preferredName : 'FUNAAB Student'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Class Load</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {sessions.length} sessions / week
                </span>
              </div>
            </div>

            {/* Schedule Overview */}
            <div className="space-y-3 pt-2">
              {ACADEMIC_DAYS.map((day) => {
                const daySessions = sessions
                  .filter((s) => s.day === day)
                  .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

                if (daySessions.length === 0) return null;

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
                          className="flex items-center justify-between py-1 px-2 rounded-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 text-[11px]"
                        >
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {s.courseCode}
                            {s.isPractical && <span className="font-normal text-emerald-600 ml-1">(P)</span>}
                          </div>
                          <div className="font-mono text-slate-500">
                            {s.startTime} • {s.venue}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Card Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 text-center">
              Class Ease — Your academic day, simplified.
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Card</span>
          </button>

          <button
            onClick={handleCopyText}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Text Summary</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
