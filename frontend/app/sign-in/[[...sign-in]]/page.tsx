import React from 'react';
import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';
import Image from 'next/image';

export default function SignInPage() {
  return (
    <div className="min-h-screen dotted-grid flex flex-col items-center justify-center p-4 bg-bg text-text">
      {/* Wordmark Header */}
      <Link href="/overview" className="flex items-center gap-2 mb-6">
        <Image
          src="/DOTMIND.png"
          alt="DotMind"
          width={28}
          height={28}
          priority
          unoptimized
          className="h-7 w-7 object-contain drop-shadow-[0_0_6px_rgba(215,25,33,0.6)]"
        />
        <span className="font-display text-xl font-bold tracking-tight text-text">
          DotMind
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
        DOTMIND // SECURE AUTHENTICATION
      </p>
    </div>
  );
}
