import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const kontrasFont = Cormorant_Garamond({
  variable: "--font-kontras",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const sansFont = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LostChain | Decentralized Lost & Found",
  description: "A privacy-preserving lost & found system built on blockchain with liquid glass aesthetics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${kontrasFont.variable} ${sansFont.variable} font-sans bg-[#000F08] text-white antialiased selection:bg-[#FB3640] selection:text-white min-h-screen relative overflow-x-hidden`}
      >
        {/* Ambient liquid light orbs */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#FB3640]/12 blur-[160px] rounded-full" />
          <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-[#FB3640]/10 blur-[180px] rounded-full" />
          <div className="absolute -bottom-40 left-1/4 w-[700px] h-[700px] bg-[#002B16]/30 blur-[200px] rounded-full" />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />
        </div>

        <div className="relative z-10">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
