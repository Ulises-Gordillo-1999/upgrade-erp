import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { getSession } from "@/utils/auth";

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
    <html lang="es" className="dark" style={{ colorScheme: "dark" }}>
      <body className={`${inter.variable} font-sans antialiased bg-zinc-950 text-zinc-100 h-screen flex overflow-hidden`}>
        {session ? (
          <>
            <Sidebar user={session} />
            <main className="flex-1 overflow-y-auto bg-zinc-950">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 h-full">
                {children}
              </div>
            </main>
          </>
        ) : (
          <main className="flex-1 overflow-y-auto w-full h-full bg-zinc-950">
            {children}
          </main>
        )}
      </body>
    </html>
  );
}
