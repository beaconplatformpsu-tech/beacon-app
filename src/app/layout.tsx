import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { Preloader } from "@/components/shared/Preloader";

export const metadata: Metadata = {
  title: "Beacon - Academic & Career Platform for CS Students",
  description:
    "Beacon collapses six fragmented tools into one unified workspace for Computer Science students - academic task management, technical skill tracking, career preparation, private notes, AI insights, and academic support, all in one intelligent platform.",
  icons: {
    icon: "/icon.jpg",
  },
  keywords: [
    "beacon platform",
    "computer science students",
    "academic task management",
    "skill tracking",
    "career preparation",
    "CS student platform",
    "student dashboard",
    "internship preparation",
    "academic support",
    "private notes",
    "unified student workspace",
    "AI academic guidance",
  ],
  authors: [{ name: "Beacon Team" }],
  openGraph: {
    title: "Beacon - One Unified Workspace for CS Students",
    description:
      "Collapse six fragmented tools into one: task management, skill tracking, career preparation, private notes, and AI insights - built for Computer Science students.",
    siteName: "Beacon",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Beacon - One Unified Workspace for CS Students",
    description:
      "Collapse six fragmented tools into one intelligent platform. Built for Computer Science students.",
  },
};

export const viewport: Viewport = {
  themeColor: "#03002e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts loaded at runtime - no build-time network dependency */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Noto+Serif+Arabic:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('beacon.theme') || 'system';
                let activeTheme = theme;
                if (theme === 'system') {
                  activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                document.documentElement.classList.add(activeTheme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>
        <Providers>
          <Preloader />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
