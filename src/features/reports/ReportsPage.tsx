import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Building,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/csvExport';

export const ReportsPage: React.FC = () => {
  const { filteredProperties, filteredRooms, filteredTenants, filteredPayments, filteredExpenses } = useApp();
  const { showToast } = useToast();

  const [reportPeriod, setReportPeriod] = useState<string>('current_month');

  // Metrics derived from active filtered context
  const totalRevenueCollected = filteredPayments
    .filter(p => p.status === 'Paid')
    .reduce((acc, p) => acc + p.amountPaid, 0);

  const totalOutstandingRent = filteredPayments.reduce((acc, p) => acc + p.balanceDue, 0);
  const totalExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const estimatedNOI = totalRevenueCollected - totalExpenses;
  const operatingMargin = totalRevenueCollected > 0
    ? ((estimatedNOI / totalRevenueCollected) * 100).toFixed(1)
    : '0';

  // Total bed counts
  const totalCapacity = filteredRooms.reduce((acc, r) => acc + r.capacity, 0);
  const totalOccupied = filteredRooms.reduce((acc, r) => acc + r.occupiedBeds, 0);
  const totalAvailable = filteredRooms.reduce((acc, r) => acc + r.availableBeds, 0);
  const overallOccupancy = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  // Revenue by Property breakdown
  const propertyRevenueBreakdown = useMemo(() => {
    return filteredProperties.map(prop => {
      const propPayments = filteredPayments.filter(p => p.propertyId === prop.id);
      const propExpenses = filteredExpenses.filter(e => e.propertyId === prop.id);
      const collected = propPayments.reduce((acc, p) => acc + p.amountPaid, 0);
      const outstanding = propPayments.reduce((acc, p) => acc + p.balanceDue, 0);
      const expenses = propExpenses.reduce((acc, e) => acc + e.amount, 0);
      const net = collected - expenses;

      const propRooms = filteredRooms.filter(r => r.propertyId === prop.id);
      const cap = propRooms.reduce((acc, r) => acc + r.capacity, 0);
      const occ = propRooms.reduce((acc, r) => acc + r.occupiedBeds, 0);
      const occRate = cap > 0 ? Math.round((occ / cap) * 100) : 0;

      return {
        id: prop.id,
        name: prop.name,
        type: prop.type,
        collected,
        outstanding,
        expenses,
        net,
        capacity: cap,
        occupied: occ,
        occRate
      };
    });
  }, [filteredProperties, filteredPayments, filteredExpenses, filteredRooms]);

  // Expense breakdown by category
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredExpenses]);

  // Tenant move-in / move-out activity
  const activeTenants = filteredTenants.filter(t => t.status === 'Active');
  const noticeTenants = filteredTenants.filter(t => t.status === 'Notice Period');
  const movedOutTenants = filteredTenants.filter(t => t.status === 'Moved Out');

  const handleExportFinancials = () => {
    const rows = propertyRevenueBreakdown.map(p => ({
      'Property Name': p.name,
      'Type': p.type,
      'Occupancy Rate': `${p.occRate}% (${p.occupied}/${p.capacity} beds)`,
      'Revenue Collected (INR)': p.collected,
      'Outstanding Dues (INR)': p.outstanding,
      'Operating Expenses (INR)': p.expenses,
      'Net Operating Cash Flow (INR)': p.net
    }));
    exportToCSV('StayNest_Financial_Report', rows);
    showToast('Report Exported', 'Financial report downloaded as CSV.', 'success');
  };

  const handleExportMoveInOut = () => {
    const rows = filteredTenants.map(t => ({
      'Tenant Name': t.name,
      'Phone': t.phone,
      'Property': t.propertyName,
      'Room': t.roomNumber,
      'Bed': t.bedCode,
      'Status': t.status,
      'Move In Date': t.moveInDate,
      'Move Out Date': t.moveOutDate || 'Active',
      'Monthly Rent (INR)': t.monthlyRent,
      'Security Deposit (INR)': t.securityDeposit,
      'Rent Status': t.rentStatus,
      'Outstanding Balance (INR)': t.outstandingBalance
    }));
    exportToCSV('StayNest_Tenant_MoveInOut_Report', rows);
    showToast('Report Exported', 'Tenant move-in/out records exported as CSV.', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="Reports & Business Analytics"
        subtitle="Financial performance, property yield, occupancy metrics and cash flow statements"
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="outline"
              icon={<Download size={16} />}
              onClick={handleExportFinancials}
            >
              Export Financials (CSV)
            </Button>
            <Button
              variant="outline"
              icon={<Download size={16} />}
              onClick={handleExportMoveInOut}
            >
              Export Resident Roster (CSV)
            </Button>
          </div>
        }
      />

      {/* Audit Disclaimer Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          padding: '14px 18px',
          backgroundColor: 'var(--primary-50)',
          border: '1px solid var(--primary-200)',
          borderRadius: 'var(--radius-lg)',
          fontSize: '12.5px',
          color: 'var(--primary-900)'
        }}
      >
        <Info size={18} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--primary-700)' }} />
        <div>
          <strong>Managerial Accounting Notice:</strong> Net Operating Income (NOI) and cash flow estimates
          are derived from transactions recorded within StayNest for management insights. They reflect operational
          cash inflows and operating expenses, and do not constitute audited statutory financial statements.
        </div>
      </div>

      {/* 4 High-Level KPI Summary Tiles */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        <div style={{ padding: '18px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Collected Revenue</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--success-700)', marginTop: '4px' }}>
            {formatCurrency(totalRevenueCollected)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            Uncollected Dues: <strong style={{ color: 'var(--danger-700)' }}>{formatCurrency(totalOutstandingRent)}</strong>
          </div>
        </div>

        <div style={{ padding: '18px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Operating Expenses</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--danger-700)', marginTop: '4px' }}>
            {formatCurrency(totalExpenses)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            Utilities, Groceries, Repairs, Wages
          </div>
        </div>

        <div style={{ padding: '18px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Net Operating Income (NOI)</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--primary-700)', marginTop: '4px' }}>
            {formatCurrency(estimatedNOI)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--primary-800)', marginTop: '4px' }}>
            Operating Margin: <strong>{operatingMargin}%</strong>
          </div>
        </div>

        <div style={{ padding: '18px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Overall Portfolio Occupancy</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '4px' }}>
            {overallOccupancy}%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            {totalOccupied} / {totalCapacity} beds occupied ({totalAvailable} vacant)
          </div>
        </div>
      </div>

      {/* Property-Wise Financial Breakdown Table */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <div>
            <h3 className="card-title">Property Yield & Revenue Breakdown</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              Performance summary across individual PG properties
            </p>
          </div>
          <Button variant="outline" size="sm" icon={<Download size={14} />} onClick={handleExportFinancials}>
            Export
          </Button>
        </div>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Type</th>
                <th>Occupancy Rate</th>
                <th>Rent Collected</th>
                <th>Pending Dues</th>
                <th>Expenses</th>
                <th>Net Operating Surplus</th>
              </tr>
            </thead>
            <tbody>
              {propertyRevenueBreakdown.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{p.name}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.type} PG</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.occRate}%</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      {p.occupied}/{p.capacity} beds occupied
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--success-700)' }}>
                      {formatCurrency(p.collected)}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: p.outstanding > 0 ? 'var(--danger-700)' : 'var(--text-tertiary)' }}>
                      {formatCurrency(p.outstanding)}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--danger-700)' }}>
                      {formatCurrency(p.expenses)}
                    </div>
                  </td>
                  <td>
                    <div
                      style={{
                        fontWeight: 800,
                        color: p.net >= 0 ? 'var(--primary-700)' : 'var(--danger-700)',
                        fontSize: '14px'
                      }}
                    >
                      {formatCurrency(p.net)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column: Expense Distribution & Move-in/Move-out Overview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
          gap: '20px'
        }}
      >
        {/* Expense Category Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Expense Breakdown by Category</h3>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {expenseByCategory.map(([cat, amt]) => {
              const pct = totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0;
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{cat}</span>
                    <span style={{ fontWeight: 700, color: 'var(--slate-900)' }}>
                      {formatCurrency(amt)} <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>({pct}%)</span>
                    </span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--slate-100)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        backgroundColor:
                          cat === 'Electricity'
                            ? '#f59e0b'
                            : cat === 'Food and groceries'
                            ? '#10b981'
                            : cat === 'Staff salaries'
                            ? '#6366f1'
                            : '#64748b',
                        borderRadius: '9999px'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tenant Move-In and Move-Out Summary */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Resident Turnover Summary</h3>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--success-50)', borderRadius: '8px', border: '1px solid var(--success-200)' }}>
                <span style={{ fontSize: '11px', color: 'var(--success-800)', fontWeight: 600, textTransform: 'uppercase' }}>Active Residents</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success-700)', marginTop: '2px' }}>
                  {activeTenants.length}
                </div>
              </div>
              <div style={{ padding: '12px', backgroundColor: 'var(--warning-50)', borderRadius: '8px', border: '1px solid var(--warning-200)' }}>
                <span style={{ fontSize: '11px', color: 'var(--warning-800)', fontWeight: 600, textTransform: 'uppercase' }}>On Notice</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--warning-700)', marginTop: '2px' }}>
                  {noticeTenants.length}
                </div>
              </div>
              <div style={{ padding: '12px', backgroundColor: 'var(--slate-100)', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
                <span style={{ fontSize: '11px', color: 'var(--slate-700)', fontWeight: 600, textTransform: 'uppercase' }}>Moved Out</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-800)', marginTop: '2px' }}>
                  {movedOutTenants.length}
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Upcoming Notice Period Expirations
              </h4>
              {noticeTenants.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>No tenants currently serving notice.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {noticeTenants.map(t => (
                    <div
                      key={t.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--warning-200)',
                        backgroundColor: 'var(--warning-50)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12.5px'
                      }}
                    >
                      <div>
                        <strong>{t.name}</strong> • Room {t.roomNumber} ({t.propertyName})
                        <div style={{ fontSize: '11px', color: 'var(--warning-800)', marginTop: '2px' }}>
                          Vacating Date: {formatDate(t.moveOutDate)}
                        </div>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--warning-900)' }}>
                        Notice Active
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
