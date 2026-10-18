import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { LoginPage } from '../features/auth/LoginPage';
import { OverviewPage } from '../features/dashboard/OverviewPage';
import { PropertiesPage } from '../features/properties/PropertiesPage';
import { RoomsPage } from '../features/rooms/RoomsPage';
import { TenantsPage } from '../features/tenants/TenantsPage';
import { PaymentsPage } from '../features/payments/PaymentsPage';
import { ExpensesPage } from '../features/expenses/ExpensesPage';
import { MaintenancePage } from '../features/maintenance/MaintenancePage';
import { StaffPage } from '../features/staff/StaffPage';
import { ReportsPage } from '../features/reports/ReportsPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { PlatformAdminPage } from '../features/admin/PlatformAdminPage';
import { TenantOverviewPage } from '../features/tenant/TenantOverviewPage';
import { TenantProfilePage } from '../features/tenant/TenantProfilePage';
import { TenantPaymentsPage } from '../features/tenant/TenantPaymentsPage';
import { TenantComplaintsPage } from '../features/tenant/TenantComplaintsPage';
import { useAuth } from '../context/AuthContext';

const RoleBasedIndex: React.FC = () => {
  const { currentRole } = useAuth();
  if (currentRole === 'superadmin') {
    return <PlatformAdminPage />;
  }
  if (currentRole === 'tenant') {
    return <TenantOverviewPage />;
  }
  return <OverviewPage />;
};

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RoleBasedIndex />} />

        {/* PG Owner Routes */}
        <Route path="properties" element={<PropertiesPage />} />
        <Route path="rooms" element={<RoomsPage />} />
        <Route path="tenants" element={<TenantsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />

        {/* Platform Super Admin */}
        <Route path="admin" element={<PlatformAdminPage />} />

        {/* Resident Tenant Self-Service Portal */}
        <Route path="tenant" element={<TenantOverviewPage />} />
        <Route path="tenant/profile" element={<TenantProfilePage />} />
        <Route path="tenant/payments" element={<TenantPaymentsPage />} />
        <Route path="tenant/complaints" element={<TenantComplaintsPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

