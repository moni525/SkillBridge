import { useState, useEffect } from 'react';
import { Github, Linkedin, Mail, ExternalLink, Compass } from 'lucide-react';
import { api } from '../services/api';

export default function Portfolio() {
    const [portfolio, setPortfolio] = useState({ student: null, projects: [], skillPaths: [] });

    useEffect(() => {
        const fetchPortfolioData = async () => {
            try {
                const user = await api.getMe();
                const projects = await api.getMyProjects();
                const skillPaths = await api.getMySkillPaths();

                // Add some dummy academic data to the User object for the UI
                setPortfolio({
                    student: { ...user, year: '3rd', dept: 'CSE' },
                    projects,
                    skillPaths
                });
            } catch (err) {
                console.error("Error fetching portfolio:", err);
            }
        };
        fetchPortfolioData();
    }, []);

    const { student, projects, skillPaths } = portfolio;

    return (
        <div className="container page-layout animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">Student Portfolio</h1>
                <p className="page-subtitle">Your academic and professional profile.</p>
            </div>

            <div className="grid-3" style={{ gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 2fr)' }}>
                {/* Profile Card */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <img
                        src="https://ui-avatars.com/api/?name=Arjun+Kumar&background=00f5c4&color=0b0f19&size=120"
                        alt="Profile"
                        style={{ borderRadius: '50%', marginBottom: '1.5rem', border: '4px solid var(--card-bg)', boxShadow: '0 0 0 2px var(--accent-purple)' }}
                    />
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{student?.name || 'RMKCETian'}</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{student ? `${student.year} Year, B.Tech ${student.dept}` : 'Student, Engineering'} <br /> RMKCET</p>

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                        <button className="btn-icon"><Github size={18} /></button>
                        <button className="btn-icon"><Linkedin size={18} /></button>
                        <button className="btn-icon"><Mail size={18} /></button>
                    </div>

                    <div style={{ width: '100%', textAlign: 'left', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                        <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem', letterSpacing: '0.05em' }}>Top Skills</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <span className="badge">React.js</span>
                            <span className="badge">Python</span>
                            <span className="badge">Machine Learning</span>
                            <span className="badge">UI/UX Design</span>
                        </div>
                    </div>
                </div>

                {/* Projects & Progress */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card">
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Academic Progress</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 500 }}>Overall CGPA</span>
                                    <span style={{ color: 'var(--accent-teal)', fontWeight: 600 }}>8.92</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: '89.2%', height: '100%', backgroundColor: 'var(--accent-teal)' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 500 }}>Attendance</span>
                                    <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>92%</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: '92%', height: '100%', backgroundColor: 'var(--accent-purple)' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Showcase Projects</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {projects.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)' }}>No projects added yet. Generate one in Planner!</p>
                            ) : projects.map(proj => (
                                <div key={proj.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '0.75rem' }}>
                                    <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                                        <h4 style={{ fontSize: '1rem', textTransform: 'capitalize' }}>{proj.domain} Project</h4>
                                        <a href="#" className="btn-icon" style={{ padding: '0.25rem' }}><ExternalLink size={16} /></a>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{proj.description}</p>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <span className="badge" style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}>{proj.domain.toUpperCase()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Compass size={20} color="var(--accent-teal)" /> Saved Skill Paths
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {skillPaths && skillPaths.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)' }}>No skill paths generated yet. Auto-saved when created in Generator!</p>
                            ) : skillPaths && skillPaths.map(path => (
                                <div key={path.id} style={{ padding: '1rem', backgroundColor: 'var(--bg-card)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                                    <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', textTransform: 'capitalize' }}>Goal: {path.goal}</h4>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                        Domain: {path.domain} • Time: {path.time_available}
                                    </p>
                                    <span className="badge" style={{ backgroundColor: 'rgba(0, 245, 196, 0.1)', color: 'var(--accent-teal)' }}>
                                        {path.roadmap && path.roadmap.weeks ? `${path.roadmap.weeks.length} Weeks Roadmap` : 'Roadmap Saved'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
