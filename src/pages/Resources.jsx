import { useState, useEffect } from 'react';
import LabCard from '../components/LabCard';
import { api } from '../services/api';

export default function Resources() {
    const [labs, setLabs] = useState([]);

    const fetchResources = async () => {
        try {
            const data = await api.getResources();
            setLabs(data);
        } catch (error) {
            console.error("Error fetching resources:", error);
        }
    };

    useEffect(() => {
        fetchResources();
    }, []);

    const handleBook = async (resourceId) => {
        try {
            const data = await api.bookResource(resourceId);
            if (data.success) {
                alert(data.message);
                fetchResources(); // Refresh lab statuses
            } else {
                alert(data.message || "Failed to book resource.");
            }
        } catch (error) {
            console.error('Error booking resource', error);
            alert("Please ensure you are logged in.");
        }
    };

    return (
        <div className="container page-layout animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">Resource Booking</h1>
                <p className="page-subtitle">Check availability and book labs, halls, and equipment.</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <input type="date" className="input-field" style={{ width: 'auto' }} />
                <select className="input-field" style={{ width: 'auto' }}>
                    <option>All Resources</option>
                    <option>Labs</option>
                    <option>Halls</option>
                    <option>Equipment</option>
                </select>
            </div>

            <div className="grid-3">
                {labs.map(lab => (
                    <div key={lab.id} onClick={() => { if (lab.status !== 'Booked') handleBook(lab.id) }}>
                        <LabCard {...lab} todayHours={lab.today_hours} isAvailable={lab.status !== 'Booked'} />
                    </div>
                ))}
            </div>
        </div>
    );
}
