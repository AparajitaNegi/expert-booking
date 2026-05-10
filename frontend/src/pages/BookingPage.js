import React, { useState } from 'react';
import { bookingAPI } from '../utils/api';
import { useApp } from '../context/AppContext';

const inputStyle = (hasError) => ({
  width: '100%', padding: '12px 16px', background: '#0d1117',
  border: `1px solid ${hasError ? '#ef4444' : '#1f2937'}`,
  borderRadius: '10px', color: '#f1f5f9', fontSize: '15px',
  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
});

const validate = (form) => {
  const errors = {};
  if (!form.clientName.trim() || form.clientName.trim().length < 2) errors.clientName = 'Name must be at least 2 characters';
  if (!form.clientEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.clientEmail)) errors.clientEmail = 'Valid email is required';
  if (!form.clientPhone.trim() || !/^[+]?[\d\s\-().]{7,20}$/.test(form.clientPhone)) errors.clientPhone = 'Valid phone number is required';
  if (form.notes && form.notes.length > 500) errors.notes = 'Notes cannot exceed 500 characters';
  return errors;
};

const BookingPage = () => {
  const { selectedExpert, selectedSlot, navigate, showToast } = useApp();
  const [form, setForm] = useState({ clientName: '', clientEmail: '', clientPhone: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  if (!selectedExpert || !selectedSlot) {
    navigate('experts');
    return null;
  }

  const formatDate = (d) => {
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async () => {
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await bookingAPI.create({
        expertId: selectedExpert._id,
        ...form,
        date: selectedSlot.date,
        timeSlot: selectedSlot.time,
      });
      setSuccess(res.data.data);
      showToast('Booking confirmed!', 'success');
    } catch (err) {
      if (err.response?.data?.errors) {
        const apiErrors = {};
        err.response.data.errors.forEach(e => { apiErrors[e.path] = e.msg; });
        setErrors(apiErrors);
      } else {
        showToast(err.message || 'Booking failed. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'center', padding: '40px 20px' }}>
        <div style={{
          width: '80px', height: '80px', background: '#10b98122', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '36px', margin: '0 auto 24px',
        }}>✓</div>
        <h2 style={{ color: '#f1f5f9', fontSize: '24px', marginBottom: '8px', fontFamily: "'Sora', sans-serif" }}>
          Booking Confirmed!
        </h2>
        <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
          Your session has been scheduled. A confirmation will be sent to your email.
        </p>
        <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '16px', padding: '24px', marginBottom: '28px', textAlign: 'left' }}>
          {[
            ['Expert', selectedExpert.name],
            ['Date', formatDate(selectedSlot.date)],
            ['Time', selectedSlot.time],
            ['Status', success.status],
            ['Booking ID', `#${success._id?.slice(-8).toUpperCase()}`],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1f2937' }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>{label}</span>
              <span style={{ color: value === 'Pending' ? '#f59e0b' : '#f1f5f9', fontSize: '14px', fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('mybookings')}
            style={{ padding: '12px 24px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}
          >
            View My Bookings
          </button>
          <button
            onClick={() => navigate('experts')}
            style={{ padding: '12px 24px', background: '#1f2937', color: '#94a3b8', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
          >
            Browse Experts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <button
        onClick={() => navigate('detail', { expert: selectedExpert, slot: selectedSlot })}
        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', marginBottom: '24px', padding: 0 }}
      >
        ← Back to expert
      </button>

      <h1 style={{ color: '#f1f5f9', fontSize: '22px', marginBottom: '8px', fontFamily: "'Sora', sans-serif" }}>
        Book a Session
      </h1>

      {/* Session Summary */}
      <div style={{ background: '#111827', border: '1px solid #6366f133', borderRadius: '14px', padding: '20px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Expert</p>
            <p style={{ color: '#f1f5f9', fontWeight: 600, margin: 0 }}>{selectedExpert.name}</p>
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</p>
            <p style={{ color: '#f1f5f9', fontWeight: 600, margin: 0 }}>{formatDate(selectedSlot.date)}</p>
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Time</p>
            <p style={{ color: '#6366f1', fontWeight: 700, margin: 0, fontSize: '18px' }}>{selectedSlot.time}</p>
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rate</p>
            <p style={{ color: '#10b981', fontWeight: 600, margin: 0 }}>${selectedExpert.hourlyRate}/hr</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Name */}
        <div>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '8px', fontWeight: 500 }}>
            Full Name <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            name="clientName" value={form.clientName} onChange={handleChange}
            placeholder="John Doe" style={inputStyle(errors.clientName)}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = errors.clientName ? '#ef4444' : '#1f2937'}
          />
          {errors.clientName && <p style={{ color: '#ef4444', fontSize: '12px', margin: '6px 0 0' }}>{errors.clientName}</p>}
        </div>

        {/* Email */}
        <div>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '8px', fontWeight: 500 }}>
            Email Address <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            name="clientEmail" value={form.clientEmail} onChange={handleChange}
            placeholder="john@example.com" type="email" style={inputStyle(errors.clientEmail)}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = errors.clientEmail ? '#ef4444' : '#1f2937'}
          />
          {errors.clientEmail && <p style={{ color: '#ef4444', fontSize: '12px', margin: '6px 0 0' }}>{errors.clientEmail}</p>}
        </div>

        {/* Phone */}
        <div>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '8px', fontWeight: 500 }}>
            Phone Number <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            name="clientPhone" value={form.clientPhone} onChange={handleChange}
            placeholder="+91 98765 43210" type="tel" style={inputStyle(errors.clientPhone)}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = errors.clientPhone ? '#ef4444' : '#1f2937'}
          />
          {errors.clientPhone && <p style={{ color: '#ef4444', fontSize: '12px', margin: '6px 0 0' }}>{errors.clientPhone}</p>}
        </div>

        {/* Notes */}
        <div>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '8px', fontWeight: 500 }}>
            Notes <span style={{ color: '#6b7280' }}>(optional)</span>
          </label>
          <textarea
            name="notes" value={form.notes} onChange={handleChange}
            placeholder="What would you like to discuss? Share any relevant context..."
            rows={4}
            style={{ ...inputStyle(errors.notes), resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6' }}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = errors.notes ? '#ef4444' : '#1f2937'}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            {errors.notes ? <p style={{ color: '#ef4444', fontSize: '12px', margin: 0 }}>{errors.notes}</p> : <span />}
            <span style={{ color: form.notes.length > 450 ? '#f59e0b' : '#6b7280', fontSize: '12px' }}>
              {form.notes.length}/500
            </span>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '15px', background: loading ? '#4f46e5' : '#6366f1',
            color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px',
            fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          }}
          onMouseEnter={e => !loading && (e.target.style.background = '#4f46e5')}
          onMouseLeave={e => !loading && (e.target.style.background = '#6366f1')}
        >
          {loading ? (
            <>
              <span style={{ width: '16px', height: '16px', border: '2px solid #ffffff44', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Confirming...
            </>
          ) : (
            'Confirm Booking'
          )}
        </button>
      </div>
    </div>
  );
};

export default BookingPage;
