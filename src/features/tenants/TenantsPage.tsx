import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  BedDouble,
  CreditCard,
  ArrowRightLeft,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
  LogOut,
  Building
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { TenantModal } from './components/TenantModal';
import { TenantDetailsModal } from './components/TenantDetailsModal';
import { TransferBedModal } from './components/TransferBedModal';
import { RecordPaymentModal } from '../payments/components/RecordPaymentModal';
import { PaymentReceiptModal } from '../payments/components/PaymentReceiptModal';
import { Tenant } from '../../types/tenant';
import { PaymentRecord } from '../../types/payment';
import { formatCurrency, formatDate, formatPhone } from '../../utils/formatters';

export const TenantsPage: React.FC = () => {
  const { filteredTenants, addTenant, updateTenant } = useApp();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRentStatus, setFilterRentStatus] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [detailsTenant, setDetailsTenant] = useState<Tenant | null>(null);
  const [transferTenant, setTransferTenant] = useState<Tenant | null>(null);
  const [paymentTenant, setPaymentTenant] = useState<Tenant | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<PaymentRecord | null>(null);

  // Filtered tenants
  const displayTenants = useMemo(() => {
    return filteredTenants.filter(t => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.phone.includes(searchQuery) ||
        (t.roomNumber && t.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
      const matchesRentStatus = filterRentStatus === 'all' || t.rentStatus === filterRentStatus;

      return matchesSearch && matchesStatus && matchesRentStatus;
    });
  }, [filteredTenants, searchQuery, filterStatus, filterRentStatus]);

  // Status counters
  const activeCount = filteredTenants.filter(t => t.status === 'Active').length;
  const noticeCount = filteredTenants.filter(t => t.status === 'Notice Period').length;
  const overdueCount = filteredTenants.filter(t => t.rentStatus === 'Overdue').length;

  return (
    <div>
      <PageHeader
        title="Tenant Directory"
        subtitle={`Total ${filteredTenants.length} tenants (${activeCount} active, ${noticeCount} on notice, ${overdueCount} rent overdue)`}
        actions={
          <Button
            variant="primary"
            icon={<UserPlus size={16} />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Register Tenant
          </Button>
        }
      />

      {/* Filter and Search Toolbar */}
      <div className="toolbar-container">
        <div className="toolbar-filters">
          <div className="filter-search-box">
            <Search className="filter-search-icon" size={16} />
            <input
              type="text"
              placeholder="Search by tenant name, mobile, or room..."
              className="form-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <Select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All Resident Statuses' },
              { value: 'Active', label: 'Active' },
              { value: 'Notice Period', label: 'Notice Period' },
              { value: 'Moved Out', label: 'Moved Out' }
            ]}
          />

          <Select
            value={filterRentStatus}
            onChange={e => setFilterRentStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All Rent Statuses' },
              { value: 'Paid', label: 'Paid in Full' },
              { value: 'Pending', label: 'Pending Dues' },
              { value: 'Overdue', label: 'Overdue' }
            ]}
          />
        </div>
      </div>

      {/* Tenant Table */}
      {displayTenants.length === 0 ? (
        <EmptyState
          icon={<Users size={32} />}
          title="No tenants found"
          description="Try modifying search criteria or onboard a new tenant to allocate an available bed."
          actionText="Register New Tenant"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Resident Name & Contact</th>
                <th>PG & Bed Slot</th>
                <th>Monthly Rent</th>
                <th>Due Balance</th>
                <th>Rent Status</th>
                <th>Resident Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayTenants.map(tenant => (
                <tr key={tenant.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--slate-900)' }}>
                      {tenant.name}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={11} /> {formatPhone(tenant.phone)}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>Room {tenant.roomNumber} ({tenant.bedCode})</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      {tenant.propertyName}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>
                      {formatCurrency(tenant.monthlyRent)}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      Due on {tenant.rentDueDay}th
                    </div>
                  </td>
                  <td>
                    <div
                      style={{
                        fontWeight: 700,
                        color: tenant.outstandingBalance > 0 ? 'var(--danger-700)' : 'var(--success-700)'
                      }}
                    >
                      {formatCurrency(tenant.outstandingBalance)}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={tenant.rentStatus} size="sm" />
                  </td>
                  <td>
                    <StatusBadge status={tenant.status} size="sm" />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '4px' }}>
                      <button
                        type="button"
                        className="btn-ghost"
                        style={{ padding: '6px' }}
                        onClick={() => setDetailsTenant(tenant)}
                        title="View Profile & Payments"
                        aria-label="View Profile"
                      >
                        <Eye size={15} />
                      </button>
                      {tenant.status !== 'Moved Out' && (
                        <>
                          <button
                            type="button"
                            className="btn-ghost"
                            style={{ padding: '6px', color: 'var(--success-700)' }}
                            onClick={() => setPaymentTenant(tenant)}
                            title="Record Payment"
                            aria-label="Record Payment"
                          >
                            <CreditCard size={15} />
                          </button>
                          <button
                            type="button"
                            className="btn-ghost"
                            style={{ padding: '6px', color: 'var(--primary-600)' }}
                            onClick={() => setTransferTenant(tenant)}
                            title="Transfer Bed"
                            aria-label="Transfer Bed"
                          >
                            <ArrowRightLeft size={15} />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        className="btn-ghost"
                        style={{ padding: '6px' }}
                        onClick={() => setEditingTenant(tenant)}
                        title="Edit Details"
                        aria-label="Edit Details"
                      >
                        <Edit2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Tenant Modal */}
      <TenantModal
        isOpen={isAddModalOpen || Boolean(editingTenant)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTenant(null);
        }}
        onSubmit={data => {
          if (editingTenant) {
            updateTenant(editingTenant.id, data);
          } else {
            addTenant(data);
          }
        }}
        initialData={editingTenant || undefined}
      />

      {/* Details Modal */}
      <TenantDetailsModal
        isOpen={Boolean(detailsTenant)}
        onClose={() => setDetailsTenant(null)}
        tenant={detailsTenant}
        onEdit={t => {
          setDetailsTenant(null);
          setEditingTenant(t);
        }}
        onTransfer={t => {
          setDetailsTenant(null);
          setTransferTenant(t);
        }}
        onRecordPayment={t => {
          setDetailsTenant(null);
          setPaymentTenant(t);
        }}
      />

      {/* Transfer Bed Modal */}
      <TransferBedModal
        isOpen={Boolean(transferTenant)}
        onClose={() => setTransferTenant(null)}
        tenant={transferTenant}
      />

      {/* Record Payment Shortcut */}
      <RecordPaymentModal
        isOpen={Boolean(paymentTenant)}
        onClose={() => setPaymentTenant(null)}
        preselectedTenantId={paymentTenant?.id}
        onSuccess={record => setActiveReceipt(record)}
      />

      {/* Generated Receipt Viewer */}
      <PaymentReceiptModal
        isOpen={Boolean(activeReceipt)}
        onClose={() => setActiveReceipt(null)}
        payment={activeReceipt}
      />
    </div>
  );
};
