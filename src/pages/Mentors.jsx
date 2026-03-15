import { useState, useEffect } from 'react';
import MentorCard from '../components/MentorCard';
import { api } from '../services/api';

export default function Mentors() {
    const [mentors, setMentors] = useState([]);
    const [selectedType, setSelectedType] = useState('All');
    const [selectedDomain, setSelectedDomain] = useState('All');

    const mentorTypes = ['All', 'Faculty Mentor', 'Research Guide', 'Senior Student Mentor'];
    const domains = [
        'All', 'AI/ML', 'Web Development', 'IoT', 'Cybersecurity',
        'Cloud Computing', 'Data Science', 'Full Stack', 'Competitive Programming'
    ];

    useEffect(() => {
        const fetchMentors = async () => {
            try {
                const data = await api.getMentors();
                setMentors(data);
            } catch (error) {
                console.error("Failed to fetch mentors", error);
            }
        };
        fetchMentors();
    }, []);

    const handleConnect = async (mentor) => {
        const message = window.prompt(`Please enter a brief message for ${mentor.name} describing what you need help with:`);

        if (message === null) return; // User cancelled

        if (!message.trim()) {
            alert("A message is required to request mentorship.");
            return;
        }

        try {
            const data = await api.requestMentorship(mentor.id, message);
            if (data.success) {
                alert(data.message);
            } else {
                alert(data.message || "Failed to submit request.");
            }
        } catch (error) {
            console.error('Error connecting to mentor', error);
            alert("Error: Ensure you are logged in!");
        }
    };

    const filteredMentors = mentors.filter(m => {
        const matchType = selectedType === 'All' || m.mentor_type === selectedType;
        const matchDomain = selectedDomain === 'All' || m.domains.includes(selectedDomain);
        return matchType && matchDomain;
    });

    return (
        <div className="container page-layout animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">Mentor Matching</h1>
                <p className="page-subtitle">Find the right guidance for your projects and career.</p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mentor Type</p>
                <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                    {mentorTypes.map(type => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className="badge"
                            style={{
                                padding: '0.5rem 1rem', cursor: 'pointer', border: '1px solid var(--border-color)',
                                backgroundColor: selectedType === type ? 'var(--accent-teal)' : 'var(--card-bg)',
                                color: selectedType === type ? '#000' : 'var(--text-color)',
                            }}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Domain</p>
                <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {domains.map(domain => (
                        <button
                            key={domain}
                            onClick={() => setSelectedDomain(domain)}
                            className="badge"
                            style={{
                                padding: '0.5rem 1rem', cursor: 'pointer', border: '1px solid var(--border-color)',
                                backgroundColor: selectedDomain === domain ? 'var(--accent-purple)' : 'var(--bg-secondary)',
                                color: selectedDomain === domain ? '#FFF' : 'var(--text-color)',
                            }}
                        >
                            {domain}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid-4">
                {filteredMentors.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No mentors found matching your selected filters. Try broadening your search.
                    </div>
                ) : (
                    filteredMentors.map(m => (
                        <MentorCard key={m.id} mentor={m} onConnect={handleConnect} />
                    ))
                )}
            </div>
        </div>
    );
}
