'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { BookOpen, Terminal, LogIn } from 'lucide-react';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export const LandingNav: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-bg/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo + wordmark */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/DOTMIND.png"
            alt="DotMind logo"
            width={40}
            height={40}
            priority
            unoptimized
            className="h-10 w-10 object-contain drop-shadow-[0_0_8px_rgba(215,25,33,0.6)] group-hover:scale-105 transition-transform"
          />
          <span className="font-display text-2xl font-black tracking-wider text-text">
            DotMind
          </span>
        </Link>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-6 font-mono text-[13px] uppercase tracking-label text-dim">
          <a href="#features" className="hover:text-text transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-text transition-colors">How it works</a>
          <Link href="/docs" className="hover:text-text transition-colors flex items-center gap-1.5">
            <BookOpen size={14} />
            <span>Docs</span>
          </Link>
        </nav>

        {/* Auth / Action Buttons */}
        <div className="flex items-center gap-3">
          <SignedOut>
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" className="gap-1.5 font-mono text-xs">
                <LogIn size={13} />
                <span>Sign in</span>
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="primary" size="sm" className="gap-1.5 font-mono text-xs">
                <span>Get started</span>
              </Button>
            </Link>
          </SignedOut>

          <SignedIn>
            <Link href="/overview">
              <Button variant="primary" size="sm" className="gap-2 font-mono text-xs">
                <Terminal size={14} />
                <span>Launch app</span>
              </Button>
            </Link>
            <div className="pl-1">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox:
                      'w-8 h-8 rounded-[4px] border border-border hover:border-signal-red transition-colors',
                  },
                }}
              />
            </div>
          </SignedIn>
        </div>
      </div>
    </header>
  );
};