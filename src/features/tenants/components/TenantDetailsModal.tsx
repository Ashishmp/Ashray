import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { Tenant } from '../../../types/tenant';
import { useApp } from '../../../context/AppContext';
import { useToast } from '../../../context/ToastContext';
import {
  Phone,
  Mail,
  Building,
  BedDouble,
  Calendar,
  ShieldCheck,
  CreditCard,
  ArrowRightLeft,
  LogOut,
  UserCheck
} from 'lucide-react';
import { formatCurrency, formatDate, formatPhone } from '../../../utils/formatters';

interface TenantDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant | null;
  onEdit: (tenant: Tenant) => void;
  onTransfer: (tenant: Tenant) => void;
  onRecordPayment: (tenant: Tenant) => void;
}

export const TenantDetailsModal: React.FC<TenantDetailsModalProps> = ({
  isOpen,
  onClose,
  tenant,
  onEdit,
  onTransfer,
  onRecordPayment
}) => {
  const { payments, vacateTenant } = useApp();
  const { showToast } = useToast();
  const [showVacateConfirm, setShowVacateConfirm] = useState(false);

  if (!tenant) return null;

  // Tenant's payment history
  const tenantPayments = payments.filter(p => p.tenantId === tenant.id);

  const handleVacate = () => {
    const today = new Date().toISOString().split('T')[0];
    vacateTenant(tenant.id, today);
    showToast(
      'Tenant Vacated',
      `${tenant.name} marked as Moved Out. Bed slot (${tenant.bedCode}) is now vacant and available.`,
      'info'
    );
    setShowVacateConfirm(false);
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={tenant.name}
        size="lg"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div>
              {tenant.status !== 'Moved Out' && (
                <Button
                  variant="outline"
                  size="sm"
                  style={{ color: 'var(--danger-600)', borderColor: 'var(--danger-200)' }}
                  icon={<LogOut size={14} />}
                  onClick={() => setShowVacateConfirm(true)}
                >
                  Vacate / Move-Out
                </Button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
              {tenant.status !== 'Moved Out' && (
                <>
                  <Button
                    variant="outline"
                    icon={<ArrowRightLeft size={14} />}
                    onClick={() => {
                      onClose();
                      onTransfer(tenant);
                    }}
                  >
                    Transfer Bed
                  </Button>
                  <Button
                    variant="primary"
                    icon={<CreditCard size={14} />}
                    onClick={() => {
                      onClose();
                      onRecordPayment(tenant);
                    }}
                  >
                    Record Payment
                  </Button>
                </>
              )}
            </div>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header summary banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--border-color)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <StatusBadge status={tenant.status} />
              <StatusBadge status={tenant.rentStatus} />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {tenant.gender} • Move-in: {formatDate(tenant.moveInDate)}
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Outstanding Dues
              </span>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: tenant.outstandingBalance > 0 ? 'var(--danger-700)' : 'var(--success-700)'
                }}
              >
                {formatCurrency(tenant.outstandingBalance)}
              </div>
            </div>
          </div>

          {/* Allocation & Contact Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
              backgroundColor: 'var(--slate-50)',
              padding: '16px',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Room & Property Allocation
              </div>
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--slate-900)' }}>
                {tenant.propertyName}
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Room <strong>{tenant.roomNumber}</strong> • Bed <strong>{tenant.bedCode}</strong>
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--primary-700)', fontWeight: 600, marginTop: '4px' }}>
                Monthly Rent: {formatCurrency(tenant.monthlyRent)} (Due on {tenant.rentDueDay}th)
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                Security Deposit: {formatCurrency(tenant.securityDeposit)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Tenant Contact & Workplace
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}>
                <Phone size={14} color="var(--slate-500)" />
                {formatPhone(tenant.phone)}
              </div>
              {tenant.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  <Mail size={14} color="var(--slate-500)" />
                  {tenant.email}
                </div>
              )}
              {tenant.workplaceOrCollege && (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Workplace: <strong>{tenant.workplaceOrCollege}</strong>
                </div>
              )}
              {tenant.idProofNumber && (
                <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  ID: {tenant.idProofType} ({tenant.idProofNumber})
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--primary-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--primary-200)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px'
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: 'var(--primary-800)', textTransform: 'uppercase', fontWeight: 600 }}>
                Emergency Contact
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-900)' }}>
                {tenant.emergencyContact.name} ({tenant.emergencyContact.relationship})
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--primary-800)' }}>
              <Phone size={14} />
              {formatPhone(tenant.emergencyContact.phone)}
            </div>
          </div>

          {/* Agreement details */}
          <div style={{ display: 'flex', gap: '20px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
            <div>
              Agreement Validity: <strong>{formatDate(tenant.agreementStartDate)}</strong> to{' '}
              <strong>{formatDate(tenant.agreementEndDate)}</strong>
            </div>
            {tenant.moveOutDate && (
              <div style={{ color: 'var(--danger-700)' }}>
                Move Out Date: <strong>{formatDate(tenant.moveOutDate)}</strong>
              </div>
            )}
          </div>

          {/* Payment History for this tenant */}
          <div>
            <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Rent Collection History ({tenantPayments.length} records)
            </h4>
            {tenantPayments.length === 0 ? (
              <div style={{ padding: '16px', backgroundColor: 'var(--slate-50)', borderRadius: '6px', color: 'var(--text-tertiary)', fontSize: '12px', textAlign: 'center' }}>
                No payment receipts logged yet for this tenant.
              </div>
            ) : (
              <div className="table-container" style={{ border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Receipt #</th>
                      <th>Total Due</th>
                      <th>Paid</th>
                      <th>Date & Mode</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenantPayments.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.billingMonth}</td>
                        <td style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{p.receiptNumber}</td>
                        <td>{formatCurrency(p.totalDue)}</td>
                        <td style={{ fontWeight: 700, color: 'var(--success-700)' }}>
                          {formatCurrency(p.amountPaid)}
                        </td>
                        <td>
                          <div>{formatDate(p.paymentDate || p.createdAt)}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{p.paymentMethod}</div>
                        </td>
                        <td>
                          <StatusBadge status={p.status} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Vacate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showVacateConfirm}
        onClose={() => setShowVacateConfirm(false)}
        onConfirm={handleVacate}
        title="Mark Tenant As Vacated"
        message={`Are you sure you want to mark ${tenant.name} as moved out? This will free up Bed ${tenant.bedCode} in Room ${tenant.roomNumber} immediately for new bookings.`}
        confirmText="Confirm Move-Out & Free Bed"
      />
    </>
  );
};
