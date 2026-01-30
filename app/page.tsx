'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadDropzone } from '@/components/upload-dropzone';
import { JobTextarea } from '@/components/job-textarea';
import { LoadingSpinner } from '@/components/loading-spinner';
import { MatchResults } from '@/components/match-results';
import { MatchResult } from '@/lib/ai-service';

export default function Home() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MatchResult | null>(null);

  const isDescriptionValid = jobDescription.trim().length >= 200;
  const isResumeAttached = !!resumeFile;
  const canSubmit = !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSubmit) return;

    // Trigger explicit validation
    if (!isResumeAttached) {
      setError('Please upload your resume PDF first.');
      return;
    }

    if (!isDescriptionValid) {
      setError(`Job description must be at least 200 characters. Currently ${jobDescription.length}/200.`);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      if (resumeFile) formData.append('resume', resumeFile);
      formData.append('jobDescription', jobDescription);

      const response = await fetch('/api/match', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze resume');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResumeFile(null);
    setJobDescription('');
    setResult(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-400/10 border border-cyan-400/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-sm text-cyan-400 font-medium">AI-Powered Analysis</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Resume</span> Matcher
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Upload your resume and paste a job description to get instant AI-powered matching analysis with actionable feedback.
          </p>
        </header>

        {/* Main Content */}
        {result ? (
          <div className="space-y-6">
            <MatchResults result={result} />
            <div className="flex justify-center">
              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-xl font-medium text-white bg-slate-700 hover:bg-slate-600 transition-colors cursor-pointer"
              >
                ← Try Another Resume
              </button>
            </div>
          </div>
        ) : isLoading ? (
          <LoadingSpinner />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Resume Upload */}
              <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-sm">
                <UploadDropzone
                  onFileSelect={setResumeFile}
                  selectedFile={resumeFile}
                  disabled={isLoading}
                />
              </div>

              {/* Job Description */}
              <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-sm">
                <JobTextarea
                  value={jobDescription}
                  onChange={setJobDescription}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium">Error</p>
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={!canSubmit}
                className={`
                  relative px-8 py-4 rounded-xl font-semibold text-lg
                  transition-all duration-300 overflow-hidden
                  ${canSubmit 
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:shadow-lg hover:shadow-cyan-500/25 hover:scale-105 cursor-pointer' 
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }
                `}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Analyze Match
                </span>
              </button>
            </div>
          </form>
        )}

        {/* Features */}
        <section className="mt-16 grid sm:grid-cols-3 gap-6">
          <Feature
            icon="🔒"
            title="Privacy First"
            description="Your resume is never stored. All processing happens in real-time."
          />
          <Feature
            icon="⚡"
            title="Instant Analysis"
            description="Get detailed results in seconds with AI-powered matching."
          />
          <Feature
            icon="💡"
            title="Actionable Insights"
            description="Specific suggestions to improve your application."
          />
        </section>
      </div>
    </main>
  );
}

function Feature({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="p-5 rounded-xl bg-slate-800/30 border border-slate-700/50 text-center">
      <span className="text-2xl mb-3 block">{icon}</span>
      <h3 className="font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  );
}
