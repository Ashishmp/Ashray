import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  Users,
  CreditCard,
  Receipt,
  Wrench,
  UserCheck,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Building,
  X,
  ArrowLeftRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Modal } from '../ui/Modal';
import { SwitchOwnerModal } from '../../features/auth/SwitchOwnerModal';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { payments, complaints, ownerProfile } = useApp();
  const { logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSwitchOwnerModal, setShowSwitchOwnerModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Compute live badges
  const overdueCount = payments.filter(p => p.status === 'Overdue').length;
  const openComplaintsCount = complaints.filter(c => c.status === 'Open' || c.status === 'In Progress').length;

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/properties', label: 'Properties', icon: Building2 },
    { to: '/rooms', label: 'Rooms & Beds', icon: BedDouble },
    { to: '/tenants', label: 'Tenants', icon: Users },
    {
      to: '/payments',
      label: 'Rent & Payments',
      icon: CreditCard,
      badge: overdueCount > 0 ? `${overdueCount} due` : undefined,
      badgeType: 'alert'
    },
    { to: '/expenses', label: 'Expenses', icon: Receipt },
    {
      to: '/maintenance',
      label: 'Complaints',
      icon: Wrench,
      badge: openComplaintsCount > 0 ? `${openComplaintsCount}` : undefined,
      badgeType: 'info'
    },
    { to: '/staff', label: 'Staff', icon: UserCheck },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <>
      <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Sidebar Header / Brand */}
        <div className="sidebar-header">
          <NavLink to="/" className="brand-link" onClick={onCloseMobile}>
            <div className="brand-icon-wrapper">
              <Building size={20} />
            </div>
            <span>
              StayNest
              <span className="brand-badge">Owner</span>
            </span>
          </NavLink>
          {isMobileOpen && (
            <button
              type="button"
              className="modal-close-btn"
              onClick={onCloseMobile}
              aria-label="Close menu"
              style={{ color: '#ffffff' }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">Main Operations</div>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <Icon className="nav-item-icon" />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`nav-item-badge ${
                      item.badgeType === 'alert' ? 'nav-badge-alert' : 'nav-badge-info'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button
            type="button"
            className="nav-item"
            style={{ width: '100%', marginBottom: '6px' }}
            onClick={() => setShowHelpModal(true)}
          >
            <HelpCircle className="nav-item-icon" />
            <span>Help & Support</span>
          </button>

          <div className="user-card" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              className="user-avatar"
              title={`${ownerProfile.name} (${ownerProfile.businessName})`}
              style={{ cursor: 'pointer' }}
              onClick={() => setShowSwitchOwnerModal(true)}
            >
              {ownerProfile.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div
              className="user-info"
              style={{ cursor: 'pointer', flex: 1, minWidth: 0 }}
              onClick={() => setShowSwitchOwnerModal(true)}
              title="Click to switch owner account"
            >
              <div className="user-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {ownerProfile.name}
              </div>
              <div className="user-role" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {ownerProfile.businessName}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '2px' }}>
              <button
                type="button"
                className="btn-ghost"
                style={{ padding: '6px', color: 'var(--slate-400)' }}
                title="Switch Owner Account"
                onClick={() => setShowSwitchOwnerModal(true)}
                aria-label="Switch Owner Account"
              >
                <ArrowLeftRight size={15} />
              </button>
              <button
                type="button"
                className="btn-ghost"
                style={{ padding: '6px', color: 'var(--slate-400)' }}
                title="Sign Out"
                onClick={() => setShowLogoutConfirm(true)}
                aria-label="Sign Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Switch Owner Account Modal */}
      <SwitchOwnerModal
        isOpen={showSwitchOwnerModal}
        onClose={() => setShowSwitchOwnerModal(false)}
        onOpenLogoutConfirm={() => {
          setShowSwitchOwnerModal(false);
          setShowLogoutConfirm(true);
        }}
      />

      {/* Logout Confirmation */}
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
        message={`Are you sure you want to log out of StayNest as ${ownerProfile.name}? Your property data remains safely saved.`}
        confirmText="Log Out"
        variant="danger"
      />

      {/* Help & Support Modal */}
      <Modal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="StayNest Owner Helpline & Support"
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px' }}>
            Need assistance managing your properties, configuring UPI payment reminders, or setting up new rooms?
          </p>

          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--primary-50)',
              borderRadius: '8px',
              border: '1px solid var(--primary-200)'
            }}
          >
            <h4 style={{ color: 'var(--primary-800)', marginBottom: '6px' }}>Direct Support Channels</h4>
            <p style={{ fontSize: '13px', color: 'var(--primary-700)', margin: '4px 0' }}>
              <strong>Helpline:</strong> +91 (80) 4567 8900 (Mon-Sat, 9 AM - 8 PM IST)
            </p>
            <p style={{ fontSize: '13px', color: 'var(--primary-700)', margin: '4px 0' }}>
              <strong>Email:</strong> support@staynest.in
            </p>
            <p style={{ fontSize: '13px', color: 'var(--primary-700)', margin: '4px 0' }}>
              <strong>WhatsApp Assistant:</strong> +91 98450 00111
            </p>
          </div>

          <div>
            <h4 style={{ marginBottom: '8px' }}>Common Owner FAQs</h4>
            <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>
              <li><strong>Bed Availability:</strong> When a tenant is marked moved-out or transferred, the bed slot is freed up in real-time.</li>
              <li><strong>Offline Cash Collections:</strong> Record cash collections via "Record Payment"; it issues a printable receipt with a unique receipt number.</li>
              <li><strong>Property Filter:</strong> Use the topbar dropdown to switch between individual PGs or view consolidated metrics for all properties.</li>
            </ul>
          </div>
        </div>
      </Modal>
    </>
  );
};
