import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  CreditCard,
  Plus,
  ShieldCheck,
  TrendingUp,
  Server,
  Activity,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  Database,
  Radio,
  ExternalLink
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatters';
import { OnboardOwnerModal } from './OnboardOwnerModal';

export const PlatformOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { switchRole } = useAuth();
  const { showToast } = useToast();

  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);

  // Load live multi-tenant aggregation
  const [ownersOverview, setOwnersOverview] = useState(() =>
    storageService.getAllOwnersOverviewForSuperAdmin()
  );

  const refreshData = () => {
    setOwnersOverview(storageService.getAllOwnersOverviewForSuperAdmin());
  };

  // Platform KPIs
  const totalBusinesses = ownersOverview.length;
  const totalProperties = ownersOverview.reduce((acc, o) => acc + o.propertyCount, 0);
  const totalBeds = ownersOverview.reduce((acc, o) => acc + o.bedCount, 0);
  const totalTenants = ownersOverview.reduce((acc, o) => acc + o.tenantCount, 0);
  const platformGMV = ownersOverview.reduce((acc, o) => acc + o.monthlyRevenue, 0);
  const saasRevenue = totalBusinesses * 4499; // Average recurring SaaS subscription
  const occupancyPercent = totalBeds > 0 ? Math.round((totalTenants / totalBeds) * 100) : 0;

  // Mock telemetry data
  const metroCities = [
    { name: 'Bengaluru (Koramangala, HSR, Indiranagar)', count: 9, gmv: 2150000, share: 62, color: 'var(--primary-600)' },
    { name: 'Delhi-NCR & Gurugram (Cyber City, DLF)', count: 3, gmv: 840000, share: 24, color: 'var(--success-600)' },
    { name: 'Pune (Hinjawadi, Viman Nagar)', count: 2, gmv: 490000, share: 14, color: '#f59e0b' }
  ];

  const recentPlatformActivity = [
    {
      id: 'act_1',
      title: 'New PG Property Live: StayNest Elite - Koramangala',
      subtitle: 'Rajesh Sharma enrolled 18 beds across 3 room categories.',
      time: '14 minutes ago',
      type: 'property'
    },
    {
      id: 'act_2',
      title: 'Tenant KYC Verification Completed',
      subtitle: 'Aadhaar Card UIDAI & PAN verified for Rohan Verma (Room 102).',
      time: '38 minutes ago',
      type: 'tenant'
    },
    {
      id: 'act_3',
      title: 'SaaS Enterprise Subscription Renewed',
      subtitle: 'Priya Sundaram (Blossom Living PGs) renewed annual plan.',
      time: '1 hour ago',
      type: 'saas'
    },
    {
      id: 'act_4',
      title: 'Online Rent Collection Settled via UPI',
      subtitle: 'HDFC Payment Gateway cleared ₹13,500 with UTR ref #449019283741.',
      time: '2 hours ago',
      type: 'payment'
    },
    {
      id: 'act_5',
      title: 'Commercial GSTIN Validation Passed',
      subtitle: 'Karnataka Commercial Tax verification passed for StayNest Hospitality.',
      time: '4 hours ago',
      type: 'compliance'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <PageHeader
        title="Platform Super Admin Overview"
        subtitle="Consolidated telemetry, system GMV, multi-tenant security status, and city growth."
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="outline"
              icon={<Building2 size={16} />}
              onClick={() => navigate('/admin/onboarded')}
            >
              View Onboarded PGs ({totalBusinesses})
            </Button>
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => setIsOnboardModalOpen(true)}
            >
              Onboard PG Business
            </Button>
          </div>
        }
      />

      {/* 4 HIGH-IMPACT PLATFORM KPIS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <StatCard
          label="Consolidated Platform GMV"
          value={formatCurrency(platformGMV)}
          icon={<CreditCard size={20} />}
          trend={{ direction: 'up', value: '18%', caption: 'rent volume' }}
        />
        <StatCard
          label="Recurring SaaS MRR"
          value={formatCurrency(saasRevenue)}
          icon={<TrendingUp size={20} />}
          trend={{ direction: 'up', value: '12%', caption: 'recurring MRR' }}
        />
        <StatCard
          label="Managed PG Properties"
          value={String(totalProperties)}
          icon={<Layers size={20} />}
          trend={{ direction: 'up', value: '8%', caption: 'across 3 metro hubs' }}
        />
        <StatCard
          label="Total Live Residents"
          value={String(totalTenants)}
          icon={<Users size={20} />}
          trend={{ direction: 'neutral', value: `${occupancyPercent}%`, caption: 'overall capacity' }}
        />
      </div>

      {/* PLATFORM SECURITY & INFRASTRUCTURE STATUS BANNER */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}
      >
        {/* Multi-Tenant Security & RBI/GST Compliance Guard */}
        <div
          style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #0f172a, #1e293b)',
            borderRadius: 'var(--radius-xl)',
            color: '#ffffff',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-300)',
                flexShrink: 0
              }}
            >
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>
                Multi-Tenant Data Isolation & RBI/GST Guard
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--slate-400)', marginTop: '4px', lineHeight: 1.5 }}>
                All PG owner records, resident Aadhaar/PAN documents, and UPI transaction references are encrypted with AES-256 and strictly isolated. Zero cross-tenant leakage.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                fontSize: '11.5px',
                fontWeight: 600
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              99.98% System Uptime
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: '#a5b4fc',
                fontSize: '11.5px',
                fontWeight: 600
              }}
            >
              42ms API Gateway Latency
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#e2e8f0',
                fontSize: '11.5px'
              }}
            >
              218 Active WebSockets
            </span>
          </div>
        </div>

        {/* Metro Market Footprint */}
        <div
          className="card"
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} style={{ color: 'var(--primary-600)' }} />
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--slate-900)' }}>
                Geographic Market Distribution
              </h3>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>3 Active Metros</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {metroCities.map(city => (
              <div key={city.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{city.name}</span>
                  <span style={{ fontWeight: 700, color: 'var(--slate-900)' }}>
                    {formatCurrency(city.gmv)} ({city.share}%)
                  </span>
                </div>
                <div style={{ height: '6px', backgroundColor: 'var(--slate-100)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${city.share}%`,
                      backgroundColor: city.color,
                      borderRadius: '9999px'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', borderTop: '1px solid var(--slate-100)', paddingTop: '8px' }}>
            Expansion queued: Hyderabad (HITEC City) & Pune (Kharadi) onboarding in Q4.
          </div>
        </div>
      </div>

      {/* TWO COLUMN: CHRONOLOGICAL ACTIVITY FEED & TOP FRANCHISES */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '20px'
        }}
      >
        {/* Real-Time Platform Audit & Event Feed */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} style={{ color: 'var(--primary-600)' }} />
              <h3 className="card-title">Live System Audit & Event Stream</h3>
            </div>
            <span style={{ fontSize: '11.5px', color: 'var(--success-700)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              Live Streaming
            </span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {recentPlatformActivity.map(act => (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--slate-50)',
                  border: '1px solid var(--border-color-subtle)'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor:
                      act.type === 'property'
                        ? 'var(--primary-100)'
                        : act.type === 'tenant'
                        ? 'var(--success-100)'
                        : act.type === 'saas'
                        ? 'var(--primary-100)'
                        : 'var(--warning-100)',
                    color:
                      act.type === 'property'
                        ? 'var(--primary-700)'
                        : act.type === 'tenant'
                        ? 'var(--success-700)'
                        : act.type === 'saas'
                        ? 'var(--primary-700)'
                        : 'var(--warning-700)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                >
                  {act.type === 'property' ? (
                    <Building2 size={16} />
                  ) : act.type === 'tenant' ? (
                    <Users size={16} />
                  ) : act.type === 'saas' ? (
                    <TrendingUp size={16} />
                  ) : (
                    <CreditCard size={16} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--slate-900)' }}>{act.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{act.time}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {act.subtitle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top PG Franchise Leaders */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={18} style={{ color: 'var(--primary-600)' }} />
              <h3 className="card-title">Enrolled PG Franchises Snapshot</h3>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/admin/onboarded')}
            >
              Open Directory <ArrowRight size={13} style={{ marginLeft: '4px' }} />
            </button>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {ownersOverview.map(item => (
              <div
                key={item.owner.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface)'
                }}
              >
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--slate-900)' }}>
                    {item.owner.businessName}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    {item.owner.name} • {item.propertyCount} Properties • {item.bedCount} Beds
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--success-700)' }}>
                      {formatCurrency(item.monthlyRevenue)}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Monthly GMV</div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      switchRole('owner', item.owner.id);
                      showToast('Switched Owner Portal', `Logged into ${item.owner.businessName}`, 'info');
                    }}
                    title="Impersonate and open this owner's dashboard"
                  >
                    Open Portal
                  </button>
                </div>
              </div>
            ))}

            <div
              style={{
                marginTop: '6px',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-50)',
                border: '1px solid var(--primary-100)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px'
              }}
            >
              <span style={{ color: 'var(--primary-900)' }}>
                Want to register a new PG operator or manage legal compliance?
              </span>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setIsOnboardModalOpen(true)}
              >
                Onboard Owner
              </button>
            </div>
          </div>
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
