import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BedDouble,
  Building,
  CreditCard,
  Wifi,
  Copy,
  Check,
  Utensils,
  Users,
  ShieldCheck,
  AlertCircle,
  FileText,
  Clock,
  ArrowRight,
  Phone,
  Mail,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { storageService } from '../../services/storageService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { TenantPayModal } from './TenantPayModal';
import { PaymentReceiptModal } from '../payments/components/PaymentReceiptModal';
import { Tenant } from '../../types/tenant';
import { PaymentRecord } from '../../types/payment';

export const TenantOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentTenant, refreshTenant } = useAuth();
  const { showToast } = useToast();

  const [tenantProfile, setTenantProfile] = useState<Tenant | null>(null);
  const [wifiCopied, setWifiCopied] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<PaymentRecord | null>(null);

  // Load tenant profile from storage
  const loadProfile = () => {
    if (!currentTenant) return;
    const full = storageService.getTenantFullProfile(currentTenant.id);
    if (full) {
      setTenantProfile(full.tenant);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [currentTenant]);

  const handleCopyWifi = () => {
    navigator.clipboard.writeText('StayNest@Kora5G#2026');
    setWifiCopied(true);
    showToast('Wi-Fi Password Copied', 'Password copied to clipboard: StayNest@Kora5G#2026', 'success');
    setTimeout(() => setWifiCopied(false), 2500);
  };

  if (!tenantProfile) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--slate-500)' }}>
        Loading tenant dashboard...
      </div>
    );
  }

  const isRentPaid = tenantProfile.rentStatus === 'Paid' && tenantProfile.outstandingBalance === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <PageHeader
        title={`Welcome back, ${tenantProfile.name.split(' ')[0]}! 👋`}
        subtitle={`Resident Portal — ${tenantProfile.propertyName || 'StayNest Elite - Koramangala'} (Room ${tenantProfile.roomNumber || '102'}, ${tenantProfile.bedCode || 'Bed A'})`}
        actions={
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button
              variant="outline"
              icon={<FileText size={15} />}
              onClick={() => navigate('/tenant/profile')}
            >
              My Profile & KYC
            </Button>
            <Button
              variant={isRentPaid ? 'secondary' : 'primary'}
              icon={<CreditCard size={15} />}
              onClick={() => setIsPayModalOpen(true)}
            >
              {isRentPaid ? 'View Rent Ledger' : `Pay ₹${(tenantProfile.outstandingBalance || 14000).toLocaleString('en-IN')} Due`}
            </Button>
          </div>
        }
      />

      {/* Outstanding Rent Alert Banner */}
      {!isRentPaid && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            backgroundColor: 'var(--warning-50)',
            border: '1px solid var(--warning-200)',
            borderRadius: 'var(--radius-lg)',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'var(--warning-100)',
                color: 'var(--warning-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AlertCircle size={20} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--warning-900)' }}>
                Monthly Rent Dues Pending: {formatCurrency(tenantProfile.outstandingBalance || 14000)}
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--warning-800)', marginTop: '2px' }}>
                Your rent for October 2026 is due. Pay online using UPI, Debit/Credit Card or NetBanking.
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsPayModalOpen(true)}
          >
            Pay Online Now
          </Button>
        </div>
      )}

      {/* Top Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <StatCard
          label="Assigned Bed Slot"
          value={`${tenantProfile.roomNumber} - ${tenantProfile.bedCode}`}
          icon={<BedDouble size={20} />}
          trend={{ direction: 'neutral', value: 'Double', caption: 'AC Suite' }}
        />
        <StatCard
          label="Monthly Bed Rent"
          value={formatCurrency(tenantProfile.monthlyRent || 13500)}
          icon={<CreditCard size={20} />}
          trend={{ direction: 'neutral', value: 'Fixed', caption: 'Due 5th of month' }}
        />
        <StatCard
          label="Security Deposit Held"
          value={formatCurrency(tenantProfile.securityDeposit || 27000)}
          icon={<ShieldCheck size={20} />}
          trend={{ direction: 'neutral', value: 'Refundable', caption: 'Escrow account' }}
        />
        <StatCard
          label="Stay Agreement Valid"
          value={formatDate(tenantProfile.agreementEndDate || '2027-01-31')}
          icon={<Clock size={20} />}
          trend={{ direction: 'neutral', value: 'Active', caption: '11-Month Lease' }}
        />
      </div>

      {/* Main 2-Column Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
        {/* Left Column: Room & Facility Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Stay Overview Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              padding: '20px',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building size={20} color="var(--primary-600)" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--slate-900)' }}>
                  Residence & Stay Information
                </h3>
              </div>
              <StatusBadge
                status={isRentPaid ? 'Paid' : 'Pending'}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--slate-500)', fontSize: '11.5px', textTransform: 'uppercase' }}>Property</span>
                <div style={{ fontWeight: 600, color: 'var(--slate-900)', marginTop: '2px' }}>
                  {tenantProfile.propertyName || 'StayNest Elite - Koramangala'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--slate-500)' }}>42, 80 Feet Road, 4th Block, Koramangala, Bengaluru</div>
              </div>

              <div>
                <span style={{ color: 'var(--slate-500)', fontSize: '11.5px', textTransform: 'uppercase' }}>Caretaker / Warden</span>
                <div style={{ fontWeight: 600, color: 'var(--slate-900)', marginTop: '2px' }}>
                  Vikas Yadav (Manager)
                </div>
                <div style={{ fontSize: '12px', color: 'var(--slate-600)' }}>+91 9845011223</div>
              </div>

              <div>
                <span style={{ color: 'var(--slate-500)', fontSize: '11.5px', textTransform: 'uppercase' }}>Move-In Date</span>
                <div style={{ fontWeight: 600, color: 'var(--slate-900)', marginTop: '2px' }}>
                  {formatDate(tenantProfile.moveInDate || '2026-02-01')}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--slate-500)', fontSize: '11.5px', textTransform: 'uppercase' }}>Emergency Contact</span>
                <div style={{ fontWeight: 600, color: 'var(--slate-900)', marginTop: '2px' }}>
                  {tenantProfile.emergencyContact?.name} ({tenantProfile.emergencyContact?.relationship})
                </div>
                <div style={{ fontSize: '12px', color: 'var(--slate-600)' }}>+91 {tenantProfile.emergencyContact?.phone}</div>
              </div>
            </div>
          </div>

          {/* Roommate Details Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              padding: '20px',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <Users size={18} color="var(--primary-600)" />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--slate-900)' }}>
                Roommate in Room {tenantProfile.roomNumber}
              </h3>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: 'var(--slate-50)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-100)',
                    color: 'var(--primary-700)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '15px'
                  }}
                >
                  AN
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--slate-900)' }}>
                    Aditya Nair
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--slate-500)' }}>
                    Bed B • Swiggy HQ (Software Engineer)
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: 'var(--slate-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={13} /> +91 9845334455
                </div>
                <div style={{ fontSize: '11px', color: 'var(--success-700)', fontWeight: 600, marginTop: '2px' }}>
                  KYC Verified Resident
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Wi-Fi, Mess Schedule, Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* High-Speed Wi-Fi Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              padding: '20px',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <Wifi size={18} color="var(--primary-600)" />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--slate-900)' }}>
                PG High-Speed Wi-Fi
              </h3>
            </div>

            <div
              style={{
                backgroundColor: 'var(--slate-900)',
                color: '#ffffff',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--slate-400)' }}>
                <span>Network SSID (5 GHz)</span>
                <span style={{ color: '#34d399', fontWeight: 600 }}>● 300 Mbps Live</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.02em' }}>
                StayNest_Elite_Koramangala_5G
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--slate-800)',
                  paddingTop: '8px',
                  marginTop: '4px'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--slate-400)' }}>Password</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '13px', color: 'var(--primary-300)' }}>
                    StayNest@Kora5G#2026
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyWifi}
                  className="btn-ghost"
                  style={{
                    color: wifiCopied ? '#34d399' : '#ffffff',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    fontSize: '11.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    border: '1px solid var(--slate-700)',
                    cursor: 'pointer'
                  }}
                >
                  {wifiCopied ? <Check size={14} /> : <Copy size={14} />}
                  {wifiCopied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Today's Mess Schedule Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              padding: '20px',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <Utensils size={18} color="var(--primary-600)" />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--slate-900)' }}>
                Today's Mess Schedule
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px' }}>
              <div style={{ padding: '10px 12px', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--slate-900)' }}>
                  <span>Breakfast (8:00 AM - 10:00 AM)</span>
                  <span style={{ fontSize: '11px', color: 'var(--slate-500)' }}>Dining Hall 1F</span>
                </div>
                <div style={{ color: 'var(--slate-600)', marginTop: '2px' }}>
                  Poha, Boiled Eggs / Banana, Filter Coffee & Masala Chai
                </div>
              </div>

              <div style={{ padding: '10px 12px', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--slate-900)' }}>
                  <span>Lunch (1:00 PM - 3:00 PM)</span>
                  <span style={{ fontSize: '11px', color: 'var(--slate-500)' }}>Buffet</span>
                </div>
                <div style={{ color: 'var(--slate-600)', marginTop: '2px' }}>
                  Dal Makhani, Steamed Rice, Phulkas, Mixed Salad, Fresh Curd
                </div>
              </div>

              <div style={{ padding: '10px 12px', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--slate-900)' }}>
                  <span>Dinner (8:00 PM - 10:30 PM)</span>
                  <span style={{ fontSize: '11px', color: 'var(--slate-500)' }}>Buffet</span>
                </div>
                <div style={{ color: 'var(--slate-600)', marginTop: '2px' }}>
                  Paneer Butter Masala, Jeera Rice, Chapati, Gulab Jamun
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Online Pay Modal */}
      <TenantPayModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        tenant={tenantProfile}
        onPaymentSuccess={p => {
          loadProfile();
          setActiveReceipt(p);
        }}
      />

      {/* Official Receipt Modal */}
      <PaymentReceiptModal
        isOpen={!!activeReceipt}
        onClose={() => setActiveReceipt(null)}
        payment={activeReceipt}
      />
    </div>
  );
};
