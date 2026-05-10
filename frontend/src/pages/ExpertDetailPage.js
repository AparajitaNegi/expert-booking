import React, { useState, useEffect, useCallback } from 'react';
import { expertAPI } from '../utils/api';
import { useApp } from '../context/AppContext';
import { useSocket } from '../context/SocketContext';

const categoryColors = {
  Technology: '#3b82f6', Business: '#8b5cf6', Design: '#ec4899',
  Marketing: '#f97316', Finance: '#10b981', Health: '#06b6d4',
  Legal: '#6366f1', Education: '#f59e0b',
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const ExpertDetailPage = () => {
  const { selectedExpert, navigate, showToast } = useApp();
  const { joinExpertRoom, leaveExpertRoom, onSlotBooked, onSlotFreed, connected } = useSocket();
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  const fetchExpert = useCallback(async () => {
    if (!selectedExpert?._id) return;
    setLoading(true);
    setError('');
    try {
      const res = await expertAPI.getById(selectedExpert._id);
      setExpert(res.data.data);
      if (res.data.data.availability?.length > 0) {
        setSelectedDate(res.data.data.availability[0].date);
      }
    } catch (err) {
      setError(err.message || 'Failed to load expert details');
    } finally {
      setLoading(false);
    }
  }, [selectedExpert]);

  useEffect(() => {
    fetchExpert();
  }, [fetchExpert]);

  // Real-time socket room management
  useEffect(() => {
    if (!expert?._id) return;
    joinExpertRoom(expert._id);
    return () => leaveExpertRoom(expert._id);
  }, [expert?._id, joinExpertRoom, leaveExpertRoom]);

  // Real-time slot booked
  useEffect(() => {
    const unsub = onSlotBooked(({ expertId, date, timeSlot }) => {
      if (expertId !== expert?._id) return;
      setExpert(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          availability: prev.availability.map(avail =>
            avail.date === date
              ? { ...avail, slots: avail.slots.map(s => s.time === timeSlot ? { ...s, isBooked: true } : s) }
              : avail
          ),
        };
      });
      showToast(`Slot ${timeSlot} on ${formatDate(date)} was just booked!`, 'info');
    });
    return unsub;
  }, [expert?._id, onSlotBooked, showToast]);

  // Real-time slot freed
  useEffect(() => {
    const unsub = onSlotFreed(({ expertId, date, timeSlot }) => {
      if (expertId !== expert?._id) return;
      setExpert(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          availability: prev.availability.map(avail =>
            avail.date === date
              ? { ...avail, slots: avail.slots.map(s => s.time === timeSlot ? { ...s, isBooked: false } : s) }
              : avail
          ),
        };
      });
    });
    return unsub;
  }, [expert?._id, onSlotFreed]);

  if (!selectedExpert) {
    navigate('experts');
    return null;
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #1f2937', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
      <p style={{ color: '#6b7280' }}>Loading expert details...</p>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>
      <button onClick={fetchExpert} style={{ padding: '10px 24px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', marginRight: '12px' }}>Retry</button>
      <button onClick={() => navigate('experts')} style={{ padding: '10px 24px', background: '#1f2937', color: '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Back</button>
    </div>
  );

  const color = categoryColors[expert.category] || '#6366f1';
  const currentDaySlots = expert.availability?.find(a => a.date === selectedDate);

  return (
    <div>
      <button
        onClick={() => navigate('experts')}
        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', marginBottom: '24px', padding: 0, display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        ← Back to experts
      </button>

      {/* Expert Header */}
      <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '20px', padding: '32px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '20px', background: color + '22',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', fontWeight: 700, color, flexShrink: 0, fontFamily: 'monospace',
            border: `2px solid ${color}44`,
          }}>
            {expert.avatar || expert.name.substring(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <h1 style={{ margin: 0, color: '#f1f5f9', fontSize: '24px', fontFamily: "'Sora', sans-serif" }}>{expert.name}</h1>
              <span style={{ padding: '3px 12px', background: color + '22', color, borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                {expert.category}
              </span>
              {connected && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#10b981' }}>
                  <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', display: 'inline-block' }} />
                  Live updates
                </span>
              )}
            </div>
            <p style={{ color: '#94a3b8', margin: '0 0 16px', lineHeight: '1.7' }}>{expert.bio}</p>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ color: '#f59e0b' }}>
                {'★'.repeat(Math.floor(expert.rating))}
                <span style={{ color: '#94a3b8', marginLeft: '6px' }}>{expert.rating.toFixed(1)} ({expert.reviewCount} reviews)</span>
              </div>
              <span style={{ color: '#94a3b8' }}>📅 {expert.experience} years experience</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>${expert.hourlyRate}/hr</span>
            </div>
          </div>
        </div>
        {expert.skills?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #1f2937' }}>
            {expert.skills.map(skill => (
              <span key={skill} style={{ padding: '5px 12px', background: '#1f2937', color: '#94a3b8', borderRadius: '8px', fontSize: '13px' }}>
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Availability Section */}
      <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '20px', padding: '28px' }}>
        <h2 style={{ color: '#f1f5f9', fontSize: '18px', margin: '0 0 20px', fontFamily: "'Sora', sans-serif" }}>
          Available Sessions
        </h2>

        {/* Date Tabs */}
        {expert.availability?.length > 0 ? (
          <>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '24px' }}>
              {expert.availability.map(avail => {
                const availableCount = avail.slots.filter(s => !s.isBooked).length;
                const isSelected = selectedDate === avail.date;
                return (
                  <button
                    key={avail.date}
                    onClick={() => setSelectedDate(avail.date)}
                    style={{
                      padding: '10px 16px', borderRadius: '12px', cursor: 'pointer',
                      border: '1px solid', transition: 'all 0.15s', flexShrink: 0, textAlign: 'center',
                      background: isSelected ? color : '#0d1117',
                      borderColor: isSelected ? color : '#1f2937',
                      color: isSelected ? '#fff' : '#94a3b8',
                    }}
                  >
                    <div style={{ fontSize: '12px', marginBottom: '2px' }}>{formatDate(avail.date)}</div>
                    <div style={{ fontSize: '11px', opacity: 0.8 }}>
                      {availableCount} slot{availableCount !== 1 ? 's' : ''} left
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Slots Grid */}
            {currentDaySlots ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px' }}>
                {currentDaySlots.slots.map(slot => {
                  const isBooked = slot.isBooked;
                  return (
                    <button
                      key={slot.time}
                      disabled={isBooked}
                      onClick={() => !isBooked && navigate('booking', { expert, slot: { date: selectedDate, time: slot.time } })}
                      style={{
                        padding: '12px', borderRadius: '10px', border: '1px solid',
                        cursor: isBooked ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
                        background: isBooked ? '#0d1117' : '#1f2937',
                        borderColor: isBooked ? '#1f2937' : color + '55',
                        color: isBooked ? '#374151' : '#f1f5f9',
                        fontSize: '14px', fontWeight: 500,
                        textDecoration: isBooked ? 'line-through' : 'none',
                        opacity: isBooked ? 0.5 : 1,
                        position: 'relative',
                      }}
                    >
                      {slot.time}
                      {isBooked && <div style={{ fontSize: '10px', color: '#4b5563', marginTop: '2px' }}>Booked</div>}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>No slots for this date</p>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            No availability in the next 14 days
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpertDetailPage;
