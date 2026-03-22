import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function Planner() {
    const [idea, setIdea] = useState('');
    const [domain, setDomain] = useState('');
    const [showPlan, setShowPlan] = useState(false);
    const [planData, setPlanData] = useState(null);
    const [activeTab, setActiveTab] = useState('roadmap');
    const [isGenerating, setIsGenerating] = useState(false);

    const handlePlan = async (e) => {
        e.preventDefault();
        setIsGenerating(true);

        try {
            const data = await api.saveProject({ title: `${domain.toUpperCase()} Project`, description: idea, domain });
            if (data.success) {
                setPlanData(data.plan);
                setShowPlan(true);
            } else {
                alert(data.message || "Failed to generate plan.");
            }
        } catch (error) {
            console.error('Error saving project', error);
            alert("Ensure you are logged in.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="container page-layout animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">Project Planner</h1>
                <p className="page-subtitle">Turn your ideas into intelligent execution plans.</p>
            </div>

            <div className="grid-2">
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Describe Your Idea</h3>
                    <form onSubmit={handlePlan}>
                        <div className="input-group">
                            <label className="input-label">Project Domain</label>
                            <select className="input-field" value={domain} onChange={(e) => setDomain(e.target.value)} required disabled={isGenerating}>
                                <option value="">Select Domain...</option>
                                <option value="ai">Artificial Intelligence</option>
                                <option value="iot">Internet of Things</option>
                                <option value="web">Web Development</option>
                                <option value="core">Core Electronics</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Project Description</label>
                            <textarea
                                className="input-field"
                                rows="4"
                                placeholder="E.g., A smart campus entry system using RFID and facial recognition..."
                                value={idea}
                                onChange={(e) => setIdea(e.target.value)}
                                required
                                disabled={isGenerating}
                            ></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isGenerating}>
                            <Sparkles size={18} /> {isGenerating ? 'Architecting Plan...' : 'Generate AI Plan'}
                        </button>
                    </form>
                </div>

                {showPlan && planData && (
                    <div className="card animate-fade-in" style={{ borderColor: 'var(--accent-teal)' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Sparkles className="logo-icon" size={20} /> Your Structured AI Plan
                        </h3>

                        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', overflowX: 'auto' }}>
                            {['roadmap', 'mentors', 'resources', 'resume'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        padding: '0.5rem 0',
                                        background: 'none',
                                        border: 'none',
                                        borderBottom: activeTab === tab ? '2px solid var(--accent-teal)' : '2px solid transparent',
                                        color: activeTab === tab ? 'var(--text-color)' : 'var(--text-muted)',
                                        fontWeight: activeTab === tab ? 600 : 400,
                                        cursor: 'pointer',
                                        textTransform: 'capitalize',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {tab === 'resume' ? 'Resume Pitch' : tab}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'roadmap' && (
                            <div className="animate-fade-in">
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                                    {planData.tech_stack?.map((tech, i) => (
                                        <span key={i} className="badge" style={{ backgroundColor: 'var(--accent-blue)', color: 'white' }}>{tech}</span>
                                    ))}
                                </div>

                                <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Weekly Milestones</h4>
                                {planData.weekly_tasks?.map((week, i) => (
                                    <div key={i} style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem', marginBottom: '0.75rem' }}>
                                        <strong style={{ color: 'var(--accent-teal)' }}>Week {week.week}:</strong> {week.task}
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{week.details}</p>
                                    </div>
                                ))}

                                {planData.risk_warnings && planData.risk_warnings.length > 0 && (
                                    <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '3px solid #ef4444', borderRadius: '0 0.5rem 0.5rem 0' }}>
                                        <h4 style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Potential Risks & Warnings</h4>
                                        <ul style={{ listStylePosition: 'inside', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                            {planData.risk_warnings.map((risk, i) => <li key={i}>{risk}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'mentors' && (
                            <div className="animate-fade-in">
                                <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Suggested Campus Mentors</h4>
                                {planData.mentors_suggested?.map((mentor, i) => (
                                    <div key={i} style={{ padding: '1rem', backgroundColor: 'rgba(123, 97, 255, 0.05)', borderRadius: '0.5rem', border: '1px solid rgba(123, 97, 255, 0.2)', marginBottom: '0.75rem' }}>
                                        <strong style={{ display: 'block', fontSize: '1.05rem', color: 'var(--text-color)' }}>{mentor.name}</strong>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{mentor.reason}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'resources' && (
                            <div className="animate-fade-in">
                                <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Required Campus Labs</h4>
                                {planData.resources_needed?.map((lab, i) => (
                                    <div key={i} style={{ padding: '1rem', backgroundColor: 'rgba(45, 212, 191, 0.05)', borderRadius: '0.5rem', border: '1px solid rgba(45, 212, 191, 0.2)', marginBottom: '0.75rem' }}>
                                        <strong style={{ display: 'block', fontSize: '1.05rem', color: 'var(--text-color)' }}>{lab.name}</strong>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{lab.reason}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'resume' && (
                            <div className="animate-fade-in">
                                <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Resume Elevator Pitch</h4>
                                <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem', fontStyle: 'italic', color: 'var(--text-color)', lineHeight: 1.6 }}>
                                    "{planData.resume_description}"
                                </div>

                                <h4 style={{ fontSize: '1rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Skills to be Gained</h4>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {planData.required_skills?.map((skill, i) => (
                                        <span key={i} className="badge">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: '2rem' }}>
                            <button className="btn btn-secondary" style={{ width: '100%' }}>Plan Saved to Dashboard</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
