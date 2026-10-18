import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Wifi,
  Sparkles,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { ServiceRequest, Resident } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface TenantServiceRequestsPageProps {
  residentId?: string;
}

export const TenantServiceRequestsPage: React.FC<TenantServiceRequestsPageProps> = ({
  residentId = 'res_2',
}) => {
  const [resident, setResident] = useState<Resident | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [category, setCategory] = useState<ServiceRequest['category']>('wifi');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ServiceRequest['priority']>('medium');

  const toast = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resData, reqList] = await Promise.all([
        api.getResidentById(residentId),
        api.getServiceRequests(residentId),
      ]);
      if (resData) setResident(resData);
      setRequests(reqList);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [residentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resident || !title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await api.createServiceRequest({
        residentId: resident.id,
        residentName: resident.name,
        propertyId: resident.propertyId,
        propertyName: resident.propertyName,
        roomNumber: resident.roomNumber,
        bedNumber: resident.bedNumber,
        category,
        title: title.trim(),
        description: description.trim(),
        priority,
      });

      toast.success(
        'Request Logged',
        'Your service ticket has been submitted to the property manager.'
      );
      setTitle('');
      setDescription('');
      setIsModalOpen(false);
      await loadData();
    } catch {
      toast.error('Failed', 'Could not submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !resident) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#B85C38] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#716A63] font-medium">Loading service requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#24211F] tracking-tight">
            Service & Maintenance Requests
          </h1>
          <p className="text-xs text-[#716A63] mt-1">
            Report Wi-Fi, plumbing, electrical, or cleaning issues directly to {resident.propertyName}&apos;s maintenance team
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-[#B85C38] hover:bg-[#984629] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all shrink-0 hover:scale-102"
        >
          <Plus className="w-4 h-4" />
          <span>Raise New Ticket</span>
        </button>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-2xl border border-[#E8E1D9] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8E1D9] flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#24211F]">Your Active & Past Requests</h3>
          <span className="text-xs bg-[#F8F6F2] font-semibold text-[#716A63] px-2.5 py-1 rounded-lg border border-[#E8E1D9]">
            {requests.length} Tickets
          </span>
        </div>

        {requests.length === 0 ? (
          <div className="p-12 text-center">
            <Wrench className="w-10 h-10 text-[#9E968E] mx-auto mb-2 opacity-50" />
            <h4 className="font-bold text-sm text-[#24211F]">No maintenance issues reported</h4>
            <p className="text-xs text-[#716A63] mt-1">
              If anything in your room requires repair, click &quot;Raise New Ticket&quot; above.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E8E1D9]">
            {requests.map((req) => (
              <div key={req.id} className="p-5 hover:bg-[#FDF4F0]/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F8F6F2] text-[#716A63] border border-[#E8E1D9]">
                      {req.category}
                    </span>
                    <h4 className="font-bold text-sm text-[#24211F]">{req.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        req.priority === 'urgent' || req.priority === 'high'
                          ? 'bg-rose-100 text-rose-800'
                          : req.priority === 'medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-100 text-stone-800'
                      }`}
                    >
                      {req.priority} Priority
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        req.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {req.status === 'resolved' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Clock className="w-3 h-3 text-blue-600" />
                      )}
                      <span>{req.status.toUpperCase()}</span>
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#716A63] leading-relaxed">{req.description}</p>
                <div className="mt-2.5 flex items-center gap-4 text-[11px] text-[#9E968E]">
                  <span>Room: {req.roomNumber} ({req.bedNumber})</span>
                  <span>•</span>
                  <span>Logged on: {req.createdAt}</span>
                  {req.resolvedAt && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold">
                        Resolved on: {req.resolvedAt}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Raise New Service Ticket */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#24211F]/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E8E1D9] overflow-hidden my-8">
            <div className="bg-[#B85C38] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Wrench className="w-5 h-5" />
                <h3 className="font-bold text-base">Raise Service Request</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#24211F] mb-1">Issue Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none font-medium"
                >
                  <option value="wifi">Wi-Fi & Internet</option>
                  <option value="plumbing">Plumbing & Bathroom</option>
                  <option value="electrical">Electrical & Appliances (AC / Geyser / Fan)</option>
                  <option value="cleaning">Daily Room Cleaning</option>
                  <option value="carpentry">Carpentry & Bed / Cupboard Lock</option>
                  <option value="other">Other Query</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#24211F] mb-1">
                  Issue Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Bathroom shower flow is weak"
                  className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24211F] mb-1">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe the issue in detail to help the technician..."
                  className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24211F] mb-1">Urgency Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPriority('low')}
                    className={`py-2 rounded-lg border font-semibold text-center ${
                      priority === 'low'
                        ? 'border-[#B85C38] bg-[#FDF4F0] text-[#B85C38]'
                        : 'border-[#E8E1D9] bg-white text-[#716A63]'
                    }`}
                  >
                    Low
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('medium')}
                    className={`py-2 rounded-lg border font-semibold text-center ${
                      priority === 'medium'
                        ? 'border-[#B85C38] bg-[#FDF4F0] text-[#B85C38]'
                        : 'border-[#E8E1D9] bg-white text-[#716A63]'
                    }`}
                  >
                    Medium
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('high')}
                    className={`py-2 rounded-lg border font-semibold text-center ${
                      priority === 'high'
                        ? 'border-[#B85C38] bg-[#FDF4F0] text-[#B85C38]'
                        : 'border-[#E8E1D9] bg-white text-[#716A63]'
                    }`}
                  >
                    High / Urgent
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8E1D9] flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#E8E1D9] text-[#716A63] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#B85C38] text-white font-bold rounded-lg shadow-sm"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
