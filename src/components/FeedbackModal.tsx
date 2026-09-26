import React, { useState } from 'react';
import { OFFICIAL_METADATA } from '../data/timetable';
import { X, Send, MessageSquareText, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';

interface FeedbackModalProps {
  initialContext?: {
    courseCode?: string;
    day?: string;
    time?: string;
    venue?: string;
  };
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  initialContext,
  onClose,
}) => {
  const [category, setCategory] = useState<'incorrect_info' | 'feature' | 'bug' | 'other'>(
    initialContext?.courseCode ? 'incorrect_info' : 'incorrect_info'
  );
  const [courseCode, setCourseCode] = useState(initialContext?.courseCode || '');
  const [venue, setVenue] = useState(initialContext?.venue || '');
  const [day, setDay] = useState(initialContext?.day || '');
  const [message, setMessage] = useState('');

  const categoryLabels = {
    incorrect_info: 'Report incorrect timetable information',
    feature: 'Suggest a feature',
    bug: 'Report a problem or glitch',
    other: 'General feedback',
  };

  const handleSendWhatsApp = () => {
    let fullText = `*Class Ease Feedback / Timetable Report*\n`;
    fullText += `Type: ${categoryLabels[category]}\n`;
    fullText += `Timetable Version: ${OFFICIAL_METADATA.academicYear} ${OFFICIAL_METADATA.semester} v${OFFICIAL_METADATA.timetableVersion}\n`;

    if (courseCode) fullText += `Course: ${courseCode}\n`;
    if (venue) fullText += `Venue: ${venue}\n`;
    if (day) fullText += `Day: ${day}\n`;

    fullText += `\n*Message:*\n${message || 'No additional comment'}\n`;
    fullText += `\n_Sent from Class Ease App_`;

    // Format for Nigeria +234
    const phone = '2348128197651';
    const encoded = encodeURIComponent(fullText);
    const url = `https://wa.me/${phone}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Community & Accuracy
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              Send Feedback or Report Details
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            “Something not right? Class Ease is built to make student life easier. If you notice an incorrect class detail, missing information, or have an idea that would make the app better, tell us. We’re listening.”
          </p>

          {/* Category selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Report Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'incorrect_info', label: 'Incorrect Info', icon: ShieldAlert },
                { id: 'feature', label: 'Suggest Feature', icon: Sparkles },
                { id: 'bug', label: 'Report Problem', icon: AlertCircle },
                { id: 'other', label: 'Something Else', icon: MessageSquareText },
              ].map((c) => {
                const isSelected = category === c.id;
                const Icon = c.icon;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id as any)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-950 dark:text-white font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Context fields if reporting incorrect timetable info */}
          {category === 'incorrect_info' && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Course Code
                </label>
                <input
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="e.g. BIO 107"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Venue
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. JAO 3 or BIO LAB"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>
          )}

          {/* Freeform Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tell us what happened *
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the discrepancy, new venue, or suggestion..."
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="text-[11px] text-slate-400 dark:text-slate-500">
            Messages are sent directly via WhatsApp to the Class Ease maintainer team.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900"
          >
            Cancel
          </button>

          <button
            onClick={handleSendWhatsApp}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send via WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
