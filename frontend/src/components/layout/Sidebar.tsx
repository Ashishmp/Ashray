import React from 'react';
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  Users,
  CreditCard,
  Receipt,
  UserCheck,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Sparkles,
  ShieldCheck,
  User as UserIcon,
  Crown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type NavRoute =
  | 'platform_overview'
  | 'platform_owners'
  | 'platform_subscriptions'
  | 'overview'
  | 'properties'
  | 'rooms'
  | 'residents'
  | 'payments'
  | 'expenses'
  | 'staff'
  | 'reports'
  | 'notifications'
  | 'settings';

interface SidebarProps {
  currentRoute: NavRoute;
  onNavigate: (route: NavRoute) => void;
  unreadNotificationsCount?: number;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  onOpenOwnerAccount?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  unreadNotificationsCount = 3,
  isMobileOpen = false,
  onMobileClose,
  onOpenOwnerAccount,
}) => {
  const { currentUser, isPlatformOwner, isPGOwner, isManager, switchRole, logout } = useAuth();

  // Navigation Items dynamically filtered based on limited platform owner rights vs PG owner operations
  const navItems = isPlatformOwner
    ? [
        { id: 'platform_overview' as NavRoute, label: 'Platform Overview', icon: LayoutDashboard },
        { id: 'platform_owners' as NavRoute, label: 'PG Owners Directory', icon: Building2 },
        { id: 'platform_subscriptions' as NavRoute, label: 'Subscriptions & Plans', icon: CreditCard },
        {
          id: 'notifications' as NavRoute,
          label: 'Platform Audit & Logs',
          icon: Bell,
          badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
        },
        { id: 'settings' as NavRoute, label: 'Platform Settings', icon: Settings },
      ]
    : [
        { id: 'overview' as NavRoute, label: 'Overview', icon: LayoutDashboard },
        { id: 'properties' as NavRoute, label: 'Properties', icon: Building2 },
        { id: 'rooms' as NavRoute, label: 'Rooms & Beds', icon: BedDouble },
        { id: 'residents' as NavRoute, label: 'Residents (Tenants)', icon: Users },
        { id: 'payments' as NavRoute, label: 'Payments', icon: CreditCard },
        { id: 'expenses' as NavRoute, label: 'Expenses', icon: Receipt },
        ...(isPGOwner
          ? [{ id: 'staff' as NavRoute, label: 'Staff & Managers', icon: UserCheck }]
          : []),
        { id: 'reports' as NavRoute, label: 'Reports', icon: BarChart3 },
        {
          id: 'notifications' as NavRoute,
          label: 'Notifications',
          icon: Bell,
          badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
        },
        { id: 'settings' as NavRoute, label: 'PG Settings', icon: Settings },
      ];

  const handleNavClick = (route: NavRoute) => {
    onNavigate(route);
    if (onMobileClose) onMobileClose();
  };

  const handleRoleSwitch = (role: 'platform_owner' | 'pg_owner' | 'manager') => {
    switchRole(role);
    if (role === 'platform_owner') {
      onNavigate('platform_overview');
    } else {
      onNavigate('overview');
    }
  };

  const sidebarContent = (
    <aside className="w-68 bg-[#FFFEFC] border-r border-[#E8E1D9] flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="px-6 py-5 border-b border-[#E8E1D9]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#B85C38] flex items-center justify-center text-white shadow-xs">
            {/* Authentic Indian Architectural Arch Motif */}
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2L2 9.5V21C2 21.5523 2.44772 22 3 22H9V15C9 13.3431 10.3431 12 12 12C13.6569 12 15 13.3431 15 15V22H21C21.5523 22 22 21.5523 22 21V9.5L12 2Z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-[#24211F]">Nivaas</span>
              <span
                className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                  isPlatformOwner
                    ? 'bg-purple-100 text-purple-900 border-purple-200'
                    : isPGOwner
                    ? 'bg-[#FDF4F0] text-[#B85C38] border-[#F6E2DA]'
                    : 'bg-blue-100 text-blue-900 border-blue-200'
                }`}
              >
                {isPlatformOwner ? 'PLATFORM ADMIN' : isPGOwner ? 'PG OWNER' : 'MANAGER'}
              </span>
            </div>
            <p className="text-[11px] text-[#716A63] tracking-tight">
              {isPlatformOwner
                ? 'SaaS Onboarding Console'
                : 'Apne PG ka hisaab, ab aasaan'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        <div className="px-3 pb-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9E968E]">
            {isPlatformOwner ? 'Platform Rights' : 'PG Management'}
          </p>
          {isPlatformOwner && (
            <span className="text-[10px] bg-amber-50 text-amber-700 font-semibold px-1.5 py-0.2 rounded border border-amber-200">
              Only Boards PGs
            </span>
          )}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[#FDF4F0] text-[#B85C38] font-semibold shadow-xs'
                  : 'text-[#716A63] hover:text-[#24211F] hover:bg-[#F8F6F2]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4.5 h-4.5 shrink-0 ${
                    isActive ? 'text-[#B85C38]' : 'text-[#716A63]'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-[#B85C38] text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Role Simulator Switcher with 3 clear perspectives */}
      <div className="px-3.5 py-2.5 mx-3 mb-2 rounded-xl bg-[#F8F6F2] border border-[#E8E1D9] text-xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-[#716A63] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#B85C38]" /> Role Switcher
          </span>
          <span
            className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
              isPlatformOwner
                ? 'bg-purple-100 text-purple-800'
                : isPGOwner
                ? 'bg-amber-100 text-amber-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {isPlatformOwner ? 'Platform' : isPGOwner ? 'PG Owner' : 'Manager'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1 mt-1 text-[10px]">
          <button
            type="button"
            onClick={() => handleRoleSwitch('platform_owner')}
            className={`py-1 text-center rounded font-semibold transition-colors ${
              isPlatformOwner
                ? 'bg-[#B85C38] text-white shadow-xs'
                : 'bg-white text-[#716A63] border border-[#E8E1D9] hover:bg-stone-50'
            }`}
            title="Limited Right: Only Boards PG Owners"
          >
            Platform
          </button>
          <button
            type="button"
            onClick={() => handleRoleSwitch('pg_owner')}
            className={`py-1 text-center rounded font-semibold transition-colors ${
              isPGOwner
                ? 'bg-[#B85C38] text-white shadow-xs'
                : 'bg-white text-[#716A63] border border-[#E8E1D9] hover:bg-stone-50'
            }`}
            title="PG Owner: Adds Staff & Manages Tenants"
          >
            PG Owner
          </button>
          <button
            type="button"
            onClick={() => handleRoleSwitch('manager')}
            className={`py-1 text-center rounded font-semibold transition-colors ${
              isManager
                ? 'bg-[#B85C38] text-white shadow-xs'
                : 'bg-white text-[#716A63] border border-[#E8E1D9] hover:bg-stone-50'
            }`}
            title="Branch Manager: Assigned properties"
          >
            Manager
          </button>
        </div>
      </div>

      {/* Authenticated User Profile */}
      <div className="p-3 border-t border-[#E8E1D9] bg-[#FFFEFC]">
        <div
          onClick={onOpenOwnerAccount}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F8F6F2] transition-colors cursor-pointer group"
          title="View Account Profile"
        >
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
            alt={currentUser?.name}
            className="w-9 h-9 rounded-full object-cover border border-[#E8E1D9] group-hover:border-[#B85C38]"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#24211F] truncate group-hover:text-[#B85C38]">
              {currentUser?.name}
            </p>
            <div className="flex items-center gap-1">
              {isPlatformOwner ? (
                <Crown className="w-3.5 h-3.5 text-purple-600" />
              ) : isPGOwner ? (
                <ShieldCheck className="w-3.5 h-3.5 text-[#B85C38]" />
              ) : (
                <UserIcon className="w-3.5 h-3.5 text-[#2786B8]" />
              )}
              <span className="text-[11px] font-semibold text-[#716A63] truncate">
                {isPlatformOwner
                  ? 'Platform Super Admin'
                  : isPGOwner
                  ? 'PG Owner Admin'
                  : 'Property Manager'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              logout();
            }}
            title="Log out"
            className="text-[#716A63] hover:text-[#D64545] p-1.5 rounded-md hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#24211F]/50 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />
          <div className="relative z-10 animate-fade-in h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
