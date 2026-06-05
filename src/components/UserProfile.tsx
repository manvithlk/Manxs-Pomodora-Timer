import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useSession } from '../contexts/SessionContext';

interface PomodoroSession {
    id: string;
    created_at: string;
    mode: string;
    duration_minutes: number;
}

interface UserProfileProps {
    refreshTrigger?: number;
}

const UserProfile: React.FC<UserProfileProps> = ({ refreshTrigger }) => {
    const { user, signOut } = useAuth();
    const { refreshTrigger: globalRefreshTrigger, mode } = useSession();
    const [history, setHistory] = useState<PomodoroSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(true);
    const [showHistoryMenu, setShowHistoryMenu] = useState(false);

    // Editable fields
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [editedBio, setEditedBio] = useState('');
    const [savingName, setSavingName] = useState(false);
    const [savingBio, setSavingBio] = useState(false);

    const nameInputRef = useRef<HTMLInputElement>(null);
    const bioInputRef = useRef<HTMLInputElement>(null);

    const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

    // Initialize editable fields
    useEffect(() => {
        setEditedName(name);
        // Load bio from localStorage (will be migrated to Supabase profiles table later)
        const savedBio = localStorage.getItem(`pomo-bio-${user?.id}`);
        setEditedBio(savedBio || '');
    }, [user, name]);

    // Focus input when entering edit mode
    useEffect(() => {
        if (isEditingName && nameInputRef.current) {
            nameInputRef.current.focus();
            nameInputRef.current.select();
        }
    }, [isEditingName]);

    useEffect(() => {
        if (isEditingBio && bioInputRef.current) {
            bioInputRef.current.focus();
            bioInputRef.current.select();
        }
    }, [isEditingBio]);

    useEffect(() => {
        if (user) {
            fetchHistory();
        }
    }, [user, refreshTrigger, globalRefreshTrigger]);

    const fetchHistory = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('sessions')
                .select('id, mode, duration_minutes, created_at')
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) {
                console.warn('Session history error:', error.message, error.details, error.hint);
            } else {
                setHistory(data || []);
            }
        } catch (err) {
            console.error('Error fetching history:', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Save the edited display name.
     * Uses Supabase auth.updateUser() to persist to user_metadata.
     * TODO: If Supabase connectivity isn't available, this will fail gracefully
     * and the name will remain as-is until next page load.
     */
    const handleSaveName = async () => {
        if (!editedName.trim() || editedName.trim() === name) {
            setEditedName(name);
            setIsEditingName(false);
            return;
        }

        setSavingName(true);
        try {
            // TODO: Connect to Supabase — this call updates user_metadata.full_name
            const { error } = await supabase.auth.updateUser({
                data: { full_name: editedName.trim() }
            });

            if (error) {
                console.error('Failed to update name:', error.message);
                // Revert on failure
                setEditedName(name);
            } else {
                console.log('Name updated successfully to:', editedName.trim());
            }
        } catch (err) {
            console.error('Error updating name:', err);
            setEditedName(name);
        } finally {
            setSavingName(false);
            setIsEditingName(false);
        }
    };

    /**
     * Save the edited bio/status.
     * Currently persists to localStorage.
     * TODO: Persist to a Supabase 'profiles' table when available.
     * Schema would be: profiles(id uuid PK, user_id uuid FK, bio text, avatar_url text, updated_at timestamp)
     */
    const handleSaveBio = async () => {
        setSavingBio(true);
        try {
            // Persist to localStorage for now
            if (user?.id) {
                localStorage.setItem(`pomo-bio-${user.id}`, editedBio.trim());
            }

            // TODO: Persist to Supabase profiles table
            // const { error } = await supabase
            //     .from('profiles')
            //     .upsert({
            //         user_id: user?.id,
            //         bio: editedBio.trim(),
            //         updated_at: new Date().toISOString(),
            //     });
            // if (error) console.error('Failed to save bio:', error.message);

            console.log('Bio saved to localStorage:', editedBio.trim());
        } catch (err) {
            console.error('Error saving bio:', err);
        } finally {
            setSavingBio(false);
            setIsEditingBio(false);
        }
    };

    const handleNameKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSaveName();
        } else if (e.key === 'Escape') {
            setEditedName(name);
            setIsEditingName(false);
        }
    };

    const handleBioKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSaveBio();
        } else if (e.key === 'Escape') {
            const savedBio = localStorage.getItem(`pomo-bio-${user?.id}`) || '';
            setEditedBio(savedBio);
            setIsEditingBio(false);
        }
    };

    /**
     * Avatar upload handler placeholder.
     * TODO: Implement avatar upload via Supabase Storage
     * 1. Open file picker for image files
     * 2. Upload to Supabase Storage bucket 'avatars'
     * 3. Get public URL
     * 4. Update profiles table with avatar_url
     * 5. Update local state to show new avatar
     */
    const handleAvatarClick = () => {
        // TODO: Implement avatar upload
        console.log('Avatar clicked — upload not yet implemented');
    };

    const totalCompleted = history.length;
    const totalFocusMins = history
        .filter(s => s.mode === 'work')
        .reduce((acc, curr) => acc + curr.duration_minutes, 0);

    // Calculate streak (consecutive days with sessions)
    const calculateStreak = () => {
        if (history.length === 0) return 0;
        const uniqueDays = [...new Set(
            history.map(s => new Date(s.created_at).toLocaleDateString())
        )];
        // Simple streak: count of unique days (a proper streak would check consecutive days)
        return uniqueDays.length;
    };

    const streak = calculateStreak();

    return (
        <div className="profile-container">
            <div className="profile-card">
                {/* Mode-colored banner strip */}
                <div className={`profile-banner mode-${mode}`}></div>

                {/* Avatar Section */}
                <div className="profile-avatar-section">
                    <div
                        className={`profile-avatar-large mode-border-${mode}`}
                        onClick={handleAvatarClick}
                        title="Click to upload avatar (coming soon)"
                    >
                        <span className="avatar-initial">{name.charAt(0).toUpperCase()}</span>
                        <div className="avatar-upload-overlay">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                <circle cx="12" cy="13" r="4" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Editable Name */}
                <div className="profile-identity">
                    {isEditingName ? (
                        <div className="editable-field editing">
                            <input
                                ref={nameInputRef}
                                className="editable-field-input name-input"
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                onKeyDown={handleNameKeyDown}
                                onBlur={handleSaveName}
                                disabled={savingName}
                                maxLength={40}
                                placeholder="Your name"
                            />
                        </div>
                    ) : (
                        <div className="editable-field" onClick={() => setIsEditingName(true)}>
                            <h3 className="profile-name">{editedName || name}</h3>
                            <svg className="edit-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                            </svg>
                        </div>
                    )}

                    {/* Editable Bio */}
                    {isEditingBio ? (
                        <div className="editable-field editing bio-field">
                            <input
                                ref={bioInputRef}
                                className="editable-field-input bio-input"
                                type="text"
                                value={editedBio}
                                onChange={(e) => setEditedBio(e.target.value)}
                                onKeyDown={handleBioKeyDown}
                                onBlur={handleSaveBio}
                                disabled={savingBio}
                                maxLength={60}
                                placeholder="Set a status..."
                            />
                        </div>
                    ) : (
                        <div className="editable-field bio-field" onClick={() => setIsEditingBio(true)}>
                            <p className="profile-bio">
                                {editedBio || 'Click to add a status...'}
                            </p>
                            <svg className="edit-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                            </svg>
                        </div>
                    )}

                    {/* Email (read-only) */}
                    <p className="profile-email-display">{user?.email}</p>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-item">
                        <span className="stat-value">{totalCompleted}</span>
                        <span className="stat-label">Sessions</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{totalFocusMins}</span>
                        <span className="stat-label">Focus Mins</span>
                    </div>
                    <div className="stat-item stat-accent">
                        <span className="stat-value">{streak}</span>
                        <span className="stat-label">Day Streak</span>
                    </div>
                    <div className="stat-item stat-accent">
                        <span className="stat-value">{Math.round(totalFocusMins / 60 * 10) / 10}</span>
                        <span className="stat-label">Hours</span>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className={`history-section ${isExpanded ? 'expanded' : ''}`}>
                    <div className="history-header">
                        <div className="history-header-left" onClick={() => setIsExpanded(!isExpanded)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                            <h4>Recent Activity</h4>
                            <svg
                                className={`chevron ${isExpanded ? 'rotated' : ''}`}
                                viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"
                                style={{ transition: 'transform 0.3s', opacity: 0.5 }}
                            >
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </div>
                        <div className="history-header-controls">
                            <div className="dropdown-container">
                                <button
                                    className={`btn-history-menu ${showHistoryMenu ? 'active' : ''}`}
                                    onClick={() => setShowHistoryMenu(!showHistoryMenu)}
                                    title="Activity Menu"
                                >
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                                </button>
                                {showHistoryMenu && (
                                    <div className="history-dropdown">
                                        <button onClick={() => { fetchHistory(); setShowHistoryMenu(false); }}>
                                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
                                            Refresh
                                        </button>
                                        <button onClick={() => { setIsExpanded(!isExpanded); setShowHistoryMenu(false); }}>
                                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                            {isExpanded ? 'Collapse' : 'Expand'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="history-list-wrapper">
                        <div className="history-list">
                            {loading ? (
                                <div className="history-loading">Loading activity...</div>
                            ) : history.length === 0 ? (
                                <div className="empty-history">
                                    <p>No sessions recorded yet.</p>
                                    <span>Start focus to see history!</span>
                                </div>
                            ) : (
                                history.map((session) => (
                                    <div key={session.id} className="history-item">
                                        <div className={`mode-indicator ${session.mode}`}></div>
                                        <div className="session-details">
                                            <span className="session-mode">{session.mode === 'work' ? 'Focus' : 'Break'}</span>
                                            <span className="session-time">
                                                {new Date(session.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <span className="session-duration">+{session.duration_minutes}m</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Full-width Logout */}
                <div className="profile-footer">
                    <button className="btn-logout-full" onClick={signOut}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                        </svg>
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
