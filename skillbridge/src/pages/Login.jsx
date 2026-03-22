import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Briefcase, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import './Login.css';

export default function Login() {
    const [role, setRole] = useState('student');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const formData = new FormData(e.target);
            const email = formData.get('email');
            const password = formData.get('password');
            const name = formData.get('name'); // Only for register

            if (isLogin) {
                const data = await api.login(email, password);
                if (data.success) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('student_name', data.user.name);
                    localStorage.setItem('role', data.user.role);
                    navigate('/dashboard');
                } else {
                    setError(data.message || 'Login failed');
                }
            } else {
                const data = await api.register({ name, email, password, role });
                if (data.success) {
                    // Auto login after register
                    const loginData = await api.login(email, password);
                    if (loginData.success) {
                        localStorage.setItem('token', loginData.token);
                        localStorage.setItem('student_name', loginData.user.name);
                        localStorage.setItem('role', loginData.user.role);
                        navigate('/dashboard');
                    }
                } else {
                    setError(data.message || 'Registration failed');
                }
            }
        } catch (err) {
            console.error('Auth error:', err);
            setError('Connection to server failed. Is Flask running?');
        }
    };

    return (
        <div className="login-container animate-fade-in">
            <div className="login-illustration-side">
                <div className="illustration-glow"></div>
                <img
                    src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Robot.png"
                    alt="AI Campus Assistant"
                    className="login-cartoon floating-animation"
                />
                <div className="illustration-text">
                    <h2><Sparkles size={24} style={{ display: 'inline', color: 'var(--accent-teal)' }} /> Welcome to the Future</h2>
                    <p>SkillBridge OS is your all-in-one <br />campus intelligence platform.</p>
                </div>
            </div>

            <div className="login-form-side">
                <div className="login-form-wrapper card">
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p style={{ color: 'var(--text-muted)' }}>
                            {isLogin ? 'Sign in to continue to SkillBridge' : 'Join the future of campus OS'}
                        </p>
                    </div>

                    <div className="role-selector" style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem', backgroundColor: 'var(--bg-color)', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
                        <button
                            type="button"
                            className={`btn ${role === 'student' ? 'btn-primary' : ''}`}
                            style={{ flex: 1, backgroundColor: role !== 'student' ? 'transparent' : '', color: role !== 'student' ? 'var(--text-muted)' : '', border: 'none' }}
                            onClick={() => setRole('student')}
                        >
                            <GraduationCap size={18} /> Student
                        </button>
                        <button
                            type="button"
                            className={`btn ${role === 'faculty' ? 'btn-primary' : ''}`}
                            style={{ flex: 1, backgroundColor: role !== 'faculty' ? 'transparent' : '', color: role !== 'faculty' ? 'var(--text-muted)' : '', border: 'none' }}
                            onClick={() => setRole('faculty')}
                        >
                            <Briefcase size={18} /> Faculty
                        </button>
                    </div>

                    {error && <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>{error}</div>}

                    <form onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="input-group">
                                <label className="input-label">Full Name</label>
                                <input type="text" name="name" className="input-field" placeholder="Enter your full name" required={!isLogin} />
                            </div>
                        )}
                        <div className="input-group" style={{ marginTop: '1rem' }}>
                            <label className="input-label">Email</label>
                            <input type="email" name="email" className="input-field" placeholder={`Enter ${role} email`} required defaultValue={isLogin ? "alice@rmkcet.ac.in" : ""} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <input type="password" name="password" className="input-field" placeholder="Enter your password" required defaultValue={isLogin ? "password123" : ""} />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '0.875rem' }}>
                            {isLogin ? 'Sign In' : 'Register'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button
                                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                style={{ background: 'none', border: 'none', color: 'var(--accent-teal)', cursor: 'pointer', fontWeight: '500', padding: 0 }}
                            >
                                {isLogin ? 'Sign up' : 'Sign in'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
