'use client';

import { MatchResult } from '@/lib/workers-ai';

interface MatchResultsProps {
  result: MatchResult;
}

function ScoreCircle({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return { stroke: '#10b981', bg: '#10b981', text: 'Excellent Match!' };
    if (score >= 60) return { stroke: '#22d3ee', bg: '#22d3ee', text: 'Good Match' };
    if (score >= 40) return { stroke: '#f59e0b', bg: '#f59e0b', text: 'Moderate Match' };
    return { stroke: '#ef4444', bg: '#ef4444', text: 'Low Match' };
  };

  const colors = getScoreColor(score);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-slate-700"
          />
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke={colors.stroke}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 8px ${colors.bg}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-white">{score}%</span>
        </div>
      </div>
      <span 
        className="text-sm font-medium px-3 py-1 rounded-full"
        style={{ backgroundColor: `${colors.bg}20`, color: colors.bg }}
      >
        {colors.text}
      </span>
    </div>
  );
}

function Section({ 
  title, 
  items, 
  icon, 
  color 
}: { 
  title: string; 
  items: string[]; 
  icon: 'check' | 'warning' | 'lightbulb';
  color: 'emerald' | 'amber' | 'cyan';
}) {
  const colorClasses = {
    emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    amber: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    cyan: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  };

  const icons = {
    check: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    lightbulb: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  };

  if (items.length === 0) return null;

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color]}`}>
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        {icons[icon]}
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-slate-300">
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-${color}-400`} />
            <span className="text-sm">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MatchResults({ result }: MatchResultsProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Score and Summary */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
        <ScoreCircle score={result.score} />
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl font-semibold text-white mb-2">Match Analysis</h2>
          <p className="text-slate-300">{result.summary}</p>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Section 
          title="Strengths" 
          items={result.strengths} 
          icon="check" 
          color="emerald" 
        />
        <Section 
          title="Gaps" 
          items={result.gaps} 
          icon="warning" 
          color="amber" 
        />
        <Section 
          title="Suggestions" 
          items={result.suggestions} 
          icon="lightbulb" 
          color="cyan" 
        />
      </div>
    </div>
  );
}
