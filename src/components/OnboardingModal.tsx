import React, { useState } from 'react';
import { UserProfile, TimetableViewMode } from '../types';
import { VERIFIED_COLLEGES } from '../data/timetable';
import { BrandLogo } from './BrandLogo';
import { ArrowRight, Check, Sparkles } from 'lucide-react';

interface OnboardingModalProps {
  initialProfile: UserProfile;
  onComplete: (updated: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  initialProfile,
  onComplete,
}) => {
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState(initialProfile.preferredName || '');
  const [collegeId, setCollegeId] = useState(initialProfile.collegeId || VERIFIED_COLLEGES[0]?.id || '');
  const [departmentId, setDepartmentId] = useState(initialProfile.departmentId || '');
  const [level, setLevel] = useState(initialProfile.level || '100');
  const [view, setView] = useState<TimetableViewMode>(initialProfile.preferredView || 'daily');

  const selectedCollege = VERIFIED_COLLEGES.find((c) => c.id === collegeId) || VERIFIED_COLLEGES[0];
  const departments = selectedCollege ? selectedCollege.departments : [];

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      // Complete
      onComplete({
        ...initialProfile,
        preferredName: name.trim(),
        collegeId: selectedCollege?.id || '',
        departmentId: departmentId || departments[0]?.code || '',
        level,
        preferredView: view,
        onboardingCompleted: true,
      });
    }
  };

  const handleSkipName = () => {
    setName('');
    setStep(2);
  };

  const viewOptions: { id: TimetableViewMode; title: string; desc: string }[] = [
    {
      id: 'daily',
      title: 'Daily View',
      desc: 'Focus on today and one day at a time with full details.',
    },
    {
      id: 'weekly',
      title: 'Weekly View',
      desc: 'Monday to Friday birds-eye view of your entire academic week.',
    },
    {
      id: 'agenda',
      title: 'Agenda View',
      desc: 'Clean, chronological stream of all your upcoming sessions.',
    },
    {
      id: 'compact',
      title: 'Compact View',
      desc: 'High-density tabular summary for maximum overview speed.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <BrandLogo size="sm" showTagline={false} />
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-mono">
            <span>Step {step} of 5</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1">
          <div
            className="bg-indigo-600 h-1 transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* STEP 1: Name */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Welcome to Class Ease
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  What should we call you?
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Optional. We use this to greet you calmly and personalize your daily timetable.
                </p>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Preferred First Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tobi"
                  maxLength={30}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNext();
                  }}
                />
              </div>

              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Stored entirely on your device. No email, phone, or university login required.
              </p>
            </div>
          )}

          {/* STEP 2: College */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Academic Profile
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Select your College
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Only verified colleges from the official FUNAAB TIMTEC timetable are listed.
                </p>
              </div>

              <div className="space-y-2 pt-1 max-h-64 overflow-y-auto pr-1">
                {VERIFIED_COLLEGES.map((col) => {
                  const isSelected = col.id === collegeId;
                  return (
                    <button
                      key={col.id}
                      onClick={() => {
                        setCollegeId(col.id);
                        if (col.departments.length > 0) {
                          setDepartmentId(col.departments[0].code);
                        }
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-white shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">
                          {col.id}
                        </div>
                        <div className="text-xs font-medium">{col.name}</div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Department */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {selectedCollege.id}
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Select your Department
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Showing verified department mappings for {selectedCollege.name}.
                </p>
              </div>

              <div className="space-y-2 pt-1 max-h-64 overflow-y-auto pr-1">
                {departments.length > 0 ? (
                  departments.map((dept) => {
                    const isSelected = (departmentId || departments[0].code) === dept.code;
                    return (
                      <button
                        key={dept.id}
                        onClick={() => setDepartmentId(dept.code)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-white shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">
                            {dept.code}
                          </div>
                          <div className="text-xs font-medium">{dept.name}</div>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 italic p-3">
                    Authoritative department mapping is unverified for this college in TIMTEC v2.0.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Level */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Academic Level
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  What is your Level?
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Filters official classes and practicals relevant to your academic year.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                {['100', '200', '300', '400', '500', '600'].map((lvl) => {
                  const isSelected = level === lvl;
                  return (
                    <button
                      key={lvl}
                      onClick={() => setLevel(lvl)}
                      className={`p-3.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold'
                      }`}
                    >
                      <div className="text-base">{lvl} Level</div>
                      <div className="text-[11px] opacity-80 font-normal">
                        {lvl === '100' ? 'Freshman' : lvl === '500' || lvl === '600' ? 'Finalist' : `Year ${lvl[0]}`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Timetable View Preference */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Display Preference
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Choose your preferred view
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  You can change this anytime with one click in the navigation bar.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                {viewOptions.map((opt) => {
                  const isSelected = view === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setView(opt.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-white shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold">{opt.title}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {opt.desc}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 text-center">
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  {name ? `You're all set, ${name}!` : "You're all set."}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between">
          {step === 1 ? (
            <button
              onClick={handleSkipName}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
            >
              Skip name
            </button>
          ) : (
            <button
              onClick={() => setStep(step - 1)}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
            >
              Back
            </button>
          )}

          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all active:scale-95"
          >
            <span>{step === 5 ? 'Open Timetable' : 'Continue'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
