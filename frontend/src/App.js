import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SocketProvider } from './context/SocketContext';
import ExpertListPage from './pages/ExpertListPage';
import ExpertDetailPage from './pages/ExpertDetailPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import './index.css';

const navItems = [
  { id: 'experts', label: 'Experts'},
  { id: 'mybookings', label: 'My Bookings' },
];

const Toast = ({ toast }) => {
  if (!toast) return null;
  const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6' };
  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
      background: '#111827', border: `1px solid ${colors[toast.type] || colors.info}`,
      borderRadius: '12px', padding: '14px 20px', maxWidth: '360px',
      boxShadow: `0 8px 32px ${colors[toast.type] || colors.info}33`,
      animation: 'slideUp 0.3s ease',
      display: 'flex', alignItems: 'center', gap: '10px',
    }}>
      <span style={{ fontSize: '16px' }}>{toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}</span>
      <span style={{ color: '#f1f5f9', fontSize: '14px' }}>{toast.message}</span>
    </div>
  );
};

const AppContent = () => {
  const { currentPage, navigate, toast } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case 'experts': return <ExpertListPage />;
      case 'detail': return <ExpertDetailPage />;
      case 'booking': return <BookingPage />;
      case 'mybookings': return <MyBookingsPage />;
      default: return <ExpertListPage />;
    }
  };

  const pageTitles = {
    experts: { title: 'Expert Sessions', sub: 'Book a 1-on-1 session with top industry professionals' },
    detail: { title: 'Expert Profile', sub: 'View details and available time slots' },
    booking: { title: 'Book Session', sub: 'Fill in your details to confirm the session' },
    mybookings: { title: 'My Bookings', sub: 'Track and manage your upcoming sessions' },
  };

  const { title, sub } = pageTitles[currentPage] || pageTitles.experts;

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#f1f5f9' }}>
      {/* Nav */}
      <header style={{
        background: '#111827', borderBottom: '1px solid #1f2937',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => navigate('experts')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <span style={{ fontSize: '24px' }}>⚡</span>
            <span style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>
              Expert<span style={{ color: '#6366f1' }}>Hub</span>
            </span>
          </button>
          <nav style={{ display: 'flex', gap: '4px' }}>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                style={{
                  padding: '8px 16px', background: 'none', border: 'none',
                  color: currentPage === item.id || (currentPage === 'detail' && item.id === 'experts') ? '#6366f1' : '#94a3b8',
                  cursor: 'pointer', fontSize: '14px', fontWeight: 500, borderRadius: '8px',
                  background: currentPage === item.id ? '#6366f111' : 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ marginRight: '6px' }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Page Header */}
      <div style={{ borderBottom: '1px solid #1f2937', background: '#111827' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 24px' }}>
          <h1 style={{ margin: 0, color: '#f1f5f9', fontSize: '26px', fontFamily: "'Sora', sans-serif", fontWeight: 700 }}>
            {title}
          </h1>
          <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: '14px' }}>{sub}</p>
        </div>
      </div>

      {/* Main Content */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        {renderPage()}
      </main>

      <Toast toast={toast} />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AppProvider>
  );
}

export default App;
