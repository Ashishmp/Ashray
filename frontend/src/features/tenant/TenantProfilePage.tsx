import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Upload,
  FileText,
  FileCheck,
  Building2,
  BedDouble,
  Heart,
  Briefcase,
  Car,
  Clock,
  Sparkles,
  Download,
  Trash2,
} from 'lucide-react';
import { Resident, TenantDocument } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatINR } from '../../utils/formatters';

interface TenantProfilePageProps {
  residentId?: string;
}

export const TenantProfilePage: React.FC<TenantProfilePageProps> = ({
  residentId = 'res_2', // Default to Rohan Desai
}) => {
  const [resident, setResident] = useState<Resident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);

  // Form states
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [foodPreference, setFoodPreference] = useState<'veg' | 'non-veg' | 'both'>('veg');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [collegeOrCompany, setCollegeOrCompany] = useState('');
  const [workOrCollegeId, setWorkOrCollegeId] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  const toast = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getResidentById(residentId);
      if (data) {
        setResident(data);
        setPhone(data.phone || '');
        setEmail(data.email || '');
        setPermanentAddress(data.permanentAddress || '');
        setBloodGroup(data.bloodGroup || 'O+');
        setFoodPreference(data.foodPreference || 'veg');
        setVehicleNumber(data.vehicleNumber || '');
        setCollegeOrCompany(data.collegeOrCompany || '');
        setWorkOrCollegeId(data.workOrCollegeId || 'RZP-4910');
        setEmergencyName(data.emergencyContact?.name || '');
        setEmergencyRelation(data.emergencyContact?.relation || '');
        setEmergencyPhone(data.emergencyContact?.phone || '');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [residentId]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resident) return;

    setIsSaving(true);
    try {
      const updated = await api.updateResidentProfile(resident.id, {
        phone,
        email,
        permanentAddress,
        bloodGroup,
        foodPreference,
        vehicleNumber,
        collegeOrCompany,
        workOrCollegeId,
        emergencyContact: {
          name: emergencyName,
          relation: emergencyRelation,
          phone: emergencyPhone,
        },
      });
      setResident(updated);
      toast.success('Profile Saved', 'Your personal details have been updated successfully.');
    } catch {
      toast.error('Save Failed', 'Could not save profile details');
    } finally {
      setIsSaving(false);
    }
  };

  // Document Upload Simulation
  const handleSimulatedUpload = async (docType: TenantDocument['type'], docName: string) => {
    if (!resident) return;
    setUploadingDocType(docType);

    try {
      // Simulate real file upload progress (800ms)
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newDoc = await api.uploadResidentDocument(resident.id, {
        type: docType,
        name: docName,
        fileUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
        status: 'verified',
        fileSize: '1.2 MB',
      });

      toast.success('Document Uploaded & Verified', `${docName} has been stored securely.`);
      await loadData();
    } catch {
      toast.error('Upload Failed', 'Could not upload document');
    } finally {
      setUploadingDocType(null);
    }
  };

  if (isLoading || !resident) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#B85C38] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#716A63] font-medium">Loading your resident profile...</p>
        </div>
      </div>
    );
  }

  const documents = resident.documents || [];
  const aadhaarDoc = documents.find((d) => d.type === 'aadhaar_front');
  const panDoc = documents.find((d) => d.type === 'pan');
  const workDoc = documents.find((d) => d.type === 'college_work_id');
  const policeDoc = documents.find((d) => d.type === 'police_verification');

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Resident Identity Header Card */}
      <div className="bg-white rounded-2xl border border-[#E8E1D9] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80"
            alt={resident.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#E8E1D9] shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#24211F]">{resident.name}</h2>
              <span className="text-[10px] font-bold bg-[#FDF4F0] text-[#B85C38] px-2 py-0.5 rounded-full border border-[#F6E2DA]">
                ACTIVE RESIDENT
              </span>
            </div>
            <p className="text-xs text-[#716A63] mt-0.5">
              {resident.propertyName} · Room {resident.roomNumber} ({resident.bedNumber})
            </p>
            <p className="text-[11px] text-[#9E968E] mt-0.5">
              Move-in Date: {formatDate(resident.moveInDate)} · Rent Cycle: 1st of every month
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-[#716A63]">Monthly Tariff</span>
            <p className="text-xl font-extrabold text-[#B85C38]">{formatINR(resident.monthlyRent)}</p>
          </div>
          <div className="h-8 w-px bg-[#E8E1D9]" />
          <div className="text-right">
            <span className="text-[10px] text-[#716A63]">Deposit Held</span>
            <p className="text-base font-bold text-[#24211F]">{formatINR(resident.securityDeposit)}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Personal Info Form (Left 2 Cols) & KYC Document Center (Right 1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal, Stay & Emergency Contact Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8E1D9] p-6 shadow-xs">
          <div className="border-b border-[#E8E1D9] pb-4 mb-5">
            <h3 className="font-bold text-sm text-[#24211F]">Personal & Emergency Details</h3>
            <p className="text-xs text-[#716A63]">
              Keep your contact, vehicle, and emergency info up to date for PG management
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
            {/* Row 1: Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#24211F] mb-1">Mobile Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-2.5 rounded-l-lg border border-r-0 border-[#E8E1D9] bg-[#F8F6F2] text-[#716A63] font-semibold text-xs">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8E1D9] rounded-r-lg bg-[#FFFEFC] text-[#24211F] outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#24211F] mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none font-medium"
                />
              </div>
            </div>

            {/* Row 2: Workplace & Vehicle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#24211F] mb-1">
                  College / Workplace Name
                </label>
                <input
                  type="text"
                  value={collegeOrCompany}
                  onChange={(e) => setCollegeOrCompany(e.target.value)}
                  placeholder="e.g. Razorpay, Swiggy, Christ University"
                  className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24211F] mb-1">
                  Work / Student ID Card No.
                </label>
                <input
                  type="text"
                  value={workOrCollegeId}
                  onChange={(e) => setWorkOrCollegeId(e.target.value)}
                  placeholder="e.g. RZP-ENG-4910"
                  className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none font-mono font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24211F] mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none font-medium"
                >
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#24211F] mb-1">
                  Mess Food Preference
                </label>
                <select
                  value={foodPreference}
                  onChange={(e) => setFoodPreference(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none font-medium"
                >
                  <option value="veg">Vegetarian</option>
                  <option value="non-veg">Non-Vegetarian</option>
                  <option value="both">Both (Flexible)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#24211F] mb-1">
                  Vehicle / Two-Wheeler Number (Parking Tag)
                </label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. KA-03-MB-1029"
                  className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none font-mono uppercase"
                />
              </div>
            </div>

            {/* Permanent Address */}
            <div>
              <label className="block font-semibold text-[#24211F] mb-1">Permanent Home Address</label>
              <textarea
                rows={2}
                value={permanentAddress}
                onChange={(e) => setPermanentAddress(e.target.value)}
                placeholder="Full permanent residential address..."
                className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none font-medium"
              />
            </div>

            {/* Emergency Contact */}
            <div className="pt-3 border-t border-[#E8E1D9]">
              <h4 className="font-bold text-[#24211F] uppercase text-[11px] tracking-wider mb-3">
                Emergency Contact (Parent / Guardian)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#24211F] mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="e.g. Kavita Desai"
                    className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#24211F] mb-1">Relationship</label>
                  <input
                    type="text"
                    value={emergencyRelation}
                    onChange={(e) => setEmergencyRelation(e.target.value)}
                    placeholder="e.g. Mother / Father"
                    className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#24211F] mb-1">Emergency Phone</label>
                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="+91 98200 11229"
                    className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 bg-[#B85C38] hover:bg-[#984629] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Save Profile Details</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Document Upload & KYC Verification Center */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E8E1D9] p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E8E1D9] pb-3 mb-4">
              <div>
                <h3 className="font-bold text-sm text-[#24211F]">KYC Documents</h3>
                <p className="text-[11px] text-[#716A63]">Upload required government verification</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>KYC VERIFIED</span>
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Doc 1: Aadhaar Card */}
              <div className="p-3.5 rounded-xl border border-[#E8E1D9] bg-[#FFFEFC] hover:border-[#B85C38]/40 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <FileCheck className="w-5 h-5 text-[#B85C38] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[#24211F]">Aadhaar Card</p>
                      <p className="text-[11px] text-[#716A63]">
                        Number: {resident.aadhaarNumber || 'XXXX-XXXX-8821'}
                      </p>
                      {aadhaarDoc && (
                        <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                          ✓ Verified ({aadhaarDoc.name})
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleSimulatedUpload('aadhaar_front', 'Aadhaar_Card_RohanDesai.pdf')
                    }
                    disabled={uploadingDocType === 'aadhaar_front'}
                    className="px-2.5 py-1 text-[11px] font-semibold text-[#B85C38] hover:text-white bg-[#FDF4F0] hover:bg-[#B85C38] rounded-lg border border-[#F6E2DA] transition-colors flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    <span>
                      {uploadingDocType === 'aadhaar_front'
                        ? 'Uploading...'
                        : aadhaarDoc
                        ? 'Re-upload'
                        : 'Upload'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Doc 2: PAN Card */}
              <div className="p-3.5 rounded-xl border border-[#E8E1D9] bg-[#FFFEFC] hover:border-[#B85C38]/40 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <FileText className="w-5 h-5 text-[#2786B8] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[#24211F]">PAN Card</p>
                      <p className="text-[11px] text-[#716A63]">Income tax ID for rent receipts</p>
                      {panDoc && (
                        <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                          ✓ Verified ({panDoc.name})
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleSimulatedUpload('pan', 'PAN_Card_RohanDesai.jpg')
                    }
                    disabled={uploadingDocType === 'pan'}
                    className="px-2.5 py-1 text-[11px] font-semibold text-[#2786B8] hover:text-white bg-blue-50 hover:bg-[#2786B8] rounded-lg border border-blue-100 transition-colors flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    <span>
                      {uploadingDocType === 'pan'
                        ? 'Uploading...'
                        : panDoc
                        ? 'Re-upload'
                        : 'Upload'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Doc 3: College / Employee ID */}
              <div className="p-3.5 rounded-xl border border-[#E8E1D9] bg-[#FFFEFC] hover:border-[#B85C38]/40 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <Briefcase className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[#24211F]">Employee / College ID</p>
                      <p className="text-[11px] text-[#716A63]">Proof of employment / enrollment</p>
                      {workDoc && (
                        <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                          ✓ Stored ({workDoc.name})
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleSimulatedUpload('college_work_id', 'Razorpay_Employee_Badge.pdf')
                    }
                    disabled={uploadingDocType === 'college_work_id'}
                    className="px-2.5 py-1 text-[11px] font-semibold text-purple-700 hover:text-white bg-purple-50 hover:bg-purple-700 rounded-lg border border-purple-100 transition-colors flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    <span>
                      {uploadingDocType === 'college_work_id'
                        ? 'Uploading...'
                        : workDoc
                        ? 'Re-upload'
                        : 'Upload'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Doc 4: Police Verification Form */}
              <div className="p-3.5 rounded-xl border border-[#E8E1D9] bg-[#FFFEFC] hover:border-[#B85C38]/40 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[#24211F]">Police Verification Form</p>
                      <p className="text-[11px] text-[#716A63]">Bangalore City Police Form</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleSimulatedUpload('police_verification', 'Police_Verification_Acknowledgement.pdf')
                    }
                    disabled={uploadingDocType === 'police_verification'}
                    className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-700 rounded-lg border border-emerald-100 transition-colors flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    <span>
                      {uploadingDocType === 'police_verification' ? 'Uploading...' : 'Upload'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Safe Storage Notice */}
          <div className="bg-[#F8F6F2] p-4 rounded-2xl border border-[#E8E1D9] text-[11px] text-[#716A63] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#24211F]">
              <ShieldCheck className="w-4 h-4 text-[#B85C38]" />
              <span>Data Protection & Privacy Policy</span>
            </div>
            <p className="leading-relaxed">
              Your Aadhaar and PAN documents are encrypted using AES-256 and stored exclusively for statutory PG compliance and tenant agreement records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
