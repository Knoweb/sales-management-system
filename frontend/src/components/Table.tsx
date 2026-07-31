import React from 'react';

export const Table: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="table-container">
    <table className="table">
      {children}
    </table>
  </div>
);

export const TableHead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead>{children}</thead>
);

export const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tbody>{children}</tbody>
);

export const TableRow: React.FC<{ children: React.ReactNode; onClick?: () => void; className?: string }> = ({ 
  children, 
  onClick, 
  className = '' 
}) => (
  <tr 
    onClick={onClick} 
    className={`${onClick ? 'cursor-pointer' : ''} ${className}`.trim()}
  >
    {children}
  </tr>
);

export const TableHeader: React.FC<{ children: React.ReactNode; className?: string; align?: 'left' | 'center' | 'right' }> = ({ children, className = '', align }) => (
  <th className={className} style={align ? { textAlign: align } : undefined}>{children}</th>
);

export const TableCell: React.FC<{ children: React.ReactNode; className?: string; align?: 'left' | 'center' | 'right' }> = ({ children, className = '', align }) => (
  <td className={className} style={align ? { textAlign: align } : undefined}>{children}</td>
);
