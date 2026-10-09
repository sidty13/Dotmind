import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DotMind (0) — Talk to your codebase',
  description: 'Minimal, dot-matrix AI assistant for GitHub codebases with line-accurate citations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased font-ui bg-bg text-text">
        {children}
      </body>
    </html>
  );
}
