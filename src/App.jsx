import { useEffect } from 'react';
import { useStore } from './store';
import Dashboard from './components/Dashboard';
import Thread from './components/Thread';
import CommandBar from './components/CommandBar';
import { C, FONT_SANS, FONT_MONO } from './theme/tokens';

export default function App() {
  const view = useStore(s => s.view);
  const goToDashboard = useStore(s => s.goToDashboard);
  const newThread = useStore(s => s.newThread);

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'Escape' && view === 'thread') goToDashboard();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [view, goToDashboard]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* ─── Header ─── */}
      <header style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        padding: '16px clamp(18px, 2vw, 24px)',
        borderBottom: '1px solid rgba(109, 123, 156, 0.14)',
        background: 'rgba(7, 11, 18, 0.88)',
        backdropFilter: 'blur(18px)',
        flexShrink: 0,
        zIndex: 20,
      }}>
        <div style={{
          position: 'absolute', inset: 0, zIndex: -1, pointerEvents: 'none',
          background: [
            'radial-gradient(circle at 8% 18%, rgba(59, 139, 246, 0.12), transparent 24%)',
            'radial-gradient(circle at 92% 12%, rgba(41, 207, 214, 0.10), transparent 26%)',
            'linear-gradient(180deg, rgba(7, 11, 18, 0.98), rgba(12, 20, 32, 0.92))',
          ].join(', '),
        }} />

        <div style={{
          fontFamily: FONT_SANS, fontSize: 18, fontWeight: 600,
          letterSpacing: '-0.04em', color: C.t1,
        }}>
          Enterprise Brain
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {view === 'thread' && (
            <ToolButton onClick={goToDashboard}>
              ← <span>Dashboard</span>
            </ToolButton>
          )}
          <ToolButton onClick={newThread}>+ <span>New Chat</span></ToolButton>
          <ToolButton>&#x29D7; <span>History</span></ToolButton>
          <ToolButton>&#x229E; <span>Bookmarks</span></ToolButton>
          <ProfileButton />
        </div>
      </header>

      {/* ─── Content ─── */}
      <div style={{
        flex: 1,
        overflowY: view === 'thread' ? 'auto' : 'hidden',
        overflowX: 'hidden',
        position: 'relative',
      }}>
        {view === 'dashboard' && <Dashboard />}
        {view === 'thread' && <Thread />}
      </div>

      {/* ─── Bottom bar ─── */}
      <CommandBar />
    </div>
  );
}

function ToolButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '6px 2px', border: 0, background: 'transparent',
        fontFamily: FONT_SANS, fontSize: 14, fontWeight: 600,
        color: '#a8b8d0', opacity: 0.88, cursor: 'pointer',
        transition: 'color 160ms ease, opacity 160ms ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.color = C.t1; e.currentTarget.style.opacity = '1'; }}
      onMouseLeave={e => { e.currentTarget.style.color = '#a8b8d0'; e.currentTarget.style.opacity = '0.88'; }}
    >
      {children}
    </button>
  );
}

function ProfileButton() {
  return (
    <button
      style={{
        width: 40, height: 40, padding: 0, borderRadius: 999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent', border: 0, color: '#a8b8d0',
        cursor: 'pointer', transition: 'color 160ms ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.color = C.t1; }}
      onMouseLeave={e => { e.currentTarget.style.color = '#a8b8d0'; }}
      aria-label="Profile"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4.2 3.6-7 8-7s8 2.8 8 7" />
      </svg>
    </button>
  );
}
