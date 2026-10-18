import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Building2,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowUpRight,
  Info,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  FileText,
  Send,
  Filter,
  Sparkles,
  PieChart,
  UserCheck,
  Percent,
  CalendarDays
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Tabs } from '../../components/ui/Tabs';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/csvExport';

type TimeframeType = 'monthly' | 'quarterly' | 'yearly' | 'custom';

export const ReportsPage: React.FC = () => {
  const { filteredProperties, filteredRooms, filteredTenants, filteredPayments, filteredExpenses, ownerProfile } = useApp();
  const { showToast } = useToast();

  // Active view tab
  const [activeTab, setActiveTab] = useState<string>('financials');

  // Timeframe selector state
  const [timeframeType, setTimeframeType] = useState<TimeframeType>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10'); // YYYY-MM
  const [selectedQuarter, setSelectedQuarter] = useState<string>('2026-Q3'); // YYYY-Q#
  const [selectedYear, setSelectedYear] = useState<string>('FY-2026-27');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-07-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-10-31');

  // Property scope filter
  const [propertyFilter, setPropertyFilter] = useState<string>('all');

  // Resolve start and end dates according to timeframe configuration
  const dateRange = useMemo(() => {
    let start = '2026-10-01';
    let end = '2026-10-31';
    let label = 'October 2026';
    let sublabel = '01 Oct 2026 – 31 Oct 2026';

    if (timeframeType === 'monthly') {
      const [yearStr, monthStr] = selectedMonth.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const lastDay = new Date(year, month, 0).getDate();
      start = `${selectedMonth}-01`;
      end = `${selectedMonth}-${String(lastDay).padStart(2, '0')}`;

      const dateObj = new Date(year, month - 1, 1);
      label = dateObj.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      sublabel = `01 ${dateObj.toLocaleDateString('en-IN', { month: 'short' })} – ${lastDay} ${dateObj.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`;
    } else if (timeframeType === 'quarterly') {
      if (selectedQuarter === '2026-Q4') {
        start = '2026-10-01';
        end = '2026-12-31';
        label = 'Q4 2026 (Oct – Dec)';
        sublabel = '01 Oct 2026 – 31 Dec 2026';
      } else if (selectedQuarter === '2026-Q3') {
        start = '2026-07-01';
        end = '2026-09-30';
        label = 'Q3 2026 (Jul – Sep)';
        sublabel = '01 Jul 2026 – 30 Sep 2026';
      } else if (selectedQuarter === '2026-Q2') {
        start = '2026-04-01';
        end = '2026-06-30';
        label = 'Q2 2026 (Apr – Jun)';
        sublabel = '01 Apr 2026 – 30 Jun 2026';
      } else if (selectedQuarter === '2026-Q1') {
        start = '2026-01-01';
        end = '2026-03-31';
        label = 'Q1 2026 (Jan – Mar)';
        sublabel = '01 Jan 2026 – 31 Mar 2026';
      }
    } else if (timeframeType === 'yearly') {
      if (selectedYear === 'FY-2026-27') {
        start = '2026-04-01';
        end = '2027-03-31';
        label = 'Financial Year FY 2026-27';
        sublabel = '01 Apr 2026 – 31 Mar 2027 (Active YTD)';
      } else if (selectedYear === 'FY-2025-26') {
        start = '2025-04-01';
        end = '2026-03-31';
        label = 'Financial Year FY 2025-26';
        sublabel = '01 Apr 2025 – 31 Mar 2026';
      } else if (selectedYear === 'CY-2026') {
        start = '2026-01-01';
        end = '2026-12-31';
        label = 'Calendar Year 2026';
        sublabel = '01 Jan 2026 – 31 Dec 2026';
      }
    } else if (timeframeType === 'custom') {
      start = customStartDate;
      end = customEndDate;
      label = `Custom Range`;
      sublabel = `${formatDate(start)} to ${formatDate(end)}`;
    }

    return { start, end, label, sublabel };
  }, [timeframeType, selectedMonth, selectedQuarter, selectedYear, customStartDate, customEndDate]);

  // Apply property filter first
  const scopedProperties = useMemo(() => {
    if (propertyFilter === 'all') return filteredProperties;
    return filteredProperties.filter(p => p.id === propertyFilter);
  }, [filteredProperties, propertyFilter]);

  const scopedRooms = useMemo(() => {
    if (propertyFilter === 'all') return filteredRooms;
    return filteredRooms.filter(r => r.propertyId === propertyFilter);
  }, [filteredRooms, propertyFilter]);

  const scopedTenants = useMemo(() => {
    if (propertyFilter === 'all') return filteredTenants;
    return filteredTenants.filter(t => t.propertyId === propertyFilter);
  }, [filteredTenants, propertyFilter]);

  // Sliced payments according to selected date range
  const periodPayments = useMemo(() => {
    return filteredPayments.filter(payment => {
      if (propertyFilter !== 'all' && payment.propertyId !== propertyFilter) return false;
      const refDate = payment.paymentDate || payment.dueDate;
      if (!refDate) return false;
      return refDate >= dateRange.start && refDate <= dateRange.end;
    });
  }, [filteredPayments, propertyFilter, dateRange]);

  // Sliced expenses according to selected date range
  const periodExpenses = useMemo(() => {
    return filteredExpenses.filter(expense => {
      if (propertyFilter !== 'all' && expense.propertyId !== propertyFilter) return false;
      return expense.expenseDate >= dateRange.start && expense.expenseDate <= dateRange.end;
    });
  }, [filteredExpenses, propertyFilter, dateRange]);

  // Core Financial Aggregates
  const totalCollectedRevenue = useMemo(() => {
    return periodPayments
      .filter(p => p.status === 'Paid')
      .reduce((acc, p) => acc + p.amountPaid, 0);
  }, [periodPayments]);

  const totalOutstandingDues = useMemo(() => {
    return periodPayments.reduce((acc, p) => acc + p.balanceDue, 0);
  }, [periodPayments]);

  const totalBilled = totalCollectedRevenue + totalOutstandingDues;

  const totalOperatingExpenses = useMemo(() => {
    return periodExpenses.reduce((acc, e) => acc + e.amount, 0);
  }, [periodExpenses]);

  const netOperatingIncome = totalCollectedRevenue - totalOperatingExpenses;

  const operatingMargin = totalCollectedRevenue > 0
    ? ((netOperatingIncome / totalCollectedRevenue) * 100).toFixed(1)
    : '0';

  const collectionEfficiency = totalBilled > 0
    ? Math.round((totalCollectedRevenue / totalBilled) * 100)
    : 100;

  // Occupancy metrics
  const totalCapacity = scopedRooms.reduce((acc, r) => acc + r.capacity, 0);
  const totalOccupied = scopedRooms.reduce((acc, r) => acc + r.occupiedBeds, 0);
  const totalAvailable = scopedRooms.reduce((acc, r) => acc + r.availableBeds, 0);
  const overallOccupancy = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  // Estimated vacancy loss (Opportunity Cost of empty beds in this period)
  const averageBedRent = totalCapacity > 0 && scopedTenants.length > 0
    ? Math.round(scopedTenants.reduce((acc, t) => acc + t.monthlyRent, 0) / scopedTenants.length)
    : 12500;
  const estimatedVacancyLoss = totalAvailable * averageBedRent;

  // Property Yield breakdown
  const propertyYieldBreakdown = useMemo(() => {
    return scopedProperties.map(prop => {
      const propPayments = periodPayments.filter(p => p.propertyId === prop.id);
      const propExpenses = periodExpenses.filter(e => e.propertyId === prop.id);
      const collected = propPayments.filter(p => p.status === 'Paid').reduce((acc, p) => acc + p.amountPaid, 0);
      const outstanding = propPayments.reduce((acc, p) => acc + p.balanceDue, 0);
      const expenses = propExpenses.reduce((acc, e) => acc + e.amount, 0);
      const net = collected - expenses;

      const propRooms = scopedRooms.filter(r => r.propertyId === prop.id);
      const cap = propRooms.reduce((acc, r) => acc + r.capacity, 0);
      const occ = propRooms.reduce((acc, r) => acc + r.occupiedBeds, 0);
      const occRate = cap > 0 ? Math.round((occ / cap) * 100) : 0;
      const margin = collected > 0 ? Math.round((net / collected) * 100) : 0;

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
        occRate,
        margin
      };
    });
  }, [scopedProperties, periodPayments, periodExpenses, scopedRooms]);

  // Expense breakdown by category for the period
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    periodExpenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [periodExpenses]);

  // Payment method breakdown
  const paymentMethodShare = useMemo(() => {
    const map: Record<string, number> = { UPI: 0, 'Bank Transfer': 0, Cash: 0, Card: 0, Other: 0 };
    periodPayments.filter(p => p.status === 'Paid').forEach(p => {
      const m = p.paymentMethod || 'Other';
      map[m] = (map[m] || 0) + p.amountPaid;
    });
    return Object.entries(map).filter(([_, amt]) => amt > 0);
  }, [periodPayments]);

  // Defaulters list in this timeframe
  const defaultersList = useMemo(() => {
    return periodPayments.filter(p => p.status === 'Overdue' || p.balanceDue > 0);
  }, [periodPayments]);

  // Resident turnover in this timeframe
  const moveInsInPeriod = useMemo(() => {
    return scopedTenants.filter(t => t.moveInDate >= dateRange.start && t.moveInDate <= dateRange.end);
  }, [scopedTenants, dateRange]);

  const moveOutsInPeriod = useMemo(() => {
    return scopedTenants.filter(t => t.moveOutDate && t.moveOutDate >= dateRange.start && t.moveOutDate <= dateRange.end);
  }, [scopedTenants, dateRange]);

  // Quick Preset Handlers
  const handleSetQuickPreset = (preset: 'this_month' | 'last_month' | 'q3' | 'q2' | 'fy26' | 'last_30_days') => {
    if (preset === 'this_month') {
      setTimeframeType('monthly');
      setSelectedMonth('2026-10');
    } else if (preset === 'last_month') {
      setTimeframeType('monthly');
      setSelectedMonth('2026-09');
    } else if (preset === 'q3') {
      setTimeframeType('quarterly');
      setSelectedQuarter('2026-Q3');
    } else if (preset === 'q2') {
      setTimeframeType('quarterly');
      setSelectedQuarter('2026-Q2');
    } else if (preset === 'fy26') {
      setTimeframeType('yearly');
      setSelectedYear('FY-2026-27');
    } else if (preset === 'last_30_days') {
      setTimeframeType('custom');
      setCustomStartDate('2026-09-19');
      setCustomEndDate('2026-10-18');
    }
  };

  // Export handlers
  const handleExportFinancials = () => {
    const rows = propertyYieldBreakdown.map(p => ({
      'Property Name': p.name,
      'Property Type': `${p.type} PG`,
      'Reporting Period': dateRange.label,
      'Occupancy Rate': `${p.occRate}% (${p.occupied}/${p.capacity} beds)`,
      'Revenue Collected (INR)': p.collected,
      'Outstanding Dues (INR)': p.outstanding,
      'Operating Expenses (INR)': p.expenses,
      'Net Operating Surplus (INR)': p.net,
      'Profit Margin %': `${p.margin}%`
    }));
    exportToCSV(`StayNest_Financial_Report_${dateRange.label.replace(/\s+/g, '_')}`, rows);
    showToast('Financial Report Exported', `Downloaded statement for ${dateRange.label}`, 'success');
  };

  const handleExportDefaulters = () => {
    if (defaultersList.length === 0) {
      showToast('No Defaulters', 'There are zero rent arrears recorded in this period.', 'info');
      return;
    }
    const rows = defaultersList.map(d => ({
      'Receipt / Invoice #': d.receiptNumber,
      'Resident Name': d.tenantName,
      'Property': d.propertyName,
      'Room #': d.roomNumber,
      'Billing Month': d.billingMonth,
      'Total Due (INR)': d.totalDue,
      'Amount Paid (INR)': d.amountPaid,
      'Balance Due (INR)': d.balanceDue,
      'Due Date': d.dueDate,
      'Payment Status': d.status
    }));
    exportToCSV(`StayNest_Defaulters_Report_${dateRange.label.replace(/\s+/g, '_')}`, rows);
    showToast('Defaulters Exported', 'Downloaded rent arrears roster as CSV.', 'success');
  };

  const handleExportRoster = () => {
    const rows = scopedTenants.map(t => ({
      'Resident Name': t.name,
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
    exportToCSV(`StayNest_Resident_Roster_${dateRange.label.replace(/\s+/g, '_')}`, rows);
    showToast('Resident Roster Exported', 'Exported tenant records as CSV.', 'success');
  };

  // Trigger Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header with Multi-Export Actions */}
      <PageHeader
        title="Reports & Financial Intelligence"
        subtitle={`Business yield, P&L statements, occupancy metrics and cash flows for ${dateRange.label}`}
        actions={
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              icon={<Printer size={16} />}
              onClick={handlePrint}
            >
              Print Official Report
            </Button>
            <Button
              variant="outline"
              icon={<Download size={16} />}
              onClick={handleExportFinancials}
            >
              Export Statement (CSV)
            </Button>
            <Button
              variant="outline"
              icon={<Download size={16} />}
              onClick={handleExportDefaulters}
            >
              Export Defaulters ({defaultersList.length})
            </Button>
          </div>
        }
      />

      {/* TIMEFRAME SELECTOR CONTROL CENTER */}
      <div
        className="card"
        style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CalendarDays size={20} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--slate-900)' }}>
                Timeframe Scope: <span style={{ color: 'var(--primary-700)' }}>{dateRange.label}</span>
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
                {dateRange.sublabel} • Scoped to {propertyFilter === 'all' ? 'All 3 PG Properties' : scopedProperties[0]?.name}
              </div>
            </div>
          </div>

          {/* Timeframe Mode Selector Segmented Pills */}
          <div
            style={{
              display: 'inline-flex',
              padding: '4px',
              backgroundColor: 'var(--slate-100)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}
          >
            <button
              type="button"
              onClick={() => setTimeframeType('monthly')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12.5px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: timeframeType === 'monthly' ? '#ffffff' : 'transparent',
                color: timeframeType === 'monthly' ? 'var(--primary-700)' : 'var(--text-secondary)',
                boxShadow: timeframeType === 'monthly' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setTimeframeType('quarterly')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12.5px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: timeframeType === 'quarterly' ? '#ffffff' : 'transparent',
                color: timeframeType === 'quarterly' ? 'var(--primary-700)' : 'var(--text-secondary)',
                boxShadow: timeframeType === 'quarterly' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Quarterly
            </button>
            <button
              type="button"
              onClick={() => setTimeframeType('yearly')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12.5px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: timeframeType === 'yearly' ? '#ffffff' : 'transparent',
                color: timeframeType === 'yearly' ? 'var(--primary-700)' : 'var(--text-secondary)',
                boxShadow: timeframeType === 'yearly' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Yearly / FY
            </button>
            <button
              type="button"
              onClick={() => setTimeframeType('custom')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12.5px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: timeframeType === 'custom' ? '#ffffff' : 'transparent',
                color: timeframeType === 'custom' ? 'var(--primary-700)' : 'var(--text-secondary)',
                boxShadow: timeframeType === 'custom' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Custom Date Range
            </button>
          </div>
        </div>

        {/* Dynamic Period Dropdowns & Property Filter */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
            alignItems: 'flex-end',
            paddingTop: '12px',
            borderTop: '1px solid var(--slate-100)'
          }}
        >
          {timeframeType === 'monthly' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '6px' }}>
                Select Month
              </label>
              <Select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                options={[
                  { value: '2026-10', label: 'October 2026 (Current Month)' },
                  { value: '2026-09', label: 'September 2026' },
                  { value: '2026-08', label: 'August 2026' },
                  { value: '2026-07', label: 'July 2026' },
                  { value: '2026-06', label: 'June 2026' },
                  { value: '2026-05', label: 'May 2026' },
                  { value: '2026-04', label: 'April 2026' }
                ]}
              />
            </div>
          )}

          {timeframeType === 'quarterly' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '6px' }}>
                Select Quarter
              </label>
              <Select
                value={selectedQuarter}
                onChange={e => setSelectedQuarter(e.target.value)}
                options={[
                  { value: '2026-Q4', label: 'Q4 2026 (Oct – Dec 2026)' },
                  { value: '2026-Q3', label: 'Q3 2026 (Jul – Sep 2026)' },
                  { value: '2026-Q2', label: 'Q2 2026 (Apr – Jun 2026)' },
                  { value: '2026-Q1', label: 'Q1 2026 (Jan – Mar 2026)' }
                ]}
              />
            </div>
          )}

          {timeframeType === 'yearly' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '6px' }}>
                Select Financial or Calendar Year
              </label>
              <Select
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                options={[
                  { value: 'FY-2026-27', label: 'Financial Year FY 2026-27 (Apr 26 – Mar 27)' },
                  { value: 'FY-2025-26', label: 'Financial Year FY 2025-26 (Apr 25 – Mar 26)' },
                  { value: 'CY-2026', label: 'Calendar Year 2026 (Jan – Dec 2026)' }
                ]}
              />
            </div>
          )}

          {timeframeType === 'custom' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '6px' }}>
                  From Date
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={customStartDate}
                  onChange={e => setCustomStartDate(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '6px' }}>
                  To Date
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={customEndDate}
                  onChange={e => setCustomEndDate(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Property Branch Scope */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '6px' }}>
              Filter by PG Property
            </label>
            <Select
              value={propertyFilter}
              onChange={e => setPropertyFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Properties (Consolidated)' },
                ...filteredProperties.map(p => ({ value: p.id, label: p.name }))
              ]}
            />
          </div>

          {/* Fast Presets Toolbar */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Quick:</span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', padding: '4px 8px' }}
              onClick={() => handleSetQuickPreset('this_month')}
            >
              This Month
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', padding: '4px 8px' }}
              onClick={() => handleSetQuickPreset('last_month')}
            >
              Last Month (Sep)
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', padding: '4px 8px' }}
              onClick={() => handleSetQuickPreset('q3')}
            >
              Q3 (Jul–Sep)
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', padding: '4px 8px' }}
              onClick={() => handleSetQuickPreset('fy26')}
            >
              FY 2026-27
            </button>
          </div>
        </div>
      </div>

      {/* 4 HIGH-LEVEL PERIOD KPI SUMMARY CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '16px'
        }}
      >
        <div style={{ padding: '20px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Rent Collected</span>
            <span style={{ fontSize: '11px', color: 'var(--success-700)', fontWeight: 700, backgroundColor: 'var(--success-50)', padding: '2px 8px', borderRadius: '9999px' }}>
              {collectionEfficiency}% Efficiency
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success-700)', marginTop: '6px' }}>
            {formatCurrency(totalCollectedRevenue)}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            Uncollected Dues: <strong style={{ color: 'var(--danger-700)' }}>{formatCurrency(totalOutstandingDues)}</strong>
          </div>
        </div>

        <div style={{ padding: '20px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Operating Expenses</span>
            <span style={{ fontSize: '11px', color: 'var(--danger-700)', fontWeight: 600, backgroundColor: 'var(--danger-50)', padding: '2px 8px', borderRadius: '9999px' }}>
              {periodExpenses.length} Records
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--danger-700)', marginTop: '6px' }}>
            {formatCurrency(totalOperatingExpenses)}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            Electricity, groceries, maintenance, salaries
          </div>
        </div>

        <div style={{ padding: '20px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Net Operating Income</span>
            <span style={{ fontSize: '11px', color: 'var(--primary-700)', fontWeight: 700, backgroundColor: 'var(--primary-50)', padding: '2px 8px', borderRadius: '9999px' }}>
              {operatingMargin}% Margin
            </span>
          </div>
          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: netOperatingIncome >= 0 ? 'var(--primary-700)' : 'var(--danger-700)',
              marginTop: '6px'
            }}
          >
            {formatCurrency(netOperatingIncome)}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            Net cash generation after operating costs
          </div>
        </div>

        <div style={{ padding: '20px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Portfolio Occupancy</span>
            <span style={{ fontSize: '11px', color: 'var(--slate-700)', fontWeight: 600 }}>
              {totalOccupied} / {totalCapacity} Beds
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '6px' }}>
            {overallOccupancy}%
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            Vacancy Opportunity Loss: <strong style={{ color: 'var(--warning-700)' }}>{formatCurrency(estimatedVacancyLoss)}</strong>
          </div>
        </div>
      </div>

      {/* REPORT VIEWS TAB HEADER */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'financials', label: 'Financial Statement & P&L' },
          { id: 'occupancy', label: 'Occupancy & Yield Analysis' },
          { id: 'defaulters', label: 'Rent Collection & Defaulters', count: defaultersList.length },
          { id: 'tax_hra', label: 'Tax & HRA Compliance' }
        ]}
      />

      {/* TAB 1: FINANCIAL STATEMENT & P&L */}
      {activeTab === 'financials' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Property-Wise Financial Breakdown Table */}
          <div className="card">
            <div className="card-header" style={{ justifyContent: 'space-between' }}>
              <div>
                <h3 className="card-title">Property Yield & Revenue Breakdown</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  Performance summary across individual PG properties during {dateRange.label}
                </p>
              </div>
              <Button variant="outline" size="sm" icon={<Download size={14} />} onClick={handleExportFinancials}>
                Export Statement
              </Button>
            </div>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Type</th>
                    <th>Occupancy</th>
                    <th>Collected</th>
                    <th>Pending Dues</th>
                    <th>Expenses</th>
                    <th>Net Surplus</th>
                    <th>Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {propertyYieldBreakdown.map(p => (
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
                          {p.occupied}/{p.capacity} beds
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
                      <td>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: p.margin >= 20 ? 'var(--success-700)' : 'var(--text-secondary)'
                          }}
                        >
                          {p.margin}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr style={{ backgroundColor: 'var(--slate-50)', fontWeight: 800 }}>
                    <td colSpan={2}>
                      <span style={{ color: 'var(--slate-900)' }}>PORTFOLIO TOTALS</span>
                    </td>
                    <td>{overallOccupancy}% ({totalOccupied}/{totalCapacity} beds)</td>
                    <td style={{ color: 'var(--success-700)' }}>{formatCurrency(totalCollectedRevenue)}</td>
                    <td style={{ color: totalOutstandingDues > 0 ? 'var(--danger-700)' : 'var(--text-tertiary)' }}>
                      {formatCurrency(totalOutstandingDues)}
                    </td>
                    <td style={{ color: 'var(--danger-700)' }}>{formatCurrency(totalOperatingExpenses)}</td>
                    <td style={{ color: netOperatingIncome >= 0 ? 'var(--primary-700)' : 'var(--danger-700)' }}>
                      {formatCurrency(netOperatingIncome)}
                    </td>
                    <td>{operatingMargin}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Two Column: Category Breakdown & Payment Methods */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
              gap: '20px'
            }}
          >
            {/* Expense Distribution */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Expense Breakdown by Category</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  Total: {formatCurrency(totalOperatingExpenses)}
                </span>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {expenseByCategory.length === 0 ? (
                  <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', padding: '20px 0', textAlign: 'center' }}>
                    No operating expenses recorded for this timeframe.
                  </div>
                ) : (
                  expenseByCategory.map(([cat, amt]) => {
                    const pct = totalOperatingExpenses > 0 ? Math.round((amt / totalOperatingExpenses) * 100) : 0;
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
                                  : cat === 'Water'
                                  ? '#0ea5e9'
                                  : '#64748b',
                              borderRadius: '9999px'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Payment Method Distribution */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Collection Channels & Payment Rail Share</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  Total: {formatCurrency(totalCollectedRevenue)}
                </span>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {paymentMethodShare.length === 0 ? (
                  <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', padding: '20px 0', textAlign: 'center' }}>
                    No paid collections in this timeframe.
                  </div>
                ) : (
                  paymentMethodShare.map(([method, amt]) => {
                    const pct = totalCollectedRevenue > 0 ? Math.round((amt / totalCollectedRevenue) * 100) : 0;
                    return (
                      <div key={method}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--slate-800)' }}>
                            {method === 'UPI' ? '📱 UPI (GPay, PhonePe, Paytm)' : method === 'Bank Transfer' ? '🏦 IMPS / NEFT Transfer' : method === 'Cash' ? '💵 Cash Collection' : method}
                          </span>
                          <span style={{ fontWeight: 700, color: 'var(--slate-900)' }}>
                            {formatCurrency(amt)} <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>({pct}%)</span>
                          </span>
                        </div>
                        <div style={{ height: '8px', backgroundColor: 'var(--slate-100)', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${pct}%`,
                              backgroundColor: method === 'UPI' ? '#10b981' : method === 'Bank Transfer' ? '#4f46e5' : '#f59e0b',
                              borderRadius: '9999px'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OCCUPANCY & YIELD ANALYSIS */}
      {activeTab === 'occupancy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px'
            }}
          >
            <div style={{ padding: '18px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Bed Inventory</div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '4px' }}>
                {totalCapacity} Beds
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                Across {scopedRooms.length} rooms in {scopedProperties.length} properties
              </div>
            </div>

            <div style={{ padding: '18px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Occupied Beds</div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--success-700)', marginTop: '4px' }}>
                {totalOccupied} Beds ({overallOccupancy}%)
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                Active rent-paying resident capacity
              </div>
            </div>

            <div style={{ padding: '18px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Vacant Beds</div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: totalAvailable > 0 ? 'var(--warning-700)' : 'var(--success-700)', marginTop: '4px' }}>
                {totalAvailable} Beds
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                Ready for immediate resident move-in
              </div>
            </div>

            <div style={{ padding: '18px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Opportunity Vacancy Loss</div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--danger-700)', marginTop: '4px' }}>
                {formatCurrency(estimatedVacancyLoss)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                Potential monthly revenue unrealized
              </div>
            </div>
          </div>

          {/* Property Occupancy Yield Comparison */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Property Occupancy & Bed Utilization Rates</h3>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {propertyYieldBreakdown.map(p => (
                <div key={p.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div>
                      <strong style={{ fontSize: '14px', color: 'var(--slate-900)' }}>{p.name}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '8px' }}>({p.type} PG)</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 800, fontSize: '14px', color: p.occRate >= 80 ? 'var(--success-700)' : 'var(--warning-700)' }}>
                        {p.occRate}%
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginLeft: '6px' }}>
                        ({p.occupied} / {p.capacity} beds)
                      </span>
                    </div>
                  </div>
                  <div style={{ height: '10px', backgroundColor: 'var(--slate-100)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${p.occRate}%`,
                        backgroundColor: p.occRate >= 85 ? 'var(--success-600)' : p.occRate >= 60 ? 'var(--primary-600)' : 'var(--warning-600)',
                        borderRadius: '9999px'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Turnover Summary */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Resident Turnover Activity During Period</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '14px', backgroundColor: 'var(--success-50)', borderRadius: '8px', border: '1px solid var(--success-200)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--success-800)', fontWeight: 600, textTransform: 'uppercase' }}>New Move-Ins</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success-700)', marginTop: '2px' }}>
                    {moveInsInPeriod.length}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--success-800)', marginTop: '4px' }}>
                    Joined in this timeframe
                  </div>
                </div>

                <div style={{ padding: '14px', backgroundColor: 'var(--slate-100)', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--slate-700)', fontWeight: 600, textTransform: 'uppercase' }}>Vacations / Move-Outs</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-800)', marginTop: '2px' }}>
                    {moveOutsInPeriod.length}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--slate-700)', marginTop: '4px' }}>
                    Vacated during period
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RENT COLLECTION & DEFAULTERS */}
      {activeTab === 'defaulters' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <div className="card-header" style={{ justifyContent: 'space-between' }}>
              <div>
                <h3 className="card-title">Rent Arrears & Defaulters Roster</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  Uncollected balances for {dateRange.label} (Total: {formatCurrency(totalOutstandingDues)})
                </p>
              </div>
              <Button variant="outline" size="sm" icon={<Download size={14} />} onClick={handleExportDefaulters}>
                Export Defaulters CSV
              </Button>
            </div>
            {defaultersList.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                <CheckCircle2 size={36} style={{ color: 'var(--success-600)', marginBottom: '8px', margin: '0 auto' }} />
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--slate-900)', marginTop: '8px' }}>
                  100% On-Time Rent Collection!
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  No overdue rent arrears recorded for {dateRange.label}.
                </div>
              </div>
            ) : (
              <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tenant Name</th>
                      <th>Property & Room</th>
                      <th>Billing Month</th>
                      <th>Due Date</th>
                      <th>Total Due</th>
                      <th>Outstanding Balance</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {defaultersList.map(d => (
                      <tr key={d.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{d.tenantName}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Inv #{d.receiptNumber}</div>
                        </td>
                        <td>
                          <div>{d.propertyName}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>Room {d.roomNumber}</div>
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', fontWeight: 600 }}>{d.billingMonth}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', color: 'var(--danger-700)', fontWeight: 600 }}>
                            {formatDate(d.dueDate)}
                          </span>
                        </td>
                        <td>{formatCurrency(d.totalDue)}</td>
                        <td>
                          <strong style={{ color: 'var(--danger-700)', fontSize: '13.5px' }}>
                            {formatCurrency(d.balanceDue)}
                          </strong>
                        </td>
                        <td>
                          <a
                            href={`https://wa.me/?text=Dear%20${encodeURIComponent(d.tenantName)},%20this%20is%20a%20reminder%20that%20your%20rent%20balance%20of%20₹${d.balanceDue}%20for%20Room%20${d.roomNumber}%20is%20overdue.%20Please%20clear%20it%20at%20your%20earliest.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Send size={13} /> Send WhatsApp Reminder
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: TAX & HRA COMPLIANCE */}
      {activeTab === 'tax_hra' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: 'var(--primary-50)',
              border: '1px solid var(--primary-200)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              gap: '14px',
              alignItems: 'flex-start'
            }}
          >
            <Info size={20} style={{ color: 'var(--primary-700)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '12.5px', color: 'var(--primary-900)' }}>
              <strong>HRA Tax Exemption & GST Guidelines (India):</strong> Rents paid by salaried tenants staying in PGs
              are eligible for House Rent Allowance (HRA) exemption under Section 10(13A) of the Income Tax Act.
              Landlord PAN is legally mandatory for tenant tax claims exceeding ₹1,00,000 per financial year.
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px'
            }}
          >
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Eligible HRA Rent Declared
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '4px' }}>
                {formatCurrency(totalCollectedRevenue)}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                Across {periodPayments.filter(p => p.status === 'Paid').length} verified receipts issued
              </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Landlord PAN on Record
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-700)', marginTop: '4px' }}>
                {ownerProfile?.panNumber || 'ABCDE1234F'}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--success-700)', marginTop: '4px', fontWeight: 600 }}>
                ✓ Valid for Section 10(13A) TDS claims
              </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                GST Registration
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-800)', marginTop: '4px' }}>
                {ownerProfile?.gstNumber || '29ABCDE1234F1Z5'}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                Karnataka Commercial GST / Co-Living Tax Slab
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT-ONLY OFFICIAL STATEMENT BLOCK */}
      <div className="print-only" style={{ display: 'none' }}>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            .print-only, .print-only * { visibility: visible; }
            .print-only {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 24px;
              display: block !important;
              color: #000000;
              background: #ffffff;
              font-family: system-ui, -apple-system, sans-serif;
            }
          }
        `}</style>
        <div style={{ borderBottom: '2px solid #333', paddingBottom: '16px', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '22px', margin: 0, fontWeight: 800 }}>STAYNEST PG MANAGEMENT SYSTEM</h1>
          <div style={{ fontSize: '14px', color: '#555', marginTop: '4px' }}>
            Official Financial Statement & Operational Yield Report
          </div>
          <div style={{ fontSize: '12px', color: '#777', marginTop: '4px' }}>
            Reporting Scope: <strong>{dateRange.label} ({dateRange.sublabel})</strong> • Property: <strong>{propertyFilter === 'all' ? 'All Properties' : scopedProperties[0]?.name}</strong>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '12px' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>Total Rent Collected:</td>
              <td style={{ padding: '8px' }}>{formatCurrency(totalCollectedRevenue)}</td>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>Operating Expenses:</td>
              <td style={{ padding: '8px' }}>{formatCurrency(totalOperatingExpenses)}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>Uncollected Arrears:</td>
              <td style={{ padding: '8px' }}>{formatCurrency(totalOutstandingDues)}</td>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>Net Operating Surplus:</td>
              <td style={{ padding: '8px' }}>{formatCurrency(netOperatingIncome)} ({operatingMargin}%)</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>Occupancy Rate:</td>
              <td style={{ padding: '8px' }}>{overallOccupancy}% ({totalOccupied}/{totalCapacity} beds)</td>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>Landlord PAN:</td>
              <td style={{ padding: '8px' }}>{ownerProfile?.panNumber || 'ABCDE1234F'}</td>
            </tr>
          </tbody>
        </table>

        <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>Property-by-Property Breakdown</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '30px' }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid #000' }}>
              <th style={{ textAlign: 'left', padding: '6px' }}>Property</th>
              <th style={{ textAlign: 'left', padding: '6px' }}>Type</th>
              <th style={{ textAlign: 'center', padding: '6px' }}>Occupancy</th>
              <th style={{ textAlign: 'right', padding: '6px' }}>Collected</th>
              <th style={{ textAlign: 'right', padding: '6px' }}>Expenses</th>
              <th style={{ textAlign: 'right', padding: '6px' }}>Net Surplus</th>
            </tr>
          </thead>
          <tbody>
            {propertyYieldBreakdown.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '6px' }}>{p.name}</td>
                <td style={{ padding: '6px' }}>{p.type} PG</td>
                <td style={{ textAlign: 'center', padding: '6px' }}>{p.occRate}% ({p.occupied}/{p.capacity})</td>
                <td style={{ textAlign: 'right', padding: '6px' }}>{formatCurrency(p.collected)}</td>
                <td style={{ textAlign: 'right', padding: '6px' }}>{formatCurrency(p.expenses)}</td>
                <td style={{ textAlign: 'right', padding: '6px' }}>{formatCurrency(p.net)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px', paddingTop: '20px', borderTop: '1px dashed #999', fontSize: '11px' }}>
          <div>
            Prepared by: <strong>{ownerProfile?.name || 'StayNest Admin'}</strong><br />
            Date of Generation: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <div style={{ textAlign: 'right' }}>
            Authorized Signatory & Stamp<br />
            ______________________________
          </div>
        </div>
      </div>
    </div>
  );
};
