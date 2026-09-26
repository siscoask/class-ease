import React, { useState, useRef, useEffect } from 'react';
import { BrandLogo } from './BrandLogo';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Moon,
  Sun,
  ShieldCheck,
  ChevronDown,
  MapPin,
  Coffee,
  CalendarPlus,
  Settings,
} from 'lucide-react';
import { OFFICIAL_METADATA } from '../data/timetable';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  darkMode,
  onToggleDarkMode,
}) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close more menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const primaryTabs = [
    { id: 'home', label: 'Home' },
    { id: 'timetable', label: 'Timetable' },
    { id: 'courses', label: 'Courses' },
  ];

  const secondaryTabs = [
    { id: 'venues', label: 'Venues', icon: MapPin },
    { id: 'freetime', label: 'Free Time', icon: Coffee },
    { id: 'myschedule', label: 'My Schedule', icon: CalendarPlus },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const allTabs = [...primaryTabs, ...secondaryTabs];

  const isSecondaryActive = secondaryTabs.some((t) => t.id === currentTab);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center text-left focus-visible:outline-none"
          >
            <BrandLogo size="md" showWordmark={true} showTagline={false} />
          </button>

          {/* Official Version Badge */}
          <div className="hidden xl:flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400 pl-3 border-l border-slate-200 dark:border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>2026/2027 First Sem (v{OFFICIAL_METADATA.timetableVersion})</span>
          </div>
        </div>

        {/* Desktop Navigation Links (Large Screens >= 1024px) */}
        <nav className="hidden lg:flex items-center gap-1">
          {allTabs.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Tablet Navigation Links (768px to 1023px) - Clean Adaptive Pattern */}
        <nav className="hidden md:flex lg:hidden items-center gap-1">
          {primaryTabs.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {/* More Dropdown for Tablets */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                isSecondaryActive || moreOpen
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>More</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
            </button>

            {moreOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 animate-in fade-in duration-100">
                {secondaryTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = currentTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        onSelectTab(tab.id);
                        setMoreOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-xs font-semibold flex items-center gap-2 transition-colors ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Right Action Icons (PWA & Dark Mode) */}
        <div className="flex items-center gap-2 shrink-0">
          <PWAInstallButton />

          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
