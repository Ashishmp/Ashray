import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  BedDouble,
  Users,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  CreditCard,
  Plus,
  ArrowRight,
  Eye,
  Clock,
  Wrench,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { MonthlyRentChart } from './components/MonthlyRentChart';
import { IncomeExpenseChart } from './components/IncomeExpenseChart';
import { QuickActions } from './components/QuickActions';

// Modals
import { PropertyModal } from '../properties/components/PropertyModal';
import { RoomModal } from '../rooms/components/RoomModal';
import { TenantModal } from '../tenants/components/TenantModal';
import { RecordPaymentModal } from '../payments/components/RecordPaymentModal';
import { PaymentReceiptModal } from '../payments/components/PaymentReceiptModal';
import { ExpenseModal } from '../expenses/components/ExpenseModal';
import { PaymentRecord } from '../../types/payment';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    filteredProperties,
    filteredRooms,
    filteredTenants,
    filteredPayments,
    filteredExpenses,
    filteredComplaints,
    addProperty,
    addRoom,
    addTenant,
    addExpense
  } = useApp();

  // Modals state
  const [modalPropertyOpen, setModalPropertyOpen] = useState(false);
  const [modalRoomOpen, setModalRoomOpen] = useState(false);
  const [modalTenantOpen, setModalTenantOpen] = useState(false);
  const [modalPaymentOpen, setModalPaymentOpen] = useState(false);
  const [modalExpenseOpen, setModalExpenseOpen] = useState(false);

  // Active receipt view modal
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);

  // Dynamic calculations from underlying live data
  const totalProperties = filteredProperties.length;
  const totalRooms = filteredRooms.length;
  const totalCapacityBeds = filteredRooms.reduce((acc, r) => acc + r.capacity, 0);
  const totalOccupiedBeds = filteredRooms.reduce((acc, r) => acc + r.occupiedBeds, 0);
  const availableBeds = filteredRooms.reduce((acc, r) => acc + r.availableBeds, 0);
  const occupancyRate = totalCapacityBeds > 0 ? (totalOccupiedBeds / totalCapacityBeds) * 100 : 0;

  const rentCollectedThisMonth = filteredPayments
    .filter(p => p.status === 'Paid')
    .reduce((acc, p) => acc + p.amountPaid, 0);

  const pendingRent = filteredPayments.reduce((acc, p) => acc + p.balanceDue, 0);
  const totalExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  // Overdue and urgent items
  const overduePayments = filteredPayments.filter(p => p.status === 'Overdue');
  const openComplaints = filteredComplaints.filter(c => c.status === 'Open' || c.status === 'In Progress');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Clean Slate Onboarding Hero Banner */}
      {totalProperties === 0 && (
        <div
          style={{
            padding: '24px 28px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--primary-700)',
                  backgroundColor: 'var(--primary-50)',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  marginBottom: '8px'
                }}
              >
                ✨ Clean Slate Ready
              </div>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--slate-900)' }}>
                Welcome to Your Clean PG Dashboard
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '640px' }}>
                All sample data has been cleared. You now have a clean slate to add your own real PG properties, rooms, beds, and residents step-by-step.
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              icon={<Plus size={18} />}
              onClick={() => setModalPropertyOpen(true)}
            >
              Add Your First Property
            </Button>
          </div>

          {/* Guided Steps Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary-600)', marginBottom: '4px' }}>STEP 1</div>
              <h4 style={{ fontSize: '13.5px', color: 'var(--slate-900)', marginBottom: '4px' }}>Add PG Property</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Click 'Add Property' to set name, city, address, and amenities.</p>
            </div>

            <div style={{ padding: '16px', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate-500)', marginBottom: '4px' }}>STEP 2</div>
              <h4 style={{ fontSize: '13.5px', color: 'var(--slate-900)', marginBottom: '4px' }}>Add Rooms & Beds</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Set room numbers, sharing types (Single/Double/Triple), and rent.</p>
            </div>

            <div style={{ padding: '16px', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate-500)', marginBottom: '4px' }}>STEP 3</div>
              <h4 style={{ fontSize: '13.5px', color: 'var(--slate-900)', marginBottom: '4px' }}>Onboard Residents</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Allocate vacant bed slots to tenants and record security deposits.</p>
            </div>

            <div style={{ padding: '16px', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--slate-500)', marginBottom: '4px' }}>STEP 4</div>
              <h4 style={{ fontSize: '13.5px', color: 'var(--slate-900)', marginBottom: '4px' }}>Collect Rent & Expenses</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Record UPI/Cash payments with instant printable receipts.</p>
            </div>
          </div>
        </div>
      )}

      {/* 8 Summary Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        <StatCard
          label="Total Properties"
          value={totalProperties}
          icon={<Building2 size={20} />}
          trend={{ direction: 'neutral', value: '100% Active', caption: 'operational' }}
          onClick={() => navigate('/properties')}
        />
        <StatCard
          label="Total Rooms"
          value={totalRooms}
          icon={<BedDouble size={20} />}
          iconBgColor="#e0f2fe"
          iconColor="#0284c7"
          trend={{ direction: 'neutral', value: `${totalCapacityBeds} bed slots`, caption: 'total capacity' }}
          onClick={() => navigate('/rooms')}
        />
        <StatCard
          label="Occupied Beds"
          value={totalOccupiedBeds}
          icon={<Users size={20} />}
          iconBgColor="var(--primary-50)"
          iconColor="var(--primary-600)"
          trend={{ direction: 'up', value: `${Math.round(occupancyRate)}% Rate`, caption: 'occupancy' }}
          onClick={() => navigate('/tenants')}
        />
        <StatCard
          label="Available Beds"
          value={availableBeds}
          icon={<CheckCircle2 size={20} />}
          iconBgColor="var(--success-50)"
          iconColor="var(--success-600)"
          trend={{ direction: availableBeds > 0 ? 'neutral' : 'down', value: `${availableBeds} Vacant`, caption: 'ready to occupy' }}
          onClick={() => navigate('/rooms')}
        />
        <StatCard
          label="Rent Collected (Oct)"
          value={formatCurrency(rentCollectedThisMonth)}
          icon={<CreditCard size={20} />}
          iconBgColor="var(--success-50)"
          iconColor="var(--success-700)"
          trend={{ direction: 'up', value: '+8.4%', caption: 'vs last month' }}
          onClick={() => navigate('/payments')}
        />
        <StatCard
          label="Pending / Overdue"
          value={formatCurrency(pendingRent)}
          icon={<AlertTriangle size={20} />}
          iconBgColor={pendingRent > 0 ? 'var(--danger-50)' : 'var(--success-50)'}
          iconColor={pendingRent > 0 ? 'var(--danger-600)' : 'var(--success-700)'}
          trend={{
            direction: overduePayments.length > 0 ? 'down' : 'neutral',
            value: `${overduePayments.length} overdue`,
            caption: 'requires follow-up'
          }}
          onClick={() => navigate('/payments')}
        />
        <StatCard
          label="Monthly Expenses"
          value={formatCurrency(totalExpenses)}
          icon={<Receipt size={20} />}
          iconBgColor="var(--warning-50)"
          iconColor="var(--warning-700)"
          trend={{ direction: 'neutral', value: `${filteredExpenses.length} entries`, caption: 'bills & salaries' }}
          onClick={() => navigate('/expenses')}
        />
        <StatCard
          label="Net Operating Cash"
          value={formatCurrency(rentCollectedThisMonth - totalExpenses)}
          icon={<Building2 size={20} />}
          iconBgColor="var(--primary-50)"
          iconColor="var(--primary-700)"
          trend={{ direction: rentCollectedThisMonth >= totalExpenses ? 'up' : 'down', value: 'Surplus', caption: 'operational cash' }}
          onClick={() => navigate('/reports')}
        />
      </div>

      {/* Quick Operational Actions Bar */}
      <QuickActions
        onAddProperty={() => setModalPropertyOpen(true)}
        onAddRoom={() => setModalRoomOpen(true)}
        onAddTenant={() => setModalTenantOpen(true)}
        onRecordPayment={() => setModalPaymentOpen(true)}
        onAddExpense={() => setModalExpenseOpen(true)}
        onViewComplaints={() => navigate('/maintenance')}
      />

      {/* High-Priority Overdue Banner if applicable */}
      {overduePayments.length > 0 && (
        <div
          style={{
            backgroundColor: 'var(--danger-50)',
            border: '1px solid var(--danger-200)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'var(--danger-100)',
                color: 'var(--danger-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--danger-900)', fontSize: '14px' }}>
                Attention: {overduePayments.length} Overdue Rent Payments Pending
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--danger-700)', marginTop: '2px' }}>
                Tenants past their 5-day grace period for October 2026. Send WhatsApp reminder or log receipt.
              </div>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => navigate('/payments')}
          >
            Review Overdue Dues
          </Button>
        </div>
      )}

      {/* Visual Charts Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
          gap: '20px'
        }}
      >
        <MonthlyRentChart
          collectedThisMonth={rentCollectedThisMonth}
          pendingThisMonth={pendingRent}
        />
        <IncomeExpenseChart
          income={rentCollectedThisMonth}
          expenses={totalExpenses}
        />
      </div>

      {/* Two Column Section: Recent Payments & Maintenance Tickets */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '20px'
        }}
      >
        {/* Recent Rent Payments */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent Rent Payments</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                Verified receipts and collection entries
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowRight size={14} />}
              iconPosition="right"
              onClick={() => navigate('/payments')}
            >
              View All
            </Button>
          </div>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tenant / Room</th>
                  <th>Amount</th>
                  <th>Date & Mode</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.slice(0, 5).map(payment => (
                  <tr key={payment.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{payment.tenantName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        Room {payment.roomNumber} • {payment.propertyName}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>
                        {formatCurrency(payment.amountPaid)}
                      </div>
                      {payment.balanceDue > 0 && (
                        <div style={{ fontSize: '10.5px', color: 'var(--danger-600)' }}>
                          Due: {formatCurrency(payment.balanceDue)}
                        </div>
                      )}
                    </td>
                    <td>
                      <div>{formatDate(payment.paymentDate || payment.createdAt)}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        {payment.paymentMethod}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={payment.status} size="sm" />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye size={14} />}
                        onClick={() => setSelectedReceipt(payment)}
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
        </div>

        {/* Open Maintenance & Complaints */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Active Complaints & Maintenance</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                Pending resident requests and repairs
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowRight size={14} />}
              iconPosition="right"
              onClick={() => navigate('/maintenance')}
            >
              View All ({openComplaints.length})
            </Button>
          </div>
          <div className="card-body" style={{ padding: '0 20px' }}>
            {filteredComplaints.length === 0 ? (
              <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                No active complaints reported.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {filteredComplaints.slice(0, 4).map(c => (
                  <div
                    key={c.id}
                    style={{
                      padding: '14px 0',
                      borderBottom: '1px solid var(--border-color-subtle)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor:
                            c.priority === 'Urgent'
                              ? 'var(--danger-50)'
                              : c.priority === 'High'
                              ? 'var(--warning-50)'
                              : 'var(--slate-100)',
                          color:
                            c.priority === 'Urgent'
                              ? 'var(--danger-600)'
                              : c.priority === 'High'
                              ? 'var(--warning-700)'
                              : 'var(--slate-600)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Wrench size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>
                          {c.title}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                          Ticket {c.ticketNumber} • {c.propertyName} {c.roomNumber ? `• Rm ${c.roomNumber}` : ''}
                        </div>
                        {c.assignedStaffName && (
                          <div style={{ fontSize: '11px', color: 'var(--primary-700)', marginTop: '3px' }}>
                            Assigned to: <strong>{c.assignedStaffName}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <StatusBadge status={c.priority} size="sm" />
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="card-footer" style={{ justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Urgent tasks: <strong>{filteredComplaints.filter(c => c.priority === 'Urgent').length}</strong>
            </span>
            <Button
              variant="outline"
              size="sm"
              icon={<ArrowRight size={14} />}
              onClick={() => navigate('/maintenance')}
            >
              View Complaints
            </Button>
          </div>
        </div>
      </div>

      {/* Functional Modals */}
      <PropertyModal
        isOpen={modalPropertyOpen}
        onClose={() => setModalPropertyOpen(false)}
        onSubmit={addProperty}
      />
      <RoomModal
        isOpen={modalRoomOpen}
        onClose={() => setModalRoomOpen(false)}
        onSubmit={addRoom}
      />
      <TenantModal
        isOpen={modalTenantOpen}
        onClose={() => setModalTenantOpen(false)}
        onSubmit={addTenant}
      />
      <RecordPaymentModal
        isOpen={modalPaymentOpen}
        onClose={() => setModalPaymentOpen(false)}
        onSuccess={record => setSelectedReceipt(record)}
      />
      <ExpenseModal
        isOpen={modalExpenseOpen}
        onClose={() => setModalExpenseOpen(false)}
        onSubmit={addExpense}
      />
      <PaymentReceiptModal
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        payment={selectedReceipt}
      />
    </div>
  );
};
