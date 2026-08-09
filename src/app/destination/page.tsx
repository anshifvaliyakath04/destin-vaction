'use client';

import { useEffect, useState } from 'react';
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
    description: 'From rolling green plantations and cool mountain air to breathtaking viewpoints and waterfalls, Munnar is a perfect escape into nature.',
    bestTime: 'September to March',
    activities: ['Tea Estate Tours', 'Trekking', 'Wildlife Spotting', 'Camping'],
    places: [
      { name: 'Tea Gardens', img: '/assets/tea_gardens.png' },
      { name: 'Eravikulam National Park', img: '/assets/eravikulam.png' },
      { name: 'Echo Point', img: '/assets/echo_point.png' },
      { name: 'Top Station', img: '/assets/top_station.png' },
    ],
  },
  wayanad: {
    title: 'Wayanad',
    subtitle: 'Where forests whisper and mountains touch the clouds',
    image: '/assets/wayanad.png',
    description: 'Wayanad is a serene hill destination known for its lush forests, misty mountains, waterfalls, and rich history.',
    bestTime: 'October to May',
    activities: ['Cave Exploration', 'Mountain Trekking', 'Wildlife Safaris', 'Camping'],
    places: [
      { name: 'Edakkal Caves', img: '/assets/edakkal_caves.png' },
      { name: 'Chembra Peak', img: '/assets/chembra_peak.png' },
      { name: 'Banasura Sagar Dam', img: '/assets/banasura_dam.png' },
    ],
  },
  thekkady: {
    title: 'Thekkady',
    subtitle: 'Where Adventure Meets Serenity',
    image: '/assets/thekkady.png',
    description: 'Thekkady is one of Kerala\'s most popular nature and wildlife destinations. Home to the famous Periyar Wildlife Sanctuary.',
    bestTime: 'October to February',
    activities: ['Periyar Lake Boat Cruise', 'Wildlife Safari', 'Bamboo Rafting', 'Spice Plantation Tour'],
    places: [
      { name: 'Periyar Lake', img: '/assets/thekkady_periyar_lake.png' },
      { name: 'Periyar Wildlife Sanctuary', img: '/assets/thekkady_periyar_sanctuary.png' },
      { name: 'Elephant Junction', img: '/assets/thekkady_elephant_junction.png' },
    ],
  },
  alleppey: {
    title: 'Alleppey',
    subtitle: 'Sail through the enchanting backwaters of Kerala',
    image: '/assets/alleppey.png',
    description: 'Alappuzha is a popular tourist destination, especially famed for its houseboat cruises.',
    bestTime: 'October to February',
    activities: ['Houseboat Cruise', 'Village Walks', 'Sunrise & Sunset Viewing'],
    places: [
      { name: 'Vembanad Lake', img: '/assets/vembanad_houseboat.png' },
      { name: 'Alappuzha Beach', img: '/assets/alappuzha_beach.png' },
      { name: 'Marari Beach', img: '/assets/marari_beach.png' },
    ],
  },
};

function DestinationContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || 'munnar';
  const data = destinationData[id] || destinationData['munnar'];

  return (
    <>
      <Navbar />
      <div className="dest-header" style={{ backgroundImage: `url('${data.image}')` }}>
        <div className="container dest-header-content">
          <h1>{data.title}</h1>
          <p style={{ fontSize: '1.5rem', opacity: 0.9 }}>{data.subtitle}</p>
        </div>
      </div>

      <div className="container" style={{ padding: '4rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '4rem' }}>
          <div>
            <h2 style={{ marginBottom: '1rem', fontSize: '2rem' }}>About This Destination</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '3rem', lineHeight: '1.8' }}>{data.description}</p>

            <h2 style={{ marginBottom: '2rem', fontSize: '2rem', color: 'var(--accent-color)', borderBottom: '2px solid var(--accent-color)', paddingBottom: '0.5rem', display: 'inline-block' }}>Must Visit Places</h2>
            <div className="must-visit-grid">
              {data.places.map(place => (
                <div key={place.name} className="place-card">
                  <img src={place.img} alt={place.name} className="place-img" />
                  <div className="place-info"><h4>{place.name}</h4></div>
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
      </div>

      <a href={`https://wa.me/919526886600`} className="floating-whatsapp" target="_blank" rel="noopener noreferrer">
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
