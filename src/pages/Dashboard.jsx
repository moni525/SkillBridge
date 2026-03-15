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

            <div className="grid-2" style={{ marginBottom: '2rem' }}>
                <DashboardCard title="Upcoming Events" link="/events" linkText="See All Events">
                    {data.upcoming_events.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No upcoming events.</p>}
                    {data.upcoming_events.map(evt => (
                        <div key={evt.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(123, 97, 255, 0.1)', borderRadius: '0.5rem', color: 'var(--accent-purple)' }}>
                                <Calendar size={24} />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{evt.title}</h4>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{evt.date}, {evt.time} • {evt.place || evt.location}</p>
                            </div>
                        </div>
                    ))}
                </DashboardCard>

                <DashboardCard title="Active Projects" link="/planner" linkText="Project Planner">
                    {data.active_projects.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No active projects.</p>}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {data.active_projects.map(proj => (
                            <div key={proj.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '0.75rem' }}>
                                <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                                    <h4 style={{ fontSize: '1rem' }}>{proj.title}</h4>
                                    <span className="badge">{proj.domain.toUpperCase()}</span>
                                </div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{proj.description}</p>
                                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: '10%', height: '100%', backgroundColor: 'var(--accent-teal)' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </DashboardCard>
            </div>

            <div className="grid-2">
                <DashboardCard title="Recommended Mentors" link="/mentors" linkText="Find Mentors">
                    {data.recommended_mentors.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No mentors found.</p>}
                    {data.recommended_mentors.map(mentor => (
                        <div key={mentor.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=random`} alt="Avatar" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                                <div>
                                    <h4 style={{ fontSize: '0.95rem' }}>{mentor.name}</h4>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{mentor.mentor_type} • {mentor.domains.substring(0, 30)}...</p>
                                </div>
                            </div>
                            <Link to="/mentors" className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem' }}>Connect</Link>
                        </div>
                    ))}
                </DashboardCard>

                <DashboardCard title="My Bookings" link="/resources" linkText="Book Resources">
                    {data.my_bookings.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No bookings today.</p>}
                    {data.my_bookings.map((booking, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ padding: '0.5rem', backgroundColor: 'rgba(123, 97, 255, 0.1)', borderRadius: '0.5rem', color: 'var(--accent-purple)' }}>
                                    <FlaskConical size={20} />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '0.95rem' }}>{booking.item_name}</h4>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Time: {booking.time}</p>
                                </div>
                            </div>
                            <span className="badge" style={{ backgroundColor: 'rgba(0, 245, 196, 0.1)', color: 'var(--accent-teal)' }}>Confirmed</span>
                        </div>
                    ))}
                </DashboardCard>
            </div>
        </div>
    );
}
