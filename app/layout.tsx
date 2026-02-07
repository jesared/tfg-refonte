import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
          <header className="border-b border-slate-200 bg-white md:hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900">
                  Trophée François Grieder
                </span>
                <span className="text-xs text-slate-500">
                  Challenge régional de tennis de table
                </span>
              </div>
              <button
                type="button"
                className="inline-flex items-center rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
              >
                Menu
              </button>
            </div>
          </header>

          <div className="md:flex">
            <aside className="hidden border-r border-slate-200 bg-slate-50 md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col md:px-6 md:py-8">
              <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Navigation
              </div>
              <nav className="mt-6 space-y-3 text-sm text-slate-700">
                <a className="block font-medium text-slate-900" href="#">
                  Accueil
                </a>
                <a className="block" href="#">
                  Programme
                </a>
                <a className="block" href="#">
                  Actualités
                </a>
                <a className="block" href="#">
                  Inscriptions
                </a>
              </nav>
            </aside>

            <div className="flex-1 md:pl-64">
              <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
