import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Receipt,
  ShieldCheck,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Printer,
  Eye,
  Plus,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { storageService } from '../../services/storageService';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { TenantPayModal } from './TenantPayModal';
import { PaymentReceiptModal } from '../payments/components/PaymentReceiptModal';
import { Tenant } from '../../types/tenant';
import { PaymentRecord } from '../../types/payment';

export const TenantPaymentsPage: React.FC = () => {
  const { currentTenant } = useAuth();
  const { showToast } = useToast();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);

  const loadData = () => {
    if (!currentTenant) return;
    const profile = storageService.getTenantFullProfile(currentTenant.id);
    if (profile) {
      setTenant(profile.tenant);
      const history = storageService.getTenantPaymentHistory(currentTenant.id);
      setPayments(history);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant]);

  if (!tenant) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--slate-500)' }}>Loading payment records...</div>;
  }

  const isDue = tenant.rentStatus !== 'Paid' || tenant.outstandingBalance > 0;
  const totalPaidYTD = payments
    .filter(p => p.status === 'Paid')
    .reduce((acc, p) => acc + p.amountPaid, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="Rent & Payment History"
        subtitle="Inspect past payment vouchers, clear monthly rent dues via UPI or cards, and generate official HRA receipts."
        actions={
          <Button
            variant="primary"
            icon={<CreditCard size={15} />}
            onClick={() => setIsPayModalOpen(true)}
          >
            {isDue ? `Pay ₹${(tenant.outstandingBalance || 14000).toLocaleString('en-IN')} Due Online` : 'Pay Rent in Advance'}
          </Button>
        }
      />

      {/* Financial KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <StatCard
          label="Current Rent Dues"
          value={formatCurrency(tenant.outstandingBalance || (isDue ? 14000 : 0))}
          icon={<CreditCard size={20} />}
          trend={{ direction: isDue ? 'down' : 'neutral', value: isDue ? 'Pending' : 'Zero', caption: 'October 2026' }}
        />
        <StatCard
          label="Security Deposit Held"
          value={formatCurrency(tenant.securityDeposit || 27000)}
          icon={<ShieldCheck size={20} />}
          trend={{ direction: 'neutral', value: 'Refundable', caption: 'Escrow account' }}
        />
        <StatCard
          label="Total Rent Paid YTD"
          value={formatCurrency(totalPaidYTD || 81000)}
          icon={<Receipt size={20} />}
          trend={{ direction: 'up', value: `${payments.length} Months`, caption: 'reconciled' }}
        />
        <StatCard
          label="Next Rent Cycle"
          value="05 Nov 2026"
          icon={<Calendar size={20} />}
          trend={{ direction: 'neutral', value: 'Auto-invoice', caption: '5th of every month' }}
        />
      </div>

      {/* Payment History Table */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-xs)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--slate-900)' }}>
              Official Payment Receipts & Vouchers ({payments.length})
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--slate-500)', marginTop: '2px' }}>
              All transactions include authorized PG landlord GST & PAN compliance details for HRA tax exemption claims.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={<CreditCard size={14} />}
            onClick={() => setIsPayModalOpen(true)}
          >
            Quick Pay UPI
          </Button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--slate-50)', borderBottom: '1px solid var(--border-color)', color: 'var(--slate-600)', fontWeight: 600 }}>
                <th style={{ padding: '12px 16px' }}>Receipt No.</th>
                <th style={{ padding: '12px 16px' }}>Billing Cycle</th>
                <th style={{ padding: '12px 16px' }}>Amount Paid</th>
                <th style={{ padding: '12px 16px' }}>Payment Mode</th>
                <th style={{ padding: '12px 16px' }}>Bank UTR / Ref</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--slate-500)' }}>
                    No payment records found. Use "Pay Rent Online" above to make your first payment.
                  </td>
                </tr>
              ) : (
                payments.map(payment => (
                  <tr
                    key={payment.id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background-color 150ms'
                    }}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--primary-700)', fontFamily: 'monospace' }}>
                        {payment.receiptNumber}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--slate-500)', marginTop: '2px' }}>
                        {formatDate(payment.paymentDate || payment.createdAt)}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>
                        {payment.billingMonth}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--slate-500)' }}>
                        Room {payment.roomNumber} ({tenant.propertyName?.split('-')[0] || 'StayNest'})
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: '14px' }}>
                        {formatCurrency(payment.amountPaid)}
                      </div>
                      {payment.lateFee > 0 && (
                        <div style={{ fontSize: '11px', color: 'var(--danger-600)' }}>
                          Inc. {formatCurrency(payment.lateFee)} late fee
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--slate-700)'
                        }}
                      >
                        {payment.paymentMethod}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          backgroundColor: 'var(--slate-100)',
                          padding: '3px 6px',
                          borderRadius: '4px',
                          color: 'var(--slate-700)'
                        }}
                      >
                        {payment.transactionRef || 'N/A'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <StatusBadge
                        status={payment.status}
                      />
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Eye size={13} />}
                        onClick={() => setSelectedReceipt(payment)}
                      >
                        Official Receipt
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Online Pay Modal */}
      <TenantPayModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        tenant={tenant}
        onPaymentSuccess={p => {
          loadData();
          setSelectedReceipt(p);
        }}
      />

      {/* Printable Receipt Modal */}
      <PaymentReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        payment={selectedReceipt}
      />
    </div>
  );
};
