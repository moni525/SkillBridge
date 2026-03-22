import { Clock, MapPin } from 'lucide-react';

export default function LabCard({ name, location, todayHours, isAvailable }) {
    return (
        <div className="card lab-card">
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem' }}>{name}</h3>
                <span className="badge" style={{ backgroundColor: isAvailable ? 'rgba(0, 245, 196, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: isAvailable ? 'var(--accent-teal)' : '#ef4444' }}>
                    {isAvailable ? 'Available' : 'Booked'}
                </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} />
                    <span>{location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} />
                    <span>{todayHours}</span>
                </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} disabled={!isAvailable}>
                {isAvailable ? 'Book Slot' : 'Notify Me'}
            </button>
        </div>
    );
}
