import { Newsreader, Inter } from "next/font/google";
import "./globals.css";

const serif = Newsreader({ subsets: ["latin"], variable: "--font-serif", style: ["normal", "italic"] });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: "Burns Depression Checklist",
  description: "A private, 25-question self-check based on David Burns' Feeling Good.",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f1ea" },
    { media: "(prefers-color-scheme: dark)", color: "#171a18" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
