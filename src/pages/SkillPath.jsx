import { useState, useEffect } from 'react';
import { Compass, Sparkles, Code, Briefcase, Calendar, ChevronRight, CheckCircle2, Circle, AlertCircle, BarChart3, Target, Clock, Globe } from 'lucide-react';
import { api } from '../services/api';
import CustomSelect from '../components/CustomSelect';

export default function SkillPath() {
    const [formData, setFormData] = useState({
        goal: '',
        current_skills: '',
        time_available: '10 hours/week',
        domain: 'Artificial Intelligence'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Active Path State
    const [activePath, setActivePath] = useState(null);
    const [taskStatus, setTaskStatus] = useState({}); // { taskId: boolean }
    const [updatingProgress, setUpdatingProgress] = useState(false);
    const [suggestEasier, setSuggestEasier] = useState(false);
    const [generatingEasier, setGeneratingEasier] = useState(false);

    const timeOptions = [
        { value: '5 hours/week', label: '5 hours/week' },
        { value: '10 hours/week', label: '10 hours/week' },
        { value: '20 hours/week', label: '20 hours/week' },
        { value: 'Full Time', label: 'Full Time' }
    ];

    const domainOptions = [
        { value: 'Frontend', label: 'Frontend Dev' },
        { value: 'Backend', label: 'Backend Dev' },
        { value: 'Full Stack', label: 'Full Stack' },
        { value: 'Artificial Intelligence', label: 'AI / ML' },
        { value: 'Cloud Computing', label: 'Cloud Computing' },
        { value: 'Data Science', label: 'Data Science' },
        { value: 'Cybersecurity', label: 'Cybersecurity' }
    ];

    const fetchActivePath = async () => {
        try {
            const data = await api.getActiveSkillPath();
            if (data.has_active_path) {
                setActivePath(data.path);
                // Initialize checkboxes based on completed status
                const initialStatus = {};
                Object.values(data.path.tasks_by_week).forEach(weekTasks => {
                    weekTasks.forEach(task => {
                        initialStatus[task.id] = task.status === 'completed';
                    });
                });
                setTaskStatus(initialStatus);
            } else {
                setActivePath(null);
            }
        } catch (err) {
            console.error("Failed to fetch active path", err);
        }
    };

    useEffect(() => {
        fetchActivePath();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await api.generateSkillPath(formData);
            if (data.success) {
                await fetchActivePath(); // Refresh to get the newly created path and its tasks
            } else {
                setError(data.message || 'Failed to generate skill path.');
            }
        } catch (err) {
            console.error('Skill Path Gen Error:', err);
            setError('Connection failed. Please check the backend server.');
        } finally {
            setLoading(false);
        }
    };

    const toggleTask = (taskId) => {
        setTaskStatus(prev => ({ ...prev, [taskId]: !prev[taskId] }));
    };

    const handleUpdateProgress = async () => {
        if (!activePath) return;
        setUpdatingProgress(true);

        try {
            // Filter tasks based on the CURRENT week we are looking at. 
            // For simplicity, we process all tasks in the active path.
            const completedIds = [];
            const pendingIds = [];

            Object.values(activePath.tasks_by_week).forEach(weekTasks => {
                weekTasks.forEach(task => {
                    // Only process tasks that were pending
                    if (task.status === 'pending') {
                        if (taskStatus[task.id]) {
                            completedIds.push(task.id);
                        } else {
                            pendingIds.push(task.id);
                        }
                    }
                });
            });

            if (completedIds.length === 0 && pendingIds.length === 0) {
                setUpdatingProgress(false);
                return; // Nothing to update
            }

            const data = await api.updateSkillTasks(completedIds, pendingIds);

            if (data.success) {
                if (data.suggest_easier) {
                    setSuggestEasier(true);
                }
                await fetchActivePath(); // Refresh the data to show updated weeks
            } else {
                alert(data.message || "Failed to save progress.");
            }
        } catch (err) {
            console.error("Update error:", err);
            alert("Failed to save progress. Please check your connection or server status.");
        } finally {
            setUpdatingProgress(false);
        }
    };

    const handleRequestEasier = async () => {
        if (!activePath) return;
        setGeneratingEasier(true);
        setSuggestEasier(false);
        try {
            const data = await api.requestEasierPath(activePath.id);
            if (data.success) {
                await fetchActivePath();
            } else {
                alert("Failed to generate easier path.");
            }
        } catch (err) {
            console.error("Easier path error", err);
            alert("Connection error trying to reach AI.");
        } finally {
            setGeneratingEasier(false);
        }
    };

    // Calculate progress for active path
    let totalTasks = 0;
    let completedTasksCount = 0;
    if (activePath) {
        Object.values(activePath.tasks_by_week).forEach(weekTasks => {
            weekTasks.forEach(task => {
                totalTasks++;
                if (task.status === 'completed') completedTasksCount++;
            });
        });
    }
    const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasksCount / totalTasks) * 100);

    return (
        <div className="container page-layout animate-fade-in">
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(0, 245, 196, 0.1)', borderRadius: '0.75rem', color: 'var(--accent-teal)' }}>
                    <Compass size={32} />
                </div>
                <div>
                    <h1 className="page-title">Adaptive AI Skill Path</h1>
                    <p className="page-subtitle">Get a custom roadmap, track your tasks, and let AI adapt to your pace.</p>
                </div>
            </div>

            <div className="grid-2">
                {/* Form Section */}
                <div className="card glass">
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Target size={20} color="var(--accent-purple)" />
                        Create New Path
                    </h3>
                    <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        <div className="input-group">
                            <label className="input-label">What is your career goal?</label>
                            <input
                                type="text"
                                name="goal"
                                className="input-field"
                                placeholder="e.g. Become a Full Stack Developer"
                                value={formData.goal}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">What are your current skills?</label>
                            <input
                                type="text"
                                name="current_skills"
                                className="input-field"
                                placeholder="e.g. Basic HTML, Python"
                                value={formData.current_skills}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid-2" style={{ gap: '1rem' }}>
                            <CustomSelect 
                                label="Time Available"
                                options={timeOptions}
                                value={formData.time_available}
                                onChange={(e) => setFormData({ ...formData, time_available: e.target.value })}
                            />
                            <CustomSelect 
                                label="Preferred Domain"
                                options={domainOptions}
                                value={formData.domain}
                                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                            />
                        </div>

                        {error && <p style={{ color: '#ff4b4b', fontSize: '0.875rem' }}>{error}</p>}

                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ justifyContent: 'center' }}>
                            {loading ? 'Consulting Gemini AI...' : (activePath ? 'Generate overriding Path' : 'Generate Skill Path')}
                            {!loading && <Sparkles size={18} />}
                        </button>
                    </form>
                </div>

                {/* Tracking & Results Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {!loading && !activePath && !generatingEasier && (
                        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: 0.6 }}>
                            <Compass size={48} style={{ marginBottom: '1rem', color: 'var(--text-muted)' }} />
                            <p>Fill out the form to generate your<br />personalized learning roadmap.</p>
                        </div>
                    )}

                    {(loading || generatingEasier) && (
                        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-teal)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
                                {generatingEasier ? 'Re-calibrating roadmap with easier tasks...' : 'Analyzing skills and building path...'}
                            </p>
                        </div>
                    )}

                    {!loading && !generatingEasier && activePath && (
                        <div className="roadmap-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '700px', overflowY: 'auto', paddingRight: '0.75rem' }}>
                            <div className="card glass" style={{ borderBottom: '2px solid var(--accent-teal)', padding: '1.5rem' }}>
                                <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <BarChart3 size={22} color="var(--accent-teal)" />
                                        Active Tracker
                                    </h3>
                                    <span style={{ fontWeight: 700, color: 'var(--accent-teal)', fontSize: '1.1rem' }}>{progressPercent}%</span>
                                </div>
                                <div style={{ width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.05)', height: '10px', borderRadius: '5px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                                    <div style={{ width: `${progressPercent}%`, background: 'linear-gradient(90deg, var(--accent-teal), #00d4aa)', height: '100%', transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 0 10px var(--accent-teal-glow)' }}></div>
                                </div>

                                {suggestEasier && (
                                    <div className="animate-fade-in" style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(255, 171, 0, 0.1)', border: '1px solid rgba(255, 171, 0, 0.3)', borderRadius: '0.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                        <AlertCircle size={24} color="#ffab00" style={{ flexShrink: 0 }} />
                                        <div>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 500 }}>Falling behind?</p>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>You had several tasks roll over. Would you like me to restructure your roadmap to be a bit easier so you can catch up?</p>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={handleRequestEasier} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Yes, make it easier</button>
                                                <button onClick={() => setSuggestEasier(false)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>No, I'll manage</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {Object.entries(activePath.tasks_by_week).map(([weekNum, tasks]) => {
                                // Find full week info from roadmap json if it exists
                                const weekDetails = activePath.roadmap?.weeks?.find(w => w.week_number === parseInt(weekNum)) || {};

                                return (
                                    <div key={weekNum} className="card glass" style={{ borderLeft: '4px solid var(--accent-purple)', padding: '1.5rem' }}>
                                        <div className="flex-between" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                                            <h4 style={{ fontSize: '1.1rem', color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                <Calendar size={18} />
                                                Week {weekNum}: {weekDetails.focus || 'Development Phase'}
                                            </h4>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                                            {/* Actionable Tasks Checklists */}
                                            {tasks && tasks.length > 0 && (
                                                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.5rem' }}>
                                                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Actionable Tasks</p>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        {tasks.map(task => (
                                                            <div
                                                                key={task.id}
                                                                onClick={() => { if (task.status === 'pending') toggleTask(task.id) }}
                                                                style={{
                                                                    display: 'flex',
                                                                    gap: '0.75rem',
                                                                    alignItems: 'flex-start',
                                                                    padding: '0.5rem',
                                                                    borderRadius: '0.25rem',
                                                                    cursor: task.status === 'pending' ? 'pointer' : 'default',
                                                                    backgroundColor: taskStatus[task.id] ? 'rgba(0, 245, 196, 0.05)' : 'transparent',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                <div style={{ marginTop: '0.1rem' }}>
                                                                    {taskStatus[task.id] ? (
                                                                        <CheckCircle2 size={18} color="var(--accent-teal)" />
                                                                    ) : (
                                                                        <Circle size={18} color="var(--text-muted)" />
                                                                    )}
                                                                </div>
                                                                <span style={{
                                                                    fontSize: '0.9rem',
                                                                    color: taskStatus[task.id] ? 'var(--text-muted)' : 'var(--text-primary)',
                                                                    textDecoration: taskStatus[task.id] ? 'line-through' : 'none'
                                                                }}>
                                                                    {task.task_text}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Extra Information */}
                                            {weekDetails.resources && weekDetails.resources.length > 0 && (
                                                <div>
                                                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Learning Material</p>
                                                    <p style={{ fontSize: '0.875rem' }}>{weekDetails.resources[0]}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                <button
                                    className="btn btn-primary"
                                    disabled={updatingProgress || progressPercent === 100}
                                    onClick={handleUpdateProgress}
                                >
                                    {updatingProgress ? 'Saving...' : 'Save & Update Progress'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .roadmap-container::-webkit-scrollbar {
                    width: 6px;
                }
                .roadmap-container::-webkit-scrollbar-thumb {
                    background-color: var(--border-color);
                    border-radius: 3px;
                }
            `}</style>
        </div>
    );
}
