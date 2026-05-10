import React, { useState, useEffect, useCallback } from 'react';
import { expertAPI } from '../utils/api';
import { useApp } from '../context/AppContext';

const CATEGORIES = ['All', 'Technology', 'Business', 'Design', 'Marketing', 'Finance', 'Health', 'Legal', 'Education'];

const categoryColors = {
  Technology: '#3b82f6', Business: '#8b5cf6', Design: '#ec4899',
  Marketing: '#f97316', Finance: '#10b981', Health: '#06b6d4',
  Legal: '#6366f1', Education: '#f59e0b',
};

const StarRating = ({ rating }) => {
  return (
    <span style={{ color: '#f59e0b', fontSize: '14px' }}>
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
      <span style={{ color: '#94a3b8', marginLeft: '4px', fontSize: '13px' }}>{rating.toFixed(1)}</span>
    </span>
  );
};

const ExpertCard = ({ expert, onSelect }) => {
  const color = categoryColors[expert.category] || '#6366f1';
  return (
    <div
      onClick={() => onSelect(expert)}
      style={{
        background: '#111827',
        border: '1px solid #1f2937',
        borderRadius: '16px',
        padding: '24px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 8px 32px ${color}22`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#1f2937';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: color }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '12px', background: color + '22',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', fontWeight: 700, color, flexShrink: 0, fontFamily: 'monospace',
        }}>
          {expert.avatar || expert.name.substring(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: '17px', fontWeight: 600, fontFamily: "'Sora', sans-serif" }}>
            {expert.name}
          </h3>
          <span style={{
            display: 'inline-block', marginTop: '4px', padding: '2px 10px',
            background: color + '22', color, borderRadius: '20px',
            fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase',
          }}>
            {expert.category}
          </span>
        </div>
      </div>
      <p style={{ color: '#94a3b8', fontSize: '13.5px', lineHeight: '1.6', margin: '0 0 16px', 
        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {expert.bio}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
        {expert.skills?.slice(0, 3).map(skill => (
          <span key={skill} style={{
            padding: '3px 8px', background: '#1f2937', color: '#94a3b8',
            borderRadius: '6px', fontSize: '11px',
          }}>{skill}</span>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #1f2937' }}>
        <div>
          <StarRating rating={expert.rating} />
          <span style={{ color: '#6b7280', fontSize: '12px', marginLeft: '6px' }}>({expert.reviewCount})</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: 700 }}>${expert.hourlyRate}</span>
          <span style={{ color: '#6b7280', fontSize: '12px' }}>/hr</span>
        </div>
      </div>
      <div style={{ marginTop: '8px', color: '#6b7280', fontSize: '12px' }}>
        {expert.experience} years experience
      </div>
    </div>
  );
};

const ExpertListPage = () => {
  const { navigate } = useApp();
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchExperts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await expertAPI.getAll({ page, limit: 6, search, category: category === 'All' ? '' : category });
      setExperts(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load experts');
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => {
    const timer = setTimeout(fetchExperts, 300);
    return () => clearTimeout(timer);
  }, [fetchExperts]);

  useEffect(() => { setPage(1); }, [search, category]);

  return (
    <div>
      {/* Search & Filter Bar */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '18px' }}>⌕</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search experts by name or skill..."
            style={{
              width: '100%', padding: '14px 16px 14px 48px', background: '#111827',
              border: '1px solid #1f2937', borderRadius: '12px', color: '#f1f5f9',
              fontSize: '15px', outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#6366f1'}
            onBlur={e => e.target.style.borderColor = '#1f2937'}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: '7px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.15s',
                background: category === cat ? '#6366f1' : '#111827',
                color: category === cat ? '#fff' : '#94a3b8',
                border: category === cat ? '1px solid #6366f1' : '1px solid #1f2937',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '16px', padding: '24px', height: '220px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <p style={{ color: '#ef4444', fontSize: '16px', marginBottom: '16px' }}>{error}</p>
          <button onClick={fetchExperts} style={{ padding: '10px 24px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            Try Again
          </button>
        </div>
      ) : experts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <p style={{ color: '#94a3b8', fontSize: '16px' }}>No experts found matching your criteria</p>
        </div>
      ) : (
        <>
          <div style={{ color: '#6b7280', fontSize: '13px', marginBottom: '16px' }}>
            Showing {experts.length} of {pagination.total} experts
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            {experts.map(expert => (
              <ExpertCard key={expert._id} expert={expert} onSelect={e => navigate('detail', { expert: e })} />
            ))}
          </div>
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ padding: '8px 16px', background: '#111827', border: '1px solid #1f2937', color: page === 1 ? '#374151' : '#94a3b8', borderRadius: '8px', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
              >← Prev</button>
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  style={{
                    padding: '8px 14px', borderRadius: '8px', border: '1px solid',
                    background: page === i + 1 ? '#6366f1' : '#111827',
                    borderColor: page === i + 1 ? '#6366f1' : '#1f2937',
                    color: page === i + 1 ? '#fff' : '#94a3b8', cursor: 'pointer',
                  }}
                >{i + 1}</button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                style={{ padding: '8px 16px', background: '#111827', border: '1px solid #1f2937', color: page === pagination.pages ? '#374151' : '#94a3b8', borderRadius: '8px', cursor: page === pagination.pages ? 'not-allowed' : 'pointer' }}
              >Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExpertListPage;
