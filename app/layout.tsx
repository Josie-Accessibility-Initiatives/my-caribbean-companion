import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/nav/Navbar";
import AICompanionBubble from "@/components/nav/AICompanionBubble";
import Footer from "@/components/nav/Footer";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";
import "./styles/ui.css";
import "./styles/layout.css";
import "./styles/dashboard.css";
import "./styles/chat.css";
import "./styles/tools.css";
import "./styles/compare.css";

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
    // Browser extensions (e.g. QuillBot's data-qb-installed) add attributes
    // to <html> before hydration; ignore those attribute mismatches only.
    <html lang="en" suppressHydrationWarning>
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
