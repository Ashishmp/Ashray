import React, { useState, useEffect } from 'react';
import { Property, PropertyType } from '../../types';
import { Modal } from '../../components/common/Modal';

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (propertyData: any) => Promise<void>;
  initialData?: Property | null;
  isLoading?: boolean;
}

const AVAILABLE_AMENITIES = [
  'High-Speed Wi-Fi',
  'Power Backup 24x7',
  '3 North/South Meals',
  'Daily Housekeeping',
  'Washing Machines',
  'CCTV Surveillance',
  'Biometric Access',
  'Gym & Lounge',
  'RO Drinking Water',
  'Two-Wheeler Parking',
  'Attached Bathrooms',
  'Split AC Units',
];

export const PropertyModal: React.FC<PropertyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'co-living' as PropertyType,
    address: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '',
    contactPhone: '',
    contactEmail: '',
    managerId: 'usr_mgr_1',
    managerName: 'Vikram Gowda',
    totalRooms: 10,
    totalBeds: 20,
    amenities: [] as string[],
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        code: initialData.code,
        type: initialData.type,
        address: initialData.address,
        city: initialData.city,
        state: initialData.state,
        pincode: initialData.pincode,
        contactPhone: initialData.contactPhone,
        contactEmail: initialData.contactEmail,
        managerId: initialData.managerId,
        managerName: initialData.managerName,
        totalRooms: initialData.totalRooms,
        totalBeds: initialData.totalBeds,
        amenities: initialData.amenities || [],
        imageUrl: initialData.imageUrl,
        description: initialData.description || '',
      });
    } else {
      setFormData({
        name: '',
        code: '',
        type: 'co-living',
        address: '',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '',
        contactPhone: '',
        contactEmail: '',
        managerId: 'usr_mgr_1',
        managerName: 'Vikram Gowda',
        totalRooms: 10,
        totalBeds: 20,
        amenities: ['High-Speed Wi-Fi', 'Power Backup 24x7', 'Daily Housekeeping'],
        imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600',
        description: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Property name is required';
    if (!formData.address.trim()) newErrors.address = 'Street address is required';
    if (!formData.pincode.trim() || formData.pincode.length !== 6) {
      newErrors.pincode = 'Valid 6-digit Indian PIN code required';
    }
    if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      ...formData,
      status: 'active',
      code: formData.code || `NV-${formData.name.substring(0, 3).toUpperCase()}`,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit PG Property' : 'Add New PG Property'}
      subtitle="Configure property address, type, capacity, and operational amenities"
      maxWidth="2xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#716A63] hover:text-[#24211F] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-[#B85C38] hover:bg-[#984629] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            {isLoading ? 'Saving...' : initialData ? 'Update Property' : 'Save Property'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Name & Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-[#24211F] mb-1">
              Property Name <span className="text-[#D64545]">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Nivaas Residency - HSR Layout"
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] focus:border-[#B85C38] outline-none"
            />
            {errors.name && <p className="text-[#D64545] text-[11px] mt-0.5">{errors.name}</p>}
          </div>

          <div>
            <label className="block font-semibold text-[#24211F] mb-1">
              Property Category <span className="text-[#D64545]">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as PropertyType })}
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] focus:border-[#B85C38] outline-none"
            >
              <option value="co-living">Co-Living PG</option>
              <option value="boys">Boys PG</option>
              <option value="girls">Girls PG (Ladies Hostel)</option>
            </select>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block font-semibold text-[#24211F] mb-1">
            Address / Street Line <span className="text-[#D64545]">*</span>
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Plot 42, 8th Main, 4th Block, Koramangala"
            className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] focus:border-[#B85C38] outline-none"
          />
          {errors.address && <p className="text-[#D64545] text-[11px] mt-0.5">{errors.address}</p>}
        </div>

        {/* City, State, PIN */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-[#24211F] mb-1">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#24211F] mb-1">State</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#24211F] mb-1">
              PIN Code <span className="text-[#D64545]">*</span>
            </label>
            <input
              type="text"
              maxLength={6}
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              placeholder="560034"
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
            />
            {errors.pincode && <p className="text-[#D64545] text-[11px] mt-0.5">{errors.pincode}</p>}
          </div>
        </div>

        {/* Contact Phone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-[#24211F] mb-1">
              Contact Phone <span className="text-[#D64545]">*</span>
            </label>
            <input
              type="text"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              placeholder="+91 80 4123 4567"
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
            />
            {errors.contactPhone && (
              <p className="text-[#D64545] text-[11px] mt-0.5">{errors.contactPhone}</p>
            )}
          </div>
          <div>
            <label className="block font-semibold text-[#24211F] mb-1">Contact Email</label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              placeholder="contact@nivaas.in"
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
            />
          </div>
        </div>

        {/* Capacity & Manager */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-[#24211F] mb-1">Total Rooms</label>
            <input
              type="number"
              min={1}
              value={formData.totalRooms}
              onChange={(e) => setFormData({ ...formData, totalRooms: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#24211F] mb-1">Total Beds</label>
            <input
              type="number"
              min={1}
              value={formData.totalBeds}
              onChange={(e) => setFormData({ ...formData, totalBeds: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#24211F] mb-1">Assigned Manager</label>
            <select
              value={formData.managerName}
              onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
            >
              <option value="Vikram Gowda">Vikram Gowda</option>
              <option value="Sunita Rao">Sunita Rao</option>
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>
        </div>

        {/* Amenities Selection */}
        <div>
          <label className="block font-semibold text-[#24211F] mb-1.5">Amenities Offered</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {AVAILABLE_AMENITIES.map((amenity) => {
              const checked = formData.amenities.includes(amenity);
              return (
                <button
                  type="button"
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-2.5 py-1.5 rounded-lg border text-left transition-colors flex items-center gap-2 ${
                    checked
                      ? 'bg-[#FDF4F0] border-[#B85C38] text-[#B85C38] font-semibold'
                      : 'bg-white border-[#E8E1D9] text-[#716A63] hover:border-stone-300'
                  }`}
                >
                  <span
                    className={`w-3 h-3 rounded flex items-center justify-center text-[10px] ${
                      checked ? 'bg-[#B85C38] text-white' : 'border border-[#E8E1D9]'
                    }`}
                  >
                    {checked ? '✓' : ''}
                  </span>
                  <span className="truncate">{amenity}</span>
                </button>
              );
            })}
          </div>
        </div>
      </form>
    </Modal>
  );
};
