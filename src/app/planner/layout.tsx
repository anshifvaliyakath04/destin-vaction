import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/seo';

const title = 'Kerala Trip Planner';
const description =
  'Build a custom Kerala vacation request with destinations, travel dates, group details, food preferences, pickup location, and contact details.';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/planner',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title,
    description,
    url: `${SITE_URL}/planner`,
    siteName: SITE_NAME,
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: 'Kerala trip planning with Destin Vacations' }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function PlannerLayout({ children }: { children: ReactNode }) {
  return children;
}
