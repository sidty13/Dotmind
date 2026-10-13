import React from 'react';
import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen dotted-grid flex flex-col items-center justify-center p-4 bg-bg text-text">
      {/* Wordmark Header */}
      <Link href="/" className="mb-8 flex items-center gap-2.5 group">
        <div className="w-6 h-6 rounded-full border border-signal-red flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-signal-red group-hover:scale-125 transition-transform" />
        </div>
        <span className="font-display text-2xl font-black tracking-wider text-text">
          DotMind
        </span>
        <span className="text-[10px] font-mono uppercase tracking-label text-dim border border-border px-1.5 py-0.5 rounded-[2px] ml-1">
          (0)
        </span>
      </Link>

      {/* Clerk Sign In Component */}
      <div className="w-full max-w-md flex justify-center">
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/overview"
        />
      </div>

      <p className="mt-8 font-mono text-[11px] text-dim/60 uppercase tracking-label">
        DOTMIND // SECURE RS256 AUTHENTICATION
      </p>
    </div>
  );
}
