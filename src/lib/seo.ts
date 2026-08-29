export const SITE_URL = 'https://www.destin.in';
export const SITE_NAME = 'Destin Vacations';
export const DEFAULT_OG_IMAGE = '/assets/munnar.png';

export const publicDestinations = [
  {
    id: 'munnar',
    title: 'Munnar',
    description:
      'Explore Munnar tour packages with misty tea gardens, Eravikulam National Park, Mattupetty Dam, Top Station, and cool Kerala hill station experiences.',
    image: '/assets/munnar.png',
  },
  {
    id: 'alleppey',
    title: 'Alleppey',
    description:
      'Plan an Alleppey backwater holiday with Kerala houseboat cruises, Vembanad Lake, Kuttanad, Marari Beach, and calm waterfront escapes.',
    image: '/assets/alleppey.png',
  },
  {
    id: 'wayanad',
    title: 'Wayanad',
    description:
      'Discover Wayanad travel packages covering Edakkal Caves, Chembra Peak, Banasura Sagar Dam, waterfalls, forests, and Kerala nature stays.',
    image: '/assets/wayanad.png',
  },
  {
    id: 'ponmudi',
    title: 'Ponmudi',
    description:
      'Visit Ponmudi with curated Kerala hill station plans for misty viewpoints, Golden Valley, Peppara Wildlife Sanctuary, tea estates, and waterfalls.',
    image: '/assets/ponmudi.png',
  },
  {
    id: 'peermade',
    title: 'Peermade',
    description:
      'Explore Peermade holiday packages with tea and spice plantations, scenic waterfalls, Pattumala Church, and peaceful Kerala mountain stays.',
    image: '/assets/peermade.png',
  },
  {
    id: 'vagamon',
    title: 'Vagamon',
    description:
      'Plan a Vagamon getaway with rolling meadows, pine forests, Kurisumala, Thangalpara, adventure activities, and quiet Kerala hill views.',
    image: '/assets/vagamon.png',
  },
  {
    id: 'vattavada',
    title: 'Vattavada',
    description:
      'Explore Vattavada near Munnar with farm visits, strawberry fields, Pampadum Shola National Park, Kurinjimala Sanctuary, and valley viewpoints.',
    image: '/assets/vattavada.png',
  },
  {
    id: 'cochin',
    title: 'Cochin',
    description:
      'Discover Cochin and Kochi heritage experiences including Fort Kochi, Chinese fishing nets, Mattancherry Palace, Marine Drive, culture, and cuisine.',
    image: '/assets/cochin.png',
  },
  {
    id: 'thekkady',
    title: 'Thekkady',
    description:
      'Plan Thekkady travel with Periyar Lake, Periyar Wildlife Sanctuary, spice plantations, jungle activities, viewpoints, and Kerala nature stays.',
    image: '/assets/thekkady.png',
  },
] as const;

export type DestinationId = (typeof publicDestinations)[number]['id'];

export const destinationAliases: Record<string, DestinationId> = {
  kochi: 'cochin',
  kochin: 'cochin',
  vagomon: 'vagamon',
};

export function normalizeDestinationId(value: string | string[] | undefined): DestinationId {
  const raw = Array.isArray(value) ? value[0] : value;
  const normalized = (raw || 'munnar').toLowerCase().trim();
  const aliased = destinationAliases[normalized] || normalized;

  if (publicDestinations.some((destination) => destination.id === aliased)) {
    return aliased as DestinationId;
  }

  return 'munnar';
}

export function getDestinationSeo(id: DestinationId) {
  return publicDestinations.find((destination) => destination.id === id) || publicDestinations[0];
}
