import React from 'react';
import {
  Building2,
  BedDouble,
  UserPlus,
  CreditCard,
  PlusCircle,
  Wrench
} from 'lucide-react';

interface QuickActionsProps {
  onAddProperty: () => void;
  onAddRoom: () => void;
  onAddTenant: () => void;
  onRecordPayment: () => void;
  onAddExpense: () => void;
  onViewComplaints: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onAddProperty,
  onAddRoom,
  onAddTenant,
  onRecordPayment,
  onAddExpense,
  onViewComplaints
}) => {
  const actions = [
    {
      label: 'Add Property',
      desc: 'Create new PG facility',
      icon: Building2,
      color: 'var(--primary-600)',
      bg: 'var(--primary-50)',
      onClick: onAddProperty
    },
    {
      label: 'Add Room',
      desc: 'Define capacity & rent',
      icon: BedDouble,
      color: '#0284c7',
      bg: '#e0f2fe',
      onClick: onAddRoom
    },
    {
      label: 'Add Tenant',
      desc: 'Onboard & allocate bed',
      icon: UserPlus,
      color: 'var(--success-600)',
      bg: 'var(--success-50)',
      onClick: onAddTenant
    },
    {
      label: 'Record Payment',
      desc: 'Log UPI / Cash / NEFT',
      icon: CreditCard,
      color: '#059669',
      bg: '#d1fae5',
      onClick: onRecordPayment
    },
    {
      label: 'Add Expense',
      desc: 'Utilities, food, repairs',
      icon: PlusCircle,
      color: 'var(--warning-700)',
      bg: 'var(--warning-50)',
      onClick: onAddExpense
    },
    {
      label: 'View Complaints',
      desc: 'Review tenant requests',
      icon: Wrench,
      color: 'var(--danger-600)',
      bg: 'var(--danger-50)',
      onClick: onViewComplaints
    }
  ];

  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <div className="card-header" style={{ padding: '12px 20px' }}>
        <h3 className="card-title" style={{ fontSize: '0.95rem' }}>
          Quick Operational Actions
        </h3>
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
          One-click workflows
        </span>
      </div>
      <div className="card-body" style={{ padding: '16px 20px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px'
          }}
        >
          {actions.map((act, i) => {
            const Icon = act.icon;
            return (
              <button
                key={i}
                type="button"
                onClick={act.onClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface)',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = act.color;
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: act.bg,
                    color: act.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {act.label}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    {act.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
