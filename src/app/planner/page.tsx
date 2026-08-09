'use client';

import { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const destinations = [
  { val: 'Munnar', img: '/assets/munnar.png', title: 'Munnar', subtitle: 'Where misty hills meet endless tea gardens' },
  { val: 'Alleppey', img: '/assets/alleppey.png', title: 'Alleppey', subtitle: 'Sail through the enchanting backwaters of Kerala' },
  { val: 'Wayanad', img: '/assets/wayanad.png', title: 'Wayanad', subtitle: 'Where forests whisper and mountains touch the clouds' },
  { val: 'Varkala', img: '/assets/kovalam.png', title: 'Varkala Beach', subtitle: 'Pristine beaches with majestic red cliffs' },
  { val: 'Cochin', img: '/assets/cochin.png', title: 'Cochin', subtitle: 'Experience Heritage, Culture, and Modern Charm' },
  { val: 'Vagamon', img: '/assets/vagamon.png', title: 'Vagamon', subtitle: 'A peaceful escape into rolling meadows and misty valleys' },
  { val: 'Athirapally', img: '/assets/athirapally.png', title: 'Athirapally', subtitle: 'The majestic Niagara of India' },
  { val: 'Ponmudi', img: '/assets/ponmudi.png', title: 'Ponmudi', subtitle: 'The Golden Peak of Kerala' },
  { val: 'Peermade', img: '/assets/peermade.png', title: 'Peermade', subtitle: 'Vast tea and spice plantations' },
  { val: 'Vattavada', img: '/assets/vattavada.png', title: 'Vattavada', subtitle: 'Experience the Beauty of Endless Valleys and Fresh Harvests' },
  { val: 'Thekkady', img: '/assets/thekkady.png', title: 'Thekkady', subtitle: 'Where Adventure Meets Serenity' },
];

export default function Planner() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDests, setSelectedDests] = useState<string[]>([]);
  const [form, setForm] = useState({
    start_date: '',
    duration: '',
    custom_nights: '',
    custom_days: '',
    adults: 2,
    children: 0,
    travel_type: 'Couple',
    food_pref: 'Any',
    requests: '',
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    pickup: '',
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dest = params.get('dest');
    if (dest) {
      const matched = destinations.find(d => d.val.toLowerCase() === dest.toLowerCase());
      if (matched && !selectedDests.includes(matched.val)) {
        setSelectedDests([matched.val]);
      }
    }
  }, []);

  const toggleDest = (val: string) => {
    setSelectedDests(prev => prev.includes(val) ? prev.filter(d => d !== val) : [...prev, val]);
  };

  const next = () => {
    if (currentStep === 1 && selectedDests.length === 0) {
      alert('Please select at least one destination!');
      return;
    }
    if (currentStep === 5) {
      const { name, phone, whatsapp, email, pickup } = form;
      if (!name || !phone || !whatsapp || !email || !pickup) {
        alert('Please fill in all contact and pickup details before proceeding.');
        return;
      }
    }
    setCurrentStep(s => Math.min(s + 1, 6));
    window.scrollTo(0, 0);
  };

  const prev = () => {
    setCurrentStep(s => Math.max(s - 1, 1));
    window.scrollTo(0, 0);
  };

  const submit = async () => {
    const tripData = {
      customer_name: form.name,
      customer_phone: form.phone,
      customer_whatsapp: form.whatsapp,
      customer_email: form.email,
      customer_address: '',
      pickup_location: form.pickup,
      destinations: selectedDests,
      start_date: form.start_date,
      duration: form.duration === 'Custom' ? `${form.custom_nights} Nights / ${form.custom_days} Days` : form.duration,
      adults: form.adults,
      children: form.children,
      travel_type: form.travel_type,
      food_pref: form.food_pref,
      special_requests: form.requests,
      budget_range: 'Not specified',
      package_type: 'Not specified',
      hotel_category: 'Not specified',
      transport: 'Not specified',
      activities: [],
      estimated_price: 0,
    };

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const res = await fetch('/api/trips', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(tripData),
    });

    if (res.ok) {
      alert('Success! Your incredible Kerala trip request has been submitted. Our team will contact you shortly with a quotation.');
      window.location.href = '/';
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to submit plan');
    }
  };


  return (
    <>
      <Navbar />
      <div className="container" style={{ paddingTop: '100px', paddingBottom: '4rem' }}>
        <div className="planner-container">
          <div className="progress-container">
            <div className="step-indicator">Step <span id="currentStepNum">{currentStep}</span> of 6</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(currentStep / 6) * 100}%` }}></div>
            </div>
          </div>

          {/* Step 1 */}
          {currentStep === 1 && (
            <div className="step-content active">
              <h2 className="step-title">Where do you want to go?</h2>
              <p className="step-subtitle">Select one or more destinations you&apos;d like to include.</p>
              <div className="selection-grid dest-selector">
                {destinations.map(d => (
                  <div
                    key={d.val}
                    className={`select-card has-bg ${selectedDests.includes(d.val) ? 'selected' : ''}`}
                    data-val={d.val}
                    style={{ backgroundImage: `url('${d.img}')` }}
                    onClick={() => toggleDest(d.val)}
                  >
                    <h3>{d.title}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <div className="step-content active">
              <h2 className="step-title">When are you traveling?</h2>
              <p className="step-subtitle">Let us know your dates and how long you want to stay.</p>
              <div className="grid-2">
                <div className="form-group">
                  <label>Arrival Date</label>
                  <input type="date" className="form-control" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <select className="form-control" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} required>
                    <option value="">Select Duration</option>
                    <option value="3N/4D">3 Nights / 4 Days</option>
                    <option value="4N/5D">4 Nights / 5 Days</option>
                    <option value="5N/6D">5 Nights / 6 Days</option>
                    <option value="6N/7D">6 Nights / 7 Days</option>
                    <option value="7N/8D">7 Nights / 8 Days</option>
                    <option value="Custom">Custom / More than 8 Days</option>
                  </select>
                </div>
                {form.duration === 'Custom' && (
                  <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                    <label>Specify Custom Duration</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <input type="number" className="form-control" placeholder="No. of Nights" min="1" value={form.custom_nights} onChange={e => setForm({ ...form, custom_nights: e.target.value })} />
                      <input type="number" className="form-control" placeholder="No. of Days" min="1" value={form.custom_days} onChange={e => setForm({ ...form, custom_days: e.target.value })} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <div className="step-content active">
              <h2 className="step-title">Who is traveling?</h2>
              <p className="step-subtitle">Tell us about your group size and type.</p>
              <div className="grid-2">
                <div className="form-group">
                  <label>Adults (12+ yrs)</label>
                  <input type="number" className="form-control" min="1" value={form.adults} onChange={e => setForm({ ...form, adults: parseInt(e.target.value) })} required />
                </div>
                <div className="form-group">
                  <label>Children (0-11 yrs)</label>
                  <input type="number" className="form-control" min="0" value={form.children} onChange={e => setForm({ ...form, children: parseInt(e.target.value) })} />
                </div>
              </div>
              <h3 style={{ marginTop: '2rem', marginBottom: '1rem', textAlign: 'center' }}>Travel Type</h3>
              <div className="selection-grid type-selector single-select">
                {['Solo', 'Couple', 'Family', 'Group'].map(type => (
                  <div key={type} className={`select-card ${form.travel_type === type ? 'selected' : ''}`} onClick={() => setForm({ ...form, travel_type: type })}>
                    <i className={`fa-solid ${type === 'Solo' ? 'fa-person' : type === 'Couple' ? 'fa-user-group' : type === 'Family' ? 'fa-children' : 'fa-users'}`}></i>
                    <h3>{type}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 */}
          {currentStep === 4 && (
            <div className="step-content active">
              <h2 className="step-title">Food & Preferences</h2>
              <p className="step-subtitle">Let us know your culinary preferences and any special requests.</p>
              <div className="form-group" style={{ marginTop: '2rem' }}>
                <label>Food Preference</label>
                <select className="form-control" value={form.food_pref} onChange={e => setForm({ ...form, food_pref: e.target.value })}>
                  <option value="Any">Any / Both</option>
                  <option value="Pure Veg">Pure Vegetarian</option>
                  <option value="Non Veg">Non-Vegetarian preferred</option>
                  <option value="Seafood">Seafood preferred</option>
                </select>
              </div>
              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label>Special Requests (Optional)</label>
                <textarea className="form-control" rows={4} placeholder="E.g., Honeymoon bed decoration, wheelchair accessible, specific dietary restrictions, etc." value={form.requests} onChange={e => setForm({ ...form, requests: e.target.value })}></textarea>
              </div>
            </div>
          )}

          {/* Step 5 */}
          {currentStep === 5 && (
            <div className="step-content active">
              <h2 className="step-title">Contact & Pickup Details</h2>
              <p className="step-subtitle">Please provide your contact information and pickup location so we can arrange your trip smoothly.</p>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Full Name *</label>
                <input type="text" className="form-control" placeholder="Enter your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input type="tel" className="form-control" placeholder="Enter your phone number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>WhatsApp Number *</label>
                  <input type="tel" className="form-control" placeholder="Enter your WhatsApp number" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} required />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label>Email Address *</label>
                <input type="email" className="form-control" placeholder="Enter your email address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label>Pickup Location / Near Point *</label>
                <textarea className="form-control" rows={5} placeholder="Please mention the nearest landmark, station, or airport where we should pick you up..." value={form.pickup} onChange={e => setForm({ ...form, pickup: e.target.value })} required></textarea>
              </div>
            </div>
          )}

          {/* Step 6 */}
          {currentStep === 6 && (
            <div className="step-content active">
              <h2 className="step-title">Final Summary</h2>
              <p className="step-subtitle">Review your custom package request before submitting.</p>
              <div style={{ background: '#f9f9f9', padding: '2rem', borderRadius: '12px', marginBottom: '2rem' }}>
                <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '1rem', marginBottom: '1rem' }}>Request Details</h3>
                <Summary label="Full Name" value={form.name} />
                <Summary label="Destinations" value={selectedDests.join(', ')} />
                <Summary label="Duration" value={form.duration === 'Custom' ? `${form.custom_nights} Nights / ${form.custom_days} Days` : form.duration} />
                <Summary label="Travelers" value={`${form.adults} Adults, ${form.children} Children (${form.travel_type})`} />
                <Summary label="Food Preference" value={form.food_pref} />
                <Summary label="Contact Email" value={form.email} />
                <Summary label="Phone / WhatsApp" value={`${form.phone} / ${form.whatsapp}`} />
                <Summary label="Pickup Location" value={form.pickup} />
              </div>
              <p style={{ textAlign: 'center', fontSize: '1rem', color: 'var(--text-dark)', marginBottom: '1rem', fontWeight: 600 }}>No payment required now!</p>
              <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>By clicking &quot;Submit Booking Request&quot;, our travel experts will verify availability, calculate the best price, and contact you with a customized itinerary and payment link.</p>
            </div>
          )}

          <div className="step-nav" style={{ padding: '0 3rem 3rem 3rem' }}>
            <button type="button" className="btn btn-outline" onClick={prev} style={{ display: currentStep === 1 ? 'none' : 'inline-block' }}>Back</button>
            <div style={{ flexGrow: 1 }}></div>
            {currentStep < 6 ? (
              <button type="button" className="btn btn-primary" onClick={next}>Continue to Step {currentStep + 1} <i className="fa-solid fa-arrow-right"></i></button>
            ) : (
              <button type="button" className="btn btn-gold" onClick={submit}>Submit Booking Request <i className="fa-solid fa-check"></i></button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', borderBottom: '1px dashed #eee', paddingBottom: '0.5rem' }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      <span style={{ textAlign: 'right', maxWidth: '60%', wordWrap: 'break-word' }}>{value}</span>
    </div>
  );
}
