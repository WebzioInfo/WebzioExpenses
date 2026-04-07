import React from 'react';
import { cn } from '@/src/lib/utils';

const Table = ({ headers, children, className, containerClassName }) => {
  return (
    <div className={cn('clay-card p-0 overflow-hidden', containerClassName)}>
      <div className="overflow-x-auto">
        <table className={cn('clay-table', className)}>
          <thead>
            <tr>
              {headers.map((header, i) => (
                <th key={i}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
