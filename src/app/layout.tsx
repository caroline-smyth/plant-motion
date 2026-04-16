import type { Metadata } from "next";
import "./globals.css";
import { EB_Garamond, Inter } from "next/font/google";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sketchbook",
  description: "Thinking about motion, elegance, interactivity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${ebGaramond.variable} ${inter.variable} font-sans antialiased flex flex-col items-center min-h-screen pt-[20dvh]`}
      >
        <div className="w-full max-w-xl px-6 pb-[30dvh]">
          {children}
        </div>
      </body>
    </html>
  );
}
