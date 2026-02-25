import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

import { LanguageProvider } from '../i18n/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

export const metadata: Metadata = {
  title: 'Scrum Cluedo',
  description: 'Un serious game per svelare i misteri degli antipattern Scrum',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col antialiased relative overflow-x-hidden`}>
        <LanguageProvider>
          <LanguageSwitcher />
          {/* Background ambient accents */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
        
        <main className="flex-1 flex flex-col relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        </LanguageProvider>
      </body>
    </html>
  );
}
