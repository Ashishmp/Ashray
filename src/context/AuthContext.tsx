import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storageService, SUPER_ADMIN_ACCOUNT } from '../services/storageService';
import { OwnerAccount, LoginCredentials, RegisterOwnerInput, SuperAdminAccount, TenantAccount, UserRole } from '../types/auth';
import { OwnerProfile } from '../types/common';

interface AuthContextValue {
  currentRole: UserRole;
  currentOwner: OwnerAccount | null;
  currentTenant: TenantAccount | null;
  superAdmin: SuperAdminAccount;
  isAuthenticated: boolean;
  registeredOwners: OwnerAccount[];
  registeredTenants: TenantAccount[];
  login: (credentials: LoginCredentials) => { success: boolean; error?: string };
  quickLogin: (ownerId: string) => { success: boolean; error?: string };
  loginAsSuperAdmin: () => void;
  loginAsTenant: (tenantId: string) => { success: boolean; error?: string };
  switchRole: (role: UserRole, targetId?: string) => void;
  logout: () => void;
  switchOwner: (ownerId: string) => { success: boolean; error?: string };
  register: (data: RegisterOwnerInput) => { success: boolean; error?: string };
  updateCurrentProfile: (updates: Partial<OwnerProfile>) => void;
  refreshOwners: () => void;
  refreshTenant: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => storageService.getActiveRole());

  const [registeredOwners, setRegisteredOwners] = useState<OwnerAccount[]>(() =>
    storageService.getRegisteredOwners()
  );

  const [registeredTenants] = useState<TenantAccount[]>(() =>
    storageService.getRegisteredTenants()
  );

  const [currentOwner, setCurrentOwner] = useState<OwnerAccount | null>(() => {
    const activeId = storageService.getActiveOwnerId();
    if (!activeId) return null;
    return storageService.getOwnerAccountById(activeId);
  });

  const [currentTenant, setCurrentTenant] = useState<TenantAccount | null>(() => {
    const activeTenantId = storageService.getActiveTenantId();
    return storageService.getTenantAccountById(activeTenantId);
  });

  const refreshOwners = useCallback(() => {
    const owners = storageService.getRegisteredOwners();
    setRegisteredOwners(owners);
  }, []);

  const refreshTenant = useCallback(() => {
    const activeTenantId = storageService.getActiveTenantId();
    const t = storageService.getTenantAccountById(activeTenantId);
    setCurrentTenant(t);
  }, []);

  const loginAsSuperAdmin = useCallback(() => {
    storageService.setActiveRole('superadmin');
    setCurrentRole('superadmin');
  }, []);

  const loginAsTenant = useCallback((tenantId: string): { success: boolean; error?: string } => {
    const t = storageService.getTenantAccountById(tenantId);
    if (!t) return { success: false, error: 'Tenant record not found.' };

    storageService.setActiveRole('tenant');
    storageService.setActiveTenantId(tenantId);
    setCurrentTenant(t);
    setCurrentRole('tenant');
    return { success: true };
  }, []);

  const loginAsOwner = useCallback((ownerId: string): { success: boolean; error?: string } => {
    const account = storageService.getOwnerAccountById(ownerId);
    if (!account) return { success: false, error: 'Owner account not found.' };

    storageService.setActiveRole('owner');
    storageService.setActiveOwnerId(account.id);
    setCurrentRole('owner');
    setCurrentOwner(account);
    refreshOwners();
    return { success: true };
  }, [refreshOwners]);

  const switchRole = useCallback((role: UserRole, targetId?: string) => {
    if (role === 'superadmin') {
      loginAsSuperAdmin();
    } else if (role === 'tenant') {
      loginAsTenant(targetId || 'tnt_02');
    } else {
      loginAsOwner(targetId || currentOwner?.id || 'usr_owner_01');
    }
  }, [loginAsSuperAdmin, loginAsTenant, loginAsOwner, currentOwner]);

  const login = useCallback(
    ({ email, password }: LoginCredentials): { success: boolean; error?: string } => {
      const cleanEmail = email.trim().toLowerCase();

      // Check Super Admin login
      if (cleanEmail === SUPER_ADMIN_ACCOUNT.email.toLowerCase()) {
        loginAsSuperAdmin();
        return { success: true };
      }

      // Check Tenant login
      const matchedTenant = registeredTenants.find(t => t.email.toLowerCase() === cleanEmail);
      if (matchedTenant) {
        return loginAsTenant(matchedTenant.id);
      }

      // Check Owner account
      const account = storageService.getOwnerAccountByEmail(cleanEmail);
      if (!account) {
        return {
          success: false,
          error: `No registered account found with email "${email}".`
        };
      }

      if (password && account.password && account.password !== password) {
        return {
          success: false,
          error: 'Invalid password. Please check your credentials or use quick sign-in.'
        };
      }

      return loginAsOwner(account.id);
    },
    [loginAsSuperAdmin, loginAsTenant, loginAsOwner, registeredTenants]
  );

  const quickLogin = useCallback(
    (ownerId: string): { success: boolean; error?: string } => {
      return loginAsOwner(ownerId);
    },
    [loginAsOwner]
  );

  const logout = useCallback(() => {
    storageService.setActiveOwnerId(null);
    storageService.setActiveTenantId(null);
    setCurrentOwner(null);
    setCurrentTenant(null);
    storageService.setActiveRole('owner');
    setCurrentRole('owner');
  }, []);

  const switchOwner = useCallback(
    (ownerId: string): { success: boolean; error?: string } => {
      return loginAsOwner(ownerId);
    },
    [loginAsOwner]
  );

  const register = useCallback(
    (data: RegisterOwnerInput): { success: boolean; error?: string } => {
      try {
        const newOwner = storageService.registerOwner(data);
        storageService.setActiveRole('owner');
        storageService.setActiveOwnerId(newOwner.id);
        setCurrentRole('owner');
        setCurrentOwner(newOwner);
        refreshOwners();
        return { success: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Registration failed.';
        return { success: false, error: message };
      }
    },
    [refreshOwners]
  );

  const updateCurrentProfile = useCallback(
    (updates: Partial<OwnerProfile>) => {
      if (!currentOwner) return;
      storageService.saveOwnerProfile(currentOwner.id, {
        ...currentOwner,
        ...updates
      });
      const updated = storageService.getOwnerAccountById(currentOwner.id);
      if (updated) {
        setCurrentOwner(updated);
        refreshOwners();
      }
    },
    [currentOwner, refreshOwners]
  );

  // Sync state if another tab or window updates localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'staynest_active_owner_id_v2') {
        const activeId = storageService.getActiveOwnerId();
        setCurrentOwner(activeId ? storageService.getOwnerAccountById(activeId) : null);
      }
      if (e.key === 'staynest_active_role_v2') {
        setCurrentRole(storageService.getActiveRole());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const isAuthenticated = currentRole === 'superadmin' ? true : currentRole === 'tenant' ? !!currentTenant : !!currentOwner;

  const value: AuthContextValue = {
    currentRole,
    currentOwner,
    currentTenant,
    superAdmin: SUPER_ADMIN_ACCOUNT,
    isAuthenticated,
    registeredOwners,
    registeredTenants,
    login,
    quickLogin,
    loginAsSuperAdmin,
    loginAsTenant,
    switchRole,
    logout,
    switchOwner,
    register,
    updateCurrentProfile,
    refreshOwners,
    refreshTenant
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

