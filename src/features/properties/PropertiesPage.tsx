import React, { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Search,
  LayoutGrid,
  Table as TableIcon,
  MapPin,
  Phone,
  BedDouble,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PropertyModal } from './components/PropertyModal';
import { PropertyDetailsModal } from './components/PropertyDetailsModal';
import { Property, PropertyType, PropertyStatus } from '../../types/property';
import { formatPhone } from '../../utils/formatters';

export const PropertiesPage: React.FC = () => {
  const { properties, rooms, addProperty, updateProperty, deleteProperty } = useApp();
  const { showToast } = useToast();

  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [detailsProperty, setDetailsProperty] = useState<Property | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  // Compute property metrics
  const propertiesWithMetrics = useMemo(() => {
    return properties.map(property => {
      const propRooms = rooms.filter(r => r.propertyId === property.id);
      const totalBeds = propRooms.reduce((acc, r) => acc + r.capacity, 0);
      const occupiedBeds = propRooms.reduce((acc, r) => acc + r.occupiedBeds, 0);
      const availableBeds = propRooms.reduce((acc, r) => acc + r.availableBeds, 0);
      const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

      return {
        ...property,
        calculatedRooms: propRooms.length,
        calculatedBeds: totalBeds,
        occupiedBeds,
        availableBeds,
        occupancyRate
      };
    });
  }, [properties, rooms]);

  // Filtered list
  const filteredProperties = useMemo(() => {
    return propertiesWithMetrics.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || p.type === filterType;
      const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [propertiesWithMetrics, searchQuery, filterType, filterStatus]);

  const handleDelete = () => {
    if (propertyToDelete) {
      deleteProperty(propertyToDelete.id);
      showToast('Property Removed', `${propertyToDelete.name} has been archived.`, 'info');
      setPropertyToDelete(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="PG Properties"
        subtitle={`Managing ${properties.length} PG properties across Bengaluru & Gurugram`}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <div
              style={{
                display: 'flex',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-surface)'
              }}
            >
              <button
                type="button"
                className={`btn-ghost ${viewMode === 'cards' ? 'active' : ''}`}
                style={{
                  padding: '8px 12px',
                  backgroundColor: viewMode === 'cards' ? 'var(--slate-100)' : 'transparent',
                  color: viewMode === 'cards' ? 'var(--primary-600)' : 'var(--text-secondary)'
                }}
                onClick={() => setViewMode('cards')}
                title="Grid view"
                aria-label="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                className={`btn-ghost ${viewMode === 'table' ? 'active' : ''}`}
                style={{
                  padding: '8px 12px',
                  backgroundColor: viewMode === 'table' ? 'var(--slate-100)' : 'transparent',
                  color: viewMode === 'table' ? 'var(--primary-600)' : 'var(--text-secondary)'
                }}
                onClick={() => setViewMode('table')}
                title="Table view"
                aria-label="Table view"
              >
                <TableIcon size={16} />
              </button>
            </div>
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Property
            </Button>
          </div>
        }
      />

      {/* Filter and Search Toolbar */}
      <div className="toolbar-container">
        <div className="toolbar-filters">
          <div className="filter-search-box">
            <Search className="filter-search-icon" size={16} />
            <input
              type="text"
              placeholder="Filter by name, locality, or city..."
              className="form-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <Select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            options={[
              { value: 'all', label: 'All Property Types' },
              { value: 'Gents', label: 'Gents PG' },
              { value: 'Ladies', label: 'Ladies PG' },
              { value: 'Co-living', label: 'Co-living' }
            ]}
          />

          <Select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'Active', label: 'Active' },
              { value: 'Under Renovation', label: 'Under Renovation' },
              { value: 'Inactive', label: 'Inactive' }
            ]}
          />
        </div>
      </div>

      {/* Content View: Cards vs Table */}
      {filteredProperties.length === 0 ? (
        <EmptyState
          icon={<Building2 size={32} />}
          title="No properties match your filter"
          description="Try clearing your search terms or register a new PG accommodation property."
          actionText="Add New Property"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : viewMode === 'cards' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '20px'
          }}
        >
          {filteredProperties.map(property => (
            <div key={property.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="card-header" style={{ padding: '16px 20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <StatusBadge status={property.type} size="sm" />
                    <StatusBadge status={property.status} size="sm" />
                  </div>
                  <h3 className="card-title" style={{ fontSize: '1.1rem' }}>
                    {property.name}
                  </h3>
                </div>
              </div>

              <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--slate-400)' }} />
                  <span>
                    {property.address}, {property.city} - {property.pinCode}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <Phone size={16} style={{ flexShrink: 0, color: 'var(--slate-400)' }} />
                  <span>{formatPhone(property.contactPhone)}</span>
                </div>

                {/* Capacity & Occupancy Meter */}
                <div
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--slate-50)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Occupancy: <strong>{property.occupiedBeds} / {property.calculatedBeds} Beds</strong>
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>
                      {property.occupancyRate}%
                    </span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'var(--slate-200)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${property.occupancyRate}%`,
                        backgroundColor:
                          property.occupancyRate > 85
                            ? 'var(--success-500)'
                            : property.occupancyRate > 50
                            ? 'var(--primary-500)'
                            : 'var(--warning-500)',
                        borderRadius: '9999px'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '6px' }}>
                    <span>{property.calculatedRooms} Rooms ({property.numberOfFloors} Floors)</span>
                    <span style={{ color: property.availableBeds > 0 ? 'var(--success-700)' : 'var(--danger-700)', fontWeight: 600 }}>
                      {property.availableBeds} Vacant Beds
                    </span>
                  </div>
                </div>

                {/* Amenity tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {property.amenities.slice(0, 4).map(a => (
                    <span
                      key={a}
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: 'var(--slate-100)',
                        color: 'var(--slate-700)'
                      }}
                    >
                      {a}
                    </span>
                  ))}
                  {property.amenities.length > 4 && (
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', alignSelf: 'center' }}>
                      +{property.amenities.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              <div className="card-footer" style={{ justifyContent: 'space-between' }}>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Eye size={14} />}
                  onClick={() => setDetailsProperty(property)}
                >
                  View Details
                </Button>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ padding: '6px', color: 'var(--text-secondary)' }}
                    onClick={() => setEditingProperty(property)}
                    title="Edit Property"
                    aria-label="Edit Property"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ padding: '6px', color: 'var(--danger-600)' }}
                    onClick={() => setPropertyToDelete(property)}
                    title="Archive Property"
                    aria-label="Archive Property"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Type</th>
                <th>City & Contact</th>
                <th>Rooms</th>
                <th>Capacity & Occupancy</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map(property => (
                <tr key={property.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{property.name}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
                      {property.address}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={property.type} size="sm" />
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{property.city}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
                      {formatPhone(property.contactPhone)}
                    </div>
                  </td>
                  <td>
                    {property.calculatedRooms} Rms ({property.numberOfFloors} Flrs)
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>
                      {property.occupiedBeds} / {property.calculatedBeds} Beds ({property.occupancyRate}%)
                    </div>
                    <div style={{ fontSize: '11px', color: property.availableBeds > 0 ? 'var(--success-700)' : 'var(--danger-600)' }}>
                      {property.availableBeds} Available
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={property.status} size="sm" />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '4px' }}>
                      <button
                        type="button"
                        className="btn-ghost"
                        style={{ padding: '6px' }}
                        onClick={() => setDetailsProperty(property)}
                        title="View Details"
                        aria-label="View Details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn-ghost"
                        style={{ padding: '6px' }}
                        onClick={() => setEditingProperty(property)}
                        title="Edit Property"
                        aria-label="Edit Property"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn-ghost"
                        style={{ padding: '6px', color: 'var(--danger-600)' }}
                        onClick={() => setPropertyToDelete(property)}
                        title="Archive Property"
                        aria-label="Archive Property"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      <PropertyModal
        isOpen={isAddModalOpen || Boolean(editingProperty)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProperty(null);
        }}
        onSubmit={data => {
          if (editingProperty) {
            updateProperty(editingProperty.id, data);
          } else {
            addProperty(data);
          }
        }}
        initialData={editingProperty || undefined}
      />

      {/* Details Modal */}
      <PropertyDetailsModal
        isOpen={Boolean(detailsProperty)}
        onClose={() => setDetailsProperty(null)}
        property={detailsProperty}
        onEdit={prop => {
          setDetailsProperty(null);
          setEditingProperty(prop);
        }}
      />

      {/* Archive / Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(propertyToDelete)}
        onClose={() => setPropertyToDelete(null)}
        onConfirm={handleDelete}
        title="Archive Property"
        message={`Are you sure you want to archive "${propertyToDelete?.name}"? All associated rooms and active tenants will be archived.`}
        confirmText="Archive Property"
      />
    </div>
  );
};
