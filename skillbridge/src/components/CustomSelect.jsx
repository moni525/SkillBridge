import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CustomSelect({ options, value, onChange, placeholder = 'Select...', label }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange({ target: { name: label, value: optionValue } });
        setIsOpen(false);
    };

    return (
        <div className="input-group" ref={containerRef}>
            {label && <label className="input-label">{label}</label>}
            <div className="custom-select-container">
                <div 
                    className={`custom-select-trigger ${isOpen ? 'active' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                    tabIndex={0}
                >
                    <span style={{ color: selectedOption ? 'var(--text-color)' : 'var(--text-muted)' }}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronDown 
                        size={18} 
                        style={{ 
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', 
                            transition: 'transform 0.3s ease',
                            color: 'var(--accent-teal)'
                        }} 
                    />
                </div>
                
                <div className={`custom-select-options ${isOpen ? 'open' : ''}`}>
                    {options.map((option) => (
                        <div 
                            key={option.value}
                            className={`select-option ${value === option.value ? 'selected' : ''}`}
                            onClick={() => handleSelect(option.value)}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
