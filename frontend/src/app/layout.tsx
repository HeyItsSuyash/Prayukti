import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import "boxicons/css/boxicons.min.css";
import { AssistantBot } from "@/components/ui/AssistantBot";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Prayukti | Virtual Laboratory Platform | MMMUT Gorakhpur',
  description: 'Prayukti is the premier Virtual Laboratory Platform for Madan Mohan Malaviya University of Technology (MMMUT), Gorakhpur. Engage with cutting-edge engineering simulations and interactive technical experiments.',
  keywords: ['Prayukti', 'Virtual Labs', 'MMMUT Gorakhpur', 'Engineering Simulations', 'Online Labs', 'CSIS Society', 'Madan Mohan Malaviya University of Technology'],
  authors: [{ name: 'CSIS Society, MMMUT' }],
  creator: 'CSIS Society',
  publisher: 'MMMUT Gorakhpur',
  icons: {
    icon: '/prayukti 2.0/logo/logo_green.png',
    apple: '/prayukti 2.0/logo/logo_green.png',
  },
  openGraph: {
    title: 'Prayukti | Virtual Laboratory Platform | MMMUT Gorakhpur',
    description: 'Explore Prayukti, the comprehensive virtual lab environment for MMMUT. Perform engineering experiments in a realistic simulated environment.',
    siteName: 'Prayukti Virtual Labs',
    images: [
      {
        url: '/prayukti 2.0/logo/logo_blue.png',
        width: 512,
        height: 512,
        alt: 'Prayukti Logo',
      }
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prayukti | Virtual Laboratory Platform',
    description: 'Virtual Laboratory Platform for Madan Mohan Malaviya University of Technology (MMMUT), Gorakhpur.',
    images: ['/prayukti 2.0/logo/logo_blue.png'],
  },
};

import { Analytics } from '@vercel/analytics/react';
import { AxiosConfig } from '@/components/AxiosConfig';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <AxiosConfig />
        {children}
        <AssistantBot />
        <Analytics />
      </body>
    </html>
  );
}
