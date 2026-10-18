import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Building,
  Plus,
  ChevronDown,
  UserPlus,
  CreditCard,
  Receipt,
  BedDouble,
  ShieldCheck,
  Crown,
} from 'lucide-react';
import { useProperty } from '../../context/PropertyContext';
import { useAuth } from '../../context/AuthContext';
import { NavRoute } from './Sidebar';

interface HeaderProps {
  currentRoute: NavRoute;
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  unreadCount?: number;
  onQuickAction: (action: 'add_resident' | 'record_payment' | 'add_expense' | 'add_room' | 'add_property' | 'onboard_pg_owner') => void;
}

const routeTitles: Record<NavRoute, { title: string; subtitle: string }> = {
  platform_overview: {
    title: 'Platform Super Admin Overview',
    subtitle: 'Limited Rights Console: Monitor PG onboardings and platform SaaS health',
  },
  platform_owners: {
    title: 'PG Owners Directory',
    subtitle: 'Onboard and manage independent PG businesses and subscription plans',
  },
  platform_subscriptions: {
    title: 'SaaS Subscriptions & Tiers',
    subtitle: 'Manage monetization tiers, Indian billing compliance, and active subscriptions',
  },
  overview: {
    title: 'PG Dashboard Overview',
    subtitle: 'Consolidated performance, occupancy, and operations across your PG properties',
  },
  properties: {
    title: 'Properties & Branches',
    subtitle: 'Manage PG buildings, room configurations, and assigned branch managers',
  },
  rooms: {
    title: 'Rooms & Bed Allocations',
    subtitle: 'Visual bed slot matrix, sharing types, and real-time inventory',
  },
  residents: {
    title: 'Residents (Tenants) Directory',
    subtitle: 'Tenant onboarding, KYC documents, deposit refunds, and monthly rent history',
  },
  payments: {
    title: 'Payments & Collections',
    subtitle: 'Collect monthly rent, track overdue dues, and issue official rent receipts',
  },
  expenses: {
    title: 'PG Expenses & Maintenance',
    subtitle: 'Track electricity, cook/mess groceries, Wi-Fi bills, and room repairs',
  },
  staff: {
    title: 'PG Staff & Managers',
    subtitle: 'Add branch managers, caretakers, and wardens for your PG properties',
  },
  reports: {
    title: 'Operational Reports',
    subtitle: 'P&L financials, occupancy trends, and rent collection analytics',
  },
  notifications: {
    title: 'Notification Center',
    subtitle: 'Rent overdue alerts, KYC verifications, and move-out notices',
  },
  settings: {
    title: 'Settings & Security',
    subtitle: 'Business profile, billing rules, WhatsApp preferences, and bank details',
  },
};

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  onOpenMobileMenu,
  onOpenSearch,
  onOpenNotifications,
  unreadCount = 3,
  onQuickAction,
}) => {
  const { properties, selectedPropertyId, setSelectedPropertyId } = useProperty();
  const { isPlatformOwner, isPGOwner, isOwner } = useAuth();
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  const routeInfo = routeTitles[currentRoute] || { title: 'Nivaas Dashboard', subtitle: '' };

  return (
    <header className="sticky top-0 z-30 bg-[#FFFEFC]/90 backdrop-blur-md border-b border-[#E8E1D9] px-4 sm:px-6 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger + Titles */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden text-[#716A63] hover:text-[#24211F] p-1.5 rounded-lg border border-[#E8E1D9]"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-[#24211F] tracking-tight truncate">
              {routeInfo.title}
            </h1>
            <p className="text-xs text-[#716A63] hidden md:block truncate">
              {routeInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right Actions Toolbar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Property Selector Dropdown (Hidden for Platform Owner because Platform Owner does not manage branch properties) */}
          {!isPlatformOwner ? (
            <div className="relative">
              <div className="flex items-center gap-2 bg-white border border-[#E8E1D9] rounded-lg px-2.5 py-1.5 shadow-2xs hover:border-[#B85C38]/40 transition-colors">
                <Building className="w-4 h-4 text-[#B85C38] shrink-0" />
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-[#24211F] outline-none cursor-pointer pr-1"
                >
                  {isPGOwner && <option value="all">All Properties ({properties.length})</option>}
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 bg-[#F8F6F2] border border-[#E8E1D9] rounded-lg px-2.5 py-1.5 text-xs text-[#716A63]">
              <Crown className="w-3.5 h-3.5 text-purple-700" />
              <span className="font-semibold text-[#24211F]">Pan-India SaaS Network</span>
            </div>
          )}

          {/* Global Search Bar */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="hidden sm:flex items-center gap-2 bg-white border border-[#E8E1D9] text-[#716A63] text-xs px-3 py-1.5 rounded-lg shadow-2xs hover:border-[#B85C38]/40 hover:text-[#24211F] transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-[#716A63]" />
            <span>{isPlatformOwner ? 'Search PG owners...' : 'Search residents, rooms...'}</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] bg-[#F8F6F2] text-[#716A63] rounded border border-[#E8E1D9] font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Quick Action Button: Limited to Onboarding for Platform Owner; PG Operations for PG Owner */}
          {isPlatformOwner ? (
            <button
              type="button"
              onClick={() => onQuickAction('onboard_pg_owner')}
              className="flex items-center gap-1.5 bg-[#B85C38] hover:bg-[#984629] text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Onboard PG</span>
            </button>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
                className="flex items-center gap-1.5 bg-[#B85C38] hover:bg-[#984629] text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">New</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {isQuickActionOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsQuickActionOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E8E1D9] rounded-xl shadow-xl z-50 py-1 animate-fade-in">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9E968E]">
                      PG Operations
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsQuickActionOpen(false);
                        onQuickAction('add_resident');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-[#24211F] hover:bg-[#FDF4F0] hover:text-[#B85C38] flex items-center gap-2.5 transition-colors"
                    >
                      <UserPlus className="w-4 h-4 text-[#B85C38]" />
                      <span>Onboard Tenant</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsQuickActionOpen(false);
                        onQuickAction('record_payment');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-[#24211F] hover:bg-[#FDF4F0] hover:text-[#B85C38] flex items-center gap-2.5 transition-colors"
                    >
                      <CreditCard className="w-4 h-4 text-[#16845B]" />
                      <span>Record Payment</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsQuickActionOpen(false);
                        onQuickAction('add_expense');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-[#24211F] hover:bg-[#FDF4F0] hover:text-[#B85C38] flex items-center gap-2.5 transition-colors"
                    >
                      <Receipt className="w-4 h-4 text-[#D99118]" />
                      <span>Add Expense</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsQuickActionOpen(false);
                        onQuickAction('add_room');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-[#24211F] hover:bg-[#FDF4F0] hover:text-[#B85C38] flex items-center gap-2.5 transition-colors"
                    >
                      <BedDouble className="w-4 h-4 text-[#2786B8]" />
                      <span>Add Room</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Notification Center Trigger */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative p-2 text-[#716A63] hover:text-[#24211F] hover:bg-[#F8F6F2] rounded-lg border border-[#E8E1D9] transition-colors"
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#B85C38] rounded-full ring-2 ring-white" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
