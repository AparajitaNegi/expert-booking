import React, { useState } from 'react';
import { bookingAPI } from '../utils/api';
import { useApp } from '../context/AppContext';

const statusConfig = {
  Pending:   { color: '#f59e0b', bg: '#f59e0b22', icon: '⏳' },
  Confirmed: { color: '#3b82f6', bg: '#3b82f622', icon: '✓' },
  Completed: { color: '#10b981', bg: '#10b98122', icon: '★' },
  Cancelled: { color: '#ef4444', bg: '#ef444422', icon: '✕' },
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
};

const MyBookingsPage = () => {
  const { navigate, showToast } = useApp();
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const handleSearch = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await bookingAPI.getByEmail(email.trim());
      setBookings(res.data.data);
      setSearched(true);
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    setUpdatingId(bookingId);
    try {
      await bookingAPI.updateStatus(bookingId, 'Cancelled');
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'Cancelled' } : b));
      showToast('Booking cancelled', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to cancel booking', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ color: '#f1f5f9', fontSize: '22px', marginBottom: '8px', fontFamily: "'Sora', sans-serif" }}>
        My Bookings
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '28px' }}>Enter your email to view all your booked sessions.</p>

      {/* Email Search */}
      <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '16px', padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="your@email.com"
            type="email"
            style={{
              flex: 1, minWidth: '200px', padding: '12px 16px', background: '#0d1117',
              border: `1px solid ${error ? '#ef4444' : '#1f2937'}`, borderRadius: '10px',
              color: '#f1f5f9', fontSize: '15px', outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = error ? '#ef4444' : '#1f2937'}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              padding: '12px 24px', background: '#6366f1', color: '#fff', border: 'none',
              borderRadius: '10px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            {loading ? (
              <span style={{ width: '16px', height: '16px', border: '2px solid #ffffff44', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            ) : 'Search'}
          </button>
        </div>
        {error && <p style={{ color: '#ef4444', fontSize: '13px', margin: '8px 0 0' }}>{error}</p>}
      </div>

      {/* Results */}
      {searched && (
        bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '16px' }}>No bookings found for this email</p>
            <button
              onClick={() => navigate('experts')}
              style={{ padding: '10px 24px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              Browse Experts
            </button>
          </div>
        ) : (
          <>
            <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '16px' }}>
              {bookings.length} booking{bookings.length !== 1 ? 's' : ''} found
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {bookings.map(booking => {
                const sc = statusConfig[booking.status] || statusConfig.Pending;
                const canCancel = booking.status === 'Pending' || booking.status === 'Confirmed';
                return (
                  <div key={booking._id} style={{
                    background: '#111827', border: '1px solid #1f2937', borderRadius: '16px',
                    padding: '22px', transition: 'border-color 0.2s',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <h3 style={{ color: '#f1f5f9', margin: '0 0 4px', fontSize: '17px', fontFamily: "'Sora', sans-serif" }}>
                          {booking.expertName}
                        </h3>
                        {booking.expert?.category && (
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>{booking.expert.category}</span>
                        )}
                      </div>
                      <span style={{
                        padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                        background: sc.bg, color: sc.color, display: 'flex', alignItems: 'center', gap: '4px',
                      }}>
                        {sc.icon} {booking.status}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                      {[
                        ['📅 Date', formatDate(booking.date)],
                        ['🕐 Time', booking.timeSlot],
                        ['👤 Name', booking.clientName],
                        ['📧 Email', booking.clientEmail],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <p style={{ color: '#6b7280', fontSize: '11px', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</p>
                          <p style={{ color: '#f1f5f9', fontSize: '14px', margin: 0, wordBreak: 'break-all' }}>{value}</p>
                        </div>
                      ))}
                    </div>

                    {booking.notes && (
                      <div style={{ background: '#0d1117', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                        <p style={{ color: '#6b7280', fontSize: '11px', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Notes</p>
                        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>{booking.notes}</p>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #1f2937' }}>
                      <span style={{ color: '#374151', fontSize: '12px' }}>ID: #{booking._id.slice(-8).toUpperCase()}</span>
                      {canCancel && (
                        <button
                          onClick={() => handleCancel(booking._id)}
                          disabled={updatingId === booking._id}
                          style={{
                            padding: '6px 16px', background: 'transparent', border: '1px solid #374151',
                            color: '#ef4444', borderRadius: '8px', fontSize: '13px',
                            cursor: updatingId === booking._id ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {updatingId === booking._id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )
      )}
    </div>
  );
};

export default MyBookingsPage;
