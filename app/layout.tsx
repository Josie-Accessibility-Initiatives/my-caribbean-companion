import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/nav/Navbar";
import AICompanionBubble from "@/components/nav/AICompanionBubble";
import Footer from "@/components/nav/Footer";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "My Caribbean Companion",
  description: "Your guide to working anywhere in the Caribbean.",
  icons: {
    icon: "/assets/favicon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider initialUser={user}>
          <div className="app-root">
            <Navbar />
            <main className="app-main">{children}</main>
            <AICompanionBubble />
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
