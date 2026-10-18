import React, { useState } from 'react';
import {
  Settings,
  User,
  Building,
  Bell,
  Database,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { OwnerProfile } from '../../types/common';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SwitchOwnerModal } from '../auth/SwitchOwnerModal';
import { ArrowLeftRight, LogOut } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { ownerProfile, updateOwnerProfile, clearAllData, loadSampleData } = useApp();
  const { logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'business' | 'notifications' | 'system'>('profile');

  // Form states
  const [name, setName] = useState(ownerProfile.name);
  const [email, setEmail] = useState(ownerProfile.email);
  const [phone, setPhone] = useState(ownerProfile.phone);
  const [businessName, setBusinessName] = useState(ownerProfile.businessName);
  const [panNumber, setPanNumber] = useState(ownerProfile.panNumber);
  const [gstNumber, setGstNumber] = useState(ownerProfile.gstNumber || '');
  const [address, setAddress] = useState(ownerProfile.address);
  const [rentDueDay, setRentDueDay] = useState<number>(ownerProfile.defaultRentDueDay);
  const [gracePeriodDays, setGracePeriodDays] = useState<number>(ownerProfile.gracePeriodDays);
  const [depositMonths, setDepositMonths] = useState<number>(ownerProfile.defaultSecurityDepositMonths);

  // Notifications
  const [whatsappReminders, setWhatsappReminders] = useState(ownerProfile.notifications.whatsappReminders);
  const [smsAlerts, setSmsAlerts] = useState(ownerProfile.notifications.smsAlerts);
  const [emailReports, setEmailReports] = useState(ownerProfile.notifications.emailMonthlyReports);

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSwitchOwnerModal, setShowSwitchOwnerModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Automatically sync form when owner profile changes (e.g. switching owner)
  React.useEffect(() => {
    setName(ownerProfile.name);
    setEmail(ownerProfile.email);
    setPhone(ownerProfile.phone);
    setBusinessName(ownerProfile.businessName);
    setPanNumber(ownerProfile.panNumber);
    setGstNumber(ownerProfile.gstNumber || '');
    setAddress(ownerProfile.address);
    setRentDueDay(ownerProfile.defaultRentDueDay);
    setGracePeriodDays(ownerProfile.gracePeriodDays);
    setDepositMonths(ownerProfile.defaultSecurityDepositMonths);
    setWhatsappReminders(ownerProfile.notifications.whatsappReminders);
    setSmsAlerts(ownerProfile.notifications.smsAlerts);
    setEmailReports(ownerProfile.notifications.emailMonthlyReports);
  }, [ownerProfile]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateOwnerProfile({
      name,
      email,
      phone,
      businessName,
      panNumber,
      gstNumber,
      address,
      defaultRentDueDay: Number(rentDueDay) || 5,
      gracePeriodDays: Number(gracePeriodDays) || 5,
      defaultSecurityDepositMonths: Number(depositMonths) || 2,
      notifications: {
        whatsappReminders,
        smsAlerts,
        emailMonthlyReports: emailReports
      }
    });

    showToast('Settings Saved', 'Owner profile and defaults updated successfully.', 'success');
  };

  const handleReset = () => {
    clearAllData();
    showToast('Clean Slate Ready', 'All data cleared. You can now add your own real PG data.', 'info');
  };

  return (
    <div>
      <PageHeader
        title="Settings & Preferences"
        subtitle="Configure owner credentials, commercial billing rules, notification channels, and system data"
      />

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Settings Navigation Tabs */}
        <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            style={{ textAlign: 'left', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}
            onClick={() => setActiveTab('profile')}
          >
            <User size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
            Owner Profile
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'business' ? 'active' : ''}`}
            style={{ textAlign: 'left', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}
            onClick={() => setActiveTab('business')}
          >
            <Building size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
            Business & PG Defaults
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            style={{ textAlign: 'left', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
            Reminders & Alerts
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`}
            style={{ textAlign: 'left', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}
            onClick={() => setActiveTab('system')}
          >
            <Database size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
            System & Architecture
          </button>
        </div>

        {/* Settings Content Area */}
        <div style={{ flex: 1, minWidth: '320px' }}>
          <div className="card">
            <form onSubmit={handleSaveProfile}>
              {/* Tab: Profile */}
              {activeTab === 'profile' && (
                <div>
                  <div className="card-header">
                    <div>
                      <h3 className="card-title">Owner Personal Information</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                        Used for authorized receipt signatory and primary account access
                      </p>
                    </div>
                  </div>
                  <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-row">
                      <Input
                        label="Full Name"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                      />
                      <Input
                        label="Official Email"
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="form-row">
                      <Input
                        label="Registered Mobile Number"
                        required
                        prefixIcon={<span>+91</span>}
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                      />
                      <div className="form-group">
                        <label className="form-label">Role in Dashboard</label>
                        <input
                          className="form-input"
                          value="Master Owner (Super Admin)"
                          disabled
                          style={{ backgroundColor: 'var(--slate-100)', color: 'var(--text-secondary)' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Business & PG Defaults */}
              {activeTab === 'business' && (
                <div>
                  <div className="card-header">
                    <div>
                      <h3 className="card-title">Business Registration & PG Defaults</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                        Appears on printed receipts and sets default agreement terms
                      </p>
                    </div>
                  </div>
                  <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Input
                      label="Business / Operating Entity Legal Name"
                      required
                      value={businessName}
                      onChange={e => setBusinessName(e.target.value)}
                    />

                    <div className="form-row">
                      <Input
                        label="PAN Card Number"
                        required
                        value={panNumber}
                        onChange={e => setPanNumber(e.target.value)}
                      />
                      <Input
                        label="GSTIN Number (Optional)"
                        value={gstNumber}
                        onChange={e => setGstNumber(e.target.value)}
                      />
                    </div>

                    <Input
                      label="Registered Office Address"
                      required
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                    />

                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                      <h4 style={{ fontSize: '13px', color: 'var(--primary-700)', marginBottom: '12px' }}>
                        Default Rent & Billing Parameters
                      </h4>
                      <div className="form-row">
                        <Input
                          label="Default Rent Due Day of Month"
                          type="number"
                          min={1}
                          max={28}
                          value={rentDueDay}
                          onChange={e => setRentDueDay(Number(e.target.value))}
                          hint="e.g. 5th of each month"
                        />
                        <Input
                          label="Grace Period (Days)"
                          type="number"
                          min={0}
                          max={15}
                          value={gracePeriodDays}
                          onChange={e => setGracePeriodDays(Number(e.target.value))}
                          hint="Days before late fee applies (e.g. 5 days)"
                        />
                        <Input
                          label="Default Security Deposit (Months)"
                          type="number"
                          min={1}
                          max={6}
                          value={depositMonths}
                          onChange={e => setDepositMonths(Number(e.target.value))}
                          hint="e.g. 2 months rent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Notifications */}
              {activeTab === 'notifications' && (
                <div>
                  <div className="card-header">
                    <div>
                      <h3 className="card-title">Tenant Reminders & Notification Preferences</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                        Configure automated dispatch triggers for rent dues and maintenance tickets
                      </p>
                    </div>
                  </div>
                  <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color-subtle)' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13.5px' }}>WhatsApp Payment Reminders</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          Send automated UPI payment link and balance reminders 3 days before rent due date.
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={whatsappReminders}
                        onChange={e => setWhatsappReminders(e.target.checked)}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary-600)' }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color-subtle)' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13.5px' }}>SMS Overdue Alerts</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          Notify resident and emergency contact when rent becomes overdue past grace period.
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={smsAlerts}
                        onChange={e => setSmsAlerts(e.target.checked)}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary-600)' }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13.5px' }}>Monthly Financial Statements via Email</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          Receive automated PDF ledger and income vs expense summaries on the 1st of every month.
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={emailReports}
                        onChange={e => setEmailReports(e.target.checked)}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary-600)' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: System & Architecture */}
              {activeTab === 'system' && (
                <div>
                  <div className="card-header">
                    <div>
                      <h3 className="card-title">System & Backend Integration Status</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                        Architecture specifications for Tenant and Admin Dashboard inter-op
                      </p>
                    </div>
                  </div>
                  <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div
                      style={{
                        padding: '14px 18px',
                        backgroundColor: 'var(--warning-50)',
                        border: '1px solid var(--warning-200)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '12.5px',
                        color: 'var(--warning-900)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '4px' }}>
                        <ShieldAlert size={16} /> Prototype Persistence Notice
                      </div>
                      Data changes are currently stored locally in your browser session via <code>StorageService</code>.
                      Browser local storage is not suitable for production tenant PII or payment transaction authorization.
                      In production, this module binds to an authenticated PostgreSQL / REST API with RBAC.
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <h4 style={{ fontSize: '13px', color: 'var(--slate-800)' }}>
                        Tri-Dashboard Integration Specifications
                      </h4>
                      <ul style={{ paddingLeft: '20px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        <li><strong>Shared Domain Types:</strong> Models in <code>src/types/</code> (Property, Room, Bed, Tenant, PaymentRecord, Complaint, StaffMember) use UUIDs and standard ISO dates for seamless sharing with Tenant & Admin suites.</li>
                        <li><strong>Indian Market Localization:</strong> Currency defaults to INR (₹), with UPI UTR verification fields and Indian tenancy agreements.</li>
                        <li><strong>State Consistency:</strong> Bed allocations enforce zero overbooking constraints, with immediate availability handshakes upon tenant move-out or transfer.</li>
                      </ul>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                      <h4 style={{ fontSize: '13px', color: 'var(--slate-900)', marginBottom: '8px' }}>
                        Active Owner Account & Multi-Owner Switching
                      </h4>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                        You are currently authenticated as <strong>{ownerProfile.name}</strong> managing <strong>{ownerProfile.businessName}</strong>. You can switch to another owner or sign out.
                      </p>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<ArrowLeftRight size={14} />}
                          onClick={() => setShowSwitchOwnerModal(true)}
                          type="button"
                        >
                          Switch Owner Account
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<LogOut size={14} />}
                          onClick={() => setShowLogoutConfirm(true)}
                          type="button"
                        >
                          Sign Out of Session
                        </Button>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                      <h4 style={{ fontSize: '13px', color: 'var(--slate-900)', marginBottom: '8px' }}>
                        Data Management & Clean Slate
                      </h4>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                        Manage local storage data for {ownerProfile.name}:
                      </p>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <Button
                          variant="danger"
                          size="sm"
                          icon={<RotateCcw size={14} />}
                          onClick={() => setShowResetConfirm(true)}
                          type="button"
                        >
                          Clear All Data (Clean Slate)
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            loadSampleData();
                            showToast('Sample Data Loaded', `Sample PG properties and tenants loaded for ${ownerProfile.name}.`, 'info');
                          }}
                          type="button"
                        >
                          Load Sample Demo Data
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="card-footer">
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Switch Owner Modal */}
      <SwitchOwnerModal
        isOpen={showSwitchOwnerModal}
        onClose={() => setShowSwitchOwnerModal(false)}
        onOpenLogoutConfirm={() => {
          setShowSwitchOwnerModal(false);
          setShowLogoutConfirm(true);
        }}
      />

      {/* Sign Out Confirm Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          logout();
          showToast('Signed Out', `You have been logged out of ${ownerProfile.businessName}.`, 'info');
          navigate('/login');
        }}
        title="Sign Out"
        message={`Are you sure you want to sign out as ${ownerProfile.name}? Your properties and tenant records are safely preserved.`}
        confirmText="Log Out"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
        title="Clear All Data (Clean Slate)"
        message={`This will completely clear all properties, rooms, tenants, payments, and complaints for ${ownerProfile.name} so you can enter your own real data from scratch.`}
        confirmText="Clear All to Empty"
      />
    </div>
  );
};
