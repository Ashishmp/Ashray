import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { PaymentRecord, PaymentMethod, PaymentStatus } from '../../../types/payment';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency } from '../../../utils/formatters';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (payment: PaymentRecord) => void;
  preselectedTenantId?: string;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedTenantId
}) => {
  const { filteredTenants, tenants, properties, recordPayment } = useApp();
  const { showToast } = useToast();

  const [tenantId, setTenantId] = useState(preselectedTenantId || '');
  const [billingMonth, setBillingMonth] = useState('October 2026');
  const [baseRent, setBaseRent] = useState<number>(0);
  const [lateFee, setLateFee] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeTenants = (filteredTenants.length > 0 ? filteredTenants : tenants).filter(
    t => t.status !== 'Moved Out'
  );

  const selectedTenant = tenants.find(t => t.id === tenantId);

  useEffect(() => {
    if (preselectedTenantId) {
      setTenantId(preselectedTenantId);
    } else if (activeTenants.length > 0 && !tenantId) {
      setTenantId(activeTenants[0].id);
    }
  }, [preselectedTenantId, activeTenants, tenantId, isOpen]);

  useEffect(() => {
    if (selectedTenant) {
      const defaultAmount = selectedTenant.monthlyRent;
      setBaseRent(defaultAmount);
      setAmountPaid(defaultAmount);
      setLateFee(selectedTenant.rentStatus === 'Overdue' ? 500 : 0);
      setDiscount(0);
    }
  }, [tenantId, selectedTenant]);

  const totalDue = Math.max(0, baseRent + lateFee - discount);
  const balanceDue = Math.max(0, totalDue - amountPaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!tenantId) newErrors.tenantId = 'Please select a tenant';
    if (amountPaid <= 0) newErrors.amountPaid = 'Please enter a valid amount paid';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!selectedTenant) return;

    const dueDate = `${billingMonth.split(' ')[1] || '2026'}-10-${String(selectedTenant.rentDueDay).padStart(2, '0')}`;
    const isPastDue = new Date(paymentDate) > new Date(dueDate);

    let paymentStatus: PaymentStatus = 'Paid';
    if (amountPaid === 0 || balanceDue > 0) {
      paymentStatus = isPastDue ? 'Overdue' : 'Pending';
    }

    const matchedProp = properties.find(p => p.id === selectedTenant.propertyId);

    const paymentRecord = recordPayment({
      tenantId: selectedTenant.id,
      tenantName: selectedTenant.name,
      propertyId: selectedTenant.propertyId,
      propertyName: matchedProp?.name || selectedTenant.propertyName || 'StayNest PG',
      roomId: selectedTenant.roomId,
      roomNumber: selectedTenant.roomNumber || '',
      billingMonth,
      baseRent,
      lateFee,
      discount,
      totalDue,
      amountPaid,
      balanceDue,
      paymentDate,
      dueDate: `${billingMonth.split(' ')[1] || '2026'}-10-${String(selectedTenant.rentDueDay).padStart(2, '0')}`,
      paymentMethod,
      transactionRef: transactionRef.trim() || undefined,
      status: paymentStatus,
      notes: notes.trim() || undefined
    });

    showToast(
      'Payment Recorded',
      `Recorded ${formatCurrency(amountPaid)} from ${selectedTenant.name}. Status: ${paymentStatus}.`,
      'success'
    );

    onSuccess(paymentRecord);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Rent Payment"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          {activeTenants.length > 0 && (
            <Button variant="primary" onClick={handleSubmit} type="button">
              Log Payment & Generate Receipt
            </Button>
          )}
        </>
      }
    >
      {activeTenants.length === 0 ? (
        <div style={{ padding: '24px 16px', textAlign: 'center', backgroundColor: 'var(--warning-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--warning-200)' }}>
          <p style={{ color: 'var(--warning-900)', fontSize: '13.5px', marginBottom: '6px', fontWeight: 700 }}>
            No Active Residents Found
          </p>
          <p style={{ color: 'var(--warning-800)', fontSize: '12.5px' }}>
            Please register a tenant in the 'Tenants' tab first before recording rent payments.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Select
            label="Tenant"
            required
            value={tenantId}
            onChange={e => setTenantId(e.target.value)}
            options={activeTenants.map(t => ({
              value: t.id,
              label: `${t.name} (Room ${t.roomNumber} - Rent: ₹${t.monthlyRent.toLocaleString('en-IN')}${
                t.outstandingBalance > 0 ? ` | Due: ₹${t.outstandingBalance.toLocaleString('en-IN')}` : ''
              })`
            }))}
            error={errors.tenantId}
          />

        {selectedTenant && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--slate-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              fontSize: '12.5px',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <span>
              Property: <strong>{selectedTenant.propertyName}</strong>
            </span>
            <span>
              Bed: <strong>{selectedTenant.bedCode}</strong>
            </span>
            <span>
              Due Day: <strong>{selectedTenant.rentDueDay}th of month</strong>
            </span>
          </div>
        )}

        <div className="form-row">
          <Select
            label="Billing Month"
            value={billingMonth}
            onChange={e => setBillingMonth(e.target.value)}
            options={[
              { value: 'October 2026', label: 'October 2026' },
              { value: 'November 2026', label: 'November 2026' },
              { value: 'September 2026', label: 'September 2026' },
              { value: 'August 2026', label: 'August 2026' }
            ]}
          />
          <Input
            label="Base Monthly Rent (₹)"
            type="number"
            required
            value={baseRent}
            onChange={e => setBaseRent(Number(e.target.value))}
          />
        </div>

        <div className="form-row">
          <Input
            label="Late Fee / Penalty (₹)"
            type="number"
            value={lateFee}
            onChange={e => setLateFee(Number(e.target.value))}
          />
          <Input
            label="Discount / Concession (₹)"
            type="number"
            value={discount}
            onChange={e => setDiscount(Number(e.target.value))}
          />
        </div>

        <div className="form-row">
          <Input
            label="Actual Amount Received (₹)"
            type="number"
            required
            value={amountPaid}
            onChange={e => setAmountPaid(Number(e.target.value))}
            error={errors.amountPaid}
          />
          <Input
            label="Payment Date"
            type="date"
            required
            value={paymentDate}
            onChange={e => setPaymentDate(e.target.value)}
          />
        </div>

        {/* Real-time Calculation Summary */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: balanceDue > 0 ? 'var(--warning-50)' : 'var(--success-50)',
            border: `1px solid ${balanceDue > 0 ? 'var(--warning-200)' : 'var(--success-200)'}`,
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '13px'
          }}
        >
          <div>
            Total Billed:{' '}
            <strong>{formatCurrency(totalDue)}</strong>
          </div>
          <div>
            Received:{' '}
            <strong style={{ color: 'var(--success-700)' }}>{formatCurrency(amountPaid)}</strong>
          </div>
          <div>
            Remaining Balance:{' '}
            <strong style={{ color: balanceDue > 0 ? 'var(--danger-700)' : 'var(--success-700)' }}>
              {formatCurrency(balanceDue)}
            </strong>
          </div>
        </div>

        <div className="form-row">
          <Select
            label="Payment Method"
            required
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
            options={[
              { value: 'UPI', label: 'UPI (GPay, PhonePe, Paytm)' },
              { value: 'Bank Transfer', label: 'Bank Transfer (NEFT / IMPS)' },
              { value: 'Cash', label: 'Cash (Collected by Caretaker)' },
              { value: 'Cheque', label: 'Cheque' },
              { value: 'Other', label: 'Other' }
            ]}
          />
          <Input
            label="Transaction Ref / UTR / Note"
            placeholder="e.g. UPI/229012349012 or Cash voucher"
            value={transactionRef}
            onChange={e => setTransactionRef(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Internal Remarks</label>
          <input
            className="form-input"
            placeholder="e.g. Received by Manager Suresh, verified in bank"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>
      </form>
    )}
  </Modal>
  );
};
