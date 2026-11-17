import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { profile } from "@/content/site";
import { SmoothScroll } from "@/components/SmoothScroll";

const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${profile.name} — ${profile.role}`,
  description: `${profile.name}, software engineer from Kerala building where AI meets healthcare.`,
  authors: [{ name: profile.name, url: profile.github }],
  openGraph: {
    title: `${profile.name} — ${profile.role}`,
    description: profile.tagline,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#e6e5e3",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={figtree.variable}>
      <body>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
