import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export interface Option {
    id: string;
    label: string;
    subtitle?: string;
    originalData?: unknown;
}

interface SearchableSelectProps {
    value?: string;
    onChange: (value: string, option?: Option) => void;
    fetchOptions: (search: string) => Promise<Option[]>;
    placeholder?: string;
    disabled?: boolean;
    style?: React.CSSProperties;
    defaultLabel?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
    value,
    onChange,
    fetchOptions,
    placeholder = 'Select an option...',
    disabled = false,
    style,
    defaultLabel
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [options, setOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedOption, setSelectedOption] = useState<Option | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetchOptions(search);
                setOptions(res || []);
            } catch {
                setOptions([]);
            }
            setLoading(false);
        };
        const timer = setTimeout(() => {
            load();
        }, 300);
        
        return () => clearTimeout(timer);
    }, [search, isOpen, fetchOptions]);

    
    useEffect(() => {
        if (!value) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedOption(null);
        } else {
            const found = options.find(o => o.id === value);
            if (found) {
                setSelectedOption(found);
            } else if (defaultLabel && !selectedOption) {
                setSelectedOption({ id: value, label: defaultLabel });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, options, defaultLabel]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%', ...style }}>
            <div 
                onClick={() => !disabled && setIsOpen(!isOpen)}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', border: '1px solid var(--color-border-strong)', borderRadius: '4px',
                    backgroundColor: disabled ? 'var(--color-surface-secondary)' : 'var(--color-surface)',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    minHeight: '38px',
                    color: !selectedOption ? 'var(--color-text-muted)' : 'var(--color-text-primary)'
                }}
            >
                <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedOption ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '14px', fontWeight: 500 }}>{selectedOption.label}</span>
                            {selectedOption.subtitle && <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{selectedOption.subtitle}</span>}
                        </div>
                    ) : (
                        <span style={{ fontSize: '14px' }}>{placeholder}</span>
                    )}
                </div>
                {value && !disabled ? (
                    <X 
                        size={16} 
                        style={{ cursor: 'pointer', color: 'var(--color-text-muted)', marginLeft: '8px' }} 
                        onClick={(e) => { e.stopPropagation(); onChange(''); setSelectedOption(null); }} 
                    />
                ) : (
                    <ChevronDown size={16} style={{ color: 'var(--color-text-muted)', marginLeft: '8px' }} />
                )}
            </div>

            {isOpen && !disabled && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    marginTop: '4px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 9999, maxHeight: '300px', display: 'flex', flexDirection: 'column'
                }}>
                    <div style={{ padding: '8px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center' }}>
                        <Search size={14} style={{ color: 'var(--color-text-muted)', marginRight: '8px' }} />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }}
                        />
                    </div>
                    
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {loading ? (
                            <div style={{ padding: '12px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>Loading...</div>
                        ) : options.length === 0 ? (
                            <div style={{ padding: '12px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>No options found</div>
                        ) : (
                            options.map(option => (
                                <div
                                    key={option.id}
                                    onClick={() => {
                                        onChange(option.id, option);
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                    style={{
                                        padding: '8px 12px', cursor: 'pointer',
                                        backgroundColor: value === option.id ? 'var(--color-primary-soft)' : 'var(--color-surface)',
                                        borderBottom: '1px solid var(--color-surface-secondary)',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-secondary)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = value === option.id ? 'var(--color-primary-soft)' : 'var(--color-surface)')}
                                >
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: value === option.id ? 600 : 400 }}>{option.label}</div>
                                        {option.subtitle && <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{option.subtitle}</div>}
                                    </div>
                                    {value === option.id && <Check size={16} style={{ color: 'var(--color-primary)' }} />}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


