import { useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './LoginModal.css';

export default function LoginModal({ onClose }) {
    const [role, setRole] = useState('student');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            if (role === 'student') {
                const formData = new FormData(e.target);
                const name = formData.get('id_email'); // using the input name
                // For prototype, we ask for just one ID field, we'll split or mock dept/year
                const response = await fetch('http://127.0.0.1:5000/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: name, dept: 'CSE', year: '3' }),
                });
                const data = await response.json();
                if (data.success) {
                    localStorage.setItem('student_id', data.student_id);
                    localStorage.setItem('student_name', name);
                }
            }
            onClose();
            navigate('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    return (
        <div className="modal-overlay blur-backdrop" onClick={onClose}>
            <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <button className="btn-icon close-btn" onClick={onClose}>
                    <X size={20} />
                </button>

                <h2 className="modal-title">Welcome Back</h2>
                <p className="modal-subtitle">Login to access your campus resources</p>

                <form className="login-form" onSubmit={handleLogin}>
                    <div className="input-group">
                        <label className="input-label">Select Role</label>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                            <button
                                type="button"
                                className={`btn ${role === 'student' ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ flex: 1, padding: '0.5rem' }}
                                onClick={() => setRole('student')}
                            >
                                Student
                            </button>
                            <button
                                type="button"
                                className={`btn ${role === 'faculty' ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ flex: 1, padding: '0.5rem' }}
                                onClick={() => setRole('faculty')}
                            >
                                Faculty
                            </button>
                        </div>
                    </div>

                    <div className="input-group" style={{ marginTop: '1rem' }}>
                        <label className="input-label">{role === 'student' ? 'Student ID / Email' : 'Faculty ID / Email'}</label>
                        <input type="text" name="id_email" className="input-field" placeholder={`Enter ${role === 'student' ? 'RMKCET ID' : 'Faculty ID'}`} required />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <input type="password" className="input-field" placeholder="••••••••" required />
                    </div>
                    <button type="submit" className="btn btn-primary w-full mt-4">Login</button>
                </form>

                <p className="modal-footer">
                    Don't have an account? <a href="#" className="link-accent">Contact Admin</a>
                </p>
            </div>
        </div>
    );
}
