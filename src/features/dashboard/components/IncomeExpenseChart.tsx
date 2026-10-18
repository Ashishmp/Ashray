import React from 'react';
import { formatCurrency } from '../../../utils/formatters';
import { TrendingUp, PlusCircle } from 'lucide-react';

interface IncomeExpenseChartProps {
  income: number;
  expenses: number;
}

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ income, expenses }) => {
  const netIncome = income - expenses;
  const margin = income > 0 ? ((netIncome / income) * 100).toFixed(1) : '0';

  const total = Math.max(income, expenses, 1);
  const incomePercent = income > 0 ? Math.min(100, Math.round((income / total) * 100)) : 0;
  const expensePercent = expenses > 0 ? Math.min(100, Math.round((expenses / total) * 100)) : 0;

  const hasData = income > 0 || expenses > 0;

  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header">
        <div>
          <h3 className="card-title">Income vs Expenses</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            Operational margin & cash flow overview
          </p>
        </div>
        {hasData && (
          <span
            style={{
              fontSize: '11.5px',
              fontWeight: 700,
              padding: '4px 8px',
              borderRadius: '9999px',
              backgroundColor: netIncome >= 0 ? 'var(--success-50)' : 'var(--danger-50)',
              color: netIncome >= 0 ? 'var(--success-700)' : 'var(--danger-700)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <TrendingUp size={14} />
            {margin}% Operating Margin
          </span>
        )}
      </div>
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Metric summary boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <div style={{ padding: '12px', backgroundColor: 'var(--slate-50)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Rent Inflow</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success-700)', marginTop: '4px' }}>
              {formatCurrency(income)}
            </div>
          </div>
          <div style={{ padding: '12px', backgroundColor: 'var(--slate-50)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Operating Expenses</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--danger-700)', marginTop: '4px' }}>
              {formatCurrency(expenses)}
            </div>
          </div>
          <div style={{ padding: '12px', backgroundColor: 'var(--primary-50)', borderRadius: '8px', border: '1px solid var(--primary-200)' }}>
            <span style={{ fontSize: '11px', color: 'var(--primary-800)', textTransform: 'uppercase', fontWeight: 600 }}>Net Cash Flow</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-700)', marginTop: '4px' }}>
              {formatCurrency(netIncome)}
            </div>
          </div>
        </div>

        {/* Comparative Bars or Empty Guide */}
        {!hasData ? (
          <div
            style={{
              padding: '24px 16px',
              textAlign: 'center',
              backgroundColor: 'var(--slate-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '12.5px'
            }}
          >
            No cash inflow or expenses logged yet.
            <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              Record rent payments and expenses to see real-time margin breakdown.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Rent Collected</span>
                <span style={{ fontWeight: 700, color: 'var(--success-700)' }}>{formatCurrency(income)}</span>
              </div>
              <div style={{ height: '10px', backgroundColor: 'var(--slate-100)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${incomePercent}%`,
                    backgroundColor: 'var(--success-500)',
                    borderRadius: '9999px',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Operating Expenses</span>
                <span style={{ fontWeight: 700, color: 'var(--danger-700)' }}>{formatCurrency(expenses)}</span>
              </div>
              <div style={{ height: '10px', backgroundColor: 'var(--slate-100)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${expensePercent}%`,
                    backgroundColor: 'var(--danger-500)',
                    borderRadius: '9999px',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="card-footer" style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
        * Calculated dynamically from your recorded transactions.
      </div>
    </div>
  );
};
