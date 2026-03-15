import { useState, useEffect } from 'react';
import { Search, Book, Clock, Bell, ExternalLink } from 'lucide-react';
import { api } from '../services/api';

export default function Library() {
    const [query, setQuery] = useState('');
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Initial fetch to show all books
    useEffect(() => {
        handleSearch();
    }, []);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            const data = await api.searchBooks(query);
            setBooks(data);
        } catch (error) {
            console.error('Error fetching books', error);
            setMessage({ text: 'Failed to connect to the library system.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleReserve = async (copyId) => {
        try {
            const data = await api.reserveBook(copyId);
            setMessage({ text: data.message, type: data.success ? 'success' : 'error' });
            if (data.success) {
                handleSearch(); // Refresh list to show updated availability
            }
        } catch (error) {
            console.error('Error reserving book', error);
            setMessage({ text: 'Ensure you are logged in to reserve books.', type: 'error' });
        }
    };

    const handleNotify = async (bookId) => {
        try {
            const data = await api.notifyBookAvailability(bookId);
            setMessage({ text: data.message, type: data.success ? 'success' : 'error' });
        } catch (error) {
            console.error('Error subscribing to notifications', error);
            setMessage({ text: 'Ensure you are logged in to get notifications.', type: 'error' });
        }
    };

    return (
        <div className="container page-layout animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">RMKCET Library</h1>
                <p className="page-subtitle">Search, reserve, and track available library materials.</p>
            </div>

            <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', flex: 1, gap: '1rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Search by title, author, or subject..."
                            style={{ paddingLeft: '3rem' }}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ whiteSpace: 'nowrap' }}>
                        {loading ? 'Searching...' : 'Search Books'}
                    </button>
                </form>
            </div>

            {message.text && (
                <div style={{
                    padding: '1rem',
                    marginBottom: '2rem',
                    borderRadius: '0.75rem',
                    backgroundColor: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 245, 196, 0.1)',
                    color: message.type === 'error' ? '#ef4444' : 'var(--accent-teal)',
                    border: `1px solid ${message.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 245, 196, 0.2)'}`
                }}>
                    {message.text}
                </div>
            )}

            <div className="grid-3">
                {books.length === 0 && !loading && <p style={{ color: 'var(--text-muted)' }}>No books found matching your criteria.</p>}

                {books.map((book) => {
                    const isAvailable = book.available_count > 0;

                    return (
                        <div key={book.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div className="flex-between" style={{ marginBottom: '1rem' }}>
                                <span className="badge" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                                    {book.subject}
                                </span>
                                <span style={{
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: isAvailable ? 'var(--accent-teal)' : '#ef4444'
                                }}>
                                    {isAvailable ? `${book.available_count}/${book.total_copies} Available` : '0 Available'}
                                </span>
                            </div>

                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', lineHeight: 1.3 }}>{book.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', flex: 1 }}>By {book.author}</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                    <Book size={16} /> <span>Shelf: {book.shelf_location}</span>
                                </div>
                                {!isAvailable && book.expected_availability && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                        <Clock size={16} /> <span>Expected: {book.expected_availability}</span>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {isAvailable ? (
                                    <button
                                        className="btn btn-primary"
                                        style={{ width: '100%' }}
                                        onClick={() => handleReserve(book.available_copy_id)}
                                    >
                                        Reserve for 24h
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-secondary"
                                        style={{ width: '100%', borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)' }}
                                        onClick={() => handleNotify(book.id)}
                                    >
                                        <Bell size={16} /> Notify Me
                                    </button>
                                )}

                                {book.book_pdf && (
                                    <a
                                        href={book.book_pdf}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="btn btn-secondary"
                                        style={{ width: '100%', justifyContent: 'center' }}
                                    >
                                        <ExternalLink size={16} /> View Soft Copy
                                    </a>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
