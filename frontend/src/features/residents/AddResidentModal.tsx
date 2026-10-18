import React, { useState, useEffect } from 'react';
import { Resident, Bed } from '../../types';
import { api } from '../../services/api';
import { useProperty } from '../../context/PropertyContext';
import { Modal } from '../../components/common/Modal';

interface AddResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Resident, 'id'>) => Promise<void>;
  isLoading?: boolean;
}

export const AddResidentModal: React.FC<AddResidentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const { properties, selectedPropertyId } = useProperty();

  const [step, setStep] = useState<1 | 2>(1);
  const [propertyId, setPropertyId] = useState(
    selectedPropertyId !== 'all' ? selectedPropertyId : properties[0]?.id || 'prop_1'
  );
  const [vacantBeds, setVacantBeds] = useState<Bed[]>([]);
  const [selectedBedId, setSelectedBedId] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    emergencyContactName: '',
    emergencyContactRelation: 'Father',
    emergencyContactPhone: '',
    permanentAddress: '',
    city: '',
    state: '',
    aadhaarNumber: '',
    moveInDate: new Date().toISOString().split('T')[0],
    monthlyRent: 11000,
    securityDeposit: 22000,
    depositStatus: 'paid' as 'paid' | 'partial' | 'pending',
    rentCycleDay: 5,
    paymentStatus: 'paid' as 'paid' | 'pending' | 'overdue',
    collegeOrCompany: '',
    vehicleNumber: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      api.getBeds(propertyId).then((allBeds) => {
        const available = allBeds.filter((b) => b.status === 'vacant');
        setVacantBeds(available);
        if (available.length > 0) {
          setSelectedBedId(available[0].id);
          setFormData((prev) => ({
            ...prev,
            monthlyRent: available[0].monthlyRent,
            securityDeposit: available[0].monthlyRent * 2,
          }));
        } else {
          setSelectedBedId('');
        }
      });
      setStep(1);
      setErrors({});
    }
  }, [isOpen, propertyId]);

  const handleBedSelect = (bedId: string) => {
    setSelectedBedId(bedId);
    const bed = vacantBeds.find((b) => b.id === bedId);
    if (bed) {
      setFormData((prev) => ({
        ...prev,
        monthlyRent: bed.monthlyRent,
        securityDeposit: bed.monthlyRent * 2,
      }));
    }
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.phone.trim() || formData.phone.length < 10) {
      errs.phone = 'Valid 10-digit mobile number required';
    }
    if (!formData.aadhaarNumber.trim()) {
      errs.aadhaarNumber = 'Govt ID / Aadhaar number required for KYC';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) {
      setStep(1);
      return;
    }

    const selectedProp = properties.find((p) => p.id === propertyId);
    const bed = vacantBeds.find((b) => b.id === selectedBedId);

    const residentPayload: Omit<Resident, 'id'> = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      emergencyContact: {
        name: formData.emergencyContactName.trim() || 'Parent',
        relation: formData.emergencyContactRelation,
        phone: formData.emergencyContactPhone.trim() || formData.phone,
      },
      permanentAddress: formData.permanentAddress.trim() || 'Resident City',
      city: formData.city.trim() || 'Bengaluru',
      state: formData.state.trim() || 'Karnataka',
      aadhaarNumber: formData.aadhaarNumber.trim(),
      aadhaarVerified: true,
      kycStatus: 'verified',
      propertyId,
      propertyName: selectedProp?.name || 'Nivaas Property',
      roomId: bed?.roomId || '',
      roomNumber: bed?.roomNumber || 'TBD',
      bedId: bed?.id || '',
      bedNumber: bed?.bedNumber || 'A',
      moveInDate: formData.moveInDate,
      monthlyRent: Number(formData.monthlyRent),
      securityDeposit: Number(formData.securityDeposit),
      depositStatus: formData.depositStatus,
      rentCycleDay: Number(formData.rentCycleDay),
      paymentStatus: formData.paymentStatus,
      residencyStatus: 'active',
      collegeOrCompany: formData.collegeOrCompany.trim(),
      vehicleNumber: formData.vehicleNumber.trim(),
      notes: formData.notes.trim(),
    };

    await onSubmit(residentPayload);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Onboard New Resident"
      subtitle="Collect KYC details, assign room bed, and setup rent ledger"
      maxWidth="2xl"
      footer={
        <>
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs font-semibold text-[#716A63] hover:text-[#24211F] rounded-lg transition-colors"
            >
              ← Back
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#716A63] hover:text-[#24211F] rounded-lg transition-colors"
          >
            Cancel
          </button>
          {step === 1 ? (
            <button
              type="button"
              onClick={() => {
                if (validateStep1()) setStep(2);
              }}
              className="px-4 py-2 bg-[#B85C38] hover:bg-[#984629] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              Continue to Bed Allocation →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !selectedBedId}
              className="px-4 py-2 bg-[#B85C38] hover:bg-[#984629] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Onboarding Resident...' : 'Complete Resident Onboarding'}
            </button>
          )}
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Step Indicator */}
        <div className="flex items-center gap-3 border-b border-[#E8E1D9] pb-3 mb-2">
          <div
            className={`flex items-center gap-2 font-semibold ${
              step === 1 ? 'text-[#B85C38]' : 'text-[#716A63]'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 1 ? 'bg-[#B85C38] text-white' : 'bg-[#E8E1D9] text-[#716A63]'
              }`}
            >
              1
            </span>
            <span>Personal & KYC Info</span>
          </div>
          <div className="h-px bg-[#E8E1D9] flex-1" />
          <div
            className={`flex items-center gap-2 font-semibold ${
              step === 2 ? 'text-[#B85C38]' : 'text-[#716A63]'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 2 ? 'bg-[#B85C38] text-white' : 'bg-[#E8E1D9] text-[#716A63]'
              }`}
            >
              2
            </span>
            <span>Room, Rent & Deposit</span>
          </div>
        </div>

        {step === 1 ? (
          /* Step 1: Personal info */
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-[#24211F] mb-1">
                  Resident Full Name <span className="text-[#D64545]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
                />
                {errors.name && <p className="text-[#D64545] text-[11px] mt-0.5">{errors.name}</p>}
              </div>

              <div>
                <label className="block font-semibold text-[#24211F] mb-1">
                  Mobile Number <span className="text-[#D64545]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
                />
                {errors.phone && <p className="text-[#D64545] text-[11px] mt-0.5">{errors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-[#24211F] mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rahul@example.com"
                  className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24211F] mb-1">
                  Aadhaar / Govt ID Number <span className="text-[#D64545]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.aadhaarNumber}
                  onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                  placeholder="XXXX-XXXX-1234"
                  className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
                />
                {errors.aadhaarNumber && (
                  <p className="text-[#D64545] text-[11px] mt-0.5">{errors.aadhaarNumber}</p>
                )}
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="p-3 bg-[#F8F6F2] rounded-xl border border-[#E8E1D9] space-y-2.5">
              <p className="font-bold text-[#24211F] text-[11px] uppercase tracking-wider">
                Emergency Contact (Parent / Guardian)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#716A63] text-[11px] mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) =>
                      setFormData({ ...formData, emergencyContactName: e.target.value })
                    }
                    placeholder="Parent's Name"
                    className="w-full px-3 py-1.5 border border-[#E8E1D9] rounded-lg bg-white text-[#24211F] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#716A63] text-[11px] mb-1">Relationship</label>
                  <select
                    value={formData.emergencyContactRelation}
                    onChange={(e) =>
                      setFormData({ ...formData, emergencyContactRelation: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-[#E8E1D9] rounded-lg bg-white text-[#24211F] outline-none"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#716A63] text-[11px] mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.emergencyContactPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, emergencyContactPhone: e.target.value })
                    }
                    placeholder="+91..."
                    className="w-full px-3 py-1.5 border border-[#E8E1D9] rounded-lg bg-white text-[#24211F] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* College / Company & Vehicle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-[#24211F] mb-1">
                  Workplace or College Name
                </label>
                <input
                  type="text"
                  value={formData.collegeOrCompany}
                  onChange={(e) => setFormData({ ...formData, collegeOrCompany: e.target.value })}
                  placeholder="e.g. Infosys, St. Joseph's College"
                  className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24211F] mb-1">
                  Two-Wheeler / Vehicle Number
                </label>
                <input
                  type="text"
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  placeholder="e.g. KA-01-AB-1234 (optional)"
                  className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Step 2: Bed Allocation & Financials */
          <div className="space-y-3.5">
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

            {/* Bed picker */}
            <div>
              <label className="block font-semibold text-[#24211F] mb-1.5">
                Assign Vacant Bed Space <span className="text-[#D64545]">*</span>
              </label>
              {vacantBeds.length === 0 ? (
                <div className="p-3 bg-[#FEF8EC] border border-[#F7E4BE] text-[#D99118] rounded-xl text-center">
                  No vacant beds currently available in this property. Please choose another property
                  or add a room.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1">
                  {vacantBeds.map((bed) => {
                    const isSelected = selectedBedId === bed.id;
                    return (
                      <div
                        key={bed.id}
                        onClick={() => handleBedSelect(bed.id)}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#FDF4F0] border-[#B85C38] shadow-xs'
                            : 'bg-white border-[#E8E1D9] hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#24211F]">
                            Room {bed.roomNumber} - Bed {bed.bedNumber}
                          </span>
                          <span
                            className={`w-3 h-3 rounded-full flex items-center justify-center text-[9px] ${
                              isSelected ? 'bg-[#B85C38] text-white' : 'border border-[#E8E1D9]'
                            }`}
                          >
                            {isSelected ? '✓' : ''}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#B85C38] font-semibold mt-1">
                          ₹{bed.monthlyRent.toLocaleString('en-IN')}/mo
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Rent & Deposit */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-[#24211F] mb-1">Monthly Rent (₹)</label>
                <input
                  type="number"
                  value={formData.monthlyRent}
                  onChange={(e) => setFormData({ ...formData, monthlyRent: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24211F] mb-1">Security Deposit (₹)</label>
                <input
                  type="number"
                  value={formData.securityDeposit}
                  onChange={(e) =>
                    setFormData({ ...formData, securityDeposit: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24211F] mb-1">Rent Due Day</label>
                <select
                  value={formData.rentCycleDay}
                  onChange={(e) =>
                    setFormData({ ...formData, rentCycleDay: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
                >
                  <option value={1}>1st of Month</option>
                  <option value={5}>5th of Month</option>
                  <option value={10}>10th of Month</option>
                  <option value={15}>15th of Month</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-[#24211F] mb-1">Move-In Date</label>
                <input
                  type="date"
                  value={formData.moveInDate}
                  onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24211F] mb-1">First Month Payment Status</label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentStatus: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
                >
                  <option value="paid">Paid (Receipt auto-generated)</option>
                  <option value="pending">Pending Payment</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};
