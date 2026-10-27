'use client';

import React, { useState, useEffect } from 'react';
import { Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import {
  Sun,
  Moon,
  Type,
} from 'lucide-react';

export default function SettingsPage() {
  // Retrieval Settings
  const [topK, setTopK] = useState(5);
  const [streamingEnabled, setStreamingEnabled] = useState(true);

  // Appearance state
  const [isLightMode, setIsLightMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isCleanFont, setIsCleanFont] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFont = localStorage.getItem('dotmind-font-mode');
      if (savedFont === 'clean') {
        setIsCleanFont(true);
      }
    }
  }, []);

  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
    document.documentElement.classList.toggle('light');
  };

  const toggleFont = () => {
    const nextState = !isCleanFont;
    setIsCleanFont(nextState);
    if (nextState) {
      document.documentElement.classList.add('clean-font');
      localStorage.setItem('dotmind-font-mode', 'clean');
    } else {
      document.documentElement.classList.remove('clean-font');
      localStorage.setItem('dotmind-font-mode', 'mono');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto pb-12 font-mono">
      {/* Header */}
      <div>
        <div className="text-[12px] uppercase tracking-label text-signal-red mb-1">
          // CONFIGURATION & DIAGNOSTICS
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight text-text">
          Settings
        </h1>
      </div>

      {/* Vector Retrieval Section */}
      <div className="space-y-6 animate-fadeIn">
        <Panel label="VECTOR RETRIEVAL HYPERPARAMETERS">
          <div className="space-y-6 text-[13px]">
            {/* Top-K Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-text font-bold uppercase tracking-label">
                  TOP-K CHUNKS (SEARCH DEPTH):
                </span>
                <span className="text-signal-red font-bold text-base">{topK}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={topK}
                onChange={(e) => setTopK(parseInt(e.target.value))}
                className="w-full accent-signal-red cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-dim">
                <span>1 (Fastest, narrow)</span>
                <span>5 (Balanced recommended)</span>
                <span>10 (Broad context)</span>
              </div>
            </div>

            {/* Readonly Architecture Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="p-3 bg-raised border border-border rounded-[4px]">
                <span className="text-dim text-[11px] block uppercase">CHUNK SIZE (CHARS)</span>
                <span className="text-text font-bold text-lg">1,200</span>
                <span className="text-[10px] text-dim block mt-0.5">READ-ONLY CONFIG</span>
              </div>

              <div className="p-3 bg-raised border border-border rounded-[4px]">
                <span className="text-dim text-[11px] block uppercase">OVERLAP (CHARS)</span>
                <span className="text-text font-bold text-lg">150</span>
                <span className="text-[10px] text-dim block mt-0.5">BOUNDARY PRESERVATION</span>
              </div>

              <div className="p-3 bg-raised border border-border rounded-[4px]">
                <span className="text-dim text-[11px] block uppercase">EMBEDDING MODEL</span>
                <span className="text-signal-red font-bold text-sm truncate block">
                  text-embedding-3-small
                </span>
                <span className="text-[10px] text-dim block mt-0.5">1536-D DENSE VECTORS</span>
              </div>
            </div>

            {/* Streaming Toggle */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div>
                <span className="text-text font-bold block">SERVER-SENT EVENTS (SSE) STREAMING:</span>
                <span className="text-dim text-[12px]">Stream LLM tokens in real-time token-by-token</span>
              </div>
              <button
                onClick={() => setStreamingEnabled(!streamingEnabled)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  streamingEnabled ? 'bg-signal-red justify-end' : 'bg-border justify-start'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </div>
        </Panel>
      </div>

      {/* Appearance & Accessibility Section */}
      <Panel label="APPEARANCE & ACCESSIBILITY">
        <div className="space-y-4 text-[13px]">
          {/* Light / Dark Mode Toggle */}
          <div className="flex items-center justify-between py-2 border-b border-border">
            <div>
              <span className="text-text font-bold block">COLOR PALETTE:</span>
              <span className="text-dim text-[12px]">
                {isLightMode ? 'Light (#F5F5F5 with Signal Red)' : 'Dark (#000000 OLED with Signal Red)'}
              </span>
            </div>
            <Button variant="secondary" size="sm" onClick={toggleTheme} className="gap-2">
              {isLightMode ? <Moon size={13} /> : <Sun size={13} />}
              <span>{isLightMode ? 'Switch to Dark' : 'Switch to Light'}</span>
            </Button>
          </div>

          {/* Typography Mode Toggle */}
          <div className="flex items-center justify-between py-2 border-b border-border">
            <div>
              <span className="text-text font-bold block">TYPOGRAPHY MODE:</span>
              <span className="text-dim text-[12px]">
                {isCleanFont
                  ? 'Clean Sans-Serif (Inter font family)'
                  : 'Dot-matrix & Monospace (JetBrains Mono & Doto)'}
              </span>
            </div>
            <Button variant="secondary" size="sm" onClick={toggleFont} className="gap-2">
              <Type size={13} />
              <span>{isCleanFont ? 'Switch to Monospace' : 'Switch to Sans-Serif'}</span>
            </Button>
          </div>

          {/* Reduce Motion Toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-text font-bold block">REDUCE MOTION:</span>
              <span className="text-dim text-[12px]">Disable pulse indicators and matrix animation cycles</span>
            </div>
            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                reducedMotion ? 'bg-signal-red justify-end' : 'bg-border justify-start'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
