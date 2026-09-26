import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  showTagline?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showWordmark = true,
  showTagline = false,
  className = '',
}) => {
  const iconSize = size === 'sm' ? 26 : size === 'lg' ? 44 : 32;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Abstract Geometric Mark: Rhythmic convergence into a clear forward vector */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform active:scale-95"
        aria-label="Class Ease brand mark"
      >
        <rect width="48" height="48" rx="12" fill="#312e81" />
        <path
          d="M 9 14 C 18 14, 22 20, 28 24 C 31 26, 33 26, 36 26"
          stroke="#818cf8"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M 9 24 H 36"
          stroke="#a5b4fc"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M 9 34 C 18 34, 22 28, 28 24 C 31 22, 33 24, 36 24"
          stroke="#c7d2fe"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* Forward Clarity Vector */}
        <path
          d="M 32 17 L 41 24 L 32 31 L 35 24 Z"
          fill="#38bdf8"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>

      {showWordmark && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className="font-bold tracking-tight text-slate-900 dark:text-white text-base md:text-lg">
              Class Ease
            </span>
          </div>
          {showTagline && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal tracking-normal mt-0.5">
              Your academic day, simplified.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
