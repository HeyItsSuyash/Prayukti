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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <ScrollToTop />
        <AssistantBot />
      </body>
    </html>
  );
}
