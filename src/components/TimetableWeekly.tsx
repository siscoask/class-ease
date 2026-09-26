import React from 'react';
import { TimetableSession, PersonalEvent, TimetableDay } from '../types';
import { ACADEMIC_DAYS, parseTimeToMinutes } from '../utils/scheduleLogic';
import { Clock, MapPin } from 'lucide-react';

interface TimetableWeeklyProps {
  sessions: TimetableSession[];
  personalEvents: PersonalEvent[];
  onSelectCourse?: (courseCode: string) => void;
  onSelectVenue?: (venueName: string) => void;
}

export const TimetableWeekly: React.FC<TimetableWeeklyProps> = ({
  sessions,
  personalEvents,
  onSelectCourse,
  onSelectVenue,
}) => {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="min-w-[760px] grid grid-cols-5 gap-3">
        {ACADEMIC_DAYS.map((day) => {
          const daySessions = sessions
            .filter((s) => s.day === day)
            .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

          const dayPersonal = personalEvents
            .filter((e) => e.day === day)
            .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

          return (
            <div
              key={day}
              className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-3 min-h-[380px]"
            >
              {/* Day Header */}
              <div className="pb-2.5 mb-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  {day}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {daySessions.length} {daySessions.length === 1 ? 'class' : 'classes'}
                </span>
              </div>

              {/* Day Items */}
              <div className="space-y-2 flex-1">
                {daySessions.length === 0 && dayPersonal.length === 0 ? (
                  <div className="h-full flex items-center justify-center p-4 text-center">
                    <span className="text-xs text-slate-400 italic">Free day</span>
                  </div>
                ) : (
                  <>
                    {daySessions.map((s) => (
                      <div
                        key={s.id}
                        className={`p-2.5 rounded-lg border text-xs transition-all ${
                          s.isPractical
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/60'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                        } shadow-2xs hover:shadow-xs`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <button
                            onClick={() => onSelectCourse?.(s.courseCode)}
                            className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 truncate text-left"
                          >
                            {s.courseCode}
                          </button>
                          {s.isPractical && (
                            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 shrink-0">
                              (P)
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{s.startTime} – {s.endTime}</span>
                        </div>

                        <button
                          onClick={() => onSelectVenue?.(s.venue)}
                          className="mt-1 flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 truncate w-full text-left"
                        >
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{s.venue}</span>
                        </button>
                      </div>
                    ))}

                    {/* Personal events on that day */}
                    {dayPersonal.map((p) => (
                      <div
                        key={p.id}
                        className="p-2 rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 text-xs"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-amber-950 dark:text-amber-200 truncate">
                            {p.title}
                          </span>
                          <span className="text-[9px] uppercase font-bold text-amber-700 dark:text-amber-400">
                            Pers
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                          {p.startTime} – {p.endTime}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
