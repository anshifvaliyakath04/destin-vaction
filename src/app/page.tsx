'use client';

import { useEffect, useRef, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { SITE_URL, SITE_NAME } from '@/lib/seo';

export default function Home() {
  const [settings, setSettings] = useState<{ whatsapp_number: string }>({ whatsapp_number: '919526886600' });
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    trip_type: 'Family Vacation',
    rating: 5,
    review_text: '',
  });

  const sliderRef = useRef<HTMLDivElement>(null);

  const fetchTestimonials = async () => {
    const { data } = await supabaseBrowser.from('testimonials').select('*').eq('status', 'Approved').order('created_at', { ascending: false });
    if (data) setTestimonials(data);
  };

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabaseBrowser.from('settings').select('whatsapp_number').single();
      if (data) setSettings(data);
    };
    fetchSettings();
    fetchTestimonials();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!sliderRef.current) return;
      const slides = sliderRef.current.querySelectorAll('.slide');
      let active = 0;
      slides.forEach((slide, idx) => {
        if (slide.classList.contains('active')) active = idx;
      });
      slides[active].classList.remove('active');
      const next = (active + 1) % slides.length;
      slides[next].classList.add('active');
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.review_text) {
      alert('Please fill out your name and review text.');
      return;
    }
    setSubmittingReview(true);
    try {
      const fd = new FormData();
      fd.append('name', reviewForm.name);
      fd.append('trip_type', reviewForm.trip_type);
      fd.append('rating', String(reviewForm.rating));
      fd.append('review_text', reviewForm.review_text);

      const fileInput = document.getElementById('review_images') as HTMLInputElement;
      if (fileInput && fileInput.files) {
        for (let i = 0; i < fileInput.files.length; i++) {
          fd.append('images', fileInput.files[i]);
        }
      }

      const res = await fetch('/api/testimonials', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();
      if (res.ok) {
        alert('Thank you! Your review has been submitted successfully.');
        setShowReviewModal(false);
        setReviewForm({ name: '', trip_type: 'Family Vacation', rating: 5, review_text: '' });
        fetchTestimonials();
      } else {
        alert(data.error || 'Failed to submit review.');
      }
    } catch (err) {
      console.error('Submit review error:', err);
      alert('An unexpected error occurred while submitting your review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const homepageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Kerala Travel Destinations',
    description: 'Popular Kerala destinations offered by Destin Vacations',
    numberOfItems: 11,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Munnar', url: `${SITE_URL}/destination?id=munnar` },
      { '@type': 'ListItem', position: 2, name: 'Alleppey', url: `${SITE_URL}/destination?id=alleppey` },
      { '@type': 'ListItem', position: 3, name: 'Wayanad', url: `${SITE_URL}/destination?id=wayanad` },
      { '@type': 'ListItem', position: 4, name: 'Ponmudi', url: `${SITE_URL}/destination?id=ponmudi` },
      { '@type': 'ListItem', position: 5, name: 'Peermade', url: `${SITE_URL}/destination?id=peermade` },
      { '@type': 'ListItem', position: 6, name: 'Vagamon', url: `${SITE_URL}/destination?id=vagamon` },
      { '@type': 'ListItem', position: 7, name: 'Vattavada', url: `${SITE_URL}/destination?id=vattavada` },
      { '@type': 'ListItem', position: 8, name: 'Cochin', url: `${SITE_URL}/destination?id=cochin` },
      { '@type': 'ListItem', position: 9, name: 'Thekkady', url: `${SITE_URL}/destination?id=thekkady` },
    ],
  };

  return (
    <>
      <Navbar />
      <main>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-slider" ref={sliderRef}>
          <div className="slide active" style={{ backgroundImage: "url('/assets/munnar.png')" }}></div>
          <div className="slide" style={{ backgroundImage: "url('/assets/wayanad.png')" }}></div>
          <div className="slide" style={{ backgroundImage: "url('/assets/kovalam.png')" }}></div>
          <div className="slide" style={{ backgroundImage: "url('/assets/cochin.png')" }}></div>
          <div className="slide" style={{ backgroundImage: "url('/assets/vagamon.png')" }}></div>
          <div className="slide" style={{ backgroundImage: "url('/assets/athirapally.png')" }}></div>
          <div className="slide" style={{ backgroundImage: "url('/assets/alleppey.png')" }}></div>
        </div>
        <div className="hero-content">
          <h1>Experience the Magic of Kerala</h1>
          <p>Your Trusted Kerala DMC - Discover Hills, Backwaters, and Beaches.</p>
          <div className="hero-buttons">
            <a href="/planner" className="btn btn-gold">Plan Your Trip</a>
          </div>
        </div>
      </section>

      {/* Categories Banner */}
      <div className="container">
        <div className="categories-banner">
          <div className="cat-grid">
            <div className="cat-item"><i className="fa-solid fa-mountain-sun"></i><span>Hills</span></div>
            <div className="cat-item"><i className="fa-solid fa-water"></i><span>Backwaters</span></div>
            <div className="cat-item"><i className="fa-solid fa-umbrella-beach"></i><span>Beaches</span></div>
            <div className="cat-item"><i className="fa-solid fa-hippo"></i><span>Wildlife</span></div>
          </div>
        </div>
      </div>

      {/* Destinations Section */}
      <section id="destinations" className="bg-light">
        <div className="container">
          <h2 className="section-title">Explore Kerala</h2>
          <p className="section-subtitle">Discover the most breathtaking destinations in God's Own Country, handpicked for your perfect holiday.</p>
          <div className="destinations-grid">
            <DestCard name="Munnar" image="/assets/munnar.png" desc="Where misty hills meet endless tea gardens." mustVisit="Eravikulam National Park, Echo Point, Mattupetty Dam, Top Station" id="munnar" />
            <DestCard name="Alleppey" image="/assets/alleppey.png" desc="Experience the serene backwaters on a houseboat." mustVisit="Vembanad Lake, Marari Beach, Pathiramanal Island" id="alleppey" />
            <DestCard name="Varkala Beach" image="/assets/kovalam.png" desc="Pristine beaches with majestic red cliffs." mustVisit="Varkala Cliff, Janardanaswamy Temple, Kappil Beach" id="varkala" disabled />
            <DestCard name="Wayanad" image="/assets/wayanad.png" desc="Pristine nature and beautiful waterfalls." mustVisit="Edakkal Caves, Chembra Peak, Banasura Sagar Dam" id="wayanad" />
            <DestCard name="Ponmudi" image="/assets/ponmudi.png" desc="The Golden Peak of Kerala." mustVisit="Peppara Wildlife Sanctuary, Tea Estates, Meenmutty Waterfalls" id="ponmudi" />
            <DestCard name="Peermade" image="/assets/peermade.png" desc="Vast tea and spice plantations." mustVisit="Coffee & Tea Plantations, Scenic Waterfalls, Pattumala Church" id="peermade" />
            {showAll && (
              <>
                <DestCard name="Vagamon" image="/assets/vagamon.png" desc="Rolling green meadows and misty hills." mustVisit="Vagamon Meadows, Pine Hill, Kurisumala" id="vagamon" />
                <DestCard name="Vattavada" image="/assets/vattavada.png" desc="Terraced vegetable fields and strawberry farms." mustVisit="Strawberry Farms, Pampadum Shola National Park, Top Station" id="vattavada" />
                <DestCard name="Cochin" image="/assets/cochin.png" desc="The Queen of the Arabian Sea." mustVisit="Fort Kochi, Chinese Fishing Nets, Mattancherry" id="cochin" />
                <DestCard name="Athirapally" image="/assets/athirapally.png" desc="The majestic Niagara of India." mustVisit="Athirapally Falls, Vazhachal Falls, Charpa Falls" id="athirapally" disabled />
                <DestCard name="Thekkady" image="/assets/thekkady.png" desc="Where Adventure Meets Serenity." mustVisit="Periyar Lake, Periyar Wildlife Sanctuary, Elephant Junction, Chellarkovil Viewpoint" id="thekkady" />
              </>
            )}
          </div>
          {!showAll && (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <button type="button" className="btn btn-outline" style={{ cursor: 'pointer', padding: '1rem 2rem', fontSize: '1rem', fontFamily: 'var(--font-heading)' }} onClick={() => setShowAll(true)}>
                View All Destinations
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" style={{ backgroundColor: '#0C2B1D' }}>
        <div className="container">
          <h2 className="section-title" style={{ color: 'white', textTransform: 'uppercase' }}>OUR PREMIUM <span style={{ color: '#92C944' }}>SERVICES</span></h2>
          <p className="section-subtitle" style={{ color: '#e0e0e0', maxWidth: '800px' }}>At Destin Vacation, we provide end-to-end destination management services across Kerala, delivering seamless, reliable, and professionally curated travel experiences.</p>
          <div className="services-grid">
            <ServiceCard icon="fa-solid fa-map-location-dot" title="Tour Packages" desc="Customized Kerala tour packages" />
            <ServiceCard icon="fa-solid fa-hotel" title="Hotels & Resorts" desc="Hotel & premium resort reservations" />
            <ServiceCard icon="fa-solid fa-ship" title="Houseboat Cruises" desc="Houseboat cruises and backwater experiences" />
            <ServiceCard icon="fa-solid fa-heart" title="Holiday Planning" desc="Honeymoon, leisure & family holiday planning" />
            <ServiceCard icon="fa-solid fa-users" title="MICE & Corporate" desc="Group tours, corporate travel & MICE services" />
            <ServiceCard icon="fa-solid fa-plane-arrival" title="Inbound Tours" desc="FIT & inbound tour handling" />
            <ServiceCard icon="fa-solid fa-car" title="Transportation" desc="Local transportation and sightseeing arrangements" />
            <ServiceCard icon="fa-solid fa-headset" title="Ground Handling" desc="Complete ground handling and on-site support" />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="bg-light">
        <div className="container">
          <h2 className="section-title">What our clients say about traveling with Destin Vacations</h2>
          <p className="section-subtitle">Explore their stories and see how Destin Vacations helps travelers explore Kerala with comfort and confidence. Your perfect vacation is our biggest win.</p>
          <div style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '-1.5rem' }}>
            <button className="btn btn-primary" style={{ cursor: 'pointer' }} onClick={() => setShowReviewModal(true)}>
              <i className="fa-solid fa-pen-to-square"></i> Submit a Review
            </button>
          </div>
          <div className="testimonials-slider">
            {testimonials.length === 0 && (
              <>
                <TestimonialCard name="Arjun Sharma" type="Family Vacation" rating={5} text="Destin Vacations made our Kerala trip absolutely unforgettable. The houseboat experience in Alleppey was breathtaking, and the entire itinerary was perfectly organized. Highly recommended for a stress-free vacation!" avatar="https://ui-avatars.com/api/?name=Arjun+Sharma&background=random" />
                <TestimonialCard name="Priya Patel" type="Honeymoon Trip" rating={4.8} text="We've booked several trips before, but none matched the flexibility and premium service of Destin Vacations. The Munnar resort they picked for our honeymoon was incredibly romantic. Destin Vacations just works—and works brilliantly." avatar="https://ui-avatars.com/api/?name=Priya+Patel&background=random" />
              </>
            )}
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} name={t.name} type={t.trip_type} rating={t.rating} text={t.review_text} images={t.images} avatar={`https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=random`} />
            ))}
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homepageJsonLd).replace(/</g, '\\u003c'),
        }}
      />

      {/* Floating WhatsApp */}
      <a href={`https://wa.me/${settings.whatsapp_number}`} className="floating-whatsapp" target="_blank" rel="noopener noreferrer" aria-label="Contact us on WhatsApp">
        <i className="fa-brands fa-whatsapp"></i>
      </a>

      {/* Submit Review Modal */}
      {showReviewModal && (
        <div className="modal-overlay active" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content" style={{ maxWidth: '550px', borderRadius: '16px', padding: '2rem' }} onClick={(e) => e.stopPropagation()}>
            <span className="close-modal" onClick={() => setShowReviewModal(false)}>&times;</span>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <i className="fa-solid fa-star" style={{ color: '#f59e0b', fontSize: '2rem', marginBottom: '0.5rem' }}></i>
              <h3 className="modal-title" style={{ margin: 0 }}>Share Your Experience</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.3rem 0 0' }}>Tell us about your Kerala trip with Destin Vacations!</p>
            </div>
            <form onSubmit={handleSubmitReview}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155' }}>Your Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Rahul Verma"
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155' }}>Trip Type</label>
                <select
                  className="form-control"
                  value={reviewForm.trip_type}
                  onChange={(e) => setReviewForm({ ...reviewForm, trip_type: e.target.value })}
                >
                  <option value="Family Vacation">👨‍👩‍👧 Family Vacation</option>
                  <option value="Honeymoon Trip">💑 Honeymoon Trip</option>
                  <option value="Solo Trip">🧍 Solo Trip</option>
                  <option value="Group Tour">👥 Group Tour</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155' }}>Rating</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: star <= reviewForm.rating ? '#f59e0b' : '#cbd5e1',
                        padding: 0,
                      }}
                    >
                      ★
                    </button>
                  ))}
                  <span style={{ fontSize: '0.9rem', color: '#64748b', alignSelf: 'center', marginLeft: '0.5rem', fontWeight: 600 }}>
                    {reviewForm.rating} / 5
                  </span>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155' }}>Your Review *</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Share details about your experience, resort stay, houseboats, driver, etc..."
                  value={reviewForm.review_text}
                  onChange={(e) => setReviewForm({ ...reviewForm, review_text: e.target.value })}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155' }}>Upload Photos / Videos (Optional)</label>
                <input
                  id="review_images"
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="form-control"
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.75rem' }} disabled={submittingReview}>
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </main>
      <Footer />
    </>
  );
}

function DestCard({ name, image, desc, mustVisit, id, disabled, hidden }: { name: string; image: string; desc: string; mustVisit: string; id: string; disabled?: boolean; hidden?: boolean }) {
  return (
    <div className={`dest-card ${hidden ? 'extra-dest' : ''}`} data-id={id} style={{ display: hidden ? 'none' : undefined, cursor: disabled ? 'default' : 'pointer' }}>
      <img src={image} alt={`${name} – Kerala travel destination`} className="dest-img" />
      <div className="dest-info">
        <h3>{name}</h3>
        <p>{desc}</p>
        <p style={{ fontSize: '0.8rem', marginBottom: '0.5rem', color: 'var(--light-color)' }}><strong>Must Visit:</strong> {mustVisit}</p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {!disabled && <a href={`/destination?id=${id}`} className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', flex: 1, textAlign: 'center' }}>View Details</a>}
          <a href="/planner" className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', flex: 1, textAlign: 'center' }}>Book Now</a>
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="service-card">
      <div className="service-icon"><i className={icon}></i></div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

function TestimonialCard({ name, type, rating, text, avatar, images }: { name: string; type: string; rating: number; text: string; avatar: string; images?: string[] }) {
  const isVideo = (url: string) => /\.(mp4|webm|mov|avi|mkv)$/i.test(url);

  return (
    <div className="testimonial-card">
      <i className="fa-solid fa-quote-left quote-icon"></i>
      <p className="testimonial-text">{text}</p>
      
      {/* Attached Media (Photos / Videos) */}
      {images && images.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', margin: '0.75rem 0', flexWrap: 'wrap' }}>
          {images.map((url, idx) => (
            isVideo(url) ? (
              <video key={idx} src={url} controls style={{ width: '100%', maxHeight: '160px', borderRadius: '8px', border: '1px solid #e2e8f0', objectFit: 'cover' }} />
            ) : (
              <img key={idx} src={url} alt="User review photo" style={{ width: '70px', height: '70px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
            )
          ))}
        </div>
      )}

      <div className="testimonial-footer">
        <div className="testimonial-user">
          <div className="user-avatar" style={{ backgroundImage: `url('${avatar}')` }}></div>
          <div className="user-info">
            <h4>{name}</h4>
            <span>{type}</span>
          </div>
        </div>
        <div className="testimonial-rating">
          <div className="stars">
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
            {rating >= 4.5 ? <i className="fa-solid fa-star-half-stroke"></i> : <i className="fa-solid fa-star"></i>}
          </div>
          <span className="rating-text">{rating} Ratings</span>
        </div>
      </div>
    </div>
  );
}
