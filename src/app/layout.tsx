import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { EB_Garamond } from "next/font/google";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",  
});

export const metadata: Metadata = {
  title: "Tinkering",
  description: "Thinking about motion, elegance, interactivity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ebGaramond.className} antialiased flex flex-col items-center min-h-screen pt-[20dvh]`}
      >
        <div className="w-full max-w-xl px-6 pb-[30dvh]">
          {children}
        </div>
      </body>
    </html>
  );
}
