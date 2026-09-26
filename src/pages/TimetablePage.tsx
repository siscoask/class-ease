import React, { useState } from 'react';
import {
  TimetableSession,
  PersonalEvent,
  TimetableViewMode,
  TimetableDay,
} from '../types';
import { matchCourseSearch, matchVenueSearch } from '../utils/scheduleLogic';
import { TimetableWeekly } from '../components/TimetableWeekly';
import { TimetableDaily } from '../components/TimetableDaily';
import { TimetableAgenda } from '../components/TimetableAgenda';
import { TimetableCompact } from '../components/TimetableCompact';
import { Search, Filter, Calendar, LayoutGrid, List, Table } from 'lucide-react';

interface TimetablePageProps {
  sessions: TimetableSession[];
  personalEvents: PersonalEvent[];
  preferredView: TimetableViewMode;
  onUpdatePreferredView: (view: TimetableViewMode) => void;
  onSelectCourse: (code: string) => void;
  onSelectVenue: (name: string) => void;
  onOpenAddPersonalEvent: (day?: TimetableDay, time?: string) => void;
}

export const TimetablePage: React.FC<TimetablePageProps> = ({
  sessions,
  personalEvents,
  preferredView,
  onUpdatePreferredView,
  onSelectCourse,
  onSelectVenue,
  onOpenAddPersonalEvent,
}) => {
  const [viewMode, setViewMode] = useState<TimetableViewMode>(preferredView);
  const [filterType, setFilterType] = useState<'all' | 'classes' | 'practicals' | 'virtual' | 'personal'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleViewChange = (mode: TimetableViewMode) => {
    setViewMode(mode);
    onUpdatePreferredView(mode);
  };

  // Filter sessions
  const filteredSessions = sessions.filter((s) => {
    // Type filter
    if (filterType === 'practicals' && !s.isPractical) return false;
    if (filterType === 'virtual' && !s.isVirtual) return false;
    if (filterType === 'classes' && s.isPractical) return false;
    if (filterType === 'personal') return false; // Handled separately

    // Search query match
    if (searchQuery.trim()) {
      const matchCourse = matchCourseSearch(s.courseCode, searchQuery);
      const matchVenue = matchVenueSearch(s.venue, searchQuery);
      if (!matchCourse && !matchVenue) return false;
    }

    return true;
  });

  // Filter personal events
  const filteredPersonal = personalEvents.filter((p) => {
    if (filterType === 'classes' || filterType === 'practicals' || filterType === 'virtual') {
      return false;
    }
    if (searchQuery.trim()) {
      const matchTitle = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchLoc = p.location?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchTitle && !matchLoc) return false;
    }
    return true;
  });

  const filterTabs = [
    { id: 'all', label: 'All Items' },
    { id: 'classes', label: 'Lectures Only' },
    { id: 'practicals', label: 'Practicals' },
    { id: 'virtual', label: 'Virtual' },
    { id: 'personal', label: 'Personal' },
  ];

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-200">
      {/* Top Header & View Modes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Academic Timetable
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Official FUNAAB Lecture Schedule • Version 2.0 TIMTEC
          </p>
        </div>

        {/* View Switcher Segmented Control */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs self-start sm:self-auto">
          <button
            onClick={() => handleViewChange('daily')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === 'daily'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Daily</span>
          </button>

          <button
            onClick={() => handleViewChange('weekly')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === 'weekly'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Weekly</span>
          </button>

          <button
            onClick={() => handleViewChange('agenda')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === 'agenda'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Agenda</span>
          </button>

          <button
            onClick={() => handleViewChange('compact')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === 'compact'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Compact</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search course (e.g. BIO 107, chm, csc) or venue (e.g. JAO 3, A105)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {filterTabs.map((tab) => {
            const isSelected = filterType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active View */}
      {filteredSessions.length === 0 && filteredPersonal.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Nothing matched that search or filter.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Try checking for typos or clear your search filter to see your complete timetable.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
            }}
            className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div>
          {viewMode === 'weekly' && (
            <TimetableWeekly
              sessions={filteredSessions}
              personalEvents={filteredPersonal}
              onSelectCourse={onSelectCourse}
              onSelectVenue={onSelectVenue}
            />
          )}

          {viewMode === 'daily' && (
            <TimetableDaily
              sessions={filteredSessions}
              personalEvents={filteredPersonal}
              onSelectCourse={onSelectCourse}
              onSelectVenue={onSelectVenue}
              onAddPersonalEvent={onOpenAddPersonalEvent}
            />
          )}

          {viewMode === 'agenda' && (
            <TimetableAgenda
              sessions={filteredSessions}
              personalEvents={filteredPersonal}
              onSelectCourse={onSelectCourse}
              onSelectVenue={onSelectVenue}
            />
          )}

          {viewMode === 'compact' && (
            <TimetableCompact
              sessions={filteredSessions}
              onSelectCourse={onSelectCourse}
              onSelectVenue={onSelectVenue}
            />
          )}
        </div>
      )}
    </div>
  );
};
