import React, { useState, useEffect, useMemo } from 'react';
import { Search, User, BedDouble, CreditCard, ArrowRight, X } from 'lucide-react';
import { api } from '../../services/api';
import { Resident, Room, Payment } from '../../types';
import { NavRoute } from './Sidebar';
import { formatINR } from '../../utils/formatters';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: NavRoute, entityId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [residents, setResidents] = useState<Resident[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      Promise.all([api.getResidents(), api.getRooms(), api.getPayments()]).then(
        ([res, rms, pays]) => {
          setResidents(res);
          setRooms(rms);
          setPayments(pays);
        }
      );
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { residents: [], rooms: [], payments: [] };

    const matchedResidents = residents.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.roomNumber.toLowerCase().includes(q) ||
        r.propertyName.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchedRooms = rooms.filter(
      (r) =>
        r.roomNumber.toLowerCase().includes(q) ||
        r.propertyName.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedPayments = payments.filter(
      (p) =>
        p.residentName.toLowerCase().includes(q) ||
        p.receiptNumber.toLowerCase().includes(q) ||
        p.transactionRef?.toLowerCase().includes(q)
    ).slice(0, 4);

    return {
      residents: matchedResidents,
      rooms: matchedRooms,
      payments: matchedPayments,
    };
  }, [query, residents, rooms, payments]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-[#24211F]/50 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />
      <div className="flex min-h-full items-start justify-center p-4 pt-16 sm:p-6 sm:pt-20">
        <div
          className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E8E1D9] overflow-hidden animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input Bar */}
          <div className="flex items-center px-4 py-3.5 border-b border-[#E8E1D9] bg-[#FFFEFC]">
            <Search className="w-5 h-5 text-[#B85C38] shrink-0 mr-3" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by resident name, phone, room number, receipt #..."
              className="w-full bg-transparent text-sm text-[#24211F] placeholder-[#9E968E] outline-none"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-[#716A63] hover:text-[#24211F] p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <kbd className="px-2 py-0.5 text-[11px] font-mono bg-[#F8F6F2] border border-[#E8E1D9] rounded text-[#716A63]">
                ESC
              </kbd>
            )}
          </div>

          {/* Results Area */}
          <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
            {!query && (
              <div className="p-4 text-center">
                <p className="text-xs text-[#716A63]">
                  Type to search across active residents, rooms, and payment records.
                </p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <span className="text-[11px] bg-[#F8F6F2] text-[#716A63] px-2 py-1 rounded border border-[#E8E1D9]">
                    e.g. "Aakash"
                  </span>
                  <span className="text-[11px] bg-[#F8F6F2] text-[#716A63] px-2 py-1 rounded border border-[#E8E1D9]">
                    "Room 102"
                  </span>
                  <span className="text-[11px] bg-[#F8F6F2] text-[#716A63] px-2 py-1 rounded border border-[#E8E1D9]">
                    "NIV-2026"
                  </span>
                </div>
              </div>
            )}

            {query && (
              <>
                {/* Residents */}
                {filteredResults.residents.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#9E968E] flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Residents
                    </div>
                    <div className="space-y-1 mt-1">
                      {filteredResults.residents.map((r) => (
                        <div
                          key={r.id}
                          onClick={() => {
                            onClose();
                            onNavigate('residents', r.id);
                          }}
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#FDF4F0] cursor-pointer transition-colors group"
                        >
                          <div>
                            <p className="text-sm font-semibold text-[#24211F] group-hover:text-[#B85C38]">
                              {r.name}
                            </p>
                            <p className="text-xs text-[#716A63]">
                              Room {r.roomNumber}-{r.bedNumber} • {r.propertyName} • {r.phone}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#716A63] group-hover:text-[#B85C38] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rooms */}
                {filteredResults.rooms.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#9E968E] flex items-center gap-1.5">
                      <BedDouble className="w-3.5 h-3.5" /> Rooms & Sharing
                    </div>
                    <div className="space-y-1 mt-1">
                      {filteredResults.rooms.map((rm) => (
                        <div
                          key={rm.id}
                          onClick={() => {
                            onClose();
                            onNavigate('rooms', rm.id);
                          }}
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#FDF4F0] cursor-pointer transition-colors group"
                        >
                          <div>
                            <p className="text-sm font-semibold text-[#24211F] group-hover:text-[#B85C38]">
                              Room {rm.roomNumber} ({rm.type} sharing)
                            </p>
                            <p className="text-xs text-[#716A63]">
                              {rm.propertyName} • {formatINR(rm.baseRentPerBed)}/bed • {rm.occupiedBeds}/{rm.totalBeds} beds occupied
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#716A63] group-hover:text-[#B85C38] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payments */}
                {filteredResults.payments.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#9E968E] flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" /> Payments & Receipts
                    </div>
                    <div className="space-y-1 mt-1">
                      {filteredResults.payments.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            onClose();
                            onNavigate('payments', p.id);
                          }}
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#FDF4F0] cursor-pointer transition-colors group"
                        >
                          <div>
                            <p className="text-sm font-semibold text-[#24211F] group-hover:text-[#B85C38]">
                              {p.receiptNumber} — {formatINR(p.amountDue)} ({p.status.toUpperCase()})
                            </p>
                            <p className="text-xs text-[#716A63]">
                              {p.residentName} • Room {p.roomNumber} • {p.billingMonth}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#716A63] group-hover:text-[#B85C38] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No results */}
                {filteredResults.residents.length === 0 &&
                  filteredResults.rooms.length === 0 &&
                  filteredResults.payments.length === 0 && (
                    <div className="p-8 text-center text-xs text-[#716A63]">
                      No records found matching "{query}".
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
