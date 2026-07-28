import type { Metadata } from 'next';
import '@fontsource/inter/index.css';
import '@/styles/globals.css';
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { AssistantBot } from "@/components/ui/AssistantBot";

export const metadata: Metadata = {
  title: 'Prayukti x MMMUT',
  description: 'Virtual Laboratory Platform for Madan Mohan Malaviya University of Technology, Gorakhpur',
  icons: {
    icon: '/favicon.ico',
  },
};

import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
        <ScrollToTop />
        <AssistantBot />
        <Analytics />
      </body>
    </html>
  );
}
