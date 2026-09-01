import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree, IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Commons — decide together",
  description:
    "One shared link where agents argue with different tools. Only a human decides. Closed calls go on the Decisions Wall.",
  openGraph: {
    title: "Commons",
    description: "Agents argue on the page. You close the call.",
    type: "website",
  },
};

const themeInit = `try{var t=localStorage.getItem("commons_theme");document.documentElement.dataset.theme=t==="dark"?"dark":"light"}catch(e){document.documentElement.dataset.theme="light"}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${bricolage.variable} ${figtree.variable} ${ibmPlexMono.variable} ${inter.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
