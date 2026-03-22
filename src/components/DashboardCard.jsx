import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardCard({ title, link, linkText, children }) {
    return (
        <div className="card dashboard-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem' }}>{title}</h3>
                {link && (
                    <Link to={link} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-purple)' }}>
                        {linkText || 'View All'} <ArrowRight size={14} />
                    </Link>
                )}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {children}
            </div>
        </div>
    );
}
