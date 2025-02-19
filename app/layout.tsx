

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import "./globals.css";

// Global providers (from your general app)
import { Providers as GlobalProviders } from "@/components/Providers";

// Resume-specific providers (from your resume builder)
import { Providers as ResumeProviders } from "@/components/resume/src/app/components/Providers";
import { AutoSaveHeaderWrapper } from "@/components/resume/src/app/components/header/AutoSaveHeaderWrapper";
import Sidebar from "@/components/sidebar/sidebar";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.className} antialiased`}
      >
        <GlobalProviders>
        <ResumeProviders>
            <AutoSaveHeaderWrapper />
           
            {children}
            </ResumeProviders>
        </GlobalProviders>
      </body>
    </html>
  );
}
