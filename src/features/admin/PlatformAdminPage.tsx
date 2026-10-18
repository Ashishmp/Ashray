import React, { useState, useMemo } from 'react';
import {
  Building2,
  Users,
  CreditCard,
  Plus,
  ShieldCheck,
  TrendingUp,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Server,
  Activity
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { formatCurrency } from '../../utils/formatters';
import { OnboardOwnerModal } from './OnboardOwnerModal';

export const PlatformAdminPage: React.FC = () => {
  const { switchRole } = useAuth();
  const { showToast } = useToast();

  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState('all');

  // Load live multi-tenant aggregation
  const [ownersOverview, setOwnersOverview] = useState(() =>
    storageService.getAllOwnersOverviewForSuperAdmin()
  );

  const refreshData = () => {
    setOwnersOverview(storageService.getAllOwnersOverviewForSuperAdmin());
  };

  // Filtered owners
  const filteredOwners = useMemo(() => {
    return ownersOverview.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        item.owner.businessName.toLowerCase().includes(q) ||
        item.owner.name.toLowerCase().includes(q) ||
        item.owner.email.toLowerCase().includes(q) ||
        item.owner.phone.includes(q);

      const matchCity =
        filterCity === 'all' ||
        (item.owner.address && item.owner.address.toLowerCase().includes(filterCity.toLowerCase()));

      return matchSearch && matchCity;
    });
  }, [ownersOverview, searchQuery, filterCity]);

  // Platform KPIs
  const totalBusinesses = ownersOverview.length;
  const totalProperties = ownersOverview.reduce((acc, o) => acc + o.propertyCount, 0);
  const totalBeds = ownersOverview.reduce((acc, o) => acc + o.bedCount, 0);
  const totalTenants = ownersOverview.reduce((acc, o) => acc + o.tenantCount, 0);
  const platformGMV = ownersOverview.reduce((acc, o) => acc + o.monthlyRevenue, 0);
  const saasRevenue = totalBusinesses * 4499; // Average subscription tier
  const occupancyPercent = totalBeds > 0 ? Math.round((totalTenants / totalBeds) * 100) : 0;

  const handleAuditToggle = (ownerId: string, currentStatus?: string) => {
    const nextStatus = currentStatus === 'verified' ? 'pending' : 'verified';
    storageService.updateOwnerStatus(ownerId, nextStatus as 'verified' | 'pending');
    refreshData();
    showToast(
      'Owner Status Updated',
      `Compliance audit status updated to ${nextStatus.toUpperCase()}.`,
      'info'
    );
  };

  const handleLoginAsOwner = (ownerId: string, businessName: string) => {
    switchRole('owner', ownerId);
    showToast('Impersonating Owner', `Switched into ${businessName} control panel.`, 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <PageHeader
        title="Platform Super Admin"
        subtitle="Consolidated governance, tenant analytics, and PG business onboarding across India."
        actions={
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => setIsOnboardModalOpen(true)}
          >
            Onboard New PG Business
          </Button>
        }
      />

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <StatCard
          label="Onboarded PG Businesses"
          value={String(totalBusinesses)}
          icon={<Building2 size={20} />}
          trend={{ direction: 'up', value: '14%', caption: 'vs last month' }}
        />
        <StatCard
          label="Total Managed Properties"
          value={String(totalProperties)}
          icon={<Layers size={20} />}
          trend={{ direction: 'up', value: '8%', caption: 'across 4 metro hubs' }}
        />
        <StatCard
          label="Total Live Residents"
          value={String(totalTenants)}
          icon={<Users size={20} />}
          trend={{ direction: 'neutral', value: `${occupancyPercent}%`, caption: 'overall capacity' }}
        />
        <StatCard
          label="Platform Monthly GMV"
          value={formatCurrency(platformGMV)}
          icon={<CreditCard size={20} />}
          trend={{ direction: 'up', value: '18%', caption: 'rent volume' }}
        />
        <StatCard
          label="Platform SaaS Revenue"
          value={formatCurrency(saasRevenue)}
          icon={<TrendingUp size={20} />}
          trend={{ direction: 'up', value: '12%', caption: 'recurring MRR' }}
        />
      </div>

      {/* Platform Security Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #0f172a, #1e293b)',
          borderRadius: 'var(--radius-lg)',
          color: '#ffffff',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-300)'
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>
              Multi-Tenant Data Isolation & RBI/GST Compliance Guard
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--slate-400)', marginTop: '2px' }}>
              All PG owner records, tenant Aadhaar/PAN documents, and UPI transaction references are encrypted and strictly partitioned.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            99.98% System Uptime
          </span>
        </div>
      </div>

      {/* Directory & Controls */}
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
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--slate-900)' }}>
              Onboarded PG Businesses & Franchises ({filteredOwners.length})
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--slate-500)', marginTop: '2px' }}>
              Manage registered PG companies, review GST compliance, and jump into specific owner workspaces.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '260px' }}>
              <Input
                placeholder="Search business, owner, phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                prefixIcon={<Search size={15} />}
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: 'var(--slate-50)',
                  borderBottom: '1px solid var(--border-color)',
                  color: 'var(--slate-600)',
                  fontWeight: 600
                }}
              >
                <th style={{ padding: '12px 16px' }}>Business / Franchise</th>
                <th style={{ padding: '12px 16px' }}>Owner & Contact</th>
                <th style={{ padding: '12px 16px' }}>Properties & Capacity</th>
                <th style={{ padding: '12px 16px' }}>Monthly Volume</th>
                <th style={{ padding: '12px 16px' }}>Audit Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOwners.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--slate-500)' }}>
                    No PG businesses matched your filter.
                  </td>
                </tr>
              ) : (
                filteredOwners.map(({ owner, propertyCount, roomCount, bedCount, tenantCount, monthlyRevenue }) => {
                  const isVerified = (owner.status || 'verified') === 'verified';
                  return (
                    <tr
                      key={owner.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background-color 150ms'
                      }}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: '14px' }}>
                          {owner.businessName}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--slate-500)', marginTop: '2px' }}>
                          PAN: <strong>{owner.panNumber || 'AAECS1234F'}</strong> | {owner.address ? owner.address.split(',')[0] : 'Bengaluru'}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{owner.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--slate-500)' }}>{owner.email}</div>
                        <div style={{ fontSize: '12px', color: 'var(--slate-600)' }}>+91 {owner.phone}</div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>
                          {propertyCount} {propertyCount === 1 ? 'Property' : 'Properties'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--slate-500)' }}>
                          {bedCount} beds ({tenantCount} active residents)
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--primary-700)', fontSize: '14px' }}>
                          {formatCurrency(monthlyRevenue || 120000)}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--slate-500)' }}>Collected this month</div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span
                          onClick={() => handleAuditToggle(owner.id, owner.status)}
                          style={{ cursor: 'pointer' }}
                          title="Click to toggle verification status"
                        >
                          <StatusBadge
                            status={isVerified ? 'Active' : 'Pending'}
                          />
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<ExternalLink size={14} />}
                            onClick={() => handleLoginAsOwner(owner.id, owner.businessName)}
                          >
                            Open Owner Portal
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Modal */}
      <OnboardOwnerModal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
        onSuccess={refreshData}
      />
    </div>
  );
};
