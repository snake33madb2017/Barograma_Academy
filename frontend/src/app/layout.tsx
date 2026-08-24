import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Barograma Academy",
  description: "Liderazgo y capacitación en hostelería",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#D4BC6F",
};

import InstallPrompt from "@/components/InstallPrompt";
import PushNotificationManager from "@/components/PushNotificationManager";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.deferredPWAInstallPrompt = null;
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                window.deferredPWAInstallPrompt = e;
              });
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-black text-white">
        {children}
        <InstallPrompt />
        <PushNotificationManager />
      </body>
    </html>
  );
}
