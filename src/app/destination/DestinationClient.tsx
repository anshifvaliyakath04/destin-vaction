'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const destinationData: Record<string, {
  title: string;
  subtitle: string;
  image: string;
  description: string;
  bestTime: string;
  activities: string[];
  places: { name: string; img: string }[];
}> = {
  munnar: {
    title: 'Munnar',
    subtitle: 'Where misty hills meet endless tea gardens',
    image: '/assets/munnar.png',
    description: "From rolling green plantations and cool mountain air to breathtaking viewpoints and waterfalls, Munnar is a perfect escape into nature. Explore Eravikulam National Park and spot the Nilgiri Tahr, enjoy peaceful moments at Mattupetty Dam & Kundala Lake, witness the magical sunrise at Top Station, and experience Kolukkumalai - the world's highest tea estate.",
    bestTime: 'September to March',
    activities: ['Tea Estate Tours', 'Trekking', 'Wildlife Spotting', 'Camping'],
    places: [
      { name: 'Tea Gardens', img: '/assets/tea_gardens.png' },
      { name: 'Eravikulam National Park', img: '/assets/eravikulam.png' },
      { name: 'Echo Point', img: '/assets/echo_point.png' },
      { name: 'Top Station', img: '/assets/top_station.png' },
      { name: 'Mattupetty Dam', img: '/assets/mattupetty_dam.png' },
      { name: 'Kundala Lake', img: '/assets/kundala_lake.png' },
      { name: 'Attukad Waterfalls', img: '/assets/attukad_waterfalls.png' },
      { name: 'Kolukkumalai', img: '/assets/kolukkumalai.png' },
      { name: 'Anayirankal Dam', img: '/assets/vagamon_anayirankal_dam.png' },
      { name: 'Marayoor', img: '/assets/vagamon_marayoor.png' },
      { name: 'Devikulam', img: '/assets/vagamon_devikulam.png' },
    ],
  },
  wayanad: {
    title: 'Wayanad',
    subtitle: 'Where forests whisper and mountains touch the clouds',
    image: '/assets/wayanad.png',
    description: 'Wayanad is a serene hill destination known for its lush forests, misty mountains, waterfalls, and rich history. Perfect for nature lovers and adventure seekers, it offers a refreshing escape into the heart of Kerala.',
    bestTime: 'October to May',
    activities: ['Cave Exploration', 'Mountain Trekking', 'Wildlife Safaris', 'Camping'],
    places: [
      { name: 'Kuruva Island', img: '/assets/kuruva_island.png' },
      { name: 'Lakkidi View Point', img: '/assets/lakkidi_viewpoint.png' },
      { name: 'Tholpetty Wildlife Sanctuary', img: '/assets/tholpetty_wildlife.png' },
      { name: 'Edakkal Caves', img: '/assets/edakkal_caves.png' },
      { name: 'Pookode Lake', img: '/assets/pookode_lake.png' },
      { name: 'Chembra Peak', img: '/assets/chembra_peak.png' },
      { name: 'Soochipara Waterfalls', img: '/assets/soochipara_waterfalls.png' },
      { name: 'Banasura Sagar Dam', img: '/assets/banasura_dam.png' },
    ],
  },
  vattavada: {
    title: 'Vattavada',
    subtitle: 'Experience the Beauty of Endless Valleys and Fresh Harvests',
    image: '/assets/vattavada.png',
    description: 'Vattavada is a beautiful hill village located near Munnar in the Western Ghats. Surrounded by lush green mountains, mist-covered valleys, and fertile farmlands, it is one of Kerala\'s most peaceful and scenic destinations. Often referred to as the "Kashmir of Kerala", Vattavada offers a refreshing climate, breathtaking landscapes, and a unique rural charm away from crowded tourist spots.',
    bestTime: 'September to April',
    activities: ['Farm Tours', 'Trekking', 'Nature Trails', 'National Park Safaris', 'Camping'],
    places: [
      { name: 'Organic Vegetable & Strawberry Farms', img: '/assets/vattavada_farms.png' },
      { name: 'Pampadum Shola National Park', img: '/assets/vattavada_pampadum.png' },
      { name: 'Kurinjimala Sanctuary', img: '/assets/vattavada_kurinjimala.png' },
      { name: 'Vattavada Viewpoint', img: '/assets/vattavada_viewpoint.png' },
    ],
  },
  vagamon: {
    title: 'Vagamon',
    subtitle: 'A peaceful escape into rolling meadows and misty valleys',
    image: '/assets/vagamon.png',
    description: 'Vagamon is a peaceful hill station located in the Idukki district of Kerala. Surrounded by rolling green meadows, tea plantations, pine forests, and mist-covered hills, it is one of Kerala\'s most beautiful offbeat destinations. With its cool climate and serene atmosphere, Vagamon is perfect for nature lovers, couples, families, and adventure seekers.',
    bestTime: 'September to May',
    activities: ['Pine Forest Trekking', 'Hill Climbing', 'Meadow Walks', 'Paragliding', 'Offroad Jeep Safari'],
    places: [
      { name: 'Pine Forest', img: '/assets/vagamon_pine_forest.png' },
      { name: 'Thangalpara', img: '/assets/vagamon_thangalpara.png' },
      { name: 'Kurisumala', img: '/assets/vagamon_kurisumala.png' },
    ],
  },
  alleppey: {
    title: 'Alleppey',
    subtitle: 'Sail through the enchanting backwaters of Kerala',
    image: '/assets/alleppey.png',
    description: 'Alappuzha is a popular tourist destination, especially famed for its houseboat cruises that offer an immersive experience of Kerala\'s enchanting backwaters. This coastal city provides a perfect blend of natural beauty, cultural heritage, and serene water-based activities.',
    bestTime: 'October to February',
    activities: ['Houseboat Cruise', 'Village Walks', 'Sunrise & Sunset Viewing', 'Canoeing'],
    places: [
      { name: 'Kuttanad', img: '/assets/kuttanad.png' },
      { name: 'Vembanad Lake Houseboat Cruise', img: '/assets/vembanad_houseboat.png' },
      { name: 'Alappuzha Beach', img: '/assets/alappuzha_beach.png' },
      { name: 'Marari Beach', img: '/assets/marari_beach.png' },
      { name: 'Pathiramanal Island', img: '/assets/pathiramanal.png' },
    ],
  },
  ponmudi: {
    title: 'Ponmudi',
    subtitle: 'The Golden Peak of Kerala',
    image: '/assets/ponmudi.png',
    description: 'Escape to the misty hills of Ponmudi, one of the most scenic hill stations in Kerala. Surrounded by lush greenery, winding roads, waterfalls, and breathtaking viewpoints, Ponmudi is perfect for a peaceful nature getaway.',
    bestTime: 'October to March',
    activities: ['Trekking', 'Nature Walks', 'Cool Mountain Escapes'],
    places: [
      { name: 'Peppara Wildlife Sanctuary', img: '/assets/ponmudi_peppara.png' },
      { name: 'Tea Estates', img: '/assets/ponmudi_tea_estates.jpg' },
      { name: 'Meenmutty Waterfalls', img: '/assets/ponmudi_meenmutty.png' },
      { name: 'Golden Valley', img: '/assets/ponmudi_golden_valley.jpg' },
      { name: 'Agasthyakoodam Trek Route', img: '/assets/ponmudi_agasthyakoodam.png' },
    ],
  },
  peermade: {
    title: 'Peermade',
    subtitle: 'Vast tea and spice plantations',
    image: '/assets/peermade.png',
    description: 'Peermade is also famous for eco-tourism. The breathtaking sights of the coffee, tea, pepper and cardamom plantations, waterfalls etc is something unique, which you can only experience here at this hill station.',
    bestTime: 'September to April',
    activities: ['Trekking', 'Cycling', 'Horse Riding'],
    places: [
      { name: 'Pattumala Church', img: '/assets/pattumala_church.png' },
      { name: 'Coffee & Tea Plantations', img: '/assets/peermade_plantations.png' },
      { name: 'Scenic Waterfalls', img: '/assets/peermade_waterfalls.png' },
    ],
  },
  cochin: {
    title: 'Cochin',
    subtitle: 'Experience Heritage, Culture, and Modern Charm',
    image: '/assets/cochin.png',
    description: 'Kochi, often called the Queen of the Arabian Sea, is a vibrant coastal city in Kerala that beautifully blends history, culture, and modern life. Known for its colonial architecture, iconic Chinese fishing nets, bustling markets, and scenic waterfronts, Kochi offers a unique travel experience. Visitors can explore historic Fort Kochi, enjoy sunset views along Marine Drive, discover cultural landmarks, and experience the city\'s rich heritage and diverse cuisine.',
    bestTime: 'October to March',
    activities: ['Sightseeing', 'Cultural Shows', 'Ferry Rides', 'Shopping', 'Food Tours'],
    places: [
      { name: 'Fort Kochi', img: '/assets/cochin_fort_kochi.jpg' },
      { name: 'Chinese Fishing Nets', img: '/assets/cochin_chinese_nets.jpg' },
      { name: 'Mattancherry Palace', img: '/assets/cochin_mattancherry.jpg' },
      { name: 'Sunset at Marine Drive', img: '/assets/cochin_marine_drive.jpg' },
    ],
  },
  thekkady: {
    title: 'Thekkady',
    subtitle: 'Where Adventure Meets Serenity',
    image: '/assets/thekkady.png',
    description: 'Thekkady is one of Kerala\'s most popular nature and wildlife destinations. Home to the famous Periyar Wildlife Sanctuary, it offers breathtaking forests, scenic lakes, and rich biodiversity. Enjoy exciting boat cruises, jungle safaris, bamboo rafting, and nature walks. Explore aromatic spice plantations and experience the region\'s unique culture.',
    bestTime: 'October to February',
    activities: [
      'Periyar Lake Boat Cruise',
      'Wildlife Safari',
      'Guided Nature Walk',
      'Bamboo Rafting',
      'Jeep Safari',
      'Spice Plantation Tour',
    ],
    places: [
      { name: 'Periyar Lake', img: '/assets/thekkady_periyar_lake.png' },
      { name: 'Periyar Wildlife Sanctuary', img: '/assets/thekkady_periyar_sanctuary.png' },
      { name: 'Elephant Junction', img: '/assets/thekkady_elephant_junction.png' },
      { name: 'Chellarkovil Viewpoint', img: '/assets/thekkady_chellarkovil.png' },
      { name: 'Murikkady', img: '/assets/thekkady_murikkady.png' },
    ],
  },
};

function DestinationContent() {
  const searchParams = useSearchParams();
  const rawId = (searchParams.get('id') || 'munnar').toLowerCase().trim();
  const [selectedPlace, setSelectedPlace] = useState<{ name: string; img: string } | null>(null);

  // Alias mapping to support variations like kochin, kochi, vagomon
  const aliasMap: Record<string, string> = {
    kochin: 'cochin',
    kochi: 'cochin',
    vagomon: 'vagamon',
  };

  const id = aliasMap[rawId] || rawId;
  const data = destinationData[id] || destinationData['munnar'];

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/#destinations';
    }
  };

  return (
    <>
      <Navbar />
      <main>
      {/* Hero Banner Header */}
      <div className="dest-header" style={{ backgroundImage: `url('${data.image}')` }} role="img" aria-label={`${data.title} Kerala destination landscape`}>
        <div className="container dest-header-content">
          <button
            type="button"
            onClick={handleGoBack}
            style={{
              background: 'rgba(0, 0, 0, 0.45)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              backdropFilter: 'blur(8px)',
              padding: '0.45rem 1.1rem',
              borderRadius: '30px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem',
              fontSize: '0.88rem',
              fontWeight: 600,
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            <i className="fa-solid fa-arrow-left"></i> Back to Destinations
          </button>
          <h1>{data.title}</h1>
          <p style={{ fontSize: '1.5rem', opacity: 0.9 }}>{data.subtitle}</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2.5rem 2rem 4rem' }}>
        {/* Top Navigation Bar */}
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handleGoBack}
            style={{
              background: '#173d32',
              color: '#ffffff',
              border: 'none',
              padding: '0.55rem 1.25rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            }}
          >
            <i className="fa-solid fa-arrow-left"></i> Back to Destinations
          </button>
          <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>
            Viewing Destination: <strong style={{ color: '#173d32' }}>{data.title}</strong>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '4rem' }}>
          <div>
            <h2 style={{ marginBottom: '1rem', fontSize: '2rem' }}>About This Destination</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '3rem', lineHeight: '1.8' }}>{data.description}</p>

            <h2 style={{ marginBottom: '2rem', fontSize: '2rem', color: 'var(--accent-color)', borderBottom: '2px solid var(--accent-color)', paddingBottom: '0.5rem', display: 'inline-block' }}>Must Visit Places</h2>
            <div className="must-visit-grid">
              {data.places.map(place => (
                <div
                  key={place.name}
                  className="place-card"
                  onClick={() => setSelectedPlace(place)}
                  style={{ cursor: 'pointer' }}
                  title={`Click to view ${place.name}`}
                >
                  <img src={place.img} alt={`${place.name}, ${data.title} – Kerala`} className="place-img" />
                  <div className="place-info">
                    <h4 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{place.name}</span>
                      <i className="fa-solid fa-expand" style={{ fontSize: '0.8rem', opacity: 0.7 }}></i>
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ background: 'var(--bg-light)', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-regular fa-calendar" style={{ color: 'var(--accent-color)' }}></i> Best Time To Visit
              </h3>
              <p style={{ fontWeight: 500, fontSize: '1.1rem' }}>{data.bestTime}</p>
            </div>

            <div style={{ background: 'var(--primary-color)', color: 'white', padding: '2rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-person-hiking" style={{ color: 'var(--accent-color)' }}></i> Activities
              </h3>
              <ul style={{ listStyle: 'none' }}>
                {data.activities.map(act => (
                  <li key={act} style={{ marginBottom: '10px' }}><i className="fa-solid fa-check" style={{ color: 'var(--accent-color)', marginRight: '8px' }}></i>{act}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginTop: '2rem', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ background: 'var(--light-green)', color: 'white', padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Related Package</div>
              <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Explore this destination</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Check out our curated packages including this location.</p>
                <a href="/planner" className="btn btn-primary" style={{ width: '100%', padding: '0.5rem' }}>Book Now</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Back Button Bar */}
        <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleGoBack}
            style={{
              background: '#173d32',
              color: '#ffffff',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '30px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              boxShadow: '0 4px 12px rgba(23,61,50,0.25)',
            }}
          >
            <i className="fa-solid fa-arrow-left"></i> Back to Destinations
          </button>
        </div>
      </div>

      {/* Place Preview Lightbox Modal */}
      {selectedPlace && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem',
          }}
          onClick={() => setSelectedPlace(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '650px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ position: 'relative' }}>
              <img
                src={selectedPlace.img}
                alt={`${selectedPlace.name}, ${data.title} – Kerala attraction`}
                style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }}
              />
              <button
                type="button"
                onClick={() => setSelectedPlace(null)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'rgba(0, 0, 0, 0.6)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#173d32', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Must Visit Attraction • {data.title}
                </span>
                <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.4rem', color: '#1e293b', fontWeight: 700 }}>
                  {selectedPlace.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlace(null)}
                style={{
                  background: '#173d32',
                  color: '#fff',
                  border: 'none',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <i className="fa-solid fa-arrow-left"></i> Back to {data.title}
              </button>
            </div>
          </div>
        </div>
      )}

      </main>

      <a href={`https://wa.me/919526886600`} className="floating-whatsapp" target="_blank" rel="noopener noreferrer" aria-label="Contact us on WhatsApp">
        <i className="fa-brands fa-whatsapp"></i>
      </a>

      <Footer />
    </>
  );
}

export default function Destination() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <DestinationContent />
    </Suspense>
  );
}
