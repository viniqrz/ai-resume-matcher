'use client';

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fadeIn">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-16 h-16 rounded-full border-4 border-slate-700" />
        
        {/* Spinning ring */}
        <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin" />
        
        {/* Inner glow */}
        <div className="absolute inset-2 w-12 h-12 rounded-full bg-cyan-400/10 animate-pulse" />
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-lg font-medium text-white">Analyzing your resume...</p>
        <p className="text-sm text-slate-400 mt-1">This may take a few seconds</p>
      </div>
      
      {/* Progress steps */}
      <div className="mt-6 flex items-center gap-3">
        <Step label="Parsing PDF" active />
        <div className="w-8 h-px bg-slate-600" />
        <Step label="AI Analysis" />
        <div className="w-8 h-px bg-slate-600" />
        <Step label="Results" />
      </div>
    </div>
  );
}

function Step({ label, active }: { label: string; active?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`
        w-2 h-2 rounded-full transition-colors
        ${active ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}
      `} />
      <span className={`
        text-xs transition-colors
        ${active ? 'text-cyan-400' : 'text-slate-500'}
      `}>
        {label}
      </span>
    </div>
  );
}
