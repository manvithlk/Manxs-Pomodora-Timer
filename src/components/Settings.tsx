import React, { useState } from 'react';
import { useSession } from '../contexts/SessionContext.tsx';

const Settings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { settings, updateSettings, resetSettings } = useSession();
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
    };

    const handleAnimationEnd = (e: React.AnimationEvent) => {
        if (isClosing && e.animationName === 'fadeOut') {
            onClose();
        }
    };

    const handleTimeChange = (key: 'work' | 'shortBreak' | 'longBreak', value: string) => {
        const mins = parseInt(value, 10);
        if (!isNaN(mins) && mins > 0) {
            updateSettings({ [key]: mins * 60 });
        }
    };

    const handleColorChange = (mode: 'work' | 'shortBreak' | 'longBreak', color: string) => {
        updateSettings({
            colors: {
                ...settings.colors,
                [mode]: color
            }
        });
    };

    return (
        <div
            className={`settings-overlay ${isClosing ? 'closing' : ''}`}
            onClick={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
            onAnimationEnd={handleAnimationEnd}
        >
            <div className={`settings-modal ${isClosing ? 'closing' : ''}`}>
                <h2>Timer Settings</h2>

                <div className="settings-section">
                    <h3>Durations (minutes)</h3>
                    <div className="settings-grid">
                        <div className="setting-item">
                            <label>Work</label>
                            <input
                                type="number"
                                defaultValue={settings.work / 60}
                                onBlur={(e) => handleTimeChange('work', e.target.value)}
                            />
                        </div>
                        <div className="setting-item">
                            <label>Short Break</label>
                            <input
                                type="number"
                                defaultValue={settings.shortBreak / 60}
                                onBlur={(e) => handleTimeChange('shortBreak', e.target.value)}
                            />
                        </div>
                        <div className="setting-item">
                            <label>Long Break</label>
                            <input
                                type="number"
                                defaultValue={settings.longBreak / 60}
                                onBlur={(e) => handleTimeChange('longBreak', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="settings-section">
                    <h3>Theme Colors</h3>
                    <div className="settings-grid">
                        <div className="setting-item color-item">
                            <label>Work</label>
                            <div className="color-picker-wrapper">
                                <input
                                    type="color"
                                    value={settings.colors.work}
                                    onChange={(e) => handleColorChange('work', e.target.value)}
                                />
                                <span className="color-value">{settings.colors.work}</span>
                            </div>
                        </div>
                        <div className="setting-item color-item">
                            <label>Short Break</label>
                            <div className="color-picker-wrapper">
                                <input
                                    type="color"
                                    value={settings.colors.shortBreak}
                                    onChange={(e) => handleColorChange('shortBreak', e.target.value)}
                                />
                                <span className="color-value">{settings.colors.shortBreak}</span>
                            </div>
                        </div>
                        <div className="setting-item color-item">
                            <label>Long Break</label>
                            <div className="color-picker-wrapper">
                                <input
                                    type="color"
                                    value={settings.colors.longBreak}
                                    onChange={(e) => handleColorChange('longBreak', e.target.value)}
                                />
                                <span className="color-value">{settings.colors.longBreak}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="settings-actions">
                    <button className="btn-reset-default" onClick={resetSettings}>Reset to Default Settings</button>
                    <button className="btn-close" onClick={handleClose}>CLOSE</button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
