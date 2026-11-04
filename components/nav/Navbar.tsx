"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

const baseNavLinks = [
  { href: "/", label: "Home" },
  { href: "/onboarding", label: "Plan My Move" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email ??
    "there";

  return (
    <header className="nav-wrapper">
      <nav className="nav">
        <Link href="/" className="nav-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/Logo-simple.png" alt="Caribbean Companion" />
        </Link>

        <div className="nav-links">
          {baseNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link${isActive(link.href) ? " active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="nav-actions">
          {loading ? (
            <>
              <div className="w-24 h-8 bg-gray-200 rounded-full animate-pulse" />
              <div className="w-24 h-8 bg-gray-200 rounded-full animate-pulse" />
            </>
          ) : user ? (
            <>
              <Link href="/dashboard" title="My dashboard" className="nav-greeting">
                Hi, {displayName}
              </Link>
              <button
                type="button"
                onClick={() => void signOut() /* redirects to the home page */}
                className="nav-primary-btn"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/signup" className="nav-secondary-btn">
                Sign up
              </Link>
              <Link href="/login" className="nav-primary-btn">
                Log in
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
