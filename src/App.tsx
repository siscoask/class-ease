import React, { useEffect, useState } from 'react';
import { UserProfile, PersonalEvent, TimetableSession, TimetableDay } from './types';
import {
  DEFAULT_PROFILE,
  getStoredProfile,
  saveStoredProfile,
  getStoredPersonalEvents,
  savePersonalEvent,
  deletePersonalEvent,
  resetAllLocalData,
} from './utils/storage';
import { TIMETABLE_SESSIONS } from './data/timetable';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { OnboardingModal } from './components/OnboardingModal';
import { CourseModal } from './components/CourseModal';
import { VenueModal } from './components/VenueModal';
import { PersonalEventModal } from './components/PersonalEventModal';
import { ShareTimetableModal } from './components/ShareTimetableModal';
import { FeedbackModal } from './components/FeedbackModal';

import { HomePage } from './pages/HomePage';
import { TimetablePage } from './pages/TimetablePage';
import { CoursesPage } from './pages/CoursesPage';
import { VenuesPage } from './pages/VenuesPage';
import { FreeTimePage } from './pages/FreeTimePage';
import { MySchedulePage } from './pages/MySchedulePage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [personalEvents, setPersonalEvents] = useState<PersonalEvent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Modals state
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [editingPersonalEvent, setEditingPersonalEvent] = useState<PersonalEvent | null>(null);
  const [isAddingPersonalEvent, setIsAddingPersonalEvent] = useState(false);
  const [suggestedDayTime, setSuggestedDayTime] = useState<{ day?: TimetableDay; time?: string }>({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackContext, setFeedbackContext] = useState<any>(null);

  // Initialize storage
  useEffect(() => {
    async function loadData() {
      const p = await getStoredProfile();
      const events = await getStoredPersonalEvents();
      setProfile(p);
      setPersonalEvents(events);
      setIsLoaded(true);

      // Apply dark mode
      if (p.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    loadData();
  }, []);

  // Update dark mode
  const toggleDarkMode = () => {
    const nextMode = !profile.darkMode;
    const updated = { ...profile, darkMode: nextMode };
    setProfile(updated);
    saveStoredProfile(updated);

    if (nextMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Profile update
  const handleUpdateProfile = (updated: UserProfile) => {
    setProfile(updated);
    saveStoredProfile(updated);
  };

  // Course toggle enrollment
  const handleToggleCourseEnrollment = (code: string) => {
    const currentCodes = profile.selectedCourseCodes || [];
    let updatedCodes: string[];
    if (currentCodes.includes(code)) {
      updatedCodes = currentCodes.filter((c) => c !== code);
    } else {
      updatedCodes = [...currentCodes, code];
    }
    const updatedProfile = { ...profile, selectedCourseCodes: updatedCodes };
    setProfile(updatedProfile);
    saveStoredProfile(updatedProfile);
  };

  // Personal event handlers
  const handleSavePersonalEvent = async (event: PersonalEvent) => {
    await savePersonalEvent(event);
    const updated = await getStoredPersonalEvents();
    setPersonalEvents(updated);
    setIsAddingPersonalEvent(false);
    setEditingPersonalEvent(null);
  };

  const handleDeletePersonalEvent = async (id: string) => {
    await deletePersonalEvent(id);
    const updated = await getStoredPersonalEvents();
    setPersonalEvents(updated);
    setEditingPersonalEvent(null);
  };

  const handleResetAll = async () => {
    await resetAllLocalData();
    setProfile(DEFAULT_PROFILE);
    setPersonalEvents([]);
    setCurrentTab('home');
  };

  // Determine active sessions for the user:
  // If user selected courses explicitly, use them.
  // Otherwise, default to sessions matching their academic level (e.g. 100 level courses for 100L).
  const activeSessions: TimetableSession[] = React.useMemo(() => {
    if (profile.selectedCourseCodes && profile.selectedCourseCodes.length > 0) {
      return TIMETABLE_SESSIONS.filter((s) =>
        profile.selectedCourseCodes.includes(s.courseCode)
      );
    }
    // Default smart filter based on user level
    const userLvl = profile.level || '100';
    const levelSessions = TIMETABLE_SESSIONS.filter((s) => s.level === userLvl);
    return levelSessions.length > 0 ? levelSessions : TIMETABLE_SESSIONS.slice(0, 50);
  }, [profile.selectedCourseCodes, profile.level]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-slate-500">Loading Class Ease...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        darkMode={profile.darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-5 pb-20 md:pb-10">
        {currentTab === 'home' && (
          <HomePage
            userProfile={profile}
            activeSessions={activeSessions}
            personalEvents={personalEvents}
            onNavigateTab={setCurrentTab}
            onSelectCourse={setSelectedCourse}
            onSelectVenue={setSelectedVenue}
            onOpenAddPersonalEvent={(day, time) => {
              setSuggestedDayTime({ day, time });
              setIsAddingPersonalEvent(true);
            }}
            onOpenShareModal={() => setShowShareModal(true)}
          />
        )}

        {currentTab === 'timetable' && (
          <TimetablePage
            sessions={activeSessions}
            personalEvents={personalEvents}
            preferredView={profile.preferredView}
            onUpdatePreferredView={(v) => handleUpdateProfile({ ...profile, preferredView: v })}
            onSelectCourse={setSelectedCourse}
            onSelectVenue={setSelectedVenue}
            onOpenAddPersonalEvent={(day, time) => {
              setSuggestedDayTime({ day, time });
              setIsAddingPersonalEvent(true);
            }}
          />
        )}

        {currentTab === 'courses' && (
          <CoursesPage
            selectedCourseCodes={profile.selectedCourseCodes}
            onToggleCourse={handleToggleCourseEnrollment}
            onSelectCourse={setSelectedCourse}
            userLevel={profile.level}
          />
        )}

        {currentTab === 'venues' && (
          <VenuesPage onSelectVenue={setSelectedVenue} />
        )}

        {currentTab === 'freetime' && (
          <FreeTimePage
            sessions={activeSessions}
            onOpenAddPersonalEvent={(day, time) => {
              setSuggestedDayTime({ day, time });
              setIsAddingPersonalEvent(true);
            }}
          />
        )}

        {currentTab === 'myschedule' && (
          <MySchedulePage
            personalEvents={personalEvents}
            officialSessions={activeSessions}
            onOpenAddEvent={() => {
              setSuggestedDayTime({});
              setIsAddingPersonalEvent(true);
            }}
            onEditEvent={setEditingPersonalEvent}
            onDeleteEvent={handleDeletePersonalEvent}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsPage
            userProfile={profile}
            onUpdateProfile={handleUpdateProfile}
            onResetAllData={handleResetAll}
            onToggleDarkMode={toggleDarkMode}
            onOpenFeedback={() => {
              setFeedbackContext(null);
              setShowFeedbackModal(true);
            }}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenFeedback={() => {
          setFeedbackContext(null);
          setShowFeedbackModal(true);
        }}
      />

      {/* Subtle Offline Indicator (Always available when offline) */}
      <OfflineIndicator />

      {/* First-Time Onboarding Modal */}
      {!profile.onboardingCompleted && (
        <OnboardingModal
          initialProfile={profile}
          onComplete={(updated) => {
            handleUpdateProfile(updated);
          }}
        />
      )}

      {/* Course Detail Modal */}
      {selectedCourse && (
        <CourseModal
          courseCode={selectedCourse}
          isRegistered={profile.selectedCourseCodes?.includes(selectedCourse) || false}
          onToggleRegistered={handleToggleCourseEnrollment}
          onClose={() => setSelectedCourse(null)}
          onSelectVenue={setSelectedVenue}
        />
      )}

      {/* Venue Detail Modal */}
      {selectedVenue && (
        <VenueModal
          venueName={selectedVenue}
          onClose={() => setSelectedVenue(null)}
          onSelectCourse={setSelectedCourse}
        />
      )}

      {/* Personal Event Modal (Add / Edit) */}
      {(isAddingPersonalEvent || editingPersonalEvent) && (
        <PersonalEventModal
          initialDay={suggestedDayTime.day || 'Monday'}
          initialStartTime={suggestedDayTime.time || '10:00 AM'}
          existingEvent={editingPersonalEvent || undefined}
          officialSessions={activeSessions}
          existingPersonalEvents={personalEvents}
          onSave={handleSavePersonalEvent}
          onDelete={editingPersonalEvent ? handleDeletePersonalEvent : undefined}
          onClose={() => {
            setIsAddingPersonalEvent(false);
            setEditingPersonalEvent(null);
          }}
        />
      )}

      {/* Share Timetable Modal */}
      {showShareModal && (
        <ShareTimetableModal
          sessions={activeSessions}
          profile={profile}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Feedback / Discrepancy Report Modal */}
      {showFeedbackModal && (
        <FeedbackModal
          initialContext={feedbackContext}
          onClose={() => setShowFeedbackModal(false)}
        />
      )}
    </div>
  );
}
