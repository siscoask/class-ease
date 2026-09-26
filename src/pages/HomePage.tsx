import React from 'react';
import { TimetableSession, PersonalEvent, UserProfile, TimetableDay } from '../types';
import { NextClassCard } from '../components/NextClassCard';
import { TodayTimeline } from '../components/TodayTimeline';
import { calculateFreeTimeGaps, getCurrentDayOfWeek, detectClashes } from '../utils/scheduleLogic';
import { Calendar, Search, MapPin, Plus, Share2, Coffee, AlertTriangle, ChevronRight } from 'lucide-react';

interface HomePageProps {
  userProfile: UserProfile;
  activeSessions: TimetableSession[];
  personalEvents: PersonalEvent[];
  onNavigateTab: (tab: string) => void;
  onSelectCourse: (code: string) => void;
  onSelectVenue: (name: string) => void;
  onOpenAddPersonalEvent: (day?: TimetableDay, time?: string) => void;
  onOpenShareModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  userProfile,
  activeSessions,
  personalEvents,
  onNavigateTab,
  onSelectCourse,
  onSelectVenue,
  onOpenAddPersonalEvent,
  onOpenShareModal,
}) => {
  // Dynamic greeting based on current local hour
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = getCurrentDayOfWeek(now);
  const isAcademicDay = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(currentDay);
  const todayDay: TimetableDay = isAcademicDay ? (currentDay as TimetableDay) : 'Monday';

  let greetingTime = 'Good morning';
  if (currentHour >= 12 && currentHour < 17) {
    greetingTime = 'Good afternoon';
  } else if (currentHour >= 17) {
    greetingTime = 'Good evening';
  }

  const greeting = userProfile.preferredName
    ? `${greetingTime}, ${userProfile.preferredName}.`
    : `${greetingTime}.`;

  // Free time calculation for today
  const freeGaps = isAcademicDay ? calculateFreeTimeGaps(activeSessions, todayDay) : [];
  const totalFreeMinutesToday = freeGaps.reduce((acc, g) => acc + g.durationMinutes, 0);

  // Clash detection
  const clashes = detectClashes(activeSessions, personalEvents);
  const todayClashes = clashes.filter((c) => c.day === currentDay);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner & Dynamic Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
            {currentDay} • FUNAAB First Semester
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
            {greeting}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {userProfile.level}L • {userProfile.departmentId || userProfile.collegeId || 'General Schedule'}
          </p>
        </div>

        {/* Quick Share action */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenShareModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share My Week</span>
          </button>
        </div>
      </div>

      {/* Clash Warning if detected today */}
      {todayClashes.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-amber-950 dark:text-amber-200">
              Schedule clash detected today ({todayClashes.length})
            </h4>
            <p className="text-amber-800/90 dark:text-amber-300/90 mt-0.5">
              Overlapping items: {todayClashes[0].itemA.title} and {todayClashes[0].itemB.title} ({todayClashes[0].timeRange}). Review your timetable.
            </p>
          </div>
        </div>
      )}

      {/* NEXT CLASS CARD */}
      <NextClassCard
        sessions={activeSessions}
        onSelectCourse={onSelectCourse}
        onSelectVenue={onSelectVenue}
      />

      {/* Free-Time Insight Snippet */}
      {freeGaps.length > 0 && (
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {totalFreeMinutesToday >= 60
                  ? `You have ${Math.floor(totalFreeMinutesToday / 60)}h ${totalFreeMinutesToday % 60 > 0 ? `${totalFreeMinutesToday % 60}m` : ''} free today`
                  : `You have ${totalFreeMinutesToday}m free today`}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                First open window: {freeGaps[0].startTime} – {freeGaps[0].endTime} ({freeGaps[0].formattedDuration})
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('freetime')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 shrink-0"
          >
            <span>Explore</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => onNavigateTab('timetable')}
          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all text-left shadow-2xs group"
        >
          <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-bold text-slate-900 dark:text-white">View Timetable</div>
          <div className="text-[11px] text-slate-500">4 viewing modes</div>
        </button>

        <button
          onClick={() => onNavigateTab('courses')}
          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all text-left shadow-2xs group"
        >
          <Search className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-bold text-slate-900 dark:text-white">Find a Course</div>
          <div className="text-[11px] text-slate-500">Search by code</div>
        </button>

        <button
          onClick={() => onNavigateTab('venues')}
          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all text-left shadow-2xs group"
        >
          <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-bold text-slate-900 dark:text-white">Find a Venue</div>
          <div className="text-[11px] text-slate-500">Auditoriums & labs</div>
        </button>

        <button
          onClick={() => onOpenAddPersonalEvent(todayDay)}
          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all text-left shadow-2xs group"
        >
          <Plus className="w-4 h-4 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-bold text-slate-900 dark:text-white">Personal Event</div>
          <div className="text-[11px] text-slate-500">Add study / meeting</div>
        </button>
      </div>

      {/* Today's Academic Schedule Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Today's Schedule ({todayDay})
            </h3>
            <p className="text-xs text-slate-500">
              Vertical chronological timeline of classes, practicals, and personal events
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('timetable')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            See full week →
          </button>
        </div>

        <TodayTimeline
          sessions={activeSessions}
          personalEvents={personalEvents}
          day={todayDay}
          onSelectCourse={onSelectCourse}
          onSelectVenue={onSelectVenue}
          onAddPersonalEvent={onOpenAddPersonalEvent}
        />
      </div>
    </div>
  );
};
