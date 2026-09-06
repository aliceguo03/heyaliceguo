import type { Metadata } from "next";
import localFont from "next/font/local";
import { Nav } from "@/components/chassis/Nav";
import { Footer } from "@/components/chassis/Footer";
import { SmoothScroll } from "@/components/chassis/SmoothScroll";
import "./globals.css";

const gambarino = localFont({
  src: "../../public/fonts/Gambarino-Regular.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-gambarino",
  adjustFontFallback: "Times New Roman",
  fallback: ["Georgia", "serif"],
});

const jetbrains = localFont({
  src: "../../public/fonts/JetBrainsMono-Regular.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-jetbrains",
  adjustFontFallback: "Arial",
  fallback: ["ui-monospace", "monospace"],
});

const satoshi = localFont({
  src: [
    {
      path: "../../public/fonts/Satoshi-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/SatoshiVariable-Bold.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-satoshi",
  adjustFontFallback: "Arial",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Alice Guo",
  description: "Alice Guo — product designer and design engineer, San Diego.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${gambarino.variable} ${jetbrains.variable} ${satoshi.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-porcelain text-deep-black font-sans text-body">
        <Nav />
        <SmoothScroll>{children}</SmoothScroll>
        <Footer />
      </body>
    </html>
  );
}
