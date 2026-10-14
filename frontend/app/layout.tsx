import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
// @ts-ignore: side-effect CSS import without type declarations
import './globals.css';

export const metadata: Metadata = {
  title: 'DotMind',
  description: 'Minimal, dot-matrix AI assistant for GitHub codebases with line-accurate citations.',
   icons: {
    icon: '/DOTMIND.png',
    shortcut: '/DOTMIND.png',
    apple: '/DOTMIND.png',
  },  
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#D71921',
          colorBackground: '#0A0A0A',
          colorText: '#EDEDED',
          colorTextSecondary: '#8A8A8A',
          colorTextOnPrimaryBackground: '#FFFFFF',
          colorInputBackground: '#111111',
          colorInputText: '#EDEDED',
          colorNeutral: '#EDEDED',
        },
        elements: {
          card: 'border border-border bg-panel shadow-2xl rounded-[8px]',
          headerTitle: 'font-display uppercase tracking-tight text-text',
          headerSubtitle: 'text-dim text-xs font-mono',
          socialButtonsBlockButton: 'border border-border bg-raised hover:bg-raised/80 hover:border-dim transition-colors rounded-[4px] text-text font-mono text-xs',
          socialButtonsBlockButtonText: 'text-text font-mono text-xs font-semibold !text-[#EDEDED]',
          socialButtonsProviderIcon: 'w-4 h-4 mr-2',
          dividerLine: 'bg-border',
          dividerText: 'text-dim text-[11px] font-mono uppercase',
          formFieldLabel: 'text-dim text-[12px] font-mono uppercase tracking-label',
          formFieldInput: 'bg-raised border border-border text-text focus:border-signal-red rounded-[4px] font-mono text-[13px]',
          formButtonPrimary: 'bg-signal-red hover:bg-signal-red/90 text-white font-mono uppercase tracking-label text-xs shadow-none',
          footerActionText: 'text-dim font-mono text-xs',
          footerActionLink: 'text-signal-red hover:text-signal-red/80 font-mono text-xs',
        },
      }}
    >
      <html lang="en" className="dark">
        <body className="antialiased font-ui bg-bg text-text">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
