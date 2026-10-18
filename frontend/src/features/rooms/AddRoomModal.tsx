import React, { useState } from 'react';
import { RoomSharingType, ACType, WashroomType } from '../../types';
import { useProperty } from '../../context/PropertyContext';
import { Modal } from '../../components/common/Modal';

interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roomData: any) => Promise<void>;
  isLoading?: boolean;
}

export const AddRoomModal: React.FC<AddRoomModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const { properties, selectedPropertyId } = useProperty();

  const [propertyId, setPropertyId] = useState(
    selectedPropertyId !== 'all' ? selectedPropertyId : properties[0]?.id || 'prop_1'
  );
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState(1);
  const [type, setType] = useState<RoomSharingType>('double');
  const [baseRentPerBed, setBaseRentPerBed] = useState(11000);
  const [acType, setAcType] = useState<ACType>('ac');
  const [washroomType, setWashroomType] = useState<WashroomType>('attached');
  const [hasBalcony, setHasBalcony] = useState(false);
  const [amenities, setAmenities] = useState<string[]>(['Cupboards', 'Study Table', 'Attached Bath']);
  const [error, setError] = useState('');

  const typeBedsMap: Record<RoomSharingType, number> = {
    single: 1,
    double: 2,
    triple: 3,
    four: 4,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim()) {
      setError('Please provide a room number (e.g. 101, 204)');
      return;
    }

    const selectedProp = properties.find((p) => p.id === propertyId);

    await onSubmit({
      propertyId,
      propertyName: selectedProp?.name || 'Nivaas Comforts',
      roomNumber: roomNumber.trim(),
      floor,
      type,
      totalBeds: typeBedsMap[type],
      baseRentPerBed: Number(baseRentPerBed),
      acType,
      washroomType,
      hasBalcony,
      amenities,
    });
    setRoomNumber('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Room"
      subtitle="Configure room configuration, sharing beds, and amenities"
      maxWidth="lg"
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
            {isLoading ? 'Creating Room...' : 'Create Room & Beds'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Property & Room Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-[#24211F] mb-1">Select Property</label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#24211F] mb-1">
              Room Number <span className="text-[#D64545]">*</span>
            </label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="e.g. 104, 205"
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
            />
            {error && <p className="text-[#D64545] text-[11px] mt-0.5">{error}</p>}
          </div>
        </div>

        {/* Floor & Sharing Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-[#24211F] mb-1">Floor Level</label>
            <select
              value={floor}
              onChange={(e) => setFloor(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
            >
              <option value={0}>Ground Floor</option>
              <option value={1}>1st Floor</option>
              <option value={2}>2nd Floor</option>
              <option value={3}>3rd Floor</option>
              <option value={4}>4th Floor</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#24211F] mb-1">Sharing Type</label>
            <select
              value={type}
              onChange={(e) => {
                const newType = e.target.value as RoomSharingType;
                setType(newType);
                if (newType === 'single') setBaseRentPerBed(16000);
                if (newType === 'double') setBaseRentPerBed(11000);
                if (newType === 'triple') setBaseRentPerBed(8500);
                if (newType === 'four') setBaseRentPerBed(7000);
              }}
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
            >
              <option value="single">Single Room (1 Bed)</option>
              <option value="double">Double Sharing (2 Beds)</option>
              <option value="triple">Triple Sharing (3 Beds)</option>
              <option value="four">Four Sharing (4 Beds)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#24211F] mb-1">Rent / Bed (₹)</label>
            <input
              type="number"
              step={500}
              value={baseRentPerBed}
              onChange={(e) => setBaseRentPerBed(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
            />
          </div>
        </div>

        {/* Features: AC, Washroom, Balcony */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-[#24211F] mb-1">Cooling</label>
            <select
              value={acType}
              onChange={(e) => setAcType(e.target.value as ACType)}
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
            >
              <option value="ac">Air Conditioned (AC)</option>
              <option value="non-ac">Non-AC (Ceiling Fan)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#24211F] mb-1">Bathroom</label>
            <select
              value={washroomType}
              onChange={(e) => setWashroomType(e.target.value as WashroomType)}
              className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
            >
              <option value="attached">Attached Bathroom</option>
              <option value="common">Common Corridor Bath</option>
            </select>
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-[#24211F]">
              <input
                type="checkbox"
                checked={hasBalcony}
                onChange={(e) => setHasBalcony(e.target.checked)}
                className="w-4 h-4 text-[#B85C38] rounded border-[#E8E1D9]"
              />
              <span>Has Balcony</span>
            </label>
          </div>
        </div>
      </form>
    </Modal>
  );
};
