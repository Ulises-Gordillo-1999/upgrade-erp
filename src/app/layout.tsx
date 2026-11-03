import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { getSession } from "@/utils/auth";
import { getNotificaciones } from "@/app/actions/notificaciones";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { PwaRegister } from "@/components/pwa/PwaRegister";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "UPGRADE ERP | Soluciones IT & Infraestructura",
    template: "%s | UPGRADE ERP",
  },
  description: "Plataforma integral de gestión de proyectos, catálogo IT, bóveda criptográfica y finanzas para UPGRADE.",
  applicationName: "UPGRADE ERP",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "UPGRADE ERP",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#07090e" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
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
        className={`${inter.variable} font-sans antialiased bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 min-h-dvh h-dvh flex flex-col lg:flex-row overflow-hidden transition-colors`}
      >
        <ThemeProvider>
          {session ? (
            <>
              <PwaRegister />
              <Sidebar user={session} notificaciones={notificaciones} />
              <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
                <Header user={session} notificaciones={notificaciones} />
                <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 bg-slate-50/60 dark:bg-[#07090e] text-slate-900 dark:text-zinc-100 transition-colors relative pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
                  {/* Cyber Grid y Resplandor Ambiental */}
                  <div className="absolute inset-0 cyber-grid pointer-events-none opacity-80" />
                  <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
                  <div className="absolute top-1/3 left-10 w-96 h-96 bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

                  <div className="relative z-10 mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-8 w-full min-h-full">
                    {children}
                  </div>
                </main>
              </div>
            </>
          ) : (
            <main className="flex-1 overflow-y-auto overflow-x-hidden w-full h-full bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors pt-[env(safe-area-inset-top,0px)] pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
              {children}
            </main>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
