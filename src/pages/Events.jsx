import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { api } from '../services/api';

export default function Events() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await api.getEvents();
                setEvents(data);
            } catch (error) {
                console.error("Failed to fetch events:", error);
            }
        };
        fetchEvents();
    }, []);

    return (
        <div className="container page-layout animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">Events Hub</h1>
                <p className="page-subtitle">Discover and register for upcoming college events.</p>
            </div>

            <div className="grid-3">
                {events.map((evt) => (
                    <div key={evt.id} className="card">
                        <div className="flex-between" style={{ marginBottom: '1rem' }}>
                            <span className="badge">{evt.type}</span>
                            <span style={{ fontSize: '0.875rem', color: 'var(--accent-teal)', fontWeight: 600 }}>{evt.status}</span>
                        </div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{evt.title}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={16} /> <span>{evt.date}</span></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} /> <span>{evt.time}</span></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16} /> <span>{evt.place}</span></div>
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%' }}>Register Now</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
