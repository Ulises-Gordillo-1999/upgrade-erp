import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { getSession } from "@/utils/auth";
import { getNotificaciones } from "@/app/actions/notificaciones";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "UPGRADE - ERP/CRM",
  description: "Panel de administración interno para UPGRADE IT Infrastructure",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const notificaciones = session ? await getNotificaciones() : undefined;

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
        className={`${inter.variable} font-sans antialiased bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 h-screen flex flex-col lg:flex-row overflow-hidden transition-colors`}
      >
        <ThemeProvider>
          {session ? (
            <>
              <Sidebar user={session} notificaciones={notificaciones} />
              <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
                <Header user={session} notificaciones={notificaciones} />
                <main className="flex-1 overflow-y-auto bg-slate-50/60 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors">
                  <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 py-4 sm:py-8 h-full">
                    {children}
                  </div>
                </main>
              </div>
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
