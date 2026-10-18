import React from 'react';

export interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const norm = status.toLowerCase();

  let variantClass = 'badge-neutral';

  // Success (Green)
  if (['paid', 'active', 'resolved', 'closed', 'available'].includes(norm)) {
    variantClass = 'badge-success';
  }
  // Warning (Amber)
  else if (['pending', 'notice period', 'in progress', 'on hold', 'under renovation'].includes(norm)) {
    variantClass = 'badge-warning';
  }
  // Danger (Red)
  else if (['overdue', 'urgent', 'high', 'full', 'inactive', 'moved out'].includes(norm)) {
    variantClass = 'badge-danger';
  }
  // Info (Sky)
  else if (['single', 'double', 'triple', 'four', 'maintenance', 'medium', 'low', 'co-living', 'gents', 'ladies'].includes(norm)) {
    variantClass = 'badge-info';
  }

  return (
    <span className={`badge ${variantClass} ${size === 'sm' ? 'btn-sm' : ''}`}>
      <span className="badge-dot" />
      {status}
    </span>
  );
};
