import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { mockUsers } from '../mock/mockData';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole;
  isPlatformOwner: boolean;
  isPGOwner: boolean;
  isOwner: boolean;
  isManager: boolean;
  isTenant: boolean;
  currentResidentId?: string;
  canManageStaff: boolean;
  canManageTenants: boolean;
  canOnboardPGOwner: boolean;
  canAccessFinancials: boolean;
  allowedPropertyIds: string[];
  loginAs: (role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  registerPlatformOwner: (data: {
    name: string;
    email: string;
    phone: string;
    businessName: string;
    panNumber?: string;
    city?: string;
    initialPropertyName?: string;
    initialPropertyAddress?: string;
    initialRooms?: number;
  }) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nivaas_auth_user');
    // Default to Rajesh Sharma (PG Owner) or Platform Admin
    return saved ? JSON.parse(saved) : mockUsers[1] || mockUsers[0];
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('nivaas_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('nivaas_auth_user');
    }
  }, [currentUser]);

  const loginAs = (role: UserRole) => {
    const user = mockUsers.find((u) => u.role === role) || mockUsers[0];
    setCurrentUser(user);
  };

  const switchRole = (role: UserRole) => {
    loginAs(role);
  };

  const registerPlatformOwner = async (data: {
    name: string;
    email: string;
    phone: string;
    businessName: string;
    panNumber?: string;
    city?: string;
    initialPropertyName?: string;
    initialPropertyAddress?: string;
    initialRooms?: number;
  }) => {
    const result = await api.createPlatformOwnerAccount(data);
    setCurrentUser(result.user);
    return result.user;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const isPlatformOwner = currentUser?.role === 'platform_owner';
  const isPGOwner = currentUser?.role === 'pg_owner' || currentUser?.role === 'owner';
  const isManager = currentUser?.role === 'manager';
  const isTenant = currentUser?.role === 'tenant';
  const currentResidentId = currentUser?.residentId || (isTenant ? 'res_2' : undefined);
  
  // Platform Owner has limited right: ONLY boards PG Owners
  const canOnboardPGOwner = isPlatformOwner;
  
  // PG Owner has rights to add staff for their PG and add tenants
  const canManageStaff = isPGOwner;
  const canManageTenants = isPGOwner || isManager;
  const canAccessFinancials = isPGOwner;
  const isOwner = isPGOwner || isPlatformOwner;

  const allowedPropertyIds = isPGOwner || isPlatformOwner
    ? ['prop_1', 'prop_2', 'prop_3']
    : currentUser?.assignedPropertyIds || ['prop_1'];

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser?.role || 'pg_owner',
        isPlatformOwner,
        isPGOwner,
        isOwner,
        isManager,
        isTenant,
        currentResidentId,
        canManageStaff,
        canManageTenants,
        canOnboardPGOwner,
        canAccessFinancials,
        allowedPropertyIds,
        loginAs,
        logout,
        switchRole,
        registerPlatformOwner,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
