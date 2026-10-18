import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storageService } from '../services/storageService';
import { OwnerAccount, LoginCredentials, RegisterOwnerInput } from '../types/auth';
import { OwnerProfile } from '../types/common';

interface AuthContextValue {
  currentOwner: OwnerAccount | null;
  isAuthenticated: boolean;
  registeredOwners: OwnerAccount[];
  login: (credentials: LoginCredentials) => { success: boolean; error?: string };
  quickLogin: (ownerId: string) => { success: boolean; error?: string };
  logout: () => void;
  switchOwner: (ownerId: string) => { success: boolean; error?: string };
  register: (data: RegisterOwnerInput) => { success: boolean; error?: string };
  updateCurrentProfile: (updates: Partial<OwnerProfile>) => void;
  refreshOwners: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [registeredOwners, setRegisteredOwners] = useState<OwnerAccount[]>(() =>
    storageService.getRegisteredOwners()
  );

  const [currentOwner, setCurrentOwner] = useState<OwnerAccount | null>(() => {
    const activeId = storageService.getActiveOwnerId();
    if (!activeId) return null;
    return storageService.getOwnerAccountById(activeId);
  });

  const refreshOwners = useCallback(() => {
    const owners = storageService.getRegisteredOwners();
    setRegisteredOwners(owners);
  }, []);

  const login = useCallback(
    ({ email, password }: LoginCredentials): { success: boolean; error?: string } => {
      const cleanEmail = email.trim().toLowerCase();
      const account = storageService.getOwnerAccountByEmail(cleanEmail);

      if (!account) {
        return {
          success: false,
          error: `No registered owner account found with email "${email}".`
        };
      }

      if (password && account.password && account.password !== password) {
        return {
          success: false,
          error: 'Invalid password. Please check your password or use quick sign-in.'
        };
      }

      storageService.setActiveOwnerId(account.id);
      setCurrentOwner(account);
      refreshOwners();
      return { success: true };
    },
    [refreshOwners]
  );

  const quickLogin = useCallback(
    (ownerId: string): { success: boolean; error?: string } => {
      const account = storageService.getOwnerAccountById(ownerId);
      if (!account) {
        return { success: false, error: 'Owner account not found.' };
      }
      storageService.setActiveOwnerId(account.id);
      setCurrentOwner(account);
      refreshOwners();
      return { success: true };
    },
    [refreshOwners]
  );

  const logout = useCallback(() => {
    storageService.setActiveOwnerId(null);
    setCurrentOwner(null);
  }, []);

  const switchOwner = useCallback(
    (ownerId: string): { success: boolean; error?: string } => {
      return quickLogin(ownerId);
    },
    [quickLogin]
  );

  const register = useCallback(
    (data: RegisterOwnerInput): { success: boolean; error?: string } => {
      try {
        const newOwner = storageService.registerOwner(data);
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
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value: AuthContextValue = {
    currentOwner,
    isAuthenticated: !!currentOwner,
    registeredOwners,
    login,
    quickLogin,
    logout,
    switchOwner,
    register,
    updateCurrentProfile,
    refreshOwners
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
