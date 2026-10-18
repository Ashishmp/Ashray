import React, { useState, useEffect } from 'react';
import {
  BedDouble,
  Plus,
  Search,
  Filter,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  Wind,
  Bath,
  Maximize2,
  UserPlus,
} from 'lucide-react';
import { Room, Bed } from '../../types';
import { api } from '../../services/api';
import { useProperty } from '../../context/PropertyContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AddRoomModal } from './AddRoomModal';
import { BedAllocationModal } from './BedAllocationModal';
import { formatINR } from '../../utils/formatters';
import { NavRoute } from '../../components/layout/Sidebar';

interface RoomsPageProps {
  onNavigate: (route: NavRoute, entityId?: string) => void;
}

export const RoomsPage: React.FC<RoomsPageProps> = ({ onNavigate }) => {
  const { selectedPropertyId } = useProperty();
  const toast = useToast();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sharingFilter, setSharingFilter] = useState<string>('all');
  const [occupancyFilter, setOccupancyFilter] = useState<string>('all');

  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [selectedBedForAllocation, setSelectedBedForAllocation] = useState<Bed | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fetchedRooms, fetchedBeds] = await Promise.all([
        api.getRooms(selectedPropertyId),
        api.getBeds(selectedPropertyId),
      ]);
      setRooms(fetchedRooms);
      setBeds(fetchedBeds);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPropertyId]);

  const handleCreateRoom = async (roomData: any) => {
    await api.createRoom(roomData);
    toast.success('Room Added', `Room ${roomData.roomNumber} has been added.`);
    await fetchData();
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.propertyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSharing = sharingFilter === 'all' || room.type === sharingFilter;
    const matchesOccupancy =
      occupancyFilter === 'all'
        ? true
        : occupancyFilter === 'vacant'
        ? room.occupiedBeds < room.totalBeds
        : occupancyFilter === 'full'
        ? room.occupiedBeds >= room.totalBeds
        : room.status === 'maintenance';

    return matchesSearch && matchesSharing && matchesOccupancy;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4.5 rounded-xl border border-[#E8E1D9] shadow-2xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#716A63] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search room number..."
              className="pl-8 pr-3 py-1.5 text-xs bg-[#FFFEFC] border border-[#E8E1D9] rounded-lg text-[#24211F] placeholder-[#9E968E] outline-none w-52"
            />
          </div>

          <select
            value={sharingFilter}
            onChange={(e) => setSharingFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#FFFEFC] border border-[#E8E1D9] rounded-lg text-[#24211F] outline-none cursor-pointer"
          >
            <option value="all">All Sharing Types</option>
            <option value="single">Single Sharing</option>
            <option value="double">Double Sharing</option>
            <option value="triple">Triple Sharing</option>
            <option value="four">Four Sharing</option>
          </select>

          <select
            value={occupancyFilter}
            onChange={(e) => setOccupancyFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#FFFEFC] border border-[#E8E1D9] rounded-lg text-[#24211F] outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="vacant">Has Vacant Beds</option>
            <option value="full">Fully Occupied</option>
            <option value="maintenance">Under Maintenance</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => setIsAddRoomOpen(true)}
          className="px-3.5 py-1.5 bg-[#B85C38] hover:bg-[#984629] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Room</span>
        </button>
      </div>

      {/* Visual Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRooms.map((room) => {
          const roomBeds = beds.filter((b) => b.roomId === room.id);
          const vacantCount = room.totalBeds - room.occupiedBeds;

          return (
            <div
              key={room.id}
              className="bg-white rounded-xl border border-[#E8E1D9] shadow-sm p-5 flex flex-col justify-between hover:border-[#B85C38]/40 transition-all duration-200"
            >
              <div>
                {/* Room Header */}
                <div className="flex items-start justify-between gap-2 border-b border-[#E8E1D9] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-[#24211F]">
                        Room {room.roomNumber}
                      </span>
                      <span className="text-[11px] font-semibold text-[#716A63] bg-[#F8F6F2] px-2 py-0.5 rounded border border-[#E8E1D9]">
                        Floor {room.floor === 0 ? 'G' : room.floor}
                      </span>
                    </div>
                    <p className="text-xs text-[#716A63] mt-0.5">{room.propertyName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#B85C38]">
                      {formatINR(room.baseRentPerBed)}
                    </span>
                    <span className="block text-[10px] text-[#716A63]">per bed/month</span>
                  </div>
                </div>

                {/* Features Tags */}
                <div className="flex items-center gap-2 flex-wrap my-3 text-[11px] text-[#716A63]">
                  <span className="px-2 py-0.5 bg-[#F8F6F2] rounded border border-[#E8E1D9] capitalize">
                    {room.type} Sharing
                  </span>
                  <span className="px-2 py-0.5 bg-[#F8F6F2] rounded border border-[#E8E1D9] flex items-center gap-1">
                    <Wind className="w-3 h-3 text-[#2786B8]" />
                    {room.acType === 'ac' ? 'AC' : 'Non-AC'}
                  </span>
                  <span className="px-2 py-0.5 bg-[#F8F6F2] rounded border border-[#E8E1D9] flex items-center gap-1">
                    <Bath className="w-3 h-3 text-[#716A63]" />
                    {room.washroomType === 'attached' ? 'Attached' : 'Common'}
                  </span>
                  {room.hasBalcony && (
                    <span className="px-2 py-0.5 bg-[#EAF7F0] text-[#16845B] border border-[#C6EADB] rounded">
                      Balcony
                    </span>
                  )}
                </div>

                {/* Visual Bed Allocations Grid */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#24211F] mb-2">
                    <span>Bed Inventory</span>
                    <span
                      className={`text-[11px] font-bold ${
                        vacantCount > 0 ? 'text-[#16845B]' : 'text-[#716A63]'
                      }`}
                    >
                      {vacantCount > 0 ? `${vacantCount} Vacant` : 'Fully Occupied'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {roomBeds.map((bed) => {
                      const isOccupied = bed.status === 'occupied';
                      const isMaintenance = bed.status === 'maintenance';

                      return (
                        <div
                          key={bed.id}
                          className={`p-3 rounded-lg border text-xs flex flex-col justify-between transition-all ${
                            isOccupied
                              ? 'bg-[#EDF6FC] border-[#C5E4F5]'
                              : isMaintenance
                              ? 'bg-[#FDF0F0] border-[#F7C6C6]'
                              : 'bg-[#F0FDF4] border-[#BBF7D0] hover:shadow-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-[#24211F]">Bed {bed.bedNumber}</span>
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isOccupied
                                  ? 'bg-[#2786B8]'
                                  : isMaintenance
                                  ? 'bg-[#D64545]'
                                  : 'bg-[#16845B]'
                              }`}
                            />
                          </div>

                          {isOccupied ? (
                            <div className="mt-1">
                              <p className="font-semibold text-[#24211F] truncate text-[11px]">
                                {bed.residentName || 'Occupied'}
                              </p>
                              <span className="text-[10px] text-[#2786B8] font-medium">Occupied</span>
                            </div>
                          ) : isMaintenance ? (
                            <div className="mt-1">
                              <p className="text-[11px] text-[#D64545] font-medium">Maintenance</p>
                            </div>
                          ) : (
                            <div className="mt-2">
                              <button
                                type="button"
                                onClick={() => setSelectedBedForAllocation(bed)}
                                className="w-full py-1 text-center bg-white border border-[#BBF7D0] hover:bg-[#16845B] hover:text-white text-[#16845B] rounded text-[11px] font-semibold transition-colors"
                              >
                                + Allocate
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-3 border-t border-[#E8E1D9] flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#716A63]">
                  {room.amenities.slice(0, 2).join(' • ')}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('residents')}
                  className="text-[11px] font-semibold text-[#B85C38] hover:underline"
                >
                  View Residents →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Room Modal */}
      <AddRoomModal
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
        onSubmit={handleCreateRoom}
      />

      {/* Bed Allocation Modal */}
      <BedAllocationModal
        isOpen={!!selectedBedForAllocation}
        onClose={() => setSelectedBedForAllocation(null)}
        bed={selectedBedForAllocation}
        onSuccess={() => {
          toast.success('Bed Allocated', 'Resident has been assigned to the bed.');
          fetchData();
        }}
      />
    </div>
  );
};
