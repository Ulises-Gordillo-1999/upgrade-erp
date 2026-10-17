import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { getSession } from "@/utils/auth";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "UPGRADE - ERP/CRM",
  description: "Panel de administración interno para UPGRADE IT Infrastructure",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="es" suppressHydrationWarning className="dark">
      <head>
        {/* Script anti-parpadeo para aplicar el tema guardado antes del render */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('upgrade_theme');
                  var isDark = t === 'dark' || (!t || t === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 h-screen flex overflow-hidden transition-colors`}
      >
        <ThemeProvider>
          {session ? (
            <>
              <Sidebar user={session} />
              <main className="flex-1 overflow-y-auto bg-slate-50/60 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 h-full">
                  {children}
                </div>
              </main>
            </>
          ) : (
            <main className="flex-1 overflow-y-auto w-full h-full bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors">
              {children}
            </main>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
