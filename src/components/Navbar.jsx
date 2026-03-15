import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Sparkles, Menu, X, User, LogOut } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const isLoggedIn = !!localStorage.getItem('token');

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Events', path: '/events' },
        { name: 'Mentors', path: '/mentors' },
        { name: 'Planner', path: '/planner' },
        { name: 'Resources', path: '/resources' },
        { name: 'Skill Path', path: '/skill-path' },
        { name: 'Portfolio', path: '/portfolio' },
        { name: 'Library', path: '/library' }
    ];

    const isActive = (path) => location.pathname === path;

    const handleAuthAction = () => {
        if (isLoggedIn) {
            localStorage.removeItem('token');
            localStorage.removeItem('student_name');
            localStorage.removeItem('role');
            navigate('/');
        } else {
            navigate('/');
        }
    };

    return (
        <nav className="navbar blur-backdrop">
            <div className="container nav-container">
                <Link to="/" className="nav-logo">
                    <Sparkles className="logo-icon" size={24} />
                    <span className="logo-text">SkillBridge</span>
                </Link>

                {isLoggedIn && (
                    <div className="nav-links desktop-only">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                )}

                <div className="nav-actions">
                    <button onClick={toggleTheme} className="btn-icon theme-toggle" aria-label="Toggle Theme">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button className="btn btn-primary desktop-only" onClick={handleAuthAction}>
                        {isLoggedIn ? <LogOut size={18} /> : <User size={18} />}
                        <span>{isLoggedIn ? 'Logout' : 'Login'}</span>
                    </button>
                    {isLoggedIn && (
                        <button className="btn-icon mobile-only" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    )}
                </div>
            </div>

            {isLoggedIn && isMenuOpen && (
                <div className="mobile-menu animate-fade-in">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`mobile-link ${isActive(link.path) ? 'active' : ''}`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <button className="btn btn-primary mobile-login-btn" onClick={() => { handleAuthAction(); setIsMenuOpen(false); }}>
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
}
