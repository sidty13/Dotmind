import React from 'react';
import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';
import Image from 'next/image';

export default function SignUpPage() {
  return (
    <div className="min-h-screen dotted-grid flex flex-col items-center justify-center p-4 bg-bg text-text">
      {/* Wordmark Header */}
     <Link href="/overview" className="hidden sm:flex items-center gap-2">
  <Image
    src="/DOTMIND.png"
    alt="DotMind"
    width={28}
    height={28}
    priority
    className="h-7 w-7 object-contain"
  />
  <span className="font-display text-xl font-bold tracking-tight text-text">
    DotMind
  </span>
 
</Link>

      {/* Clerk Sign Up Component */}
      <div className="w-full max-w-md flex justify-center">
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/overview"
        />
      </div>

      <p className="mt-8 font-mono text-[11px] text-dim/60 uppercase tracking-label">
        DOTMIND // NEW DEVELOPER REGISTRATION
      </p>
    </div>
  );
}
