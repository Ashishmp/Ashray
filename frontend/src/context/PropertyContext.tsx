import React, { createContext, useContext, useState, useEffect } from 'react';
import { Property } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface PropertyContextType {
  properties: Property[];
  selectedPropertyId: string; // 'all' or specific property id
  selectedProperty: Property | undefined;
  setSelectedPropertyId: (id: string) => void;
  dateRange: string;
  setDateRange: (range: string) => void;
  refreshProperties: () => Promise<void>;
  isLoading: boolean;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOwner, allowedPropertyIds } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('oct_2026');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProperties = async () => {
    setIsLoading(true);
    try {
      const allProps = await api.getProperties();
      // Filter by permissions if manager
      const accessible = isOwner
        ? allProps
        : allProps.filter((p) => allowedPropertyIds.includes(p.id));
      setProperties(accessible);

      // If manager cannot see 'all', auto-select their first property
      if (!isOwner && (selectedPropertyId === 'all' || !allowedPropertyIds.includes(selectedPropertyId))) {
        if (accessible.length > 0) {
          setSelectedPropertyId(accessible[0].id);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProperties();
  }, [isOwner, allowedPropertyIds]);

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);

  return (
    <PropertyContext.Provider
      value={{
        properties,
        selectedPropertyId,
        selectedProperty,
        setSelectedPropertyId,
        dateRange,
        setDateRange,
        refreshProperties,
        isLoading,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperty = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
};
