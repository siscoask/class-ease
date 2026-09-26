import { UserProfile, PersonalEvent } from '../types';

const DB_NAME = 'ClassEaseDB';
const DB_VERSION = 1;
const STORE_PROFILE = 'userProfile';
const STORE_EVENTS = 'personalEvents';

export const DEFAULT_PROFILE: UserProfile = {
  preferredName: '',
  collegeId: '',
  departmentId: '',
  level: '100',
  selectedCourseCodes: [],
  preferredView: 'daily',
  darkMode: false,
  onboardingCompleted: false,
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_PROFILE)) {
        db.createObjectStore(STORE_PROFILE, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORE_EVENTS)) {
        db.createObjectStore(STORE_EVENTS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// LocalStorage fallback helpers
const LS_PROFILE_KEY = 'class_ease_profile';
const LS_EVENTS_KEY = 'class_ease_events';

export async function getStoredProfile(): Promise<UserProfile> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_PROFILE, 'readonly');
      const store = tx.objectStore(STORE_PROFILE);
      const req = store.get('current');
      req.onsuccess = () => {
        if (req.result && req.result.data) {
          resolve({ ...DEFAULT_PROFILE, ...req.result.data });
        } else {
          // Check local storage fallback
          const ls = localStorage.getItem(LS_PROFILE_KEY);
          if (ls) {
            try {
              resolve({ ...DEFAULT_PROFILE, ...JSON.parse(ls) });
              return;
            } catch {
              // ignore
            }
          }
          resolve(DEFAULT_PROFILE);
        }
      };
      req.onerror = () => {
        const ls = localStorage.getItem(LS_PROFILE_KEY);
        resolve(ls ? JSON.parse(ls) : DEFAULT_PROFILE);
      };
    });
  } catch {
    const ls = localStorage.getItem(LS_PROFILE_KEY);
    return ls ? JSON.parse(ls) : DEFAULT_PROFILE;
  }
}

export async function saveStoredProfile(profile: UserProfile): Promise<void> {
  // Always mirror in localStorage for immediate sync
  try {
    localStorage.setItem(LS_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PROFILE, 'readwrite');
      const store = tx.objectStore(STORE_PROFILE);
      const req = store.put({ key: 'current', data: profile });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Falling back to localStorage for profile', err);
  }
}

export async function getStoredPersonalEvents(): Promise<PersonalEvent[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_EVENTS, 'readonly');
      const store = tx.objectStore(STORE_EVENTS);
      const req = store.getAll();
      req.onsuccess = () => {
        if (req.result && req.result.length > 0) {
          resolve(req.result);
        } else {
          const ls = localStorage.getItem(LS_EVENTS_KEY);
          resolve(ls ? JSON.parse(ls) : []);
        }
      };
      req.onerror = () => {
        const ls = localStorage.getItem(LS_EVENTS_KEY);
        resolve(ls ? JSON.parse(ls) : []);
      };
    });
  } catch {
    const ls = localStorage.getItem(LS_EVENTS_KEY);
    return ls ? JSON.parse(ls) : [];
  }
}

export async function savePersonalEvent(event: PersonalEvent): Promise<void> {
  const current = await getStoredPersonalEvents();
  const existingIdx = current.findIndex((e) => e.id === event.id);
  const updated = existingIdx >= 0
    ? current.map((e) => (e.id === event.id ? event : e))
    : [...current, event];

  try {
    localStorage.setItem(LS_EVENTS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_EVENTS, 'readwrite');
      const store = tx.objectStore(STORE_EVENTS);
      const req = store.put(event);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Fallback saving personal event', err);
  }
}

export async function deletePersonalEvent(eventId: string): Promise<void> {
  const current = await getStoredPersonalEvents();
  const updated = current.filter((e) => e.id !== eventId);

  try {
    localStorage.setItem(LS_EVENTS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_EVENTS, 'readwrite');
      const store = tx.objectStore(STORE_EVENTS);
      const req = store.delete(eventId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Fallback deleting personal event', err);
  }
}

export async function resetAllLocalData(): Promise<void> {
  try {
    localStorage.removeItem(LS_PROFILE_KEY);
    localStorage.removeItem(LS_EVENTS_KEY);
  } catch {
    // ignore
  }

  try {
    const db = await openDB();
    const tx = db.transaction([STORE_PROFILE, STORE_EVENTS], 'readwrite');
    tx.objectStore(STORE_PROFILE).clear();
    tx.objectStore(STORE_EVENTS).clear();
  } catch {
    // ignore
  }
}
