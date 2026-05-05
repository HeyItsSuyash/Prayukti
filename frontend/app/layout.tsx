import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { AssistantBot } from "@/components/ui/AssistantBot";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Prayukti x MMMUT",
  description: "Virtual Laboratory Platform for Madan Mohan Malaviya University of Technology, Gorakhpur",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
        <ScrollToTop />
        <AssistantBot />
      </body>
    </html>
  );
}
