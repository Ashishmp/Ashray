import React from 'react';

export type BadgeVariant =
  | 'paid'
  | 'pending'
  | 'overdue'
  | 'partially_paid'
  | 'occupied'
  | 'vacant'
  | 'maintenance'
  | 'reserved'
  | 'active'
  | 'notice_period'
  | 'checked_out'
  | 'verified'
  | 'archived'
  | 'boys'
  | 'girls'
  | 'co-living';

interface StatusBadgeProps {
  status: BadgeVariant | string;
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'sm' }) => {
  const norm = status.toLowerCase();

  let styles = 'bg-stone-100 text-stone-700 border-stone-200';
  let dotColor = 'bg-stone-500';
  let defaultLabel = label || status;

  switch (norm) {
    // Green (Positive)
    case 'paid':
    case 'active':
    case 'verified':
    case 'available':
      styles = 'bg-[#EAF7F0] text-[#16845B] border-[#C6EADB]';
      dotColor = 'bg-[#16845B]';
      defaultLabel = label || (norm === 'paid' ? 'Paid' : norm === 'verified' ? 'KYC Verified' : 'Active');
      break;

    // Amber (Pending / In Progress)
    case 'pending':
    case 'partially_paid':
    case 'partial':
    case 'notice_period':
    case 'reserved':
      styles = 'bg-[#FEF8EC] text-[#D99118] border-[#F7E4BE]';
      dotColor = 'bg-[#D99118]';
      defaultLabel =
        label ||
        (norm === 'pending'
          ? 'Pending'
          : norm === 'partially_paid'
          ? 'Partial'
          : norm === 'notice_period'
          ? 'Notice Period'
          : 'Reserved');
      break;

    // Red (Overdue / Attention / Blocked)
    case 'overdue':
    case 'rejected':
    case 'full':
    case 'maintenance':
    case 'archived':
      styles = 'bg-[#FDF0F0] text-[#D64545] border-[#F7C6C6]';
      dotColor = 'bg-[#D64545]';
      defaultLabel =
        label ||
        (norm === 'overdue'
          ? 'Overdue'
          : norm === 'maintenance'
          ? 'Maintenance'
          : norm === 'full'
          ? 'Full'
          : 'Archived');
      break;

    // Blue / Violet (Info / Types)
    case 'occupied':
      styles = 'bg-[#EDF6FC] text-[#2786B8] border-[#C5E4F5]';
      dotColor = 'bg-[#2786B8]';
      defaultLabel = label || 'Occupied';
      break;

    case 'vacant':
      styles = 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]';
      dotColor = 'bg-[#15803D]';
      defaultLabel = label || 'Vacant';
      break;

    case 'checked_out':
      styles = 'bg-[#F4F1EA] text-[#716A63] border-[#E8E1D9]';
      dotColor = 'bg-[#716A63]';
      defaultLabel = label || 'Checked Out';
      break;

    case 'co-living':
      styles = 'bg-[#FDF4F0] text-[#B85C38] border-[#F6E2DA]';
      dotColor = 'bg-[#B85C38]';
      defaultLabel = label || 'Co-Living';
      break;

    case 'boys':
      styles = 'bg-blue-50 text-blue-700 border-blue-200';
      dotColor = 'bg-blue-600';
      defaultLabel = label || 'Boys PG';
      break;

    case 'girls':
      styles = 'bg-rose-50 text-rose-700 border-rose-200';
      dotColor = 'bg-rose-600';
      defaultLabel = label || 'Girls PG';
      break;

    default:
      styles = 'bg-stone-100 text-stone-700 border-stone-200';
      dotColor = 'bg-stone-500';
      defaultLabel = label || status;
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${sizeClasses} ${styles} whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      <span>{defaultLabel}</span>
    </span>
  );
};
