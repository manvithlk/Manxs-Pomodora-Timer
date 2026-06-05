import React, { useState } from 'react';

interface ContactProps {
    onClose: () => void;
}

const Contact: React.FC<ContactProps> = ({ onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [copied, setCopied] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        // The actual onClose will be called after the animation finishes via onAnimationEnd
    };

    const handleAnimationEnd = (e: React.AnimationEvent) => {
        if (isClosing && e.animationName === 'fadeOut') {
            onClose();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });

        // Reset success message after 3 seconds
        setTimeout(() => setStatus('idle'), 3000);
    };

    const copyEmail = () => {
        navigator.clipboard.writeText('manvithlk@gmail.com');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            className={`settings-overlay contact-overlay ${isClosing ? 'closing' : ''}`}
            onClick={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
            onAnimationEnd={handleAnimationEnd}
        >
            <div className={`settings-modal contact-modal-enhanced ${isClosing ? 'closing' : ''}`}>
                <div className="contact-banner">
                    <div className="contact-banner-content">
                        <h2>Let's Connect</h2>
                        <p>Have something to say? I'm all ears!</p>
                    </div>
                </div>

                <div className="contact-content-grid">
                    <div className="contact-form-section">
                        <form onSubmit={handleSubmit} className="modern-contact-form">
                            <div className="form-row">
                                <div className="contact-form-group">
                                    <label htmlFor="name">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Your Name"
                                        required
                                    />
                                </div>
                                <div className="contact-form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Your Email"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="contact-form-group">
                                <label htmlFor="subject">Subject</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="What's this about?"
                                    required
                                />
                            </div>
                            <div className="contact-form-group">
                                <label htmlFor="message">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Write your message here..."
                                    rows={4}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className={`btn-submit ${status === 'sending' ? 'loading' : ''} ${status === 'success' ? 'success' : ''}`}
                                disabled={status === 'sending'}
                            >
                                {status === 'idle' && 'Send Message'}
                                {status === 'sending' && 'Sending...'}
                                {status === 'success' && 'Message Sent!'}
                                {status === 'error' && 'Failed to send'}
                            </button>
                        </form>
                    </div>

                    <div className="contact-sidebar-info">
                        <div className="info-card" onClick={copyEmail} title="Click to copy email">
                            <div className="info-icon">
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                            </div>
                            <div className="info-text">
                                <span>Email Me</span>
                                <p>manvithlk@gmail.com</p>
                            </div>
                            <span className={`copy-badge ${copied ? 'visible' : ''}`}>Copied!</span>
                        </div>

                        <div className="social-links-container">
                            <h3>Find me on</h3>
                            <div className="social-grid">
                                <a href="https://github.com/manx-69" target="_blank" rel="noopener noreferrer" className="social-link github" title="GitHub">
                                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                </a>
                                <a href="https://www.linkedin.com/in/manvith-lk-50519439a/" target="_blank" rel="noopener noreferrer" className="social-link linkedin" title="LinkedIn">
                                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.238 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        <div className="suggestion-box-enhanced">
                            <h4>Feedback Welcome</h4>
                            <p>Suggestions to improve this Pomo app are always welcome! Feel free to reach out with your ideas.</p>
                        </div>
                    </div>
                </div>

                <div className="contact-footer-enhanced">
                    <p>© {new Date().getFullYear()} Manvith L K • ALL RIGHTS RESERVED</p>
                    <button className="btn-close-minimal" onClick={handleClose} title="Close">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Contact;
