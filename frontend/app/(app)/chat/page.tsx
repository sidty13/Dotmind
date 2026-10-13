'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRepo } from '@/context/repo-context';
import { ChatMessage, Citation } from '@/lib/types';
import { SourcesDrawer } from '@/components/chat/sources-drawer';
import { SlashMenu } from '@/components/chat/slash-menu';
import { CodeBlock } from '@/components/ui/code-block';
import { Chip } from '@/components/ui/chip';
import { DotLoader } from '@/components/ui/dot-loader';
import { Button } from '@/components/ui/button';
import {
  Send,
  Square,
  Copy,
  RotateCw,
  ThumbsUp,
  ThumbsDown,
  Layers,
  ChevronDown,
  FileCode,
  FolderGit2,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export default function ChatPage() {
  const { getToken, isSignedIn } = useAuth();
  const { activeRepo } = useRepo();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [scope, setScope] = useState<'Whole repo'>('Whole repo');
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [highlightedCitationId, setHighlightedCitationId] = useState<number | null>(null);

  // Streaming & Menus
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [citationsList, setCitationsList] = useState<Citation[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Handle Input change & trigger slash or file mentions
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputPrompt(val);

    if (val.startsWith('/')) {
      setShowSlashMenu(true);
      setShowFileMenu(false);
    } else if (val.endsWith('@')) {
      setShowFileMenu(true);
      setShowSlashMenu(false);
    } else {
      setShowSlashMenu(false);
      setShowFileMenu(false);
    }
  };

  // Real Streaming Assistant Response via SSE
  const handleSendMessage = async (textToSend?: string) => {
    const q = (textToSend || inputPrompt).trim();
    if (!q || isStreaming) return;

    if (!activeRepo) {
      alert('Please connect or select a repository from the top bar before chatting.');
      return;
    }

    setShowSlashMenu(false);
    setShowFileMenu(false);

    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsStreaming(true);

    // 2. Prepare Assistant Streaming Message placeholder
    const assistantMsgId = `a-${Date.now()}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: [],
      isStreaming: true,
    };

    setMessages((prev) => [...prev, initialAssistantMsg]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (isSignedIn) {
        const token = await getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/chat/stream`, {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          question: q,
          repo_id: activeRepo.id,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Server returned HTTP ${res.status}`);
      }

      if (!res.body) {
        throw new Error('ReadableStream not supported by server response.');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let currentCitations: Citation[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const rawData = line.slice(6).trim();
          if (!rawData) continue;

          try {
            const data = JSON.parse(rawData);

            if (data.type === 'sources' && Array.isArray(data.sources)) {
              currentCitations = data.sources.map((s: any, idx: number) => ({
                id: idx + 1,
                filePath: s.path,
                startLine: s.start_line,
                endLine: s.end_line,
                similarity: s.score,
                preview: s.preview,
                githubUrl: s.url,
              }));
              setCitationsList(currentCitations);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId ? { ...m, citations: currentCitations } : m
                )
              );
            } else if (data.type === 'token') {
              assistantContent += data.token;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId ? { ...m, content: assistantContent } : m
                )
              );
            } else if (data.type === 'done') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, isStreaming: false, citations: currentCitations }
                    : m
                )
              );
              setIsStreaming(false);
            }
          } catch (jsonErr) {
            // Ignore partial SSE chunk parses
          }
        }
      }

      // Finish streaming cleanly
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, isStreaming: false, citations: currentCitations }
            : m
        )
      );
      setIsStreaming(false);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setIsStreaming(false);
        return;
      }

      const errorMsg = `Unable to connect to DotMind backend: ${err.message || err}.\n\nEnsure your backend is running at ${API_BASE_URL} and your OPENAI_API_KEY is configured.`;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: errorMsg, isStreaming: false }
            : m
        )
      );
      setIsStreaming(false);
    }
  };

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Citation Click -> scroll to card in drawer
  const handleCitationClick = (citationId: number) => {
    setIsDrawerOpen(true);
    setHighlightedCitationId(citationId);
    setTimeout(() => {
      const el = document.getElementById(`source-${citationId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Render assistant message content with formatted citations & code
  const renderMessageContent = (content: string, isStreamingMsg?: boolean) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, pIdx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).split('\n');
        const language = lines[0].trim() || 'python';
        const codeText = lines.slice(1).join('\n');

        return (
          <div key={pIdx} className="my-3">
            <CodeBlock code={codeText} language={language} />
          </div>
        );
      }

      // Highlight citation pills [1], [2]
      const textWithPills = part.split(/(\[\d+\])/g);

      return (
        <span key={pIdx}>
          {textWithPills.map((segment, sIdx) => {
            const match = segment.match(/\[(\d+)\]/);
            if (match) {
              const citationId = parseInt(match[1], 10);
              return (
                <button
                  key={sIdx}
                  onClick={() => handleCitationClick(citationId)}
                  className="inline-flex items-center justify-center px-1.5 py-0.2 mx-0.5 text-[11px] font-mono font-bold rounded-[3px] border border-border bg-raised text-signal-red hover:border-signal-red hover:bg-signal-red/10 transition-colors cursor-pointer select-none align-baseline"
                  title={`View citation source [${citationId}]`}
                >
                  [{citationId}]
                </button>
              );
            }
            return segment;
          })}
        </span>
      );
    });
  };

  return (
    <div className="flex h-[calc(100vh-100px)] border border-border rounded-[6px] overflow-hidden bg-bg animate-fadeIn">
      {/* Center: Terminal Chat */}
      <div className="flex-1 flex flex-col min-w-0 bg-bg">
        {/* Top Control Bar: Repo selector + Scope dropdown */}
        <div className="h-12 border-b border-border bg-panel px-4 flex items-center justify-between text-xs font-mono select-none">
          <div className="flex items-center gap-3">
            {/* Repo selector */}
            <div className="flex items-center gap-1.5 text-text font-bold">
              <FolderGit2 size={13} className="text-signal-red" />
              <span>{activeRepo ? `${activeRepo.owner}/${activeRepo.name}` : 'No repo selected'}</span>
            </div>

            <span className="text-dim/40">·</span>

            {/* Scope dropdown */}
            <div className="flex items-center gap-1.5 text-dim">
              <span>SCOPE:</span>
              <span className="text-text font-semibold">Whole repository</span>
            </div>
          </div>

          {/* Toggle Sources Drawer */}
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] border transition-colors ${
              isDrawerOpen
                ? 'border-signal-red bg-signal-red/10 text-signal-red font-bold'
                : 'border-border text-dim hover:text-text'
            }`}
          >
            <Layers size={12} />
            <span>SOURCES ({citationsList.length})</span>
          </button>
        </div>

        {/* Message Stream Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 font-mono text-[15px]">
          {messages.length === 0 ? (
            /* Empty state suggestions */
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-dim space-y-4">
              <span className="font-display text-4xl font-bold text-text/80">DotMind</span>
              <p className="max-w-md text-sm font-ui text-dim">
                {activeRepo
                  ? `Query ${activeRepo.owner}/${activeRepo.name} with exact line-level references.`
                  : 'Please connect or select a repository from the top bar to start chatting.'}
              </p>
              {activeRepo && (
                <div className="flex items-center gap-2 flex-wrap justify-center pt-2">
                  <Chip
                    label="Explain the architecture"
                    onClick={() => handleSendMessage('Explain the architecture')}
                  />
                  <Chip
                    label="Find the entry point"
                    onClick={() => handleSendMessage('Find the entry point')}
                  />
                  <Chip
                    label="How does routing work?"
                    onClick={() => handleSendMessage('How does routing work?')}
                  />
                </div>
              )}
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={msg.id}
                  className={`group relative flex items-start gap-3 p-2 -mx-2 rounded-[4px] transition-colors ${
                    isUser ? 'bg-panel/30' : 'bg-transparent'
                  }`}
                >
                  {/* Terminal Avatar Indicator */}
                  <span
                    className={`shrink-0 font-bold select-none text-[16px] leading-snug ${
                      isUser ? 'text-signal-red' : 'text-white'
                    }`}
                  >
                    {isUser ? '> ' : '◉'}
                  </span>

                  {/* Message Body */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-dim select-none">
                      <span className="font-bold tracking-label uppercase">
                        {isUser ? 'DEVELOPER' : 'DOTMIND AI'}
                      </span>
                      <span className="text-dim/50">{msg.timestamp}</span>
                    </div>

                    <div className="text-text leading-relaxed whitespace-pre-wrap break-words">
                      {msg.content ? (
                        renderMessageContent(msg.content, msg.isStreaming)
                      ) : msg.isStreaming ? (
                        <div className="py-1">
                          <DotLoader />
                        </div>
                      ) : null}

                      {/* Blinking Block Cursor while Streaming */}
                      {msg.isStreaming && msg.content && (
                        <span className="inline-block w-2 h-4 bg-signal-red animate-blink ml-1 align-middle" />
                      )}
                    </div>

                    {/* Citations Pills Row */}
                    {!isUser && msg.citations && msg.citations.length > 0 && !msg.isStreaming && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-2 select-none">
                        <span className="text-[11px] font-mono text-dim uppercase">Sources:</span>
                        {msg.citations.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => handleCitationClick(c.id)}
                            className="text-[11px] font-mono px-2 py-0.5 rounded-[3px] border border-border bg-panel text-dim hover:border-signal-red hover:text-text transition-colors"
                          >
                            [{c.id}] {c.filePath.split('/').pop()}#L{c.startLine}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Action Bar on hover */}
                    {!isUser && !msg.isStreaming && msg.content && (
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 pt-2 transition-opacity select-none">
                        <button
                          onClick={() => navigator.clipboard.writeText(msg.content)}
                          className="p-1 rounded-[3px] border border-border bg-raised text-dim hover:text-text"
                          title="Copy message"
                        >
                          <Copy size={12} />
                        </button>
                        <button
                          onClick={() => handleSendMessage(messages[messages.length - 2]?.content)}
                          className="p-1 rounded-[3px] border border-border bg-raised text-dim hover:text-text"
                          title="Regenerate"
                        >
                          <RotateCw size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area */}
        <div className="p-4 border-t border-border bg-panel select-none relative">
          {/* Slash Command Menu */}
          {showSlashMenu && (
            <SlashMenu
              onSelect={(cmd) => {
                if (cmd === '/clear') {
                  setMessages([]);
                  setInputPrompt('');
                  setShowSlashMenu(false);
                } else {
                  setInputPrompt(`${cmd} `);
                  setShowSlashMenu(false);
                }
              }}
              onClose={() => setShowSlashMenu(false)}
            />
          )}

          <div className="flex items-end gap-2 bg-raised border border-border focus-within:border-signal-red rounded-[6px] p-2 transition-colors">
            <span className="text-signal-red font-bold font-mono pl-1 pb-1 select-none text-[15px]">
              {'>'}
            </span>

            <textarea
              value={inputPrompt}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isStreaming || !activeRepo}
              rows={1}
              placeholder={
                activeRepo
                  ? `Ask ${activeRepo.owner}/${activeRepo.name} (type / for commands, @ for files)...`
                  : 'Please connect or select a repository from the top bar...'
              }
              className="flex-1 bg-transparent text-text placeholder:text-dim/60 focus:outline-none resize-none font-mono text-[14px] max-h-32 leading-relaxed"
            />

            {isStreaming ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleStopGenerating}
                className="gap-1.5 h-8 text-signal-red border-signal-red/50 hover:bg-signal-red/10"
              >
                <Square size={12} className="fill-signal-red" />
                <span className="text-[11px]">Stop</span>
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSendMessage()}
                disabled={!inputPrompt.trim() || !activeRepo}
                className="h-8 w-8 p-0 shrink-0"
              >
                <Send size={13} />
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-dim/60 pt-2 px-1">
            <span>DotMind SSE Stream · GPT-4o-mini · Line Citations</span>
            <span>↵ Send · ⇧↵ New line</span>
          </div>
        </div>
      </div>

      {/* Right: Sources Drawer (360px) */}
      <SourcesDrawer
        isOpen={isDrawerOpen}
        onToggle={() => setIsDrawerOpen(!isDrawerOpen)}
        citations={citationsList}
        highlightedCitationId={highlightedCitationId}
      />
    </div>
  );
}
