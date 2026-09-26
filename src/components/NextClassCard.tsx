import React, { useEffect, useState } from 'react';
import { TimetableSession } from '../types';
import { calculateNextClassState, formatRelativeMinutes } from '../utils/scheduleLogic';
import { OFFICIAL_METADATA } from '../data/timetable';
import { MapPin, Navigation, Clock, CheckCircle2, Calendar, Radio } from 'lucide-react';

interface NextClassCardProps {
  sessions: TimetableSession[];
  onSelectCourse?: (courseCode: string) => void;
  onSelectVenue?: (venueName: string) => void;
}

export const NextClassCard: React.FC<NextClassCardProps> = ({
  sessions,
  onSelectCourse,
  onSelectVenue,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Update clock every 30 seconds for live countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const state = calculateNextClassState(sessions, currentDate);

  // External Direction link handler
  const handleDirections = (venue: string) => {
    const url = `${OFFICIAL_METADATA.directionServiceUrl}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // State 1: Active class right now
  if (state.status === 'now' && state.currentSession) {
    const session = state.currentSession;
    return (
      <div className="relative overflow-hidden rounded-2xl bg-indigo-900 text-white p-5 md:p-6 shadow-md border border-indigo-800">
        <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-3 pb-3 border-b border-indigo-800/80">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Happening Now
            </span>
          </div>

          <div className="text-xs font-mono text-indigo-200 tabular-nums">
            Ends in {formatRelativeMinutes(state.timeRemainingMinutes || 0)}
          </div>
        </div>

        <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <button
              onClick={() => onSelectCourse?.(session.courseCode)}
              className="text-2xl md:text-3xl font-extrabold tracking-tight hover:underline text-left"
            >
              {session.courseCode}
            </button>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-indigo-200">
              <span className="inline-flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-indigo-300" />
                {session.startTime} – {session.endTime}
              </span>
              <button
                onClick={() => onSelectVenue?.(session.venue)}
                className="inline-flex items-center gap-1 hover:text-white hover:underline transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-indigo-300" />
                <span>{session.venue}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 md:pt-0">
            <button
              onClick={() => handleDirections(session.venue)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-xs"
              title="Open campus direction service (funaab.getdirection.xyz)"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Need directions?</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Next Upcoming Class Today
  if (state.status === 'upcoming' && state.nextSession) {
    const session = state.nextSession;
    return (
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-5 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Radio className="w-3.5 h-3.5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Next Class
            </span>
          </div>

          <div className="text-xs font-semibold font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md tabular-nums">
            Starts in {formatRelativeMinutes(state.timeRemainingMinutes || 0)}
          </div>
        </div>

        <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <button
              onClick={() => onSelectCourse?.(session.courseCode)}
              className="text-2xl md:text-3xl font-extrabold tracking-tight hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left"
            >
              {session.courseCode}
            </button>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {session.startTime} – {session.endTime}
              </span>
              <button
                onClick={() => onSelectVenue?.(session.venue)}
                className="inline-flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{session.venue}</span>
              </button>
              {session.isPractical && (
                <span className="text-emerald-700 dark:text-emerald-400 font-medium">· Practical</span>
              )}
              {session.isVirtual && (
                <span className="text-indigo-700 dark:text-indigo-400 font-medium">· Virtual Component</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 md:pt-0">
            <button
              onClick={() => handleDirections(session.venue)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-slate-500" />
              <span>Get directions</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // State 3: Done for today
  if (state.status === 'done_for_today') {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              You're done for today.
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {state.nextAcademicDay && state.firstSessionNextDay ? (
                <>
                  Next class is on <strong className="text-slate-700 dark:text-slate-200">{state.nextAcademicDay}</strong>: {state.firstSessionNextDay.courseCode} at {state.firstSessionNextDay.startTime} ({state.firstSessionNextDay.venue}).
                </>
              ) : (
                'All scheduled lectures and practicals for today have concluded.'
              )}
            </p>
          </div>
        </div>

        {state.firstSessionNextDay && (
          <button
            onClick={() => onSelectCourse?.(state.firstSessionNextDay!.courseCode)}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
          >
            Preview {state.nextAcademicDay} schedule →
          </button>
        )}
      </div>
    );
  }

  // State 4: No classes today (e.g. weekend or free day)
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 md:p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No classes scheduled today.
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {state.nextAcademicDay && state.firstSessionNextDay ? (
              <>
                Upcoming academic day: <strong className="text-slate-700 dark:text-slate-200">{state.nextAcademicDay}</strong> starting with {state.firstSessionNextDay.courseCode} at {state.firstSessionNextDay.startTime}.
              </>
            ) : (
              'You have no official lecture or practical timetable items today.'
            )}
          </p>
        </div>
      </div>

      {state.firstSessionNextDay && (
        <button
          onClick={() => onSelectCourse?.(state.firstSessionNextDay!.courseCode)}
          className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
        >
          View {state.nextAcademicDay} →
        </button>
      )}
    </div>
  );
};
