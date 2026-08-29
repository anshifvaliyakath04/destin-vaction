import type { Metadata } from 'next';
import DestinationClient from './DestinationClient';
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, getDestinationSeo, normalizeDestinationId } from '@/lib/seo';

type DestinationPageProps = {
  searchParams: Promise<{ id?: string | string[] }>;
};

export async function generateMetadata({ searchParams }: DestinationPageProps): Promise<Metadata> {
  const params = await searchParams;
  const id = normalizeDestinationId(params.id);
  const destination = getDestinationSeo(id);
  const title = `${destination.title} Kerala Tour Packages`;
  const canonical = `${SITE_URL}/destination?id=${destination.id}`;

  return {
    title,
    description: destination.description,
    alternates: {
      canonical,
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
      title: `${destination.title} Kerala Tour Packages | ${SITE_NAME}`,
      description: destination.description,
      url: canonical,
      siteName: SITE_NAME,
      type: 'website',
      images: [{ url: destination.image || DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `${destination.title} Kerala destination` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${destination.title} Kerala Tour Packages | ${SITE_NAME}`,
      description: destination.description,
      images: [destination.image || DEFAULT_OG_IMAGE],
    },
  };
}

export default async function DestinationPage({ searchParams }: DestinationPageProps) {
  const params = await searchParams;
  const id = normalizeDestinationId(params.id);
  const destination = getDestinationSeo(id);
  const canonical = `${SITE_URL}/destination?id=${destination.id}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: `${destination.title}, Kerala`,
    description: destination.description,
    url: canonical,
    image: `${SITE_URL}${destination.image}`,
    containedInPlace: {
      '@type': 'State',
      name: 'Kerala',
    },
    provider: {
      '@type': 'TravelAgency',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Destinations',
        item: `${SITE_URL}/#destinations`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: destination.title,
        item: canonical,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <DestinationClient />
    </>
  );
}
