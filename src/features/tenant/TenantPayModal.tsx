import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Copy,
  ArrowRight,
  Printer,
  Sparkles
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { formatCurrency } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import { storageService } from '../../services/storageService';
import { PaymentRecord, PaymentMethod } from '../../types/payment';
import { Tenant } from '../../types/tenant';

interface TenantPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  onPaymentSuccess: (payment: PaymentRecord) => void;
}

export const TenantPayModal: React.FC<TenantPayModalProps> = ({
  isOpen,
  onClose,
  tenant,
  onPaymentSuccess
}) => {
  const { showToast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [upiId, setUpiId] = useState('rohan.verma@okhdfcbank');
  const [selectedApp, setSelectedApp] = useState<'gpay' | 'phonepe' | 'paytm'>('gpay');

  // Card details
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('742');
  const [cardName, setCardName] = useState(tenant.name);

  // Netbanking
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Processing & Confirmation state
  const [isProcessing, setIsProcessing] = useState(false);
  const [successPayment, setSuccessPayment] = useState<PaymentRecord | null>(null);

  // Billing breakdown
  const baseRent = tenant.monthlyRent || 13500;
  const maintenanceFee = 500;
  const totalAmount = tenant.outstandingBalance > 0 ? tenant.outstandingBalance : baseRent + maintenanceFee;

  const handleProcessPayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      try {
        const randomUTR = `UPI/2026/${Math.floor(100000000 + Math.random() * 900000000)}`;
        const result = storageService.payRentOnline(tenant.id, {
          baseRent,
          maintenanceFee,
          totalPaid: totalAmount,
          paymentMethod,
          transactionRef: randomUTR,
          billingMonth: 'October 2026',
          notes: `Online resident rent payment cleared via ${paymentMethod} (${paymentMethod === 'UPI' ? upiId : paymentMethod === 'Card' ? 'Card ending 8821' : selectedBank}).`
        });

        setIsProcessing(false);
        setSuccessPayment(result.payment);
        onPaymentSuccess(result.payment);
        showToast('Payment Successful!', `₹${totalAmount.toLocaleString('en-IN')} paid. Receipt generated.`, 'success');
      } catch (err: unknown) {
        setIsProcessing(false);
        showToast('Payment Error', err instanceof Error ? err.message : 'Transaction failed.', 'error');
      }
    }, 1200);
  };

  const handleModalClose = () => {
    setSuccessPayment(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={successPayment ? 'Payment Confirmation' : 'Pay Monthly Rent Online'}
      size="md"
      footer={
        successPayment ? (
          <Button variant="primary" onClick={handleModalClose} type="button">
            Done & View Receipt
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={handleModalClose} type="button" disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={isProcessing ? undefined : <ShieldCheck size={16} />}
              onClick={handleProcessPayment}
              type="button"
              disabled={isProcessing}
            >
              {isProcessing ? 'Verifying with Bank...' : `Pay ${formatCurrency(totalAmount)} Now`}
            </Button>
          </>
        )
      }
    >
      {successPayment ? (
        <div style={{ textAlign: 'center', padding: '16px 8px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--success-50)',
              color: 'var(--success-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              border: '2px solid var(--success-200)'
            }}
          >
            <CheckCircle2 size={32} />
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--slate-900)' }}>
            Rent Payment Successful!
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--slate-500)', marginTop: '4px' }}>
            Your rent payment for October 2026 has been reconciled and credited.
          </p>

          <div
            style={{
              backgroundColor: 'var(--slate-50)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginTop: '20px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '13px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--slate-500)' }}>Receipt Number:</span>
              <strong style={{ color: 'var(--slate-900)' }}>{successPayment.receiptNumber}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--slate-500)' }}>Amount Paid:</span>
              <strong style={{ color: 'var(--success-700)', fontSize: '15px' }}>
                {formatCurrency(successPayment.amountPaid)}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--slate-500)' }}>Bank UTR / Transaction Ref:</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary-700)' }}>
                {successPayment.transactionRef}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--slate-500)' }}>Payment Mode:</span>
              <span>{successPayment.paymentMethod}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--slate-500)' }}>Reconciliation Status:</span>
              <span style={{ color: 'var(--success-700)', fontWeight: 600 }}>Zero Outstanding Balance</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Bill Breakdown Box */}
          <div
            style={{
              backgroundColor: 'var(--primary-50)',
              border: '1px solid var(--primary-100)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-800)', textTransform: 'uppercase' }}>
                October 2026 Monthly Dues
              </span>
              <span style={{ fontSize: '11px', color: 'var(--primary-600)' }}>Due by 5th Oct</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--slate-700)', marginBottom: '4px' }}>
              <span>Base Bed Rent (Room {tenant.roomNumber || '102'})</span>
              <span>{formatCurrency(baseRent)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--slate-700)', marginBottom: '8px' }}>
              <span>Maintenance & High-Speed Wi-Fi</span>
              <span>{formatCurrency(maintenanceFee)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--slate-900)',
                borderTop: '1px solid var(--primary-200)',
                paddingTop: '8px'
              }}
            >
              <span>Total Payable</span>
              <span style={{ color: 'var(--primary-700)' }}>{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          {/* Payment Method Selector Tabs */}
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--slate-700)', display: 'block', marginBottom: '8px' }}>
              Select Payment Mode
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                style={{
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-md)',
                  border: paymentMethod === 'UPI' ? '2px solid var(--primary-600)' : '1px solid var(--border-color)',
                  backgroundColor: paymentMethod === 'UPI' ? 'var(--primary-50)' : 'var(--bg-surface)',
                  color: paymentMethod === 'UPI' ? 'var(--primary-800)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '12.5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <QrCode size={15} /> UPI / QR
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Card')}
                style={{
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-md)',
                  border: paymentMethod === 'Card' ? '2px solid var(--primary-600)' : '1px solid var(--border-color)',
                  backgroundColor: paymentMethod === 'Card' ? 'var(--primary-50)' : 'var(--bg-surface)',
                  color: paymentMethod === 'Card' ? 'var(--primary-800)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '12.5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <CreditCard size={15} /> Debit / Credit
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Bank Transfer')}
                style={{
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-md)',
                  border: paymentMethod === 'Bank Transfer' ? '2px solid var(--primary-600)' : '1px solid var(--border-color)',
                  backgroundColor: paymentMethod === 'Bank Transfer' ? 'var(--primary-50)' : 'var(--bg-surface)',
                  color: paymentMethod === 'Bank Transfer' ? 'var(--primary-800)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '12.5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Building size={15} /> NetBanking
              </button>
            </div>
          </div>

          {/* UPI Method View */}
          {paymentMethod === 'UPI' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '14px',
                  backgroundColor: 'var(--slate-50)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--slate-800)'
                  }}
                >
                  <QrCode size={56} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--slate-900)' }}>
                    Scan PG Dynamic UPI QR
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--slate-500)', marginTop: '2px' }}>
                    Open any UPI App (GPay, PhonePe, Paytm, BHIM) to scan and pay instantly.
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--success-700)', fontWeight: 600 }}>
                      ✓ Verified Merchant ID: staynest.hospitality@icici
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <Input
                  label="Or Enter Resident UPI ID / VPA"
                  placeholder="name@okhdfcbank"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  prefixIcon={<QrCode size={15} />}
                  hint="A collect request will be pushed directly to your UPI app"
                />
              </div>

              {/* Fast App Selectors */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['gpay', 'phonepe', 'paytm'] as const).map(app => (
                  <button
                    key={app}
                    type="button"
                    onClick={() => setSelectedApp(app)}
                    style={{
                      flex: 1,
                      padding: '6px',
                      borderRadius: 'var(--radius-sm)',
                      border: selectedApp === app ? '1px solid var(--primary-500)' : '1px solid var(--border-color)',
                      backgroundColor: selectedApp === app ? 'var(--primary-50)' : 'var(--bg-surface)',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: selectedApp === app ? 'var(--primary-800)' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {app === 'gpay' ? 'Google Pay' : app === 'phonepe' ? 'PhonePe' : 'Paytm UPI'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Card Method View */}
          {paymentMethod === 'Card' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Input
                label="Card Number"
                placeholder="4532 0000 0000 0000"
                value={cardNumber}
                onChange={e => setCardNumber(e.target.value)}
                prefixIcon={<CreditCard size={15} />}
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <Input
                  label="Expiry Date"
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={e => setCardExpiry(e.target.value)}
                />
                <Input
                  label="CVV / CVC"
                  type="password"
                  placeholder="•••"
                  value={cardCvv}
                  onChange={e => setCardCvv(e.target.value)}
                />
              </div>
              <Input
                label="Name on Card"
                value={cardName}
                onChange={e => setCardName(e.target.value)}
              />
            </div>
          )}

          {/* Netbanking Method View */}
          {paymentMethod === 'Bank Transfer' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Select
                label="Select Indian Scheduled Commercial Bank"
                value={selectedBank}
                onChange={e => setSelectedBank(e.target.value)}
                options={[
                  { value: 'HDFC Bank', label: 'HDFC Bank NetBanking' },
                  { value: 'ICICI Bank', label: 'ICICI Bank Internet Banking' },
                  { value: 'State Bank of India', label: 'State Bank of India (SBI)' },
                  { value: 'Axis Bank', label: 'Axis Bank Corporate & Retail' },
                  { value: 'Kotak Mahindra', label: 'Kotak Mahindra Bank' }
                ]}
              />
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--slate-600)',
                  backgroundColor: 'var(--slate-50)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)'
                }}
              >
                You will be redirected to the secure bank portal to authorize payment of{' '}
                <strong>{formatCurrency(totalAmount)}</strong>.
              </div>
            </div>
          )}

          {/* Security Guarantee Note */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '11.5px',
              color: 'var(--slate-500)',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '12px'
            }}
          >
            <ShieldCheck size={16} color="var(--success-600)" />
            <span>256-bit Bank Grade Encrypted Payment Gateway. Instant Official HRA Rent Receipt.</span>
          </div>
        </div>
      )}
    </Modal>
  );
};
