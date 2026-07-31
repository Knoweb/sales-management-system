import React, { forwardRef } from 'react';
import { Search } from 'lucide-react';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({ className = '', onSearch, onChange, ...props }, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <div className={`relative ${className}`.trim()} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <Search 
        size={18} 
        style={{ 
          position: 'absolute', 
          left: '12px', 
          color: 'var(--color-text-muted)' 
        }} 
      />
      <input
        ref={ref}
        type="search"
        className="form-control"
        style={{ paddingLeft: '38px', height: 'var(--control-height-md)', width: '100%', borderRadius: 'var(--radius-full)' }}
        onChange={handleChange}
        {...props}
      />
    </div>
  );
});
SearchInput.displayName = 'SearchInput';
