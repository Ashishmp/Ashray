import React, { useState, useMemo } from 'react';
import {
  Building2,
  Users,
  CreditCard,
  Plus,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  Layers,
  Send,
  Download,
  Filter,
  ShieldCheck,
  Building,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { formatCurrency } from '../../utils/formatters';
import { exportToCSV } from '../../utils/csvExport';
import { OnboardOwnerModal } from './OnboardOwnerModal';

export const OnboardedPgsPage: React.FC = () => {
  const { switchRole } = useAuth();
  const { showToast } = useToast();

  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

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
        item.owner.phone.includes(q) ||
        (item.owner.panNumber && item.owner.panNumber.toLowerCase().includes(q)) ||
        (item.owner.gstNumber && item.owner.gstNumber.toLowerCase().includes(q));

      const matchCity =
        filterCity === 'all' ||
        (item.owner.address && item.owner.address.toLowerCase().includes(filterCity.toLowerCase()));

      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'verified' && item.owner.status === 'verified') ||
        (filterStatus === 'pending' && item.owner.status === 'pending');

      return matchSearch && matchCity && matchStatus;
    });
  }, [ownersOverview, searchQuery, filterCity, filterStatus]);

  // Aggregate metrics
  const totalBusinesses = ownersOverview.length;
  const totalProperties = ownersOverview.reduce((acc, o) => acc + o.propertyCount, 0);
  const totalBeds = ownersOverview.reduce((acc, o) => acc + o.bedCount, 0);
  const totalMonthlyVolume = ownersOverview.reduce((acc, o) => acc + o.monthlyRevenue, 0);

  const handleAuditToggle = (ownerId: string, currentStatus?: string) => {
    const nextStatus = currentStatus === 'verified' ? 'pending' : 'verified';
    storageService.updateOwnerStatus(ownerId, nextStatus as 'verified' | 'pending');
    refreshData();
    showToast(
      'Audit Status Updated',
      `Franchise compliance status set to ${nextStatus.toUpperCase()}.`,
      'info'
    );
  };

  const handleLoginAsOwner = (ownerId: string, businessName: string) => {
    switchRole('owner', ownerId);
    showToast('Impersonating Owner', `Switched into ${businessName} control panel.`, 'info');
  };

  const handleExportCSV = () => {
    const rows = filteredOwners.map(item => ({
      'Business Legal Name': item.owner.businessName,
      'Owner Full Name': item.owner.name,
      'Email': item.owner.email,
      'Phone': item.owner.phone,
      'PAN': item.owner.panNumber || 'N/A',
      'GSTIN': item.owner.gstNumber || 'N/A',
      'City / Region': item.owner.address || 'Karnataka',
      'Properties Managed': item.propertyCount,
      'Total Bed Capacity': item.bedCount,
      'Active Residents': item.tenantCount,
      'Monthly Rent Volume (INR)': item.monthlyRevenue,
      'Compliance Status': item.owner.status || 'verified'
    }));
    exportToCSV('StayNest_Onboarded_PG_Franchises', rows);
    showToast('Directory Exported', 'Downloaded onboarded PG franchise directory as CSV.', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <PageHeader
        title="Onboarded PG Businesses & Franchises"
        subtitle="Manage registered PG operators, review legal entity documents, audit compliance, and jump into franchise accounts."
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="outline"
              icon={<Download size={16} />}
              onClick={handleExportCSV}
            >
              Export Directory (CSV)
            </Button>
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => setIsOnboardModalOpen(true)}
            >
              Onboard New PG Business
            </Button>
          </div>
        }
      />

      {/* Directory Metrics Ribbon */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px'
        }}
      >
        <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Registered Franchises</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '2px' }}>
            {totalBusinesses} Businesses
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Managed PG Properties</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-700)', marginTop: '2px' }}>
            {totalProperties} Branches
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Bed Inventory</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '2px' }}>
            {totalBeds} Beds
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Monthly Volume</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success-700)', marginTop: '2px' }}>
            {formatCurrency(totalMonthlyVolume)}
          </div>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div
        className="card"
        style={{
          padding: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)'
              }}
            />
            <input
              type="text"
              placeholder="Search by business name, owner, phone, PAN or GSTIN..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '36px', width: '100%' }}
            />
          </div>

          <div style={{ width: '180px' }}>
            <Select
              value={filterCity}
              onChange={e => setFilterCity(e.target.value)}
              options={[
                { value: 'all', label: 'All Metro Cities' },
                { value: 'bangalore', label: 'Bengaluru, KA' },
                { value: 'gurgaon', label: 'Gurugram / NCR' },
                { value: 'pune', label: 'Pune, MH' }
              ]}
            />
          </div>

          <div style={{ width: '180px' }}>
            <Select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              options={[
                { value: 'all', label: 'All Audit Statuses' },
                { value: 'verified', label: 'Verified & Active' },
                { value: 'pending', label: 'Under Audit / Pending' }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Onboarded PG Businesses Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Business / Legal Franchise</th>
                <th>Owner & Contact</th>
                <th>Properties & Capacity</th>
                <th>Monthly Volume</th>
                <th>Subscription Plan</th>
                <th>Compliance Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOwners.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                    No PG businesses match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOwners.map(item => (
                  <tr key={item.owner.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: '14px' }}>
                          {item.owner.businessName}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                            PAN: {item.owner.panNumber || 'AAECS1234F'}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>•</span>
                          <span style={{ fontSize: '11px', color: 'var(--primary-700)', fontWeight: 600 }}>
                            GSTIN: {item.owner.gstNumber || '29AAECS1234F1Z5'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{item.owner.name}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{item.owner.email}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>+91 {item.owner.phone}</div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--slate-900)' }}>
                          {item.propertyCount} {item.propertyCount === 1 ? 'Property' : 'Properties'}
                        </span>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
                          {item.bedCount} beds ({item.tenantCount} active residents)
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--success-700)' }}>
                          {formatCurrency(item.monthlyRevenue)}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Gross Rent/mo</div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: 600,
                            backgroundColor: 'var(--primary-50)',
                            color: 'var(--primary-700)',
                            border: '1px solid var(--primary-200)'
                          }}
                        >
                          Enterprise Pro
                        </span>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                          ₹4,499/mo • Renews 01 Nov
                        </div>
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleAuditToggle(item.owner.id, item.owner.status)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0
                        }}
                        title="Click to toggle compliance audit status"
                      >
                        <StatusBadge
                          status={item.owner.status === 'pending' ? 'Under Audit' : 'Active'}
                        />
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<ExternalLink size={13} />}
                          onClick={() => handleLoginAsOwner(item.owner.id, item.owner.businessName)}
                        >
                          Open Owner Portal
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Modal */}
      {isOnboardModalOpen && (
        <OnboardOwnerModal
          isOpen={isOnboardModalOpen}
          onClose={() => setIsOnboardModalOpen(false)}
          onSuccess={() => {
            refreshData();
            showToast('PG Owner Onboarded', 'New business successfully activated on platform.', 'success');
          }}
        />
      )}
    </div>
  );
};
