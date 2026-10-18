import React, { useState } from 'react';
import {
  Building2,
  Plus,
  BedDouble,
  Users,
  MapPin,
  Phone,
  Edit2,
  Archive,
  LayoutGrid,
  List,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Property } from '../../types';
import { useProperty } from '../../context/PropertyContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { PropertyModal } from './PropertyModal';
import { formatINR } from '../../utils/formatters';
import { NavRoute } from '../../components/layout/Sidebar';

interface PropertiesPageProps {
  onNavigate: (route: NavRoute, entityId?: string) => void;
}

export const PropertiesPage: React.FC<PropertiesPageProps> = ({ onNavigate }) => {
  const { properties, refreshProperties, setSelectedPropertyId } = useProperty();
  const { isOwner } = useAuth();
  const toast = useToast();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [propertyToArchive, setPropertyToArchive] = useState<Property | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.address.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.city.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesType = selectedType === 'all' || p.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleSaveProperty = async (data: any) => {
    if (editingProperty) {
      await api.updateProperty(editingProperty.id, data);
      toast.success('Property Updated', `${data.name} details have been saved.`);
    } else {
      await api.createProperty(data);
      toast.success('Property Added', `${data.name} has been added to Nivaas.`);
    }
    await refreshProperties();
    setIsAddModalOpen(false);
    setEditingProperty(null);
  };

  const handleArchiveProperty = async () => {
    if (!propertyToArchive) return;
    await api.archiveProperty(propertyToArchive.id);
    toast.warning('Property Archived', `${propertyToArchive.name} marked as archived.`);
    await refreshProperties();
    setPropertyToArchive(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4.5 rounded-xl border border-[#E8E1D9] shadow-2xs">
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search properties by name or area..."
            className="px-3 py-1.5 text-xs bg-[#FFFEFC] border border-[#E8E1D9] rounded-lg text-[#24211F] placeholder-[#9E968E] outline-none w-64"
          />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#FFFEFC] border border-[#E8E1D9] rounded-lg text-[#24211F] outline-none cursor-pointer"
          >
            <option value="all">All Types (Co-living, Boys, Girls)</option>
            <option value="co-living">Co-Living</option>
            <option value="boys">Boys PG</option>
            <option value="girls">Girls PG</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center border border-[#E8E1D9] rounded-lg p-0.5 bg-[#FFFEFC]">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#B85C38] text-white shadow-2xs'
                  : 'text-[#716A63] hover:text-[#24211F]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'table'
                  ? 'bg-[#B85C38] text-white shadow-2xs'
                  : 'text-[#716A63] hover:text-[#24211F]'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {isOwner && (
            <button
              type="button"
              onClick={() => {
                setEditingProperty(null);
                setIsAddModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-[#B85C38] hover:bg-[#984629] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Property</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => {
            const occupancyPct =
              property.totalBeds > 0
                ? Math.round((property.occupiedBeds / property.totalBeds) * 100)
                : 0;

            return (
              <div
                key={property.id}
                className="bg-white rounded-xl border border-[#E8E1D9] shadow-sm overflow-hidden flex flex-col hover:border-[#B85C38]/40 transition-all duration-200"
              >
                {/* Photo & Badges */}
                <div className="relative h-44 bg-stone-200 overflow-hidden">
                  <img
                    src={property.imageUrl}
                    alt={property.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <StatusBadge status={property.type} />
                  </div>
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={property.status} />
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-[#24211F]">{property.name}</h3>
                      <span className="text-[11px] font-mono text-[#716A63] bg-[#F8F6F2] px-1.5 py-0.5 rounded border border-[#E8E1D9]">
                        {property.code}
                      </span>
                    </div>

                    <p className="text-xs text-[#716A63] flex items-center gap-1 mt-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#B85C38] shrink-0" />
                      <span className="truncate">{property.address}, {property.city}</span>
                    </p>

                    {/* Occupancy bar */}
                    <div className="mt-4 p-3 bg-[#F8F6F2] rounded-lg border border-[#E8E1D9]">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-[#716A63]">Occupancy ({occupancyPct}%)</span>
                        <span className="font-bold text-[#24211F]">
                          {property.occupiedBeds} / {property.totalBeds} Beds
                        </span>
                      </div>
                      <div className="w-full bg-[#E8E1D9] rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#B85C38] h-2 rounded-full transition-all duration-500"
                          style={{ width: `${occupancyPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                      <div className="p-2 rounded bg-[#FFFEFC] border border-[#E8E1D9]">
                        <p className="text-[#716A63] text-[11px]">Total Rooms</p>
                        <p className="font-semibold text-[#24211F] mt-0.5">
                          {property.totalRooms} Rooms
                        </p>
                      </div>
                      <div className="p-2 rounded bg-[#FFFEFC] border border-[#E8E1D9]">
                        <p className="text-[#716A63] text-[11px]">Property Manager</p>
                        <p className="font-semibold text-[#24211F] mt-0.5 truncate">
                          {property.managerName}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-5 pt-3.5 border-t border-[#E8E1D9] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPropertyId(property.id);
                        onNavigate('rooms');
                      }}
                      className="text-xs font-semibold text-[#B85C38] hover:text-[#984629] flex items-center gap-1"
                    >
                      <span>Manage Rooms</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1">
                      {isOwner && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProperty(property);
                              setIsAddModalOpen(true);
                            }}
                            className="p-1.5 text-[#716A63] hover:text-[#24211F] hover:bg-[#F8F6F2] rounded-md transition-colors"
                            title="Edit Property"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPropertyToArchive(property)}
                            className="p-1.5 text-[#716A63] hover:text-[#D64545] hover:bg-rose-50 rounded-md transition-colors"
                            title="Archive Property"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-[#E8E1D9] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FFFEFC] border-b border-[#E8E1D9] text-[#716A63] font-semibold uppercase text-[11px]">
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4">Rooms</th>
                  <th className="py-3 px-4">Beds (Occupied / Total)</th>
                  <th className="py-3 px-4">Occupancy %</th>
                  <th className="py-3 px-4">Manager</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D9]">
                {filteredProperties.map((p) => {
                  const pct = p.totalBeds > 0 ? Math.round((p.occupiedBeds / p.totalBeds) * 100) : 0;
                  return (
                    <tr key={p.id} className="hover:bg-[#FDF4F0]/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[#24211F]">
                        {p.name}
                        <span className="block text-[11px] text-[#716A63] font-normal">{p.code}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={p.type} />
                      </td>
                      <td className="py-3.5 px-4 text-[#716A63]">
                        {p.address}, {p.city}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#24211F]">{p.totalRooms}</td>
                      <td className="py-3.5 px-4 font-medium text-[#24211F]">
                        {p.occupiedBeds} / {p.totalBeds}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#24211F]">{pct}%</span>
                      </td>
                      <td className="py-3.5 px-4 text-[#716A63]">{p.managerName}</td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPropertyId(p.id);
                            onNavigate('rooms');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-[#B85C38] hover:bg-[#FDF4F0] rounded-lg transition-colors"
                        >
                          Rooms →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Property Modal */}
      <PropertyModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProperty(null);
        }}
        onSubmit={handleSaveProperty}
        initialData={editingProperty}
      />

      {/* Archive Property Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!propertyToArchive}
        onClose={() => setPropertyToArchive(null)}
        onConfirm={handleArchiveProperty}
        title="Archive PG Property?"
        message={`Are you sure you want to archive "${propertyToArchive?.name}"? Archived properties will be hidden from daily operations until restored.`}
        confirmLabel="Archive Property"
        isDestructive={true}
      />
    </div>
  );
};
