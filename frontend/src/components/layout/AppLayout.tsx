import React, { useState, useEffect } from 'react';
import { Sidebar, NavRoute } from './Sidebar';
import { Header } from './Header';
import { GlobalSearchModal } from './GlobalSearchModal';
import { NotificationDrawer } from './NotificationDrawer';
import { DashboardOverview } from '../../features/dashboard/DashboardOverview';
import { PropertiesPage } from '../../features/properties/PropertiesPage';
import { RoomsPage } from '../../features/rooms/RoomsPage';
import { ResidentsPage } from '../../features/residents/ResidentsPage';
import { PaymentsPage } from '../../features/payments/PaymentsPage';
import { ExpensesPage } from '../../features/expenses/ExpensesPage';
import { StaffPage } from '../../features/staff/StaffPage';
import { ReportsPage } from '../../features/reports/ReportsPage';
import { SettingsPage } from '../../features/settings/SettingsPage';
import { PlatformOverview } from '../../features/platform/PlatformOverview';
import { PGOwnersPage } from '../../features/platform/PGOwnersPage';
import { SubscriptionsPage } from '../../features/platform/SubscriptionsPage';
import { OnboardPGOwnerModal } from '../../features/platform/OnboardPGOwnerModal';
import { Payment } from '../../types';
import { api } from '../../services/api';
import { useProperty } from '../../context/PropertyContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AddResidentModal } from '../../features/residents/AddResidentModal';
import { RecordPaymentModal } from '../../features/payments/RecordPaymentModal';
import { AddExpenseModal } from '../../features/expenses/AddExpenseModal';
import { AddRoomModal } from '../../features/rooms/AddRoomModal';
import { PropertyModal } from '../../features/properties/PropertyModal';
import { RentReceiptModal } from '../../features/payments/RentReceiptModal';
import { OwnerAccountModal } from './OwnerAccountModal';
import { CreateAdminModal } from '../../features/staff/CreateAdminModal';
import { formatINR } from '../../utils/formatters';

export const AppLayout: React.FC = () => {
  const { isPlatformOwner, isPGOwner } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<NavRoute>(() =>
    isPlatformOwner ? 'platform_overview' : 'overview'
  );
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(3);
  const [activeReceipt, setActiveReceipt] = useState<Payment | null>(null);
  const [highlightedResidentId, setHighlightedResidentId] = useState<string | undefined>(undefined);

  // Quick action modal triggers
  const [isQuickAddResidentOpen, setIsQuickAddResidentOpen] = useState(false);
  const [isQuickRecordPaymentOpen, setIsQuickRecordPaymentOpen] = useState(false);
  const [isQuickAddExpenseOpen, setIsQuickAddExpenseOpen] = useState(false);
  const [isQuickAddRoomOpen, setIsQuickAddRoomOpen] = useState(false);
  const [isQuickAddPropertyOpen, setIsQuickAddPropertyOpen] = useState(false);
  const [isOwnerAccountOpen, setIsOwnerAccountOpen] = useState(false);
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);
  const [isOnboardPGOwnerOpen, setIsOnboardPGOwnerOpen] = useState(false);

  const { refreshProperties } = useProperty();
  const toast = useToast();

  // Keep route synced if role changes
  useEffect(() => {
    if (isPlatformOwner && !['platform_overview', 'platform_owners', 'platform_subscriptions', 'notifications', 'settings'].includes(currentRoute)) {
      setCurrentRoute('platform_overview');
    } else if (!isPlatformOwner && ['platform_overview', 'platform_owners', 'platform_subscriptions'].includes(currentRoute)) {
      setCurrentRoute('overview');
    }
  }, [isPlatformOwner]);

  const fetchUnreadNotifs = async () => {
    const list = await api.getNotifications();
    setUnreadNotificationsCount(list.filter((n) => !n.isRead).length);
  };

  useEffect(() => {
    fetchUnreadNotifs();
  }, []);

  const handleNavigate = (route: NavRoute, entityId?: string) => {
    setCurrentRoute(route);
    if (route === 'residents' && entityId) {
      setHighlightedResidentId(entityId);
    }
  };

  const handleQuickAction = (
    action: 'add_resident' | 'record_payment' | 'add_expense' | 'add_room' | 'add_property' | 'onboard_pg_owner'
  ) => {
    if (action === 'onboard_pg_owner') setIsOnboardPGOwnerOpen(true);
    if (action === 'add_resident') setIsQuickAddResidentOpen(true);
    if (action === 'record_payment') setIsQuickRecordPaymentOpen(true);
    if (action === 'add_expense') setIsQuickAddExpenseOpen(true);
    if (action === 'add_room') setIsQuickAddRoomOpen(true);
    if (action === 'add_property') setIsQuickAddPropertyOpen(true);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F6F2]">
      {/* Sidebar */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        unreadNotificationsCount={unreadNotificationsCount}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        onOpenOwnerAccount={() => setIsOwnerAccountOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <Header
          currentRoute={currentRoute}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          unreadCount={unreadNotificationsCount}
          onQuickAction={handleQuickAction}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            {/* Platform Owner Routes (Limited Rights: Onboard PG Owners & SaaS Subscriptions) */}
            {currentRoute === 'platform_overview' && (
              <PlatformOverview
                onNavigateToPGOwners={() => setCurrentRoute('platform_owners')}
                onOpenOnboardModal={() => setIsOnboardPGOwnerOpen(true)}
              />
            )}
            {currentRoute === 'platform_owners' && (
              <PGOwnersPage onOpenOnboardModal={() => setIsOnboardPGOwnerOpen(true)} />
            )}
            {currentRoute === 'platform_subscriptions' && <SubscriptionsPage />}

            {/* PG Operations Routes (Full PG Rights: Rooms, Beds, Tenants, Staff, Payments, Expenses) */}
            {currentRoute === 'overview' && (
              <DashboardOverview
                onNavigate={handleNavigate}
                onQuickAction={handleQuickAction}
              />
            )}
            {currentRoute === 'properties' && (
              <PropertiesPage onNavigate={handleNavigate} />
            )}
            {currentRoute === 'rooms' && (
              <RoomsPage onNavigate={handleNavigate} />
            )}
            {currentRoute === 'residents' && (
              <ResidentsPage
                onNavigate={handleNavigate}
                onViewReceipt={(payment) => setActiveReceipt(payment)}
                highlightedResidentId={highlightedResidentId}
              />
            )}
            {currentRoute === 'payments' && (
              <PaymentsPage
                onOpenReceipt={(payment) => setActiveReceipt(payment)}
                activeReceiptPayment={activeReceipt}
              />
            )}
            {currentRoute === 'expenses' && <ExpensesPage />}
            {currentRoute === 'staff' && <StaffPage />}
            {currentRoute === 'reports' && <ReportsPage />}
            {currentRoute === 'notifications' && (
              <div className="bg-white p-6 rounded-xl border border-[#E8E1D9] shadow-sm">
                <h2 className="text-lg font-bold text-[#24211F] mb-4">All System Notifications</h2>
                <p className="text-xs text-[#716A63]">
                  {isPlatformOwner
                    ? 'Platform-level tenant registrations, new PG onboardings, and billing alerts.'
                    : 'Use the notification center bell in the header to filter unread alerts and trigger WhatsApp reminders.'}
                </p>
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen(true)}
                  className="mt-4 px-4 py-2 bg-[#B85C38] text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  Open Notification Drawer
                </button>
              </div>
            )}
            {currentRoute === 'settings' && <SettingsPage />}
          </div>
        </main>
      </div>

      {/* Global Command Palette / Search Dialog */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Notification Center Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigate={handleNavigate}
        onNotificationRead={fetchUnreadNotifs}
      />

      {/* Platform Owner: Onboard PG Owner Modal */}
      <OnboardPGOwnerModal
        isOpen={isOnboardPGOwnerOpen}
        onClose={() => setIsOnboardPGOwnerOpen(false)}
        onSubmit={async (data) => {
          await api.onboardPGOwner(data);
          toast.success(
            'PG Owner Onboarded!',
            `${data.ownerName} (${data.businessName}) has been provisioned on ${data.plan.toUpperCase()} tier.`
          );
        }}
      />

      {/* PG Owner Quick Operations */}
      <AddResidentModal
        isOpen={isQuickAddResidentOpen}
        onClose={() => setIsQuickAddResidentOpen(false)}
        onSubmit={async (data) => {
          await api.createResident(data);
          toast.success('Resident Onboarded', `${data.name} has been added.`);
          await refreshProperties();
        }}
      />

      <RecordPaymentModal
        isOpen={isQuickRecordPaymentOpen}
        onClose={() => setIsQuickRecordPaymentOpen(false)}
        onSubmit={async (data) => {
          const newPay = await api.recordPayment(data);
          toast.success('Payment Recorded', `Received ${formatINR(data.amountPaid)}.`);
          setActiveReceipt(newPay);
        }}
      />

      <AddExpenseModal
        isOpen={isQuickAddExpenseOpen}
        onClose={() => setIsQuickAddExpenseOpen(false)}
        onSubmit={async (data) => {
          await api.createExpense(data);
          toast.success('Expense Added', `Recorded ${formatINR(data.amount)} for ${data.category}.`);
        }}
      />

      <AddRoomModal
        isOpen={isQuickAddRoomOpen}
        onClose={() => setIsQuickAddRoomOpen(false)}
        onSubmit={async (data) => {
          await api.createRoom(data);
          toast.success('Room Added', `Room ${data.roomNumber} created.`);
          await refreshProperties();
        }}
      />

      <PropertyModal
        isOpen={isQuickAddPropertyOpen}
        onClose={() => setIsQuickAddPropertyOpen(false)}
        onSubmit={async (data) => {
          await api.createProperty(data);
          toast.success('Property Added', `${data.name} added to Nivaas.`);
          await refreshProperties();
        }}
      />

      {/* Global Receipt Modal */}
      <RentReceiptModal
        isOpen={!!activeReceipt}
        onClose={() => setActiveReceipt(null)}
        payment={activeReceipt}
      />

      {/* Owner Account & Security Profile Modal */}
      <OwnerAccountModal
        isOpen={isOwnerAccountOpen}
        onClose={() => setIsOwnerAccountOpen(false)}
        onOpenCreateAdmin={() => setIsCreateAdminOpen(true)}
      />

      {/* Provision Platform Owner / Admin Account Modal */}
      <CreateAdminModal
        isOpen={isCreateAdminOpen}
        onClose={() => setIsCreateAdminOpen(false)}
        onSuccess={refreshProperties}
      />
    </div>
  );
};
