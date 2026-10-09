'use client';

import React, { useState, useEffect } from 'react';
import { Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import { StatusDot } from '@/components/ui/status-dot';
import {
  Sliders,
  Activity,
  RotateCw,
  Sun,
  Moon,
  AlertCircle,
  Eye,
  Check,
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'retrieval' | 'health'>('retrieval');

  // Retrieval Settings
  const [topK, setTopK] = useState(5);
  const [streamingEnabled, setStreamingEnabled] = useState(true);

  // System Health state (mock)
  const [isApiOnline, setIsApiOnline] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [uptime, setUptime] = useState('2d 14h 22m');
  const [lastRefreshed, setLastRefreshed] = useState('Just now');

  // Appearance state
  const [isLightMode, setIsLightMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
    document.documentElement.classList.toggle('light');
  };

  const handleManualRefresh = () => {
    setLastRefreshed('Just now');
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

      {/* Offline Alert Banner (simulated toggleable) */}
      {!isApiOnline && (
        <div className="p-3.5 bg-signal-red/10 border border-signal-red rounded-[6px] flex items-center justify-between text-xs text-signal-red">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle size={15} />
            <span>API unreachable, retrying connection in 10s…</span>
          </div>
          <Button variant="danger" size="sm" onClick={() => setIsApiOnline(true)}>
            Reconnect now
          </Button>
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-border text-[13px] select-none">
        <button
          onClick={() => setActiveTab('retrieval')}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold uppercase tracking-label border-b-2 transition-colors ${
            activeTab === 'retrieval'
              ? 'border-signal-red text-signal-red'
              : 'border-transparent text-dim hover:text-text'
          }`}
        >
          <Sliders size={13} />
          <span>1. Retrieval Parameters</span>
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold uppercase tracking-label border-b-2 transition-colors ${
            activeTab === 'health'
              ? 'border-signal-red text-signal-red'
              : 'border-transparent text-dim hover:text-text'
          }`}
        >
          <Activity size={13} />
          <span>2. System Health (GET /health)</span>
        </button>
      </div>

      {/* Tab 1: Retrieval */}
      {activeTab === 'retrieval' && (
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
      )}

      {/* Tab 2: System Health */}
      {activeTab === 'health' && (
        <div className="space-y-6 animate-fadeIn">
          <Panel label="TELEMETRY // GET /health STATUS">
            <div className="space-y-5 text-[13px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                <div>
                  <span className="text-dim text-[11px] block">SERVER INSTANCE:</span>
                  <span className="text-text font-bold">FastAPI ASGI Server @ 127.0.0.1:8001</span>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="secondary" size="sm" onClick={handleManualRefresh} className="gap-1.5">
                    <RotateCw size={12} />
                    <span>Refresh</span>
                  </Button>
                  <button
                    onClick={() => setIsApiOnline(!isApiOnline)}
                    className="text-[11px] text-dim underline"
                  >
                    Simulate {isApiOnline ? 'Offline' : 'Online'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-raised border border-border rounded-[4px]">
                  <span className="text-dim text-[11px] block uppercase">STATUS</span>
                  <div className="mt-1 flex items-center gap-2">
                    <StatusDot status={isApiOnline ? 'READY' : 'ERROR'} />
                    <span className="font-bold text-text">
                      {isApiOnline ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-raised border border-border rounded-[4px]">
                  <span className="text-dim text-[11px] block uppercase">ACTIVE REPO</span>
                  <span className="font-bold text-text block mt-1 truncate">encode/starlette</span>
                </div>

                <div className="p-3 bg-raised border border-border rounded-[4px]">
                  <span className="text-dim text-[11px] block uppercase">LOADED VECTORS</span>
                  <span className="font-bold text-signal-red block mt-1">612</span>
                </div>

                <div className="p-3 bg-raised border border-border rounded-[4px]">
                  <span className="text-dim text-[11px] block uppercase">UPTIME</span>
                  <span className="font-bold text-text block mt-1">{uptime}</span>
                </div>
              </div>

              {/* Auto refresh toggle */}
              <div className="flex items-center justify-between pt-2 text-[12px] text-dim">
                <span>Auto-refresh health status every 10s</span>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    autoRefresh ? 'bg-ready-green justify-end' : 'bg-border justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>
            </div>
          </Panel>
        </div>
      )}

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
