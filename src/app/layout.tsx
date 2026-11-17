import type { Metadata, Viewport } from "next";
import { Figtree, Noto_Sans_Malayalam } from "next/font/google";
import "./globals.css";
import { profile } from "@/content/site";

const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"] });
// for the Malayalam chat answers (Figtree has no Malayalam letters)
const malayalam = Noto_Sans_Malayalam({ variable: "--font-malayalam", subsets: ["malayalam"], display: "swap" });

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
    <html lang="en" className={`${figtree.variable} ${malayalam.variable}`}>
      <body>{children}</body>
    </html>
  );
}
