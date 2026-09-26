import {
  DayOfWeek,
  TimetableDay,
  TimetableSession,
  PersonalEvent,
  FreeTimeGap,
  ScheduleClash,
  TimelineItem,
} from '../types';

export const ACADEMIC_DAYS: TimetableDay[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  // Format: "09:00 AM" or "9:00 AM" or "2:30 PM"
  const match = timeStr.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();

  if (ampm === 'PM' && hours !== 12) {
    hours += 12;
  } else if (ampm === 'AM' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

export function formatMinutesToTime(totalMinutes: number): string {
  const norm = ((totalMinutes % 1440) + 1440) % 1440;
  let hours = Math.floor(norm / 60);
  const minutes = norm % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';

  if (hours === 0) hours = 12;
  else if (hours > 12) hours -= 12;

  const mStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours}:${mStr} ${ampm}`;
}

export function getCurrentDayOfWeek(date: Date = new Date()): DayOfWeek {
  const days: DayOfWeek[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return days[date.getDay()];
}

export function formatRelativeMinutes(minutes: number): string {
  if (minutes <= 0) return 'Just now';
  const hrs = Math.floor(minutes / 60);
  const rem = minutes % 60;
  if (hrs === 0) return `${rem}m`;
  if (rem === 0) return `${hrs}h`;
  return `${hrs}h ${rem}m`;
}

export interface NextClassState {
  status: 'now' | 'upcoming' | 'done_for_today' | 'no_classes_today';
  currentSession?: TimetableSession;
  nextSession?: TimetableSession;
  timeRemainingMinutes?: number;
  nextAcademicDay?: TimetableDay;
  firstSessionNextDay?: TimetableSession;
}

export function calculateNextClassState(
  allSessions: TimetableSession[],
  currentDate: Date = new Date()
): NextClassState {
  const dayName = getCurrentDayOfWeek(currentDate);
  const currentMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();

  // If weekend or non-academic day
  const isAcademicDay = ACADEMIC_DAYS.includes(dayName as TimetableDay);
  const todayAcademicDay = isAcademicDay ? (dayName as TimetableDay) : null;

  // Filter today's sessions sorted by start time
  const todaySessions = todayAcademicDay
    ? allSessions
        .filter((s) => s.day === todayAcademicDay)
        .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime))
    : [];

  if (!todayAcademicDay || todaySessions.length === 0) {
    // Find next academic day with classes
    const nextDayInfo = findNextDayWithClasses(allSessions, dayName);
    return {
      status: 'no_classes_today',
      nextAcademicDay: nextDayInfo.day,
      firstSessionNextDay: nextDayInfo.firstSession,
    };
  }

  // Check if currently inside a class
  for (const session of todaySessions) {
    const start = parseTimeToMinutes(session.startTime);
    const end = parseTimeToMinutes(session.endTime);
    if (currentMinutes >= start && currentMinutes < end) {
      return {
        status: 'now',
        currentSession: session,
        timeRemainingMinutes: end - currentMinutes,
      };
    }
  }

  // Check for upcoming class today
  const upcomingToday = todaySessions.filter(
    (s) => parseTimeToMinutes(s.startTime) > currentMinutes
  );

  if (upcomingToday.length > 0) {
    const next = upcomingToday[0];
    const startsIn = parseTimeToMinutes(next.startTime) - currentMinutes;
    return {
      status: 'upcoming',
      nextSession: next,
      timeRemainingMinutes: startsIn,
    };
  }

  // If reached here: all classes for today are finished
  const nextDayInfo = findNextDayWithClasses(allSessions, dayName);
  return {
    status: 'done_for_today',
    nextAcademicDay: nextDayInfo.day,
    firstSessionNextDay: nextDayInfo.firstSession,
  };
}

function findNextDayWithClasses(
  allSessions: TimetableSession[],
  currentDay: DayOfWeek
): { day?: TimetableDay; firstSession?: TimetableSession } {
  const dayOrder: TimetableDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const currentIndex = dayOrder.indexOf(currentDay as TimetableDay);

  for (let offset = 1; offset <= 7; offset++) {
    const targetIndex = (currentIndex + offset + 7) % 7;
    // Only evaluate Monday to Friday
    if (targetIndex < 5) {
      const candidateDay = dayOrder[targetIndex];
      const dayClasses = allSessions
        .filter((s) => s.day === candidateDay)
        .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));
      if (dayClasses.length > 0) {
        return {
          day: candidateDay,
          firstSession: dayClasses[0],
        };
      }
    }
  }
  return {};
}

export function calculateFreeTimeGaps(
  sessions: TimetableSession[],
  day: TimetableDay
): FreeTimeGap[] {
  const daySessions = sessions
    .filter((s) => s.day === day)
    .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

  if (daySessions.length <= 1) return [];

  const gaps: FreeTimeGap[] = [];

  for (let i = 0; i < daySessions.length - 1; i++) {
    const curr = daySessions[i];
    const next = daySessions[i + 1];

    const currEnd = parseTimeToMinutes(curr.endTime);
    const nextStart = parseTimeToMinutes(next.startTime);

    if (nextStart > currEnd) {
      const duration = nextStart - currEnd;
      // Only include meaningful gaps (>= 15 minutes)
      if (duration >= 15) {
        const hrs = Math.floor(duration / 60);
        const mins = duration % 60;
        const formatted = hrs > 0 ? (mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`) : `${mins}m`;

        gaps.push({
          id: `gap-${day.toLowerCase()}-${currEnd}-${nextStart}`,
          day,
          startTime: formatMinutesToTime(currEnd),
          endTime: formatMinutesToTime(nextStart),
          durationMinutes: duration,
          formattedDuration: formatted,
          precedingItem: curr.courseCode,
          followingItem: next.courseCode,
        });
      }
    }
  }

  return gaps;
}

export function detectClashes(
  officialSessions: TimetableSession[],
  personalEvents: PersonalEvent[]
): ScheduleClash[] {
  const clashes: ScheduleClash[] = [];

  // 1. Official vs Official
  for (let i = 0; i < officialSessions.length; i++) {
    for (let j = i + 1; j < officialSessions.length; j++) {
      const a = officialSessions[i];
      const b = officialSessions[j];
      if (a.day !== b.day) continue;

      const aStart = parseTimeToMinutes(a.startTime);
      const aEnd = parseTimeToMinutes(a.endTime);
      const bStart = parseTimeToMinutes(b.startTime);
      const bEnd = parseTimeToMinutes(b.endTime);

      if (Math.max(aStart, bStart) < Math.min(aEnd, bEnd)) {
        clashes.push({
          id: `clash-off-off-${a.id}-${b.id}`,
          type: 'official-official',
          day: a.day,
          timeRange: `${formatMinutesToTime(Math.max(aStart, bStart))} – ${formatMinutesToTime(Math.min(aEnd, bEnd))}`,
          itemA: {
            title: a.courseCode,
            venue: a.venue,
            isPersonal: false,
            startTime: a.startTime,
            endTime: a.endTime,
          },
          itemB: {
            title: b.courseCode,
            venue: b.venue,
            isPersonal: false,
            startTime: b.startTime,
            endTime: b.endTime,
          },
        });
      }
    }
  }

  // 2. Official vs Personal
  for (const off of officialSessions) {
    for (const pers of personalEvents) {
      if (off.day !== pers.day) continue;

      const aStart = parseTimeToMinutes(off.startTime);
      const aEnd = parseTimeToMinutes(off.endTime);
      const bStart = parseTimeToMinutes(pers.startTime);
      const bEnd = parseTimeToMinutes(pers.endTime);

      if (Math.max(aStart, bStart) < Math.min(aEnd, bEnd)) {
        clashes.push({
          id: `clash-off-pers-${off.id}-${pers.id}`,
          type: 'official-personal',
          day: off.day,
          timeRange: `${formatMinutesToTime(Math.max(aStart, bStart))} – ${formatMinutesToTime(Math.min(aEnd, bEnd))}`,
          itemA: {
            title: off.courseCode,
            venue: off.venue,
            isPersonal: false,
            startTime: off.startTime,
            endTime: off.endTime,
          },
          itemB: {
            title: pers.title,
            venue: pers.location,
            isPersonal: true,
            startTime: pers.startTime,
            endTime: pers.endTime,
          },
        });
      }
    }
  }

  // 3. Personal vs Personal
  for (let i = 0; i < personalEvents.length; i++) {
    for (let j = i + 1; j < personalEvents.length; j++) {
      const a = personalEvents[i];
      const b = personalEvents[j];
      if (a.day !== b.day) continue;

      const aStart = parseTimeToMinutes(a.startTime);
      const aEnd = parseTimeToMinutes(a.endTime);
      const bStart = parseTimeToMinutes(b.startTime);
      const bEnd = parseTimeToMinutes(b.endTime);

      if (Math.max(aStart, bStart) < Math.min(aEnd, bEnd)) {
        clashes.push({
          id: `clash-pers-pers-${a.id}-${b.id}`,
          type: 'personal-personal',
          day: a.day,
          timeRange: `${formatMinutesToTime(Math.max(aStart, bStart))} – ${formatMinutesToTime(Math.min(aEnd, bEnd))}`,
          itemA: {
            title: a.title,
            venue: a.location,
            isPersonal: true,
            startTime: a.startTime,
            endTime: a.endTime,
          },
          itemB: {
            title: b.title,
            venue: b.location,
            isPersonal: true,
            startTime: b.startTime,
            endTime: b.endTime,
          },
        });
      }
    }
  }

  return clashes;
}

export function buildDayTimeline(
  sessions: TimetableSession[],
  personalEvents: PersonalEvent[],
  day: TimetableDay
): TimelineItem[] {
  const daySessions = sessions.filter((s) => s.day === day);
  const dayPersonal = personalEvents.filter((e) => e.day === day);

  const items: TimelineItem[] = [];

  // Add official sessions
  for (const s of daySessions) {
    items.push({
      kind: 'session',
      id: s.id,
      session: s,
      startMinutes: parseTimeToMinutes(s.startTime),
      endMinutes: parseTimeToMinutes(s.endTime),
    });
  }

  // Add personal events
  for (const p of dayPersonal) {
    items.push({
      kind: 'personal',
      id: p.id,
      event: p,
      startMinutes: parseTimeToMinutes(p.startTime),
      endMinutes: parseTimeToMinutes(p.endTime),
    });
  }

  // Sort chronologically
  items.sort((a, b) => a.startMinutes - b.startMinutes);

  // Compute gaps between successive items
  const finalTimeline: TimelineItem[] = [];
  for (let i = 0; i < items.length; i++) {
    finalTimeline.push(items[i]);

    if (i < items.length - 1) {
      const currentEnd = items[i].endMinutes;
      const nextStart = items[i + 1].startMinutes;

      if (nextStart - currentEnd >= 20) {
        const duration = nextStart - currentEnd;
        const hrs = Math.floor(duration / 60);
        const mins = duration % 60;
        const formatted = hrs > 0 ? (mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`) : `${mins}m`;

        finalTimeline.push({
          kind: 'free',
          id: `free-${day.toLowerCase()}-${currentEnd}-${nextStart}`,
          gap: {
            id: `gap-${day.toLowerCase()}-${currentEnd}-${nextStart}`,
            day,
            startTime: formatMinutesToTime(currentEnd),
            endTime: formatMinutesToTime(nextStart),
            durationMinutes: duration,
            formattedDuration: formatted,
          },
          startMinutes: currentEnd,
          endMinutes: nextStart,
        });
      }
    }
  }

  return finalTimeline;
}

export function calculateWeeklySummary(
  sessions: TimetableSession[],
  personalEvents: PersonalEvent[]
) {
  let totalLectures = 0;
  let totalPracticals = 0;
  let totalVirtual = 0;
  let totalAcademicMinutes = 0;

  for (const s of sessions) {
    if (s.isPractical) {
      totalPracticals += 1;
    } else {
      totalLectures += 1;
    }
    if (s.isVirtual) totalVirtual += 1;

    const start = parseTimeToMinutes(s.startTime);
    const end = parseTimeToMinutes(s.endTime);
    if (end > start) {
      totalAcademicMinutes += end - start;
    }
  }

  let totalPersonalMinutes = 0;
  for (const p of personalEvents) {
    const start = parseTimeToMinutes(p.startTime);
    const end = parseTimeToMinutes(p.endTime);
    if (end > start) {
      totalPersonalMinutes += end - start;
    }
  }

  // Calculate free time within Monday-Friday typical 8:00 AM to 6:00 PM (10 hrs/day = 50 hrs total)
  const totalStandardMinutes = 50 * 60;
  const freeMinutes = Math.max(0, totalStandardMinutes - totalAcademicMinutes);

  return {
    totalClasses: sessions.length,
    totalLectures,
    totalPracticals,
    totalVirtual,
    academicHours: +(totalAcademicMinutes / 60).toFixed(1),
    freeHours: +(freeMinutes / 60).toFixed(1),
    personalEventsCount: personalEvents.length,
    personalHours: +(totalPersonalMinutes / 60).toFixed(1),
  };
}

export function matchCourseSearch(courseCode: string, query: string): boolean {
  if (!query) return true;
  const qClean = query.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cClean = courseCode.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cClean.includes(qClean) || courseCode.toLowerCase().includes(query.toLowerCase());
}

export function matchVenueSearch(venueName: string, query: string): boolean {
  if (!query) return true;
  // Handle phrases like "Where is A105?"
  const cleanedQuery = query
    .toLowerCase()
    .replace(/where\s+is\s+/gi, '')
    .replace(/[^a-z0-9]/g, '');
  const cleanedVenue = venueName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleanedVenue.includes(cleanedQuery) || venueName.toLowerCase().includes(query.toLowerCase());
}
