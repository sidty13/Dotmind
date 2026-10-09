'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MOCK_CHAT_MESSAGES, MOCK_CITATIONS, MOCK_REPOSITORIES, MOCK_FILE_TREE } from '@/lib/mock-data';
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

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_CHAT_MESSAGES);
  const [inputPrompt, setInputPrompt] = useState('');
  const [activeRepo, setActiveRepo] = useState(MOCK_REPOSITORIES[0]);
  const [scope, setScope] = useState<'Whole repo' | 'starlette/routing.py' | 'starlette/middleware/'>('Whole repo');
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [highlightedCitationId, setHighlightedCitationId] = useState<number | null>(null);

  // Streaming & Menus
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [citationsList, setCitationsList] = useState<Citation[]>(MOCK_CITATIONS);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<boolean>(false);

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

  // Mock Streaming Assistant Response
  const handleSendMessage = (textToSend?: string) => {
    const q = (textToSend || inputPrompt).trim();
    if (!q || isStreaming) return;

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
    abortControllerRef.current = false;

    // 2. Prepare Assistant Streaming Message
    const streamTarget =
      q.toLowerCase().includes('architecture')
        ? `Starlette is structured around three modular core layers [1]:\n\n1. **ASGI Kernel**: Implements the raw asynchronous server gateway interface.\n2. **Routing & Dispatch**: Handles path matching, regular expression extraction, and route mount points [1][2].\n3. **Middleware Pipeline**: Wraps requests in exception, CORS, and authentication handlers [3].\n\n\`\`\`python\n# Architectural core\napp = Starlette(routes=routes, middleware=middleware)\n\`\`\``
        : `Based on **${activeRepo.name}** context, request handling begins in the router table [1].\n\nWhen a client submits an HTTP payload, the corresponding endpoint is resolved via \`Route.matches()\` [2]. If found, execution delegates to your custom handler function [3].`;

    // Temporary streaming message with loader
    const assistantMsgId = `a-${Date.now()}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: MOCK_CITATIONS,
      isStreaming: true,
    };

    setMessages((prev) => [...prev, initialAssistantMsg]);

    // Stream tokens after short loader delay
    setTimeout(() => {
      let idx = 0;
      const interval = setInterval(() => {
        if (abortControllerRef.current) {
          clearInterval(interval);
          setIsStreaming(false);
          return;
        }

        if (idx < streamTarget.length) {
          idx += 3;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, content: streamTarget.slice(0, idx) } : m
            )
          );
        } else {
          clearInterval(interval);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, isStreaming: false } : m
            )
          );
          setIsStreaming(false);
        }
      }, 25);
    }, 600);
  };

  const handleStopGenerating = () => {
    abortControllerRef.current = true;
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
    // Split by code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, pIdx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const lang = lines[0].startsWith('#') ? 'python' : lines[0] || 'python';
        const code = lines.slice(1).join('\n') || lines.join('\n');
        return (
          <CodeBlock
            key={pIdx}
            code={code}
            language={lang}
            filePath="starlette/routing.py"
          />
        );
      }

      // Replace citation brackets [1], [2] with clickable pills
      const textParts = part.split(/(\[\d+\])/g);
      return (
        <span key={pIdx}>
          {textParts.map((t, tIdx) => {
            const match = t.match(/\[(\d+)\]/);
            if (match) {
              const cId = parseInt(match[1]);
              return (
                <button
                  key={tIdx}
                  onClick={() => handleCitationClick(cId)}
                  className="inline-flex items-center px-1.5 py-0.2 mx-1 rounded-[2px] border border-border bg-raised hover:border-signal-red hover:text-signal-red font-mono text-[12px] font-bold text-signal-red transition-colors align-baseline"
                  title={`View cited source [${cId}]`}
                >
                  [{cId}]
                </button>
              );
            }
            return <span key={tIdx}>{t}</span>;
          })}
          {isStreamingMsg && (
            <span className="w-2 h-4 bg-signal-red inline-block animate-blink ml-1 align-middle" />
          )}
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
              <span>{activeRepo.owner}/{activeRepo.name}</span>
            </div>

            <span className="text-dim/40">·</span>

            {/* Scope dropdown */}
            <div className="flex items-center gap-1.5 text-dim">
              <span>SCOPE:</span>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as any)}
                className="bg-raised border border-border rounded-[3px] px-2 py-0.5 text-text focus:outline-none cursor-pointer"
              >
                <option value="Whole repo">Whole repository</option>
                <option value="starlette/routing.py">File: starlette/routing.py</option>
                <option value="starlette/middleware/">Folder: starlette/middleware/</option>
              </select>
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
                Query {activeRepo.owner}/{activeRepo.name} with exact line-level references.
              </p>
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
                  label="Where is auth handled?"
                  onClick={() => handleSendMessage('Where is auth handled?')}
                />
              </div>
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

                    {/* Content */}
                    <div className="text-text/95 leading-relaxed break-words">
                      {msg.isStreaming && !msg.content ? (
                        <div className="flex items-center gap-2 py-1 text-dim text-xs">
                          <DotLoader size="sm" />
                          <span>Searching index & generating answer...</span>
                        </div>
                      ) : (
                        renderMessageContent(msg.content, msg.isStreaming)
                      )}
                    </div>

                    {/* Message Actions on Hover */}
                    {!msg.isStreaming && (
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 pt-2 text-[11px] text-dim transition-opacity select-none">
                        <button
                          onClick={() => navigator.clipboard.writeText(msg.content)}
                          className="hover:text-text flex items-center gap-1"
                        >
                          <Copy size={11} />
                          <span>Copy</span>
                        </button>
                        {!isUser && (
                          <>
                            <button
                              onClick={() => handleSendMessage('Regenerate answer with more details')}
                              className="hover:text-text flex items-center gap-1"
                            >
                              <RotateCw size={11} />
                              <span>Regenerate</span>
                            </button>
                            <button className="hover:text-text">
                              <ThumbsUp size={11} />
                            </button>
                            <button className="hover:text-text">
                              <ThumbsDown size={11} />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area (Bottom Terminal Prompt) */}
        <div className="relative border-t border-border bg-panel p-3">
          {/* Slash Command Autocomplete Menu */}
          {showSlashMenu && (
            <SlashMenu
              onSelect={(cmd) => {
                if (cmd === '/clear') {
                  setMessages([]);
                } else if (cmd === '/health') {
                  handleSendMessage('/health check');
                } else {
                  setInputPrompt(`${cmd} `);
                }
                setShowSlashMenu(false);
              }}
              onClose={() => setShowSlashMenu(false)}
            />
          )}

          {/* @ File mention Autocomplete Menu */}
          {showFileMenu && (
            <div className="absolute bottom-16 left-3 w-72 rounded-[6px] border border-border bg-raised shadow-2xl p-1 z-50 font-mono text-[12px] max-h-48 overflow-y-auto">
              <div className="px-2 py-1 text-[10px] text-dim uppercase">MENTION FILE (@)</div>
              {MOCK_FILE_TREE.filter((f) => !f.isDir).map((f) => (
                <button
                  key={f.path}
                  onClick={() => {
                    setInputPrompt((prev) => prev.slice(0, -1) + `@${f.path} `);
                    setShowFileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 p-1.5 hover:bg-panel text-left text-text truncate rounded-[3px]"
                >
                  <FileCode size={12} className="text-signal-red" />
                  <span className="truncate">{f.path}</span>
                </button>
              ))}
            </div>
          )}

          {/* Prompt Form */}
          <div className="flex items-start gap-2 bg-raised border border-border focus-within:border-signal-red rounded-[6px] p-2 transition-colors">
            <span className="text-signal-red font-bold text-[15px] pt-1 select-none">{'>'}</span>

            <textarea
              rows={2}
              value={inputPrompt}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about the codebase (try / for commands, @ for files)..."
              className="flex-1 bg-transparent text-text placeholder:text-dim/60 focus:outline-none resize-none font-mono text-[14px] leading-relaxed"
            />

            {/* Send / Stop Buttons */}
            {isStreaming ? (
              <Button
                variant="danger"
                size="sm"
                onClick={handleStopGenerating}
                className="gap-1.5 self-end shrink-0"
              >
                <Square size={12} />
                <span>Stop</span>
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                disabled={!inputPrompt.trim()}
                onClick={() => handleSendMessage()}
                className="gap-1.5 self-end shrink-0"
              >
                <Send size={12} />
                <span>Send</span>
              </Button>
            )}
          </div>

          {/* Hint Row Beneath */}
          <div className="flex items-center justify-between text-[11px] font-mono text-dim/70 pt-2 px-1 select-none">
            <span>/ commands · @ files · ↑ history</span>
            <span>⏎ send · Shift+⏎ newline</span>
          </div>
        </div>
      </div>

      {/* Right: Collapsible Sources Drawer (360px) */}
      <SourcesDrawer
        citations={citationsList}
        isOpen={isDrawerOpen}
        onToggle={() => setIsDrawerOpen(!isDrawerOpen)}
        highlightedCitationId={highlightedCitationId}
      />
    </div>
  );
}
