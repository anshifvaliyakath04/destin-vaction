import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="container" style={{ minHeight: '65vh', paddingTop: '120px', paddingBottom: '4rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--accent-color)', fontWeight: 700, marginBottom: '0.75rem' }}>404</p>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Page Not Found</h1>
        <p style={{ maxWidth: '560px', margin: '0 auto 2rem', color: 'var(--text-muted)' }}>
          The page you are looking for does not exist. Explore Kerala destinations or start a fresh travel plan.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn-primary">
            Back to Home
          </Link>
          <Link href="/planner" className="btn btn-outline">
            Plan Your Trip
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
