import { Providers } from "@/components/Providers";
import { Sidebar } from "@/components/Sidebar";
import { AppBreadcrumb } from "@/components/app-breadcrumb";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trophée François Grieder – Challenge régional de tennis de table",
  description: "Site officiel du Trophée François Grieder.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function () {
              try {
                var stored = localStorage.getItem("theme");
                var theme = stored === "light" || stored === "dark" ? stored : "dark";
                document.documentElement.classList.toggle("dark", theme === "dark");
                document.documentElement.style.colorScheme = theme;
              } catch (e) {}
            })();`,
          }}
        />
      </head>
      <body className="min-h-full bg-background text-foreground antialiased">
        <Providers>
          <div className="min-h-full md:flex">
            <Sidebar />
            <div className="flex-1 md:pl-[var(--sidebar-width)]">
              <main className="px-4 py-6 sm:px-6 lg:px-8">
                <AppBreadcrumb />
                <div className="mt-4">{children}</div>
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
