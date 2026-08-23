'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isHeroPage = pathname === '/' || pathname.startsWith('/destination');
  const isSolid = !isHeroPage || scrolled;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isSolid ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        <Link href="/" className="logo">
          <img src="/assets/logo.png" alt="Destin Vacations" />
        </Link>

        <div className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
          <i className="fa-solid fa-bars"></i>
        </div>

        <ul className={`nav-links ${mobileOpen ? 'active' : ''}`}>
          <li>
            <a
              href="/#home"
              onClick={(e) => {
                setMobileOpen(false);
                if (pathname === '/') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              Home
            </a>
          </li>
          <li><a href="/#destinations" onClick={() => setMobileOpen(false)}>Destinations</a></li>
          <li><a href="/#services" onClick={() => setMobileOpen(false)}>Services</a></li>
          <li><a href="/#contact" onClick={() => setMobileOpen(false)}>Contact</a></li>
          <li id="auth-link">
            <Link href="/login" className="btn btn-outline" style={{ padding: '0.5rem 1.5rem', marginLeft: '1rem' }}>
              Login
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
