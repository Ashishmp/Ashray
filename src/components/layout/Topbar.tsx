import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Building,
  Bell,
  Search,
  RotateCcw,
  Check,
  ChevronDown,
  AlertCircle,
  LogOut,
  ArrowLeftRight,
  User,
  Settings
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { SwitchOwnerModal } from '../../features/auth/SwitchOwnerModal';

interface TopbarProps {
  onToggleSidebar: () => void;
}

const PAGE_TITLES: Record<string, { title: string; category: string }> = {
  '/': { title: 'Overview', category: 'Dashboard' },
  '/properties': { title: 'Property Management', category: 'Portfolio' },
  '/rooms': { title: 'Rooms & Beds', category: 'Inventory' },
  '/tenants': { title: 'Tenant Directory', category: 'Residents' },
  '/payments': { title: 'Rent & Payments', category: 'Financials' },
  '/expenses': { title: 'Expenses & Overhead', category: 'Financials' },
  '/maintenance': { title: 'Complaints & Maintenance', category: 'Operations' },
  '/staff': { title: 'Staff & Team', category: 'Operations' },
  '/reports': { title: 'Reports & Analytics', category: 'Insights' },
  '/settings': { title: 'Settings & Defaults', category: 'Configuration' }
};

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const {
    properties,
    selectedPropertyId,
    setSelectedPropertyId,
    globalSearch,
    setGlobalSearch,
    notifications,
    unreadNotifCount,
    markNotificationRead,
    markAllNotificationsRead,
    clearAllData,
    ownerProfile
  } = useApp();

  const { showToast } = useToast();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSwitchOwnerModal, setShowSwitchOwnerModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pageInfo = PAGE_TITLES[location.pathname] || { title: 'Dashboard', category: 'StayNest' };

  const handleReset = () => {
    clearAllData();
    showToast('Clean Slate Ready', 'All data cleared. You can now add your own PG properties, rooms, and tenants.', 'info');
  };

  return (
    <>
      <header className="topbar">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="topbar-left">
          <button
            type="button"
            className="sidebar-toggle-btn"
            onClick={onToggleSidebar}
            aria-label="Toggle Navigation Menu"
          >
            <Menu size={20} />
          </button>

          <div className="topbar-title-section">
            <div className="topbar-breadcrumbs">
              <span>{pageInfo.category}</span>
              <span>/</span>
              <span style={{ color: 'var(--text-secondary)' }}>{pageInfo.title}</span>
            </div>
            <h1 className="topbar-page-title">{pageInfo.title}</h1>
          </div>
        </div>

        {/* Right: Property Selector, Search, Notifications, Demo Reset */}
        <div className="topbar-right">
          {/* Property Selector */}
          <div className="property-selector-box" title="Filter dashboard data by property">
            <Building className="property-selector-icon" />
            <select
              className="property-select"
              value={selectedPropertyId}
              onChange={e => setSelectedPropertyId(e.target.value)}
              aria-label="Filter by property"
            >
              <option value="all">
                {properties.length === 0 ? 'No Properties Added' : `All Properties (${properties.length})`}
              </option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Search */}
          <div className="topbar-search-wrapper">
            <Search className="topbar-search-icon" />
            <input
              type="text"
              placeholder="Search tenant, room, receipt..."
              className="topbar-search-input"
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
            />
          </div>

          {/* Clear All / Clean Slate Button */}
          <button
            type="button"
            className="icon-action-btn"
            onClick={() => setShowResetConfirm(true)}
            title="Clear all data to empty clean slate"
            aria-label="Clear All Data"
          >
            <RotateCcw size={17} />
          </button>

          {/* Notifications Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="icon-action-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="View notifications"
              title="Notifications"
            >
              <Bell size={18} />
              {unreadNotifCount > 0 && <span className="notification-badge" />}
            </button>

            {/* Notification Popover */}
            {showNotifications && (
              <div
                style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '320px',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--border-color)',
                  zIndex: 'var(--z-dropdown)',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>
                    Notifications {unreadNotifCount > 0 && `(${unreadNotifCount})`}
                  </div>
                  {unreadNotifCount > 0 && (
                    <button
                      type="button"
                      style={{ fontSize: '11.5px', color: 'var(--primary-600)', fontWeight: 600 }}
                      onClick={markAllNotificationsRead}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                      No new notifications
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid var(--border-color-subtle)',
                          backgroundColor: n.read ? 'transparent' : 'var(--primary-50)',
                          cursor: 'pointer',
                          display: 'flex',
                          gap: '10px'
                        }}
                      >
                        <AlertCircle
                          size={16}
                          style={{
                            color: n.type === 'payment' ? 'var(--warning-600)' : 'var(--danger-600)',
                            marginTop: '2px',
                            flexShrink: 0
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {n.title}
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {n.message}
                          </div>
                          <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                            {n.timestamp}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div ref={userMenuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="User profile menu"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 6px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid transparent',
                backgroundColor: showUserMenu ? 'var(--slate-100)' : 'transparent',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--slate-100)'; }}
              onMouseLeave={e => {
                if (!showUserMenu) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-600)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '13px'
                }}
              >
                {ownerProfile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {ownerProfile.name.split(' ')[0]}
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>
                  Owner
                </div>
              </div>
              <ChevronDown size={14} style={{ color: 'var(--text-tertiary)', marginLeft: '2px' }} />
            </button>

            {/* Profile Popover Menu */}
            {showUserMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '125%',
                  right: 0,
                  width: '260px',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--border-color)',
                  zIndex: 'var(--z-dropdown)',
                  overflow: 'hidden'
                }}
              >
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--slate-50)' }}>
                  <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-primary)' }}>
                    {ownerProfile.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--primary-600)', fontWeight: 600, marginTop: '2px' }}>
                    {ownerProfile.businessName}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    {ownerProfile.email}
                  </div>
                </div>

                <div style={{ padding: '6px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowSwitchOwnerModal(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--primary-50)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <ArrowLeftRight size={16} color="var(--primary-600)" />
                    <span>Switch Owner Account</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/settings');
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--slate-100)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <Settings size={16} color="var(--slate-600)" />
                    <span>Settings & Profile</span>
                  </button>

                  <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '4px 0' }} />

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowLogoutConfirm(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--danger-600)',
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--danger-50)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <LogOut size={16} color="var(--danger-600)" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Switch Owner Modal */}
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
        message={`Are you sure you want to sign out as ${ownerProfile.name}? Your properties and tenant records are safely preserved.`}
        confirmText="Log Out"
        variant="danger"
      />

      {/* Confirm Clear Dialog */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
        title="Clear All Data (Clean Slate)"
        message="This will clear all properties, rooms, tenants, and transactions so you can start completely fresh and enter your own real PG data."
        confirmText="Clear All Data"
        variant="danger"
      />
    </>
  );
};
