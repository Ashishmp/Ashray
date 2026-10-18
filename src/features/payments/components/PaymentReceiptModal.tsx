import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Printer, Download, Building, CheckCircle2 } from 'lucide-react';
import { PaymentRecord } from '../../../types/payment';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { useApp } from '../../../context/AppContext';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentRecord | null;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  payment
}) => {
  const { ownerProfile } = useApp();

  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Rent Receipt"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Close
          </Button>
          <Button
            variant="outline"
            icon={<Printer size={16} />}
            onClick={handlePrint}
            type="button"
          >
            Print Receipt
          </Button>
        </>
      }
    >
      <div
        id="printable-receipt"
        style={{
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          backgroundColor: '#ffffff',
          color: 'var(--slate-800)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid var(--slate-200)',
            paddingBottom: '16px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}
              >
                <Building size={18} />
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--slate-900)' }}>
                {ownerProfile.businessName}
              </h3>
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--slate-500)', marginTop: '4px', maxWidth: '320px' }}>
              {ownerProfile.address} | PAN: {ownerProfile.panNumber}
              {ownerProfile.gstNumber ? ` | GST: ${ownerProfile.gstNumber}` : ''}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                display: 'inline-block',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary-700)',
                padding: '3px 8px',
                borderRadius: '4px',
                marginBottom: '4px'
              }}
            >
              Payment Receipt
            </span>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--slate-900)' }}>
              {payment.receiptNumber}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--slate-500)' }}>
              Date: {formatDate(payment.paymentDate || payment.createdAt)}
            </div>
          </div>
        </div>

        {/* Tenant & Property Info */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            backgroundColor: 'var(--slate-50)',
            padding: '12px 16px',
            borderRadius: '6px',
            fontSize: '12.5px'
          }}
        >
          <div>
            <div style={{ color: 'var(--slate-500)', fontSize: '11px', textTransform: 'uppercase' }}>
              Received From (Tenant)
            </div>
            <div style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: '14px', marginTop: '2px' }}>
              {payment.tenantName}
            </div>
            <div style={{ color: 'var(--slate-600)' }}>
              Room No: <strong>{payment.roomNumber}</strong>
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--slate-500)', fontSize: '11px', textTransform: 'uppercase' }}>
              PG Property
            </div>
            <div style={{ fontWeight: 600, color: 'var(--slate-900)', marginTop: '2px' }}>
              {payment.propertyName}
            </div>
            <div style={{ color: 'var(--slate-600)' }}>
              Billing Cycle: <strong>{payment.billingMonth}</strong>
            </div>
          </div>
        </div>

        {/* Breakdown Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--slate-300)', textAlign: 'left' }}>
              <th style={{ padding: '8px 4px', color: 'var(--slate-600)' }}>Item Description</th>
              <th style={{ padding: '8px 4px', textAlign: 'right', color: 'var(--slate-600)' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--slate-100)' }}>
              <td style={{ padding: '10px 4px' }}>Base Monthly Bed Rent ({payment.billingMonth})</td>
              <td style={{ padding: '10px 4px', textAlign: 'right', fontWeight: 600 }}>
                {formatCurrency(payment.baseRent)}
              </td>
            </tr>
            {payment.lateFee > 0 && (
              <tr style={{ borderBottom: '1px solid var(--slate-100)' }}>
                <td style={{ padding: '8px 4px', color: 'var(--danger-700)' }}>Late Payment Fee</td>
                <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 600, color: 'var(--danger-700)' }}>
                  +{formatCurrency(payment.lateFee)}
                </td>
              </tr>
            )}
            {payment.discount > 0 && (
              <tr style={{ borderBottom: '1px solid var(--slate-100)' }}>
                <td style={{ padding: '8px 4px', color: 'var(--success-700)' }}>Approved Concession / Discount</td>
                <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 600, color: 'var(--success-700)' }}>
                  -{formatCurrency(payment.discount)}
                </td>
              </tr>
            )}
            <tr style={{ borderTop: '2px solid var(--slate-300)' }}>
              <td style={{ padding: '10px 4px', fontWeight: 700 }}>Total Billed</td>
              <td style={{ padding: '10px 4px', textAlign: 'right', fontWeight: 700, fontSize: '14px' }}>
                {formatCurrency(payment.totalDue)}
              </td>
            </tr>
            <tr style={{ backgroundColor: 'var(--primary-50)' }}>
              <td style={{ padding: '10px 8px', fontWeight: 700, color: 'var(--primary-800)' }}>
                Amount Paid
              </td>
              <td
                style={{
                  padding: '10px 8px',
                  textAlign: 'right',
                  fontWeight: 800,
                  fontSize: '15px',
                  color: 'var(--primary-700)'
                }}
              >
                {formatCurrency(payment.amountPaid)}
              </td>
            </tr>
            {payment.balanceDue > 0 && (
              <tr>
                <td style={{ padding: '8px 4px', color: 'var(--warning-700)', fontWeight: 600 }}>
                  Remaining Due Balance
                </td>
                <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 700, color: 'var(--warning-700)' }}>
                  {formatCurrency(payment.balanceDue)}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Transaction details & Stamp */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderTop: '1px solid var(--slate-200)',
            paddingTop: '16px',
            fontSize: '12px'
          }}
        >
          <div>
            <div>Payment Mode: <strong>{payment.paymentMethod}</strong></div>
            {payment.transactionRef && (
              <div style={{ marginTop: '2px', color: 'var(--slate-600)' }}>
                UTR / Reference: <strong>{payment.transactionRef}</strong>
              </div>
            )}
            <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success-700)' }}>
              <CheckCircle2 size={14} />
              <span>Status: Verified & Recorded</span>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                borderBottom: '1px solid var(--slate-400)',
                width: '140px',
                height: '32px',
                marginBottom: '4px'
              }}
            />
            <span style={{ fontSize: '11px', color: 'var(--slate-500)' }}>
              Authorized Signatory
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
