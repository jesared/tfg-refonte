import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trophée François Grieder – Challenge régional de tennis de table",
  description: "Site officiel du Trophée François Grieder.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full bg-white antialiased`}
      >
        <div className="min-h-full">
          <div className="md:flex">
            <Sidebar />
            <div className="flex-1 md:pl-64">
              <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
