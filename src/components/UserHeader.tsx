import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import UserProfile from './UserProfile';

export const UserHeader: React.FC = () => {
    const { user } = useAuth();
    const [showSidebar, setShowSidebar] = useState(false);

    if (!user) return null;

    const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'U';

    return (
        <>
            <div className="user-nav-container">
                <div
                    className="user-avatar-trigger"
                    onClick={() => setShowSidebar(true)}
                    title="Account"
                >
                    {name.charAt(0).toUpperCase()}
                </div>
            </div>

            <div className={`sidebar-overlay ${showSidebar ? 'active' : ''}`} onClick={() => setShowSidebar(false)} />

            <div className={`user-sidebar ${showSidebar ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <UserProfile refreshTrigger={showSidebar ? 1 : 0} />
                    <button className="btn-close-sidebar" onClick={() => setShowSidebar(false)}>
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>
        </>
    );
};
