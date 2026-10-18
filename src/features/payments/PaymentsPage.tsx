import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Printer,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Tabs } from '../../components/ui/Tabs';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { RecordPaymentModal } from './components/RecordPaymentModal';
import { PaymentReceiptModal } from './components/PaymentReceiptModal';
import { PaymentRecord, PaymentMethod, PaymentStatus } from '../../types/payment';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/csvExport';

export const PaymentsPage: React.FC = () => {
  const { filteredPayments, payments, filteredTenants } = useApp();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<PaymentRecord | null>(null);

  // Filtered payments
  const displayPayments = useMemo(() => {
    return filteredPayments.filter(payment => {
      const matchesSearch =
        payment.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (payment.transactionRef && payment.transactionRef.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesMonth = filterMonth === 'all' || payment.billingMonth === filterMonth;
      const matchesMethod = filterMethod === 'all' || payment.paymentMethod === filterMethod;

      let matchesTab = true;
      if (activeTab === 'paid') matchesTab = payment.status === 'Paid';
      else if (activeTab === 'overdue') matchesTab = payment.status === 'Overdue';
      else if (activeTab === 'pending') matchesTab = payment.status === 'Pending';

      return matchesSearch && matchesMonth && matchesMethod && matchesTab;
    });
  }, [filteredPayments, searchQuery, filterMonth, filterMethod, activeTab]);

  // Aggregate statistics
  const totalBilled = filteredPayments.reduce((acc, p) => acc + p.totalDue, 0);
  const totalCollected = filteredPayments.reduce((acc, p) => acc + p.amountPaid, 0);
  const totalPending = filteredPayments.reduce((acc, p) => acc + p.balanceDue, 0);
  const overdueCount = filteredPayments.filter(p => p.status === 'Overdue').length;

  const handleExportCSV = () => {
    const rows = displayPayments.map(p => ({
      'Receipt #': p.receiptNumber,
      'Tenant Name': p.tenantName,
      'Property': p.propertyName,
      'Room #': p.roomNumber,
      'Billing Month': p.billingMonth,
      'Base Rent (INR)': p.baseRent,
      'Late Fee (INR)': p.lateFee,
      'Discount (INR)': p.discount,
      'Total Due (INR)': p.totalDue,
      'Amount Paid (INR)': p.amountPaid,
      'Balance Due (INR)': p.balanceDue,
      'Payment Date': p.paymentDate || 'Pending',
      'Method': p.paymentMethod,
      'Reference / UTR': p.transactionRef || '',
      'Status': p.status
    }));
    exportToCSV('StayNest_Rent_Payments', rows);
    showToast('Export Complete', 'Exported rent collection records to CSV.', 'success');
  };

  return (
    <div>
      <PageHeader
        title="Rent & Payments"
        subtitle="Manage rent billing, UPI and cash collections, outstanding arrears, and formal receipts"
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="outline"
              icon={<Download size={16} />}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => setIsRecordModalOpen(true)}
            >
              Record Payment
            </Button>
          </div>
        }
      />

      {/* Financial Health Summary Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginBottom: '20px'
        }}
      >
        <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
            Total Gross Billed
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '2px', color: 'var(--text-primary)' }}>
            {formatCurrency(totalBilled)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            Total scheduled invoice receivables
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: 'var(--success-50)', border: '1px solid var(--success-200)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '12px', color: 'var(--success-800)', fontWeight: 600, textTransform: 'uppercase' }}>
            Rent Collected
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '2px', color: 'var(--success-700)' }}>
            {formatCurrency(totalCollected)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--success-800)', marginTop: '2px' }}>
            Verified in bank & cash accounts
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: 'var(--warning-50)', border: '1px solid var(--warning-200)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '12px', color: 'var(--warning-800)', fontWeight: 600, textTransform: 'uppercase' }}>
            Pending Balances
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '2px', color: 'var(--warning-700)' }}>
            {formatCurrency(totalPending)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--warning-800)', marginTop: '2px' }}>
            Current cycle invoices awaiting collection
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: overdueCount > 0 ? 'var(--danger-50)' : 'var(--slate-50)', border: `1px solid ${overdueCount > 0 ? 'var(--danger-200)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '12px', color: overdueCount > 0 ? 'var(--danger-800)' : 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>
            Overdue Accounts
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '2px', color: overdueCount > 0 ? 'var(--danger-700)' : 'var(--text-primary)' }}>
            {overdueCount} Tenants
          </div>
          <div style={{ fontSize: '11px', color: overdueCount > 0 ? 'var(--danger-800)' : 'var(--text-tertiary)', marginTop: '2px' }}>
            Past 5-day grace period
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'all', label: 'All Collections', count: filteredPayments.length },
          { id: 'paid', label: 'Fully Paid', count: filteredPayments.filter(p => p.status === 'Paid').length },
          { id: 'overdue', label: 'Overdue Dues', count: overdueCount },
          { id: 'pending', label: 'Pending', count: filteredPayments.filter(p => p.status === 'Pending').length }
        ]}
      />

      {/* Filter and Search Toolbar */}
      <div className="toolbar-container">
        <div className="toolbar-filters">
          <div className="filter-search-box">
            <Search className="filter-search-icon" size={16} />
            <input
              type="text"
              placeholder="Search receipt #, tenant, room, UTR..."
              className="form-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <Select
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            options={[
              { value: 'all', label: 'All Billing Cycles' },
              { value: 'October 2026', label: 'October 2026' },
              { value: 'September 2026', label: 'September 2026' },
              { value: 'August 2026', label: 'August 2026' }
            ]}
          />

          <Select
            value={filterMethod}
            onChange={e => setFilterMethod(e.target.value)}
            options={[
              { value: 'all', label: 'All Payment Modes' },
              { value: 'UPI', label: 'UPI (GPay / PhonePe)' },
              { value: 'Bank Transfer', label: 'Bank Transfer (NEFT/IMPS)' },
              { value: 'Cash', label: 'Cash' },
              { value: 'Other', label: 'Other' }
            ]}
          />
        </div>
      </div>

      {/* Payments Table */}
      {displayPayments.length === 0 ? (
        <EmptyState
          icon={<CreditCard size={32} />}
          title="No payment records match criteria"
          description="Adjust your search filters or record an incoming rent transaction."
          actionText="Record Rent Payment"
          onAction={() => setIsRecordModalOpen(true)}
        />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Tenant & Property</th>
                <th>Billing Cycle</th>
                <th>Billed</th>
                <th>Paid</th>
                <th>Balance Due</th>
                <th>Payment Mode & Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {displayPayments.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--primary-700)' }}>
                      {p.receiptNumber}
                    </div>
                    {p.transactionRef && (
                      <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', maxWidth: '140px' }} className="text-truncate" title={p.transactionRef}>
                        Ref: {p.transactionRef}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{p.tenantName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      Rm {p.roomNumber} • {p.propertyName}
                    </div>
                  </td>
                  <td>
                    {p.billingMonth}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{formatCurrency(p.totalDue)}</div>
                    {p.lateFee > 0 && (
                      <div style={{ fontSize: '10.5px', color: 'var(--danger-600)' }}>
                        +{formatCurrency(p.lateFee)} late fee
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, color: 'var(--success-700)' }}>
                      {formatCurrency(p.amountPaid)}
                    </div>
                  </td>
                  <td>
                    <div
                      style={{
                        fontWeight: 700,
                        color: p.balanceDue > 0 ? 'var(--danger-700)' : 'var(--text-tertiary)'
                      }}
                    >
                      {formatCurrency(p.balanceDue)}
                    </div>
                  </td>
                  <td>
                    <div>{p.paymentMethod}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      {p.paymentDate ? formatDate(p.paymentDate) : 'Unpaid'}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={p.status} size="sm" />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Printer size={14} />}
                      onClick={() => setActiveReceipt(p)}
                      title="View & Print Official Receipt"
                    >
                      Receipt
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSuccess={record => setActiveReceipt(record)}
      />

      {/* Payment Receipt Viewer Modal */}
      <PaymentReceiptModal
        isOpen={Boolean(activeReceipt)}
        onClose={() => setActiveReceipt(null)}
        payment={activeReceipt}
      />
    </div>
  );
};
