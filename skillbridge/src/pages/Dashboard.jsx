import { useState, useEffect } from 'react';
import DashboardCard from '../components/DashboardCard';
import { Calendar, Users, FolderKanban, FlaskConical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function Dashboard() {
    const [data, setData] = useState({
        upcoming_events: [],
        active_projects: [],
        my_bookings: [],
        recommended_mentors: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardInfo = async () => {
            try {
                const response = await api.getDashboardData();
                setData(response);
            } catch (error) {
                console.error("Dashboard fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardInfo();
    }, []);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Dashboard...</div>;

    const studentName = localStorage.getItem('student_name') || 'Student';

    return (
        <div className="container page-layout animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Welcome back, {studentName}. Here's what's happening today.</p>
            </div>

            <div className="grid-2" style={{ marginBottom: '2.5rem', gap: '2rem' }}>
                <DashboardCard title="Upcoming Events" link="/events" linkText="See All Events">
                    {data.upcoming_events.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No upcoming events.</p>}
                    {data.upcoming_events.map(evt => (
                        <div key={evt.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
                            <div style={{ padding: '0.8rem', backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', color: 'var(--accent-purple)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                                <Calendar size={22} />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{evt.title}</h4>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{evt.date}, {evt.time} • {evt.place || evt.location}</p>
                            </div>
                        </div>
                    ))}
                </DashboardCard>

                <DashboardCard title="Active Projects" link="/planner" linkText="Project Planner">
                    {data.active_projects.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No active projects.</p>}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {data.active_projects.map(proj => (
                            <div key={proj.id} style={{ padding: '1.25rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                                <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{proj.title}</h4>
                                    <span className="badge">{proj.domain.toUpperCase()}</span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>{proj.description}</p>
                                <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                                    <div style={{ width: '15%', height: '100%', background: 'linear-gradient(90deg, var(--accent-teal), #00d4aa)', transition: 'width 1s ease' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </DashboardCard>
            </div>

            <div className="grid-2" style={{ gap: '2rem' }}>
                <DashboardCard title="Recommended Mentors" link="/mentors" linkText="Find Mentors">
                    {data.recommended_mentors.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No mentors found.</p>}
                    {data.recommended_mentors.map(mentor => (
                        <div key={mentor.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=random`} alt="Avatar" style={{ width: 44, height: 44, borderRadius: '12px', border: '1px solid var(--border-color)' }} />
                                <div>
                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{mentor.name}</h4>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{mentor.mentor_type} • {mentor.domains.substring(0, 25)}...</p>
                                </div>
                            </div>
                            <Link to="/mentors" className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', borderRadius: '10px' }}>Connect</Link>
                        </div>
                    ))}
                </DashboardCard>

                <DashboardCard title="My Bookings" link="/resources" linkText="Book Resources">
                    {data.my_bookings.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No bookings today.</p>}
                    {data.my_bookings.map((booking, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ padding: '0.6rem', backgroundColor: 'rgba(0, 245, 196, 0.1)', borderRadius: '10px', color: 'var(--accent-teal)', border: '1px solid rgba(0, 245, 196, 0.2)' }}>
                                    <FlaskConical size={20} />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{booking.item_name}</h4>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{booking.time}</p>
                                </div>
                            </div>
                            <span className="badge" style={{ padding: '0.25rem 0.6rem', borderRadius: '6px' }}>Confirmed</span>
                        </div>
                    ))}
                </DashboardCard>
            </div>
        </div>
    );
}
