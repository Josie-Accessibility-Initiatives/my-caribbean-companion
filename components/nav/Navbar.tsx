"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/onboarding", label: "Plan My Move" },
  { href: "/dashboard", label: "My Plan" },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="nav-wrapper">
      <nav className="nav">
        <Link href="/" className="nav-logo">
          <span className="nav-logo-mark">CC</span>
          <span className="nav-logo-text">Caribbean Companion</span>
        </Link>

        <div className="nav-links">
          {navLinks.map((link) => (
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
          <Link href="/signup" className="nav-secondary-btn">
            Sign up
          </Link>
          <Link href="/login" className="nav-primary-btn">
            Log in
          </Link>
        </div>
      </nav>
    </header>
  );
}
