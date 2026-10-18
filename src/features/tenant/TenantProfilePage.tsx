import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Trash2,
  Save,
  Phone,
  Mail,
  Building,
  Heart,
  Utensils,
  MapPin,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { storageService } from '../../services/storageService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { Tenant, TenantDocument, DocumentType } from '../../types/tenant';

export const TenantProfilePage: React.FC = () => {
  const { currentTenant } = useAuth();
  const { showToast } = useToast();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [foodPreference, setFoodPreference] = useState<'Veg' | 'Non-Veg' | 'Eggetarian' | 'Jain'>('Veg');
  const [permanentAddress, setPermanentAddress] = useState('');

  // Emergency contact
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRel, setEmergencyRel] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Document states
  const [documents, setDocuments] = useState<TenantDocument[]>([]);
  const [previewDoc, setPreviewDoc] = useState<TenantDocument | null>(null);
  const [uploadingDocType, setUploadingDocType] = useState<DocumentType | null>(null);
  const [docNumberInput, setDocNumberInput] = useState('');

  const loadData = () => {
    if (!currentTenant) return;
    const profile = storageService.getTenantFullProfile(currentTenant.id);
    if (profile) {
      const t = profile.tenant;
      setTenant(t);
      setName(t.name);
      setEmail(t.email);
      setPhone(t.phone);
      setWorkplace(t.workplaceOrCollege || '');
      setBloodGroup(t.bloodGroup || 'B+');
      setFoodPreference(t.foodPreference || 'Veg');
      setPermanentAddress(t.permanentAddress || 'Plot 42, Green Glen Layout, Bellandur, Bengaluru');
      setEmergencyName(t.emergencyContact?.name || '');
      setEmergencyRel(t.emergencyContact?.relationship || '');
      setEmergencyPhone(t.emergencyContact?.phone || '');
      setDocuments(t.documents || []);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;

    setIsSaving(true);
    storageService.updateTenantFullProfile(tenant.id, {
      name,
      email,
      phone,
      workplaceOrCollege: workplace,
      bloodGroup,
      foodPreference,
      permanentAddress,
      emergencyContact: {
        name: emergencyName,
        relationship: emergencyRel,
        phone: emergencyPhone
      }
    });

    setTimeout(() => {
      setIsSaving(false);
      showToast('Profile Saved', 'Your personal and emergency details have been updated.', 'success');
      loadData();
    }, 400);
  };

  const handleSimulatedUpload = (type: DocumentType, defaultTitle: string) => {
    if (!tenant) return;

    const fileMap: Record<DocumentType, { name: string; size: string; number: string }> = {
      aadhaar: { name: 'aadhaar_front_back_scanned.pdf', size: '1.4 MB', number: '4829-1029-3841' },
      pan: { name: 'pan_card_official.jpg', size: '820 KB', number: 'ABCDE1234F' },
      college_work_id: { name: 'workplace_corporate_badge.png', size: '1.1 MB', number: 'EMP-90241' },
      police_verification: { name: 'police_tenant_acknowledgment.pdf', size: '2.4 MB', number: 'POL-BLR-88192' }
    };

    const target = fileMap[type];
    const newDoc: TenantDocument = {
      id: `doc_${type}_${Date.now()}`,
      type,
      title: defaultTitle,
      fileName: target.name,
      fileSize: target.size,
      uploadedAt: new Date().toISOString(),
      status: 'pending',
      documentNumber: docNumberInput || target.number,
      verificationNotes: 'Uploaded by resident. Pending physical verification by PG Property Manager.'
    };

    storageService.uploadTenantKYCDocument(tenant.id, newDoc);
    setUploadingDocType(null);
    setDocNumberInput('');
    showToast('Document Uploaded!', `${defaultTitle} successfully uploaded for audit review.`, 'success');
    loadData();
  };

  if (!tenant) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--slate-500)' }}>Loading resident profile...</div>;
  }

  const kycDefinitions: Array<{ type: DocumentType; title: string; desc: string; icon: React.ReactNode }> = [
    {
      type: 'aadhaar',
      title: 'Aadhaar Card (Front & Back)',
      desc: 'Government issued 12-digit UIDAI proof of national identity & address.',
      icon: <ShieldCheck size={18} color="var(--primary-600)" />
    },
    {
      type: 'pan',
      title: 'Permanent Account Number (PAN)',
      desc: 'Income Tax Department issued PAN card for financial record keeping.',
      icon: <FileText size={18} color="var(--primary-600)" />
    },
    {
      type: 'college_work_id',
      title: 'Workplace / Student Identity Card',
      desc: 'Corporate employee badge or University student ID confirming occupation.',
      icon: <Building size={18} color="var(--primary-600)" />
    },
    {
      type: 'police_verification',
      title: 'Police Verification Form',
      desc: 'Local jurisdictional police tenant information record as mandated by city police.',
      icon: <Lock size={18} color="var(--primary-600)" />
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title="My Profile & KYC Verification"
        subtitle="Maintain your resident details, food preferences, emergency contacts, and statutory verification documents."
        actions={
          <Button
            variant="primary"
            icon={<Save size={15} />}
            onClick={handleSaveProfile}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Profile Changes'}
          </Button>
        }
      />

      {/* KYC Documents Section */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          padding: '24px',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--slate-900)' }}>
              KYC & Verification Document Center
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--slate-500)', marginTop: '2px' }}>
              Required under Karnataka / Haryana PG regulations for police reporting and tenant lease compliance.
            </p>
          </div>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--success-50)',
              color: 'var(--success-700)',
              fontSize: '12px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <CheckCircle2 size={14} /> 3 of 4 Documents Verified
          </span>
        </div>

        {/* 4-Card Document Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {kycDefinitions.map(def => {
            const uploaded = documents.find(d => d.type === def.type);
            const isVerified = uploaded?.status === 'verified';
            const isPending = uploaded?.status === 'pending';

            return (
              <div
                key={def.type}
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  backgroundColor: uploaded ? 'var(--slate-50)' : '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--primary-50)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {def.icon}
                      </div>
                      <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--slate-900)' }}>
                        {def.title}
                      </h4>
                    </div>

                    <StatusBadge
                      status={isVerified ? 'Active' : isPending ? 'Pending' : 'Single'}
                    />
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--slate-500)', marginTop: '8px', lineHeight: 1.4 }}>
                    {def.desc}
                  </p>

                  {uploaded ? (
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '10px 12px',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px'
                      }}
                    >
                      <div style={{ fontWeight: 600, color: 'var(--slate-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {uploaded.fileName}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--slate-500)', marginTop: '2px' }}>
                        {uploaded.fileSize} • Uploaded {new Date(uploaded.uploadedAt).toLocaleDateString()}
                      </div>
                      {uploaded.documentNumber && (
                        <div style={{ fontSize: '11.5px', color: 'var(--primary-700)', fontWeight: 600, marginTop: '4px' }}>
                          ID No: {uploaded.documentNumber}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '10px',
                        backgroundColor: 'var(--slate-100)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '11.5px',
                        color: 'var(--slate-600)',
                        textAlign: 'center'
                      }}
                    >
                      Accepted formats: PDF, JPG, PNG up to 5 MB
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  {uploaded && (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Eye size={13} />}
                      onClick={() => setPreviewDoc(uploaded)}
                    >
                      Preview
                    </Button>
                  )}
                  <Button
                    variant={uploaded ? 'secondary' : 'primary'}
                    size="sm"
                    icon={<Upload size={13} />}
                    onClick={() => setUploadingDocType(def.type)}
                    style={{ flex: 1 }}
                  >
                    {uploaded ? 'Re-upload' : 'Upload Document'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Profile Form 2-Columns */}
      <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
        {/* Left: Personal & Lifestyle Details */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '24px',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <User size={18} color="var(--primary-600)" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--slate-900)' }}>
              Personal & Employment Profile
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <Input
              label="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              prefixIcon={<User size={15} />}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              prefixIcon={<Mail size={15} />}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <Input
              label="Mobile Number (+91)"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              prefixIcon={<Phone size={15} />}
              required
            />
            <Input
              label="Employer / College Institution"
              value={workplace}
              onChange={e => setWorkplace(e.target.value)}
              prefixIcon={<Building size={15} />}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <Select
              label="Blood Group"
              value={bloodGroup}
              onChange={e => setBloodGroup(e.target.value)}
              options={[
                { value: 'A+', label: 'A+' },
                { value: 'A-', label: 'A-' },
                { value: 'B+', label: 'B+' },
                { value: 'B-', label: 'B-' },
                { value: 'O+', label: 'O+' },
                { value: 'O-', label: 'O-' },
                { value: 'AB+', label: 'AB+' },
                { value: 'AB-', label: 'AB-' }
              ]}
            />
            <Select
              label="Mess Food Preference"
              value={foodPreference}
              onChange={e => setFoodPreference(e.target.value as any)}
              options={[
                { value: 'Veg', label: 'Vegetarian (Pure Veg)' },
                { value: 'Eggetarian', label: 'Eggetarian' },
                { value: 'Non-Veg', label: 'Non-Vegetarian' },
                { value: 'Jain', label: 'Jain (No Onion / Garlic)' }
              ]}
            />
          </div>

          <Input
            label="Permanent Home Address (Aadhaar Registered)"
            value={permanentAddress}
            onChange={e => setPermanentAddress(e.target.value)}
            prefixIcon={<MapPin size={15} />}
          />
        </div>

        {/* Right: Emergency Contact Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '24px',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <Heart size={18} color="var(--danger-600)" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--slate-900)' }}>
              Emergency Contact (Next of Kin)
            </h3>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--slate-500)', lineHeight: 1.4 }}>
            In case of medical emergencies or urgent resident notices, PG wardens will contact this individual immediately.
          </p>

          <Input
            label="Contact Person Name *"
            value={emergencyName}
            onChange={e => setEmergencyName(e.target.value)}
            placeholder="e.g. Ramesh Verma"
            required
          />

          <Select
            label="Relationship *"
            value={emergencyRel}
            onChange={e => setEmergencyRel(e.target.value)}
            options={[
              { value: 'Father', label: 'Father' },
              { value: 'Mother', label: 'Mother' },
              { value: 'Spouse', label: 'Spouse' },
              { value: 'Sibling', label: 'Sibling (Brother / Sister)' },
              { value: 'Guardian', label: 'Local Guardian' }
            ]}
          />

          <Input
            label="Emergency Contact Phone (+91) *"
            type="tel"
            value={emergencyPhone}
            onChange={e => setEmergencyPhone(e.target.value)}
            placeholder="9845000000"
            prefixIcon={<Phone size={15} />}
            required
          />

          <div
            style={{
              marginTop: 'auto',
              padding: '12px',
              backgroundColor: 'var(--slate-50)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              fontSize: '11.5px',
              color: 'var(--slate-600)'
            }}
          >
            🔒 All personal information is encrypted and accessible only by authorized PG management for regulatory compliance.
          </div>
        </div>
      </form>

      {/* Document Upload Modal */}
      {uploadingDocType && (
        <Modal
          isOpen={!!uploadingDocType}
          onClose={() => setUploadingDocType(null)}
          title={`Upload ${uploadingDocType.replace('_', ' ').toUpperCase()}`}
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setUploadingDocType(null)} type="button">
                Cancel
              </Button>
              <Button
                variant="primary"
                icon={<Upload size={14} />}
                onClick={() => {
                  const def = kycDefinitions.find(d => d.type === uploadingDocType);
                  handleSimulatedUpload(uploadingDocType, def?.title || 'Document');
                }}
                type="button"
              >
                Confirm & Upload
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                border: '2px dashed var(--primary-300)',
                backgroundColor: 'var(--primary-50)',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer'
              }}
            >
              <Upload size={32} color="var(--primary-600)" style={{ margin: '0 auto 8px auto' }} />
              <div style={{ fontWeight: 600, color: 'var(--primary-800)', fontSize: '13px' }}>
                Drag and drop your file here, or click to browse
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--slate-500)', marginTop: '4px' }}>
                Supports PDF, JPG, PNG (Max 5 MB)
              </div>
            </div>

            <Input
              label="Document Identification / Certificate Number"
              placeholder="e.g. 4829-1029-3841 or POL-2026-98"
              value={docNumberInput}
              onChange={e => setDocNumberInput(e.target.value)}
            />
          </div>
        </Modal>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <Modal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          title={previewDoc.title}
          size="md"
          footer={
            <Button variant="secondary" onClick={() => setPreviewDoc(null)} type="button">
              Close Preview
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '10px 0' }}>
            <div
              style={{
                backgroundColor: 'var(--slate-50)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                textAlign: 'center'
              }}
            >
              <FileText size={48} color="var(--primary-600)" style={{ margin: '0 auto 10px auto' }} />
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--slate-900)' }}>
                {previewDoc.fileName}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--slate-500)', marginTop: '4px' }}>
                {previewDoc.fileSize} • Uploaded on {new Date(previewDoc.uploadedAt).toLocaleString()}
              </div>

              {previewDoc.documentNumber && (
                <div style={{ marginTop: '12px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--slate-500)' }}>Document Number: </span>
                  <strong style={{ color: 'var(--primary-700)' }}>{previewDoc.documentNumber}</strong>
                </div>
              )}

              <div style={{ marginTop: '14px' }}>
                <StatusBadge
                  status={previewDoc.status === 'verified' ? 'Active' : 'Pending'}
                />
              </div>

              {previewDoc.verificationNotes && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '10px 14px',
                    backgroundColor: '#ffffff',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    color: 'var(--slate-600)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <strong>Verification Note:</strong> {previewDoc.verificationNotes}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
