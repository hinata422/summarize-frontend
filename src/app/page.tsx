"use client";

import { useState, useMemo, Fragment } from 'react';
import { Transition } from '@headlessui/react';

// Icons (no changes needed, but we can style them with classes)
const MagicWandIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 3.5a1.5 1.5 0 011.5 1.5v1a1.5 1.5 0 01-3 0v-1A1.5 1.5 0 0110 3.5z" />
    <path d="M10 8.5a1.5 1.5 0 011.5 1.5v1a1.5 1.5 0 01-3 0v-1A1.5 1.5 0 0110 8.5z" />
    <path d="M10 13.5a1.5 1.5 0 011.5 1.5v1a1.5 1.5 0 01-3 0v-1a1.5 1.5 0 0110 13.5z" />
  </svg>
);

const ClearIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const LoadingSpinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export default function Home() {
  const [text, setText] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const characterCount = useMemo(() => text.length, [text]);

  const handleSummarize = async () => {
    if (!text.trim()) {
      setError('要約するテキストを入力してください。');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSummary('');
    try {
      const response = await fetch('http://127.0.0.1:8000/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `エラーが発生しました: ${response.statusText}`);
      }
      const data = await response.json();
      setSummary(data.summary);
    } catch (e: any) {
      setError(e.message || '要約の取得中に不明なエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setSummary('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl mx-auto">

        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            AI Memo Summarizer
          </h1>
          <p className="text-subtle-foreground mt-2">
            テキストを貼り付けて、瞬時に要約を生成します。
          </p>
        </header>

        <main className="bg-surface border border-border rounded-lg shadow-lg p-6 space-y-6">
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="ここに要約したい文章を貼り付けてください..."
              className="w-full h-[270px] p-4 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 resize-none placeholder-subtle-foreground"
              disabled={isLoading}
              maxLength={5000}
            />
            <div className="absolute bottom-3 right-3 text-xs text-subtle-foreground">
              {characterCount} / 5000
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={handleClear}
              disabled={isLoading}
              className="flex items-center justify-center bg-transparent border border-border text-foreground font-semibold py-2 px-3 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-border disabled:opacity-50 transition-colors duration-200"
            >
              <ClearIcon className="h-5 w-5 mr-2" />
              Clear
            </button>
            <button
              onClick={handleSummarize}
              disabled={isLoading || !text.trim()}
              className="flex items-center justify-center bg-primary text-primary-foreground font-semibold py-2 px-3 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200"
            >
              {isLoading ? (
                <><LoadingSpinner /> <span className="ml-2">Processing...</span></>
              ) : (
                <><MagicWandIcon className="h-5 w-5 mr-2" /> 'Summarize'</>
              )}
            </button>
          </div>
        </main>

        <Transition
          show={!!error}
          as={Fragment}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 text-red-300 rounded-lg">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        </Transition>

        <Transition
          show={!!summary}
          as={Fragment}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="mt-6 bg-surface border border-border rounded-lg shadow-md">
            <div className="p-5">
              <h2 className="text-xl font-semibold text-foreground mb-3">Summary</h2>
              <p className="text-foreground/80 whitespace-pre-wrap leading-relaxed">{summary}</p>
            </div>
          </div>
        </Transition>
      </div>
       <footer className="text-center mt-12 text-subtle-foreground text-sm">
        <p>Powered by Gemini & FastAPI & Next.js</p>
      </footer>
    </div>
  );
}