import React, { useEffect, useCallback } from 'react';
import { SessionProvider, useSession } from './contexts/SessionContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useTimer } from './hooks/useTimer';
import Settings from './components/Settings';
import Auth from './components/Auth';
import Contact from './components/Contact';
import { UserHeader } from './components/UserHeader';
import { supabase } from './lib/supabase';
import './App.css';

const TimerContainer: React.FC = () => {
  const { mode, settings, nextSession, setMode, triggerRefresh } = useSession();
  const { user } = useAuth();
  const [showSettings, setShowSettings] = React.useState(false);
  const [showContact, setShowContact] = React.useState(false);
  const [authMinimized, setAuthMinimized] = React.useState(false);
  const [appReady, setAppReady] = React.useState(false);
  const currentInitialSeconds = settings[mode === 'longBreak' ? 'longBreak' : mode === 'shortBreak' ? 'shortBreak' : 'work'];

  // Preloader fade-out and app fade-in
  useEffect(() => {
    const preloader = document.getElementById('preloader');
    // Small delay to ensure content is painted
    const timer = setTimeout(() => {
      if (preloader) {
        preloader.classList.add('fade-out');
        // Remove preloader from DOM after animation
        preloader.addEventListener('transitionend', () => {
          preloader.remove();
        }, { once: true });
        // Fallback removal if transitionend doesn't fire
        setTimeout(() => {
          if (document.getElementById('preloader')) {
            preloader.remove();
          }
        }, 1000);
      }
      setAppReady(true);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('/sound/Gentle-wake-alarm-clock.mp3');
      audio.play();
    } catch (e) {
      console.error('Failed to play sound:', e);
    }
  }, []);

  const sendNotification = useCallback((title: string, body: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  }, []);

  const saveSessionToSupabase = useCallback(async () => {
    if (!user) {
      console.warn('Cannot save session: No user logged in');
      return;
    }

    try {
      const minutes = Math.ceil(currentInitialSeconds / 60);
      console.log('Attempting to save session:', {
        user_id: user.id,
        mode,
        duration_minutes: minutes
      });

      const { data, error } = await supabase.from('sessions').insert({
        user_id: user.id,
        mode: mode,
        duration_minutes: minutes,
      }).select();

      if (error) {
        throw error;
      }

      console.log('Session saved successfully:', data);
    } catch (err: any) {
      console.error('Failed to save session:', err?.message || err);
      alert(`Error saving session: ${err?.message || 'Unknown error'}`);
    }
  }, [user, mode, currentInitialSeconds]);

  const handleComplete = useCallback(async () => {
    playNotificationSound();
    const modeName = mode === 'work' ? 'Work' : mode === 'shortBreak' ? 'Short Break' : 'Long Break';
    sendNotification('Timer Finished!', `${modeName} session is over. Time for a change!`);

    if (user) {
      await saveSessionToSupabase();
      triggerRefresh();
    }

    nextSession();
  }, [mode, nextSession, playNotificationSound, sendNotification, user, saveSessionToSupabase, triggerRefresh]);

  const { secondsRemaining, isActive, start, pause, reset } = useTimer(
    currentInitialSeconds,
    handleComplete
  );

  // Sync timer when mode changes
  useEffect(() => {
    reset(currentInitialSeconds);
  }, [mode, currentInitialSeconds, reset]);

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Update document title
  useEffect(() => {
    const timeStr = formatTime(secondsRemaining);
    const modeStr = mode === 'work' ? 'Focus' : 'Break';
    document.title = `${timeStr} - ${modeStr}`;
  }, [secondsRemaining, mode]);

  // Keyboard shortcuts (ONLY Escape for settings and contact)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (showSettings) setShowSettings(false);
        if (showContact) setShowContact(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSettings, showContact]);

  const dynamicStyles = {
    '--bg-work': settings.colors.work,
    '--bg-short-break': settings.colors.shortBreak,
    '--bg-long-break': settings.colors.longBreak,
  } as React.CSSProperties;

  return (
    <div
      className={`main-layout mode-${mode} ${isActive ? 'isActive' : ''} ${user ? 'is-logged-in' : ''} ${appReady ? 'app-fade-in' : 'app-hidden'}`}
      style={dynamicStyles}
    >
      <div className="brand-title">
        <h2><span className="dot"></span>Manx's Pomo Timer</h2>
      </div>

      <UserHeader />

      <div className="timer-section">
        <div className="timer-wrapper">
          <div className="timer-card">
            <div className="mode-selector">
              <button className={mode === 'work' ? 'active' : ''} onClick={() => setMode('work')}>Work</button>
              <button className={mode === 'shortBreak' ? 'active' : ''} onClick={() => setMode('shortBreak')}>Short Break</button>
              <button className={mode === 'longBreak' ? 'active' : ''} onClick={() => setMode('longBreak')}>Long Break</button>
            </div>

            <h1 className="timer-display">{formatTime(secondsRemaining)}</h1>

            <div className="controls">
              {!isActive ? (
                <button className="btn-primary" onClick={start}>START</button>
              ) : (
                <button className="btn-secondary" onClick={pause}>PAUSE</button>
              )}
              <div className="extra-controls">
                <button className="btn-icon" onClick={() => reset()} title="Reset">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                </button>
                <button
                  className={`btn-icon ${showSettings ? 'active' : ''}`}
                  onClick={() => setShowSettings(!showSettings)}
                  title="Settings"
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                </button>
              </div>
            </div>

            {showSettings && <Settings onClose={() => setShowSettings(false)} />}
          </div>
        </div>
      </div>

      <button
        className={`contact-me-trigger ${showContact ? 'active' : ''}`}
        onClick={() => setShowContact(!showContact)}
        title="Contact Me"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
        <span>Contact</span>
      </button>

      {showContact && <Contact onClose={() => setShowContact(false)} />}

      {!user && (
        <div className={`auth-section ${authMinimized ? 'minimized' : ''}`}>
          {/* Minimize/Expand toggle tab */}
          <button
            className="auth-toggle-tab"
            onClick={() => setAuthMinimized(!authMinimized)}
            title={authMinimized ? 'Show Login' : 'Hide Login'}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {authMinimized ? (
                <path d="M15 18l-6-6 6-6" />
              ) : (
                <path d="M9 18l6-6-6-6" />
              )}
            </svg>
            <span className="auth-toggle-label">{authMinimized ? 'Login' : ''}</span>
          </button>

          <div className="auth-section-content">
            <Auth />
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <TimerContainer />
      </SessionProvider>
    </AuthProvider>
  );
}
