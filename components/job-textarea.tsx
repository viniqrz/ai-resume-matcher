'use client';

interface JobTextareaProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function JobTextarea({ value, onChange, disabled }: JobTextareaProps) {
  const charCount = value.length;
  const minChars = 200;
  const isValid = charCount >= minChars;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">
        Job Description
      </label>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Paste the job description here...

Include requirements, responsibilities, and qualifications for the best analysis."
          className={`
            w-full h-64 px-4 py-3 rounded-xl resize-none
            bg-slate-800/50 border-2 transition-all duration-300
            text-slate-100 placeholder:text-slate-500
            focus:outline-none focus:ring-2 focus:ring-cyan-400/50
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isValid 
              ? 'border-slate-600 focus:border-cyan-400' 
              : charCount > 0 
                ? 'border-amber-500/50' 
                : 'border-slate-600'
            }
          `}
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <span className={`
            text-xs px-2 py-1 rounded-full transition-colors
            ${isValid 
              ? 'bg-emerald-500/20 text-emerald-400' 
              : 'bg-slate-700 text-slate-400'
            }
          `}>
            {charCount} / {minChars}+
          </span>
        </div>
      </div>
      {charCount > 0 && !isValid && (
        <p className="text-sm text-amber-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Please add at least {minChars - charCount} more characters
        </p>
      )}
    </div>
  );
}
