'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';

type Trip = {
  id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  user_whatsapp: string;
  pickup_location: string;
  destinations: string;
  duration: string;
  adults: number;
  children: number;
  travel_type: string;
  estimated_price: number;
  status: string;
  payment_status: string;
  created_at: string;
  start_date?: string;
  food_pref?: string;
  special_requests?: string;
};

type Testimonial = {
  id: string;
  name: string;
  trip_type: string;
  rating: number;
  review_text: string;
  status: string;
  images?: string[];
  created_at: string;
};

type Settings = {
  whatsapp_number: string;
  email_user: string;
  email_from_name: string;
  admin_notification_email?: string;
};

const TRAVEL_TYPE_COLORS: Record<string, string> = {
  Solo:   '#6c63ff',
  Couple: '#e91e8c',
  Family: '#00b894',
  Group:  '#f39c12',
};

export default function Admin() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [settings, setSettings] = useState<Settings>({ whatsapp_number: '919526886600', email_user: '', email_from_name: 'Destin Vacations' });
  const [stats, setStats] = useState({ totalBookings: 0, totalRevenue: 0, pendingApprovals: 0, upcomingTrips: 0 });

  // Filters
  const [filterDest, setFilterDest] = useState('');
  const [filterTravelType, setFilterTravelType] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('');

  const [showAddTrip, setShowAddTrip] = useState(false);
  const [showChangeCred, setShowChangeCred] = useState(false);
  const [showAdminCredPassword, setShowAdminCredPassword] = useState(false);
  const [credMode, setCredMode] = useState<'direct' | 'otp'>('direct');
  const [adminOtpStep, setAdminOtpStep] = useState<1 | 2 | 3>(1);
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminOtpCode, setAdminOtpCode] = useState('');
  const [adminOtpNewPassword, setAdminOtpNewPassword] = useState('');
  const [adminOtpConfirmPassword, setAdminOtpConfirmPassword] = useState('');
  const [adminOtpLoading, setAdminOtpLoading] = useState(false);
  const [adminOtpError, setAdminOtpError] = useState('');
  const [adminOtpSuccess, setAdminOtpSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'trips' | 'testimonials' | 'settings'>('trips');
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  const [mounted, setMounted] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};

  useEffect(() => {
    setMounted(true);
    if (!token || user.role !== 'admin') {
      window.location.href = '/login';
      return;
    }
    if (user?.email) setAdminEmailInput(user.email);
    fetchTrips();
    fetchTestimonials();
    fetchSettings();
    fetchStats();
  }, []);

  const fetchTrips = async () => {
    const res = await fetch('/api/admin/trips', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setTrips(await res.json());
  };

  const fetchTestimonials = async () => {
    const res = await fetch('/api/admin/testimonials', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setTestimonials(await res.json());
  };

  const fetchSettings = async () => {
    const res = await fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setSettings(data);
    }
  };

  const fetchStats = async () => {
    const res = await fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setStats(await res.json());
  };

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string) => {
    let reason = '';
    if (status === 'Rejected') {
      const input = prompt('Please enter the reason for rejection (optional):');
      if (input === null) return;
      reason = input;
    }
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/trips/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, reason }),
      });
      if (res.ok) {
        alert(`Trip status updated to "${status}"! Confirmation email sent to customer.`);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update trip status.');
      }
      fetchTrips();
      fetchStats();
    } catch {
      alert('Network error while updating trip status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteTrip = async (id: string) => {
    if (!confirm('Delete this trip?')) return;
    await fetch(`/api/admin/trips/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchTrips();
    fetchStats();
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) fetchTestimonials();
    else alert('Failed to delete testimonial.');
  };

  const updateTestimonialStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/testimonials/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    if (res.ok) fetchTestimonials();
    else alert('Failed to update status.');
  };

  const saveEditTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial) return;
    const res = await fetch(`/api/admin/testimonials/${editingTestimonial.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: editingTestimonial.name,
        trip_type: editingTestimonial.trip_type,
        rating: Number(editingTestimonial.rating),
        review_text: editingTestimonial.review_text,
        status: editingTestimonial.status,
      }),
    });
    if (res.ok) {
      alert('Testimonial updated successfully!');
      setEditingTestimonial(null);
      fetchTestimonials();
    } else {
      const d = await res.json();
      alert(d.error || 'Failed to update.');
    }
  };

  // ─── Settings & Security Handlers ─────────────────────────────────────────

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(settings),
    });
    alert('Settings saved!');
  };

  const saveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const currentPassword = (form.elements.namedItem('currentPassword') as HTMLInputElement).value;
    const newEmail = (form.elements.namedItem('newEmail') as HTMLInputElement).value;
    const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value;
    const res = await fetch('/api/admin/change-credentials', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword, newEmail, newPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      alert('Credentials updated!');
      setShowChangeCred(false);
    } else {
      alert(data.error || 'Failed to update credentials');
    }
  };

  const handleSendAdminOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminOtpError('');
    setAdminOtpSuccess('');
    if (!adminEmailInput.trim()) {
      setAdminOtpError('Please enter a valid email address.');
      return;
    }
    setAdminOtpLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmailInput.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setAdminOtpStep(2);
        setAdminOtpSuccess(`OTP code sent to ${adminEmailInput.trim()}. Check your inbox.`);
      } else {
        setAdminOtpError(data.error || 'Failed to send OTP email.');
      }
    } catch {
      setAdminOtpError('Error sending OTP email.');
    } finally {
      setAdminOtpLoading(false);
    }
  };

  const handleVerifyAdminOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminOtpError('');
    setAdminOtpSuccess('');
    if (adminOtpCode.trim().length < 6) {
      setAdminOtpError('Please enter all 6 digits of the OTP code.');
      return;
    }
    setAdminOtpLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmailInput.trim(), otp: adminOtpCode.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setAdminOtpStep(3);
        setAdminOtpSuccess('OTP verified successfully! Set your new password below.');
      } else {
        setAdminOtpError(data.error || 'Invalid or expired OTP code.');
      }
    } catch {
      setAdminOtpError('Error verifying OTP code.');
    } finally {
      setAdminOtpLoading(false);
    }
  };

  const handleResetAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminOtpError('');
    setAdminOtpSuccess('');
    if (adminOtpNewPassword.length < 6) {
      setAdminOtpError('Password must be at least 6 characters.');
      return;
    }
    if (adminOtpNewPassword !== adminOtpConfirmPassword) {
      setAdminOtpError('Passwords do not match.');
      return;
    }
    setAdminOtpLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmailInput.trim(), otp: adminOtpCode.trim(), newPassword: adminOtpNewPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Password reset successfully via OTP! Please log in with your new password.');
        setShowChangeCred(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        setAdminOtpError(data.error || 'Failed to reset password.');
      }
    } catch {
      setAdminOtpError('Error resetting password.');
    } finally {
      setAdminOtpLoading(false);
    }
  };

  // ─── Filtering ───────────────────────────────────────────────────────────────
  const filteredTrips = (trips || []).filter(t => {
    const q = filterDest.trim().toLowerCase();
    const searchMatch = !q ||
      (t.destinations || '').toLowerCase().includes(q) ||
      (t.user_name || '').toLowerCase().includes(q) ||
      (t.user_email || '').toLowerCase().includes(q) ||
      (t.user_phone || '').toLowerCase().includes(q) ||
      (t.user_whatsapp || '').toLowerCase().includes(q) ||
      (t.pickup_location || '').toLowerCase().includes(q);

    const typeMatch = !filterTravelType || (t.travel_type || '').trim().toLowerCase() === filterTravelType.trim().toLowerCase();
    const statusMatch = !filterStatus || (t.status || '').trim().toLowerCase() === filterStatus.trim().toLowerCase();
    const paymentMatch = !filterPaymentStatus || (t.payment_status || '').trim().toLowerCase() === filterPaymentStatus.trim().toLowerCase();

    // Date filtering: filter by start date or booking date between filterDateFrom & filterDateTo
    const dateStr = t.start_date ? t.start_date.slice(0, 10) : (t.created_at ? t.created_at.slice(0, 10) : '');

    const fromMatch = !filterDateFrom || (dateStr !== '' && dateStr >= filterDateFrom);
    const toMatch = !filterDateTo || (dateStr !== '' && dateStr <= filterDateTo);

    return searchMatch && typeMatch && statusMatch && paymentMatch && fromMatch && toMatch;
  });

  // ─── Export to Excel (shared helper) ────────────────────────────────────────
  const buildExcelFile = async (sourceTrips: Trip[], fileLabel: string, summaryLabel: string) => {
    const XLSX = await import('xlsx');

    if (sourceTrips.length === 0) {
      alert('No records to export for the selected range.');
      return;
    }

    // ── Data rows ──
    const rows = sourceTrips.map(t => ({
      'Customer Name':      t.user_name,
      'Email':              t.user_email,
      'Phone':              t.user_phone,
      'WhatsApp':           t.user_whatsapp,
      'Destinations':       t.destinations,
      'Duration':           t.duration,
      'Start Date':         t.start_date ? new Date(t.start_date).toLocaleDateString('en-IN') : '',
      'Adults':             t.adults,
      'Children':           t.children,
      'Travel Type':        t.travel_type,
      'Pickup Location':    t.pickup_location,
      'Food Preference':    t.food_pref || '',
      'Special Requests':   t.special_requests || '',
      'Approval Status':    t.status,
      'Payment Status':     t.payment_status,
      'Estimated Price (₹)': t.estimated_price > 0 ? t.estimated_price : '',
      'Booked On':          new Date(t.created_at).toLocaleDateString('en-IN'),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const colWidths = Object.keys(rows[0] || {}).map(key => ({
      wch: Math.max(key.length + 2, ...rows.map(r => String((r as Record<string, unknown>)[key] ?? '').length + 2))
    }));
    ws['!cols'] = colWidths;

    // ── Summary sheet ──
    const totalCount    = sourceTrips.length;
    const approvedCount = sourceTrips.filter(t => t.status === 'Approved').length;
    const pendingCount  = sourceTrips.filter(t => t.status === 'Pending').length;
    const rejectedCount = sourceTrips.filter(t => t.status === 'Rejected').length;
    const paidCount     = sourceTrips.filter(t => t.payment_status === 'Paid').length;
    const totalRevenue  = sourceTrips.reduce((sum, t) => sum + (t.estimated_price || 0), 0);

    const summaryRows = [
      { 'Metric': 'Export Date',                  'Value': new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) },
      { 'Metric': 'Records Exported',             'Value': summaryLabel },
      { 'Metric': '',                              'Value': '' },
      { 'Metric': '--- Booking Stats ---',         'Value': '' },
      { 'Metric': 'Total Bookings',                'Value': totalCount },
      { 'Metric': 'Approved',                      'Value': approvedCount },
      { 'Metric': 'Pending',                       'Value': pendingCount },
      { 'Metric': 'Rejected',                      'Value': rejectedCount },
      { 'Metric': '',                              'Value': '' },
      { 'Metric': '--- Revenue ---',               'Value': '' },
      { 'Metric': 'Total Estimated Revenue (₹)',   'Value': totalRevenue.toLocaleString('en-IN') },
      { 'Metric': 'Paid Bookings',                 'Value': paidCount },
      { 'Metric': '',                              'Value': '' },
      { 'Metric': '--- By Travel Type ---',        'Value': '' },
      ...['Solo', 'Couple', 'Family', 'Group'].map(type => ({
        'Metric': type,
        'Value': sourceTrips.filter(t => (t.travel_type || '').toLowerCase() === type.toLowerCase()).length,
      })),
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    wsSummary['!cols'] = [{ wch: 34 }, { wch: 28 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Trip Bookings');
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
    XLSX.writeFile(wb, `destin-trips_${fileLabel}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // ── Export: current filtered view ──
  const exportToExcel = () => {
    const hasDateFilter = Boolean(filterDateFrom || filterDateTo);
    const label = hasDateFilter
      ? `trips_${filterDateFrom || 'start'}_to_${filterDateTo || 'today'}`
      : 'filtered_trips';
    const summaryLabel = hasDateFilter
      ? `Start Date: ${filterDateFrom || 'Start'} → End Date: ${filterDateTo || 'Today'}`
      : 'All filtered trips';
    buildExcelFile(filteredTrips, label, summaryLabel);
  };

  // ── Export: all trips (no filter) ──
  const exportAllToExcel = () => {
    buildExcelFile(trips, 'all_trips', 'All Trips List');
  };

  const clearFilters = () => {
    setFilterDest('');
    setFilterTravelType('');
    setFilterStatus('');
    setFilterPaymentStatus('');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  return (
    <>
      <Navbar />
      <div className="admin-nav" style={{ padding: '0.85rem 2rem', background: '#173d32', borderBottom: '3px solid #92C944', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'white' }}>
          <img src="/assets/logo.png" alt="Destin Vacations" style={{ height: '32px', objectFit: 'contain' }} />
          <span>Admin Portal</span>
        </div>
      </div>

      <div className="dashboard-container">
        {/* Dashboard Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', background: '#ffffff', padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b', fontWeight: 700 }}>Dashboard Overview</h2>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Logged in as: <strong style={{ color: '#1e293b' }} suppressHydrationWarning>{mounted ? (user.email || 'Admin') : 'Admin'}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              onClick={() => setShowChangeCred(true)}
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <i className="fa-solid fa-key" style={{ color: '#6366f1' }}></i> Change Password
            </button>
            <button
              onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login'; }}
              style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <i className="fa-solid fa-right-from-bracket"></i> Logout
            </button>
          </div>
        </div>
        <div className="stats-grid">
          <div className="stat-card"><h3>Total Bookings</h3><div className="value">{stats.totalBookings}</div></div>
          <div className="stat-card"><h3>Pending Approvals</h3><div className="value">{stats.pendingApprovals}</div></div>
          <div className="stat-card"><h3>Upcoming Trips</h3><div className="value">{stats.upcomingTrips}</div></div>
        </div>

        <div className="card" style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <button className={`btn ${activeTab === 'trips' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('trips')}>Trips</button>
            <button className={`btn ${activeTab === 'testimonials' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('testimonials')}>Testimonials</button>
            <button className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('settings')}>Settings</button>
          </div>

          {activeTab === 'trips' && (
            <>
              {/* Header Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ margin: 0 }}>
                  Planned Trips{' '}
                  <span style={{ fontWeight: 400, fontSize: '0.9rem', color: '#888' }}>({filteredTrips.length} shown / {trips.length} total)</span>
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Export Filtered */}
                  <button
                    onClick={exportToExcel}
                    title="Export currently filtered trips to Excel"
                    style={{ background: '#1D6F42', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem' }}
                  >
                    <i className="fa-solid fa-file-excel"></i> Export Filtered ({filteredTrips.length})
                  </button>
                  {/* Export All */}
                  <button
                    onClick={exportAllToExcel}
                    title="Export ALL trips in Excel format"
                    style={{ background: '#0f4c75', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem' }}
                  >
                    <i className="fa-solid fa-file-excel"></i> Export All ({trips.length})
                  </button>
                  <button className="btn btn-primary" style={{ padding: '0.5rem 1.2rem' }} onClick={() => setShowAddTrip(true)}>
                    <i className="fa-solid fa-plane-departure"></i> Add New Trip
                  </button>
                </div>
              </div>

              {/* Filter Bar */}
              <div style={{ background: '#f7f9fc', border: '1px solid #e8ecf0', borderRadius: '10px', padding: '1rem', marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <i className="fa-solid fa-filter" style={{ color: '#173d32' }}></i>
                  <strong style={{ fontSize: '0.9rem' }}>Filters</strong>
                  <button onClick={clearFilters} style={{ marginLeft: 'auto', background: 'none', border: '1px solid #ccc', padding: '0.2rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', color: '#666' }}>
                    Clear All
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>Search</label>
                    <input
                      type="text"
                      placeholder="Name, Destination, Phone, Email..."
                      value={filterDest}
                      onChange={e => setFilterDest(e.target.value)}
                      style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #ddd', borderRadius: '5px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>Travel Type</label>
                    <select
                      value={filterTravelType}
                      onChange={e => setFilterTravelType(e.target.value)}
                      style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #ddd', borderRadius: '5px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    >
                      <option value="">All Types</option>
                      <option value="Solo">🧍 Solo</option>
                      <option value="Couple">💑 Couple</option>
                      <option value="Family">👨‍👩‍👧 Family</option>
                      <option value="Group">👥 Group</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>Approval Status</label>
                    <select
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value)}
                      style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #ddd', borderRadius: '5px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    >
                      <option value="">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>Payment Status</label>
                    <select
                      value={filterPaymentStatus}
                      onChange={e => setFilterPaymentStatus(e.target.value)}
                      style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #ddd', borderRadius: '5px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                    >
                      <option value="">All Payment</option>
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>📅 Start Date</label>
                    <input
                      type="date"
                      value={filterDateFrom}
                      onChange={e => setFilterDateFrom(e.target.value)}
                      style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #86efac', borderRadius: '5px', fontSize: '0.85rem', boxSizing: 'border-box', background: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>📅 End Date</label>
                    <input
                      type="date"
                      value={filterDateTo}
                      onChange={e => setFilterDateTo(e.target.value)}
                      style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #86efac', borderRadius: '5px', fontSize: '0.85rem', boxSizing: 'border-box', background: '#fff' }}
                    />
                  </div>
                </div>

                {/* Active filter pills */}
                {(filterTravelType || filterStatus || filterPaymentStatus || filterDateFrom || filterDateTo || filterDest) && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
                    {filterDest && <span style={{ background: '#e3eaff', color: '#3355cc', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem' }}>🔍 &quot;{filterDest}&quot;</span>}
                    {filterTravelType && <span style={{ background: (TRAVEL_TYPE_COLORS[filterTravelType] || '#999') + '22', color: TRAVEL_TYPE_COLORS[filterTravelType] || '#555', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 }}>👥 {filterTravelType}</span>}
                    {filterStatus && <span style={{ background: '#f0f0f0', color: '#555', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem' }}>📋 Status: {filterStatus}</span>}
                    {filterPaymentStatus && <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem' }}>💳 Payment: {filterPaymentStatus}</span>}
                    {(filterDateFrom || filterDateTo) && (
                      <span style={{ background: '#fff3e0', color: '#e65100', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem' }}>
                        📅 Date: {filterDateFrom || 'Start'} → {filterDateTo || 'End'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Travel Type Subsections */}
              {(() => {
                const groupedTrips: { type: string; title: string; icon: string; color: string; list: Trip[] }[] = [
                  { type: 'Solo', title: 'Solo Travel Trips', icon: '🧍', color: '#6c63ff', list: filteredTrips.filter(t => (t.travel_type || '').trim().toLowerCase() === 'solo') },
                  { type: 'Couple', title: 'Couple Travel Trips', icon: '💑', color: '#e91e8c', list: filteredTrips.filter(t => (t.travel_type || '').trim().toLowerCase() === 'couple') },
                  { type: 'Family', title: 'Family Travel Trips', icon: '👨‍👩‍👧', color: '#00b894', list: filteredTrips.filter(t => (t.travel_type || '').trim().toLowerCase() === 'family') },
                  { type: 'Group', title: 'Group Travel Trips', icon: '👥', color: '#f39c12', list: filteredTrips.filter(t => (t.travel_type || '').trim().toLowerCase() === 'group') },
                ];

                const otherTripsList = filteredTrips.filter(t => !['solo', 'couple', 'family', 'group'].includes((t.travel_type || '').trim().toLowerCase()));
                if (otherTripsList.length > 0) {
                  groupedTrips.push({ type: 'Other', title: 'Other Travel Trips', icon: '🧳', color: '#64748b', list: otherTripsList });
                }

                const activeSubsections = groupedTrips.filter(g => {
                  // If a travel type filter is set, show only that category
                  if (filterTravelType) return g.type.toLowerCase() === filterTravelType.toLowerCase();
                  // Otherwise, only show categories that have trips (hide empty subsections)
                  return g.list.length > 0;
                });

                if (filteredTrips.length === 0) {
                  return (
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                      <i className="fa-solid fa-plane-slash" style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#cbd5e1' }}></i>
                      <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>No trips match the current filters.</p>
                      {(filterDest || filterTravelType || filterStatus || filterPaymentStatus || filterDateFrom || filterDateTo) && (
                        <button onClick={clearFilters} style={{ marginTop: '1rem', background: '#173d32', color: 'white', border: 'none', borderRadius: '6px', padding: '0.4rem 1rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                          Clear Filters
                        </button>
                      )}
                    </div>
                  );
                }

                return activeSubsections.map(g => (
                  <div key={g.type} style={{ marginBottom: '2rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    {/* Subsection Header */}
                    <div style={{
                      background: `linear-gradient(135deg, ${g.color}15 0%, #ffffff 100%)`,
                      borderBottom: `2px solid ${g.color}`,
                      padding: '0.85rem 1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontSize: '1.3rem' }}>{g.icon}</span>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#1e293b', fontWeight: 700 }}>{g.title}</h4>
                        <span style={{
                          background: g.color,
                          color: '#ffffff',
                          padding: '0.15rem 0.6rem',
                          borderRadius: '20px',
                          fontSize: '0.78rem',
                          fontWeight: 700
                        }}>
                          {g.list.length} {g.list.length === 1 ? 'trip' : 'trips'}
                        </span>
                      </div>
                    </div>

                    {/* Subsection Content */}
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ margin: 0, border: 'none' }}>
                          <thead>
                            <tr style={{ background: '#f8fafc' }}>
                              <th>Customer</th>
                              <th>Destinations</th>
                              <th>Pickup Location</th>
                              <th>Duration</th>
                              <th>Travelers</th>
                              <th>Start Date</th>
                              <th>Status</th>
                              <th>Payment</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {g.list.map(t => (
                              <tr key={t.id}>
                                <td>
                                  <strong>{t.user_name}</strong>
                                  <br /><small style={{ color: '#64748b' }}>{t.user_email}</small>
                                  {t.user_phone && <><br /><small style={{ color: '#64748b' }}>📞 {t.user_phone}</small></>}
                                  {t.user_whatsapp && <><br /><small style={{ color: '#25D366' }}>💬 {t.user_whatsapp}</small></>}
                                </td>
                                <td>
                                  <strong>{t.destinations}</strong>
                                  {t.special_requests && (
                                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem', fontStyle: 'italic' }}>
                                      &quot;{t.special_requests}&quot;
                                    </div>
                                  )}
                                </td>
                                <td>{t.pickup_location || '—'}</td>
                                <td>{t.duration}</td>
                                <td style={{ whiteSpace: 'nowrap' }}>
                                  {t.adults} Adult{t.adults !== 1 ? 's' : ''}
                                  {t.children > 0 ? ` + ${t.children} Child${t.children !== 1 ? 'ren' : ''}` : ''}
                                  {t.food_pref && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>🥗 {t.food_pref}</div>}
                                </td>
                                <td style={{ whiteSpace: 'nowrap' }}>
                                  {t.start_date ? new Date(t.start_date).toLocaleDateString('en-IN') : '—'}
                                </td>
                                <td>
                                  <span style={{
                                    padding: '0.25rem 0.65rem',
                                    borderRadius: '6px',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    background: t.status === 'Approved' ? '#dcfce7' : t.status === 'Rejected' ? '#fee2e2' : '#fef9c3',
                                    color: t.status === 'Approved' ? '#15803d' : t.status === 'Rejected' ? '#b91c1c' : '#a16207',
                                  }}>
                                    {t.status}
                                  </span>
                                </td>
                                <td>
                                  <span style={{
                                    padding: '0.25rem 0.65rem',
                                    borderRadius: '6px',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    background: t.payment_status === 'Paid' ? '#dcfce7' : '#fef9c3',
                                    color: t.payment_status === 'Paid' ? '#15803d' : '#a16207',
                                  }}>
                                    {t.payment_status}
                                  </span>
                                  {t.estimated_price > 0 && <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1e293b', marginTop: '0.2rem' }}>₹{t.estimated_price.toLocaleString('en-IN')}</div>}
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'nowrap' }}>
                                    {t.status !== 'Approved' && (
                                      <button
                                        className="action-btn btn-approve"
                                        disabled={updatingId === t.id}
                                        onClick={() => updateStatus(t.id, 'Approved')}
                                        style={{ opacity: updatingId === t.id ? 0.7 : 1, cursor: updatingId === t.id ? 'not-allowed' : 'pointer' }}
                                      >
                                        {updatingId === t.id ? 'Approving...' : '✓ Approve'}
                                      </button>
                                    )}
                                    {t.status !== 'Rejected' && (
                                      <button
                                        className="action-btn btn-reject"
                                        disabled={updatingId === t.id}
                                        onClick={() => updateStatus(t.id, 'Rejected')}
                                        style={{ opacity: updatingId === t.id ? 0.7 : 1, cursor: updatingId === t.id ? 'not-allowed' : 'pointer' }}
                                      >
                                        {updatingId === t.id ? 'Updating...' : '✗ Reject'}
                                      </button>
                                    )}
                                    {t.status === 'Approved' && (
                                      <button
                                        className="action-btn"
                                        disabled={updatingId === t.id}
                                        onClick={() => updateStatus(t.id, 'Pending')}
                                        style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', opacity: updatingId === t.id ? 0.7 : 1, cursor: updatingId === t.id ? 'not-allowed' : 'pointer' }}
                                      >
                                        {updatingId === t.id ? 'Updating...' : '⟳ Pending'}
                                      </button>
                                    )}
                                    <button
                                      className="action-btn btn-reject"
                                      disabled={updatingId === t.id}
                                      onClick={() => deleteTrip(t.id)}
                                      style={{ background: '#ef4444', color: 'white' }}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                    </div>
                  </div>
                ));
              })()}
            </>
          )}

          {activeTab === 'testimonials' && (
            <div>
              {/* Testimonials Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Customer Testimonials</h3>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#64748b' }}>{testimonials.length} total &middot; {testimonials.filter(t => t.status === 'Approved').length} approved &middot; {testimonials.filter(t => t.status === 'Pending').length} pending</p>
                </div>
              </div>

              {testimonials.length === 0 ? (
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                  <i className="fa-solid fa-comments" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}></i>
                  <p style={{ margin: 0 }}>No testimonials yet.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.2rem' }}>
                  {testimonials.map(t => {
                    const statusColor = t.status === 'Approved' ? '#15803d' : t.status === 'Rejected' ? '#dc2626' : '#b45309';
                    const statusBg   = t.status === 'Approved' ? '#dcfce7'  : t.status === 'Rejected' ? '#fee2e2'  : '#fef3c7';
                    return (
                      <div key={t.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                        {/* Card header */}
                        <div style={{ background: 'linear-gradient(135deg, #173d3215 0%, #fff 100%)', borderBottom: '1px solid #f1f5f9', padding: '0.9rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <div>
                            <strong style={{ fontSize: '0.95rem', color: '#1e293b', display: 'block' }}>{t.name}</strong>
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{t.trip_type} &middot; {new Date(t.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          </div>
                          <span style={{ background: statusBg, color: statusColor, padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{t.status}</span>
                        </div>
                        {/* Rating */}
                        <div style={{ padding: '0.6rem 1rem 0' }}>
                          <span style={{ color: '#f59e0b', fontSize: '1rem', letterSpacing: '1px' }}>
                            {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginLeft: '0.4rem' }}>({t.rating}/5)</span>
                        </div>
                        {/* Review */}
                        <p style={{ margin: '0.5rem 1rem 0.8rem', fontSize: '0.85rem', color: '#475569', lineHeight: 1.6, flexGrow: 1 }}>
                          &ldquo;{t.review_text}&rdquo;
                        </p>
                        {/* Images / Videos */}
                        {t.images && t.images.length > 0 && (
                          <div style={{ display: 'flex', gap: '0.4rem', padding: '0 1rem 0.8rem', overflowX: 'auto', flexWrap: 'wrap' }}>
                            {t.images.map((mediaUrl, i) => {
                              const isVideo = /\.(mp4|webm|mov|avi|mkv)$/i.test(mediaUrl);
                              return isVideo ? (
                                <video key={i} src={mediaUrl} controls style={{ width: '100%', maxHeight: '140px', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                              ) : (
                                <img key={i} src={mediaUrl} alt="testimonial attachment" style={{ width: '65px', height: '65px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0', flexShrink: 0 }} />
                              );
                            })}
                          </div>
                        )}
                        {/* Action buttons */}
                        <div style={{ borderTop: '1px solid #f1f5f9', padding: '0.7rem 1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {t.status !== 'Approved' && (
                            <button
                              onClick={() => updateTestimonialStatus(t.id, 'Approved')}
                              style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '0.35rem 0.8rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                            >✓ Approve</button>
                          )}
                          {t.status !== 'Rejected' && (
                            <button
                              onClick={() => updateTestimonialStatus(t.id, 'Rejected')}
                              style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.35rem 0.8rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                            >✗ Reject</button>
                          )}
                          {t.status !== 'Pending' && (
                            <button
                              onClick={() => updateTestimonialStatus(t.id, 'Pending')}
                              style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', borderRadius: '6px', padding: '0.35rem 0.8rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                            >⟳ Pending</button>
                          )}
                          <button
                            onClick={() => setEditingTestimonial({ ...t })}
                            style={{ background: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe', borderRadius: '6px', padding: '0.35rem 0.8rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', marginLeft: 'auto' }}
                          >✎ Edit</button>
                          <button
                            onClick={() => deleteTestimonial(t.id)}
                            style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.35rem 0.8rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                          >🗑 Delete</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <form onSubmit={saveSettings} style={{ maxWidth: '550px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: '#1e293b' }}>Global Site Settings</h3>
              
              <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155' }}>WhatsApp Business Number</label>
                <small style={{ display: 'block', color: '#64748b', marginBottom: '0.3rem' }}>Include country code without '+' (e.g. 919526886600 for India)</small>
                <input type="text" className="form-control" value={settings.whatsapp_number || ''} onChange={e => setSettings({ ...settings, whatsapp_number: e.target.value })} placeholder="919526886600" />
              </div>

              <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155' }}>Admin Notification Email</label>
                <small style={{ display: 'block', color: '#64748b', marginBottom: '0.3rem' }}>New customer trip bookings will be emailed to this address</small>
                <input type="email" className="form-control" value={settings.admin_notification_email || ''} onChange={e => setSettings({ ...settings, admin_notification_email: e.target.value })} placeholder="sales@destin.in" />
              </div>

              <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155' }}>SMTP Email User Address</label>
                <small style={{ display: 'block', color: '#64748b', marginBottom: '0.3rem' }}>Outgoing email address used to send customer emails</small>
                <input type="email" className="form-control" value={settings.email_user || ''} onChange={e => setSettings({ ...settings, email_user: e.target.value })} placeholder="Sales@destin.in" />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155' }}>Email Sender Name</label>
                <small style={{ display: 'block', color: '#64748b', marginBottom: '0.3rem' }}>Name displayed in customer email inboxes</small>
                <input type="text" className="form-control" value={settings.email_from_name || ''} onChange={e => setSettings({ ...settings, email_from_name: e.target.value })} placeholder="Destin Vacations" />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.7rem' }}>Save Settings</button>
            </form>
          )}
        </div>
      </div>

      {/* Add Trip Modal */}
      {showAddTrip && (
        <div className="modal-overlay active" onClick={() => setShowAddTrip(false)}>
          <div className="modal-content" style={{ maxHeight: '85vh', overflowY: 'auto', maxWidth: '650px' }} onClick={e => e.stopPropagation()}>
            <span className="close-modal" onClick={() => setShowAddTrip(false)}>&times;</span>
            <h3 className="modal-title">Add New Trip</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const fd = new FormData(form);
              const payload = Object.fromEntries(fd);
              try {
                const res = await fetch('/api/admin/trips', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify(payload),
                });
                const data = await res.json();
                if (res.ok) {
                  alert('Trip created successfully!');
                  setShowAddTrip(false);
                  fetchTrips();
                  fetchStats();
                } else {
                  alert(data.error || 'Failed to create trip');
                }
              } catch (err: any) {
                alert('Network error while creating trip');
              }
            }}>
              <div className="form-group" style={{ marginBottom: '1rem' }}><label>Customer Name *</label><input name="customer_name" className="form-control" required /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: '1rem' }}><label>Phone *</label><input name="customer_phone" className="form-control" required /></div>
                <div className="form-group" style={{ marginBottom: '1rem' }}><label>WhatsApp</label><input name="customer_whatsapp" className="form-control" /></div>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}><label>Email *</label><input name="customer_email" type="email" className="form-control" required /></div>
              <div className="form-group" style={{ marginBottom: '1rem' }}><label>Pickup Location *</label><textarea name="pickup_location" className="form-control" rows={3} required></textarea></div>
              <div className="form-group" style={{ marginBottom: '1rem' }}><label>Destinations (comma-separated, e.g. Munnar, Alleppey) *</label><input name="destinations" className="form-control" required /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: '1rem' }}><label>Start Date *</label><input name="start_date" type="date" className="form-control" required /></div>
                <div className="form-group" style={{ marginBottom: '1rem' }}><label>Duration</label>
                  <select name="duration" className="form-control">
                    <option value="3 Nights / 4 Days">3 Nights / 4 Days</option>
                    <option value="4 Nights / 5 Days">4 Nights / 5 Days</option>
                    <option value="5 Nights / 6 Days">5 Nights / 6 Days</option>
                    <option value="6 Nights / 7 Days">6 Nights / 7 Days</option>
                    <option value="7 Nights / 8 Days">7 Nights / 8 Days</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: '1rem' }}><label>Adults</label><input name="adults" type="number" defaultValue={2} min={1} className="form-control" /></div>
                <div className="form-group" style={{ marginBottom: '1rem' }}><label>Children</label><input name="children" type="number" defaultValue={0} min={0} className="form-control" /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: '1rem' }}><label>Travel Type</label>
                  <select name="travel_type" className="form-control">
                    <option value="Solo">Solo</option>
                    <option value="Couple">Couple</option>
                    <option value="Family">Family</option>
                    <option value="Group">Group</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}><label>Food Preference</label>
                  <select name="food_pref" className="form-control">
                    <option value="Any">Any / Both</option>
                    <option value="Pure Veg">Pure Veg</option>
                    <option value="Non Veg">Non Veg</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: '1rem' }}><label>Estimated Price (₹)</label><input name="estimated_price" type="number" defaultValue={0} min={0} className="form-control" /></div>
                <div className="form-group" style={{ marginBottom: '1rem' }}><label>Status</label>
                  <select name="status" className="form-control">
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: '1rem' }}><label>Payment Status</label>
                  <select name="payment_status" className="form-control">
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}><label>Special Requests</label><textarea name="special_requests" className="form-control" rows={2}></textarea></div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Trip</button>
            </form>
          </div>
        </div>
      )}

      {/* Change Credentials Modal */}
      {showChangeCred && (
        <div className="modal-overlay active" onClick={() => setShowChangeCred(false)}>
          <div className="modal-content" style={{ maxHeight: '85vh', overflowY: 'auto', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <span className="close-modal" onClick={() => setShowChangeCred(false)}>&times;</span>
            <h3 className="modal-title">Admin Account Security</h3>

            {/* Mode Switcher Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '8px' }}>
              <button
                type="button"
                onClick={() => setCredMode('direct')}
                style={{ flex: 1, padding: '0.45rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, background: credMode === 'direct' ? '#ffffff' : 'transparent', color: credMode === 'direct' ? '#1e293b' : '#64748b', boxShadow: credMode === 'direct' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
              >
                🔑 Change Password
              </button>
              <button
                type="button"
                onClick={() => setCredMode('otp')}
                style={{ flex: 1, padding: '0.45rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, background: credMode === 'otp' ? '#ffffff' : 'transparent', color: credMode === 'otp' ? '#1e293b' : '#64748b', boxShadow: credMode === 'otp' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
              >
                📧 Forgot Password (OTP)
              </button>
            </div>

            {credMode === 'direct' ? (
              <form onSubmit={saveCredentials}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>Current Password *</label>
                  <input name="currentPassword" type={showAdminCredPassword ? 'text' : 'password'} className="form-control" placeholder="Enter current password" required />
                </div>
                <hr style={{ border: 'none', borderTop: '1px dashed #ddd', margin: '1rem 0' }} />
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>New Email (Optional)</label>
                  <input name="newEmail" type="email" className="form-control" placeholder="Enter new email address" />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>New Password (Optional)</label>
                  <input name="newPassword" type={showAdminCredPassword ? 'text' : 'password'} className="form-control" placeholder="Enter new password" />
                </div>
                <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem', color: '#444' }}>
                    <input type="checkbox" checked={showAdminCredPassword} onChange={e => setShowAdminCredPassword(e.target.checked)} style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#173D2F' }} />
                    Show password
                  </label>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Update Credentials</button>
              </form>
            ) : (
              <div>
                {/* 3 Step Progress Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', padding: '0 0.2rem' }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: '50%', background: adminOtpStep >= 1 ? '#173D2F' : '#e0e0e0', color: adminOtpStep >= 1 ? '#fff' : '#666', fontSize: '0.75rem', fontWeight: 700 }}>1</span>
                    <div style={{ fontSize: '0.72rem', fontWeight: adminOtpStep === 1 ? 700 : 400, color: adminOtpStep === 1 ? '#173D2F' : '#666', marginTop: '0.25rem' }}>1. Enter Email</div>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: '50%', background: adminOtpStep >= 2 ? '#173D2F' : '#e0e0e0', color: adminOtpStep >= 2 ? '#fff' : '#666', fontSize: '0.75rem', fontWeight: 700 }}>2</span>
                    <div style={{ fontSize: '0.72rem', fontWeight: adminOtpStep === 2 ? 700 : 400, color: adminOtpStep === 2 ? '#173D2F' : '#666', marginTop: '0.25rem' }}>2. OTP Verification</div>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: '50%', background: adminOtpStep >= 3 ? '#173D2F' : '#e0e0e0', color: adminOtpStep >= 3 ? '#fff' : '#666', fontSize: '0.75rem', fontWeight: 700 }}>3</span>
                    <div style={{ fontSize: '0.72rem', fontWeight: adminOtpStep === 3 ? 700 : 400, color: adminOtpStep === 3 ? '#173D2F' : '#666', marginTop: '0.25rem' }}>3. New Password</div>
                  </div>
                </div>

                {/* Alerts */}
                {adminOtpError && (
                  <div style={{ background: '#fde8e8', color: '#c0392b', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '1rem' }}>
                    ⚠️ {adminOtpError}
                  </div>
                )}
                {adminOtpSuccess && (
                  <div style={{ background: '#e8f8f0', color: '#1a7a4a', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '1rem' }}>
                    ✅ {adminOtpSuccess}
                  </div>
                )}

                {/* Step 1: Enter Email */}
                {adminOtpStep === 1 && (
                  <form onSubmit={handleSendAdminOtp}>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
                      Enter your admin email address to receive a 6-digit OTP verification code.
                    </p>
                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                      <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Admin Registered Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="yourname@gmail.com"
                        value={adminEmailInput}
                        onChange={e => setAdminEmailInput(e.target.value)}
                        required
                        disabled={adminOtpLoading}
                      />
                    </div>
                    <button type="submit" disabled={adminOtpLoading} className="btn btn-primary" style={{ width: '100%', padding: '0.65rem' }}>
                      {adminOtpLoading ? 'Sending OTP...' : 'Send OTP Code →'}
                    </button>
                  </form>
                )}

                {/* Step 2: OTP Verification */}
                {adminOtpStep === 2 && (
                  <form onSubmit={handleVerifyAdminOtp}>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
                      A 6-digit OTP code was sent to <strong style={{ color: '#173D2F' }}>{adminEmailInput}</strong>. Enter it below to verify.
                    </p>
                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                      <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Enter 6-Digit OTP Code *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 482910"
                        value={adminOtpCode}
                        onChange={e => setAdminOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        required
                        disabled={adminOtpLoading}
                        style={{ letterSpacing: '0.2rem', textAlign: 'center', fontSize: '1.2rem', fontWeight: 700 }}
                      />
                    </div>
                    <button type="submit" disabled={adminOtpLoading} className="btn btn-primary" style={{ width: '100%', padding: '0.65rem', marginBottom: '0.6rem' }}>
                      {adminOtpLoading ? 'Verifying OTP...' : 'Verify OTP Code →'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAdminOtpStep(1); setAdminOtpError(''); setAdminOtpSuccess(''); }}
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem', width: '100%', textDecoration: 'underline' }}
                    >
                      ← Change Email
                    </button>
                  </form>
                )}

                {/* Step 3: New Password */}
                {adminOtpStep === 3 && (
                  <form onSubmit={handleResetAdminPassword}>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
                      OTP verified! ✅ Create a new strong password for your admin account.
                    </p>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>New Password *</label>
                      <input
                        type={showAdminCredPassword ? 'text' : 'password'}
                        className="form-control"
                        placeholder="Minimum 6 characters"
                        value={adminOtpNewPassword}
                        onChange={e => setAdminOtpNewPassword(e.target.value)}
                        required
                        disabled={adminOtpLoading}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Confirm New Password *</label>
                      <input
                        type={showAdminCredPassword ? 'text' : 'password'}
                        className="form-control"
                        placeholder="Re-enter new password"
                        value={adminOtpConfirmPassword}
                        onChange={e => setAdminOtpConfirmPassword(e.target.value)}
                        required
                        disabled={adminOtpLoading}
                      />
                    </div>

                    {/* Mandatory Show Password Checkbox */}
                    <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem', color: '#444' }}>
                        <input
                          type="checkbox"
                          checked={showAdminCredPassword}
                          onChange={e => setShowAdminCredPassword(e.target.checked)}
                          style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#173D2F' }}
                        />
                        Show password
                      </label>
                    </div>

                    <button type="submit" disabled={adminOtpLoading} className="btn btn-primary" style={{ width: '100%', padding: '0.65rem' }}>
                      {adminOtpLoading ? 'Resetting Password...' : '🔒 Reset Password'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Testimonial Modal */}
      {editingTestimonial && (
        <div className="modal-overlay active" onClick={() => setEditingTestimonial(null)}>
          <div className="modal-content" style={{ maxHeight: '85vh', overflowY: 'auto', maxWidth: '550px' }} onClick={e => e.stopPropagation()}>
            <span className="close-modal" onClick={() => setEditingTestimonial(null)}>&times;</span>
            <h3 className="modal-title">Edit Testimonial</h3>
            <form onSubmit={saveEditTestimonial}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Customer Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={editingTestimonial.name}
                  onChange={e => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Trip Type</label>
                <select
                  className="form-control"
                  value={editingTestimonial.trip_type}
                  onChange={e => setEditingTestimonial({ ...editingTestimonial, trip_type: e.target.value })}
                >
                  <option value="">Select Type</option>
                  <option value="Solo">🧍 Solo</option>
                  <option value="Couple">💑 Couple</option>
                  <option value="Family">👨‍👩‍👧 Family</option>
                  <option value="Group">👥 Group</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Rating (1–5)</label>
                <select
                  className="form-control"
                  value={editingTestimonial.rating}
                  onChange={e => setEditingTestimonial({ ...editingTestimonial, rating: Number(e.target.value) })}
                >
                  {[1, 2, 3, 4, 5].map(r => (
                    <option key={r} value={r}>{'★'.repeat(r)} ({r}/5)</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Review Text</label>
                <textarea
                  className="form-control"
                  rows={5}
                  value={editingTestimonial.review_text}
                  onChange={e => setEditingTestimonial({ ...editingTestimonial, review_text: e.target.value })}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                <label>Status</label>
                <select
                  className="form-control"
                  value={editingTestimonial.status}
                  onChange={e => setEditingTestimonial({ ...editingTestimonial, status: e.target.value })}
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
                <button type="button" onClick={() => setEditingTestimonial(null)} style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.6rem 1rem', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
