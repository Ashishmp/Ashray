import React from 'react';
import { formatCurrency } from '../../../utils/formatters';
import { useApp } from '../../../context/AppContext';

interface MonthlyRentChartProps {
  collectedThisMonth: number;
  pendingThisMonth: number;
}

export const MonthlyRentChart: React.FC<MonthlyRentChartProps> = ({
  collectedThisMonth,
  pendingThisMonth
}) => {
  const { filteredPayments } = useApp();

  const totalBilled = collectedThisMonth + pendingThisMonth;

  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header">
        <div>
          <h3 className="card-title">Rent Collection vs Outstanding</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            Monthly collections and pending balances
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--primary-600)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Collected</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--warning-500)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Pending / Overdue</span>
          </div>
        </div>
      </div>
      <div className="card-body">
        {totalBilled === 0 ? (
          <div
            style={{
              height: '200px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: 'var(--text-tertiary)',
              padding: '20px'
            }}
          >
            <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              No Rent Invoices Recorded Yet
            </div>
            <p style={{ fontSize: '12px', maxWidth: '320px' }}>
              When you onboard residents and log payments via 'Record Payment', this chart will display collections vs outstanding balances.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: '200px', paddingTop: '20px', gap: '32px' }}>
            {/* Current Month Active Bar */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                height: '100%',
                justifyContent: 'flex-end',
                minWidth: '120px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '8px',
                  justifyContent: 'center'
                }}
              >
                <div
                  title={`Collected: ${formatCurrency(collectedThisMonth)}`}
                  style={{
                    width: '36px',
                    height: `${Math.max(12, totalBilled > 0 ? (collectedThisMonth / totalBilled) * 160 : 0)}px`,
                    backgroundColor: 'var(--primary-600)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s ease'
                  }}
                />
                <div
                  title={`Pending: ${formatCurrency(pendingThisMonth)}`}
                  style={{
                    width: '36px',
                    height: `${Math.max(12, totalBilled > 0 ? (pendingThisMonth / totalBilled) * 160 : 0)}px`,
                    backgroundColor: 'var(--warning-500)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s ease'
                  }}
                />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-700)' }}>
                Current Cycle
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="card-footer" style={{ justifyContent: 'space-between', fontSize: '12.5px' }}>
        <span style={{ color: 'var(--text-secondary)' }}>
          Collection Rate:{' '}
          <strong style={{ color: 'var(--success-700)' }}>
            {totalBilled > 0 ? `${Math.round((collectedThisMonth / totalBilled) * 100)}%` : '0%'}
          </strong>
        </span>
        <span style={{ color: 'var(--text-tertiary)' }}>
          Total Billed: {formatCurrency(totalBilled)}
        </span>
      </div>
    </div>
  );
};
