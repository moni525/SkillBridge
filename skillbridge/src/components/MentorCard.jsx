export default function MentorCard({ mentor, onConnect }) {
    const domainsList = mentor.domains ? mentor.domains.split(',').map(d => d.trim()) : [];

    return (
        <div className="card mentor-card flex-center" style={{ flexDirection: 'column', textAlign: 'center', height: '100%', justifyContent: 'space-between' }}>
            <div>
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=random`} alt={mentor.name} style={{ width: 80, height: 80, borderRadius: '50%', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{mentor.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 600 }}>{mentor.mentor_type}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{mentor.department}</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem' }}>
                    {domainsList.map((d, index) => (
                        <span key={index} className="badge" style={{ fontSize: '0.75rem' }}>{d}</span>
                    ))}
                </div>
            </div>

            <div style={{ width: '100%' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--accent-teal)', marginBottom: '0.75rem', fontWeight: 500 }}>🕒 {mentor.availability}</p>
                <button
                    className="btn btn-secondary"
                    style={{ width: '100%' }}
                    onClick={() => onConnect(mentor)}
                >
                    Request Mentorship
                </button>
            </div>
        </div>
    );
}
