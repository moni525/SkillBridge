import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import './Chatbot.css';

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi there! 👋 I'm the SkillBridge AI Assistant. You can ask me about events, labs, or mentors currently available on campus!", isBot: true }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userText = input.trim();
        setMessages(prev => [...prev, { text: userText, isBot: false }]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:5000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText })
            });
            const data = await response.json();

            setMessages(prev => [...prev, { text: data.reply, isBot: true }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { text: 'Sorry, I am having trouble reaching the server.', isBot: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chatbot-container">
            {/* Chat Toggle Button */}
            <button
                className={`chat-toggle-btn ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle AI Chat"
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window animate-fade-in">
                    <div className="chat-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ backgroundColor: 'rgba(0, 245, 196, 0.2)', padding: '0.4rem', borderRadius: '50%', color: 'var(--accent-teal)' }}>
                                <Sparkles size={18} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1rem', margin: 0 }}>SkillBridge AI</h3>
                                <span style={{ fontSize: '0.75rem', color: 'var(--accent-teal)' }}>Online</span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="btn-icon">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message-wrapper ${msg.isBot ? 'bot' : 'user'}`}>
                                <div className={`message-bubble ${msg.isBot ? 'bot' : 'user'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message-wrapper bot">
                                <div className="message-bubble bot" style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '36px' }}>
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="typing-dot" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSend} className="chat-input-area">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything about campus..."
                            className="chat-input"
                        />
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ padding: '0.5rem', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                            disabled={!input.trim() || isLoading}
                        >
                            <Send size={16} style={{ marginLeft: '2px' }} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
