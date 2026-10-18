import React, { useState } from 'react';
import { Building2, User, Mail, Phone, FileText, MapPin, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface OnboardOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const OnboardOwnerModal: React.FC<OnboardOwnerModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { register } = useAuth();
  const { showToast } = useToast();

  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [address, setAddress] = useState('');
  const [numberOfProperties, setNumberOfProperties] = useState('1');
  const [plan, setPlan] = useState<'starter' | 'growth' | 'enterprise'>('growth');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!businessName.trim() || !ownerName.trim() || !email.trim() || !phone.trim()) {
      setError('Please fill in all mandatory legal business and owner contact details.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = register({
        businessName: businessName.trim(),
        name: ownerName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        panNumber: panNumber.trim().toUpperCase(),
        gstNumber: gstNumber.trim().toUpperCase(),
        address: address.trim() || `${city}, India`,
        city,
        numberOfProperties: Number(numberOfProperties) || 1,
        plan,
        preloadDemoData: true
      });

      if (!result.success) {
        setError(result.error || 'Failed to onboard PG business.');
        setIsSubmitting(false);
        return;
      }

      showToast(
        'PG Business Onboarded!',
        `${businessName} has been verified and registered on StayNest Platform.`,
        'success'
      );

      // Reset
      setBusinessName('');
      setOwnerName('');
      setEmail('');
      setPhone('');
      setPanNumber('');
      setGstNumber('');
      setAddress('');
      setIsSubmitting(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Onboard New PG Business"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={<CheckCircle2 size={16} />}
            onClick={handleSubmit}
            type="button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering Business...' : 'Verify & Onboard Business'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {error && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--danger-50)',
              border: '1px solid var(--danger-200)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--danger-700)',
              fontSize: '13px'
            }}
          >
            {error}
          </div>
        )}

        {/* Business Info Section */}
        <div>
          <h4
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--primary-700)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Building2 size={15} /> 1. Business Legal Profile
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <Input
              label="Business / Enterprise Name *"
              placeholder="e.g. Royal Comfort Living PGs"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              prefixIcon={<Building2 size={16} />}
              required
            />
            <Select
              label="Operating City / Hub *"
              value={city}
              onChange={e => setCity(e.target.value)}
              options={[
                { value: 'Bengaluru', label: 'Bengaluru, Karnataka' },
                { value: 'Gurugram', label: 'Gurugram / NCR' },
                { value: 'Hyderabad', label: 'Hyderabad, Telangana' },
                { value: 'Pune', label: 'Pune, Maharashtra' },
                { value: 'Noida', label: 'Noida, Uttar Pradesh' },
                { value: 'Chennai', label: 'Chennai, Tamil Nadu' }
              ]}
            />
          </div>
        </div>

        {/* Owner Details */}
        <div>
          <h4
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--primary-700)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <User size={15} /> 2. Primary Owner & Signatory
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <Input
              label="Owner Full Name *"
              placeholder="e.g. Amit Singhania"
              value={ownerName}
              onChange={e => setOwnerName(e.target.value)}
              prefixIcon={<User size={16} />}
              required
            />
            <Input
              label="Email Address *"
              type="email"
              placeholder="owner@royalstays.in"
              value={email}
              onChange={e => setEmail(e.target.value)}
              prefixIcon={<Mail size={16} />}
              required
            />
            <Input
              label="Mobile Number (+91) *"
              type="tel"
              placeholder="9876543210"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              prefixIcon={<Phone size={16} />}
              required
            />
          </div>
        </div>

        {/* Taxation & Compliance */}
        <div>
          <h4
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--primary-700)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ShieldCheck size={15} /> 3. GST & Tax Compliance
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <Input
              label="PAN Number"
              placeholder="e.g. ABCPS1234F"
              value={panNumber}
              onChange={e => setPanNumber(e.target.value.toUpperCase())}
              prefixIcon={<FileText size={16} />}
              hint="10-digit Income Tax Permanent Account Number"
            />
            <Input
              label="GSTIN Number (Optional)"
              placeholder="e.g. 29ABCPS1234F1Z5"
              value={gstNumber}
              onChange={e => setGstNumber(e.target.value.toUpperCase())}
              prefixIcon={<FileText size={16} />}
              hint="15-digit Goods & Services Tax Identification"
            />
          </div>
          <div style={{ marginTop: '14px' }}>
            <Input
              label="Registered Office Address"
              placeholder="#104, 2nd Main, Indiranagar, Bengaluru - 560038"
              value={address}
              onChange={e => setAddress(e.target.value)}
              prefixIcon={<MapPin size={16} />}
            />
          </div>
        </div>

        {/* Subscription Plan & Portfolio */}
        <div>
          <h4
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--primary-700)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={15} /> 4. Platform Tier & Properties
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <Select
              label="Initial Number of PG Properties"
              value={numberOfProperties}
              onChange={e => setNumberOfProperties(e.target.value)}
              options={[
                { value: '1', label: '1 Property (Single Branch)' },
                { value: '2', label: '2 Properties' },
                { value: '3', label: '3 to 5 Properties (Cluster)' },
                { value: '10', label: '10+ Properties (Enterprise Chain)' }
              ]}
            />
            <Select
              label="SaaS Plan Subscription"
              value={plan}
              onChange={e => setPlan(e.target.value as 'starter' | 'growth' | 'enterprise')}
              options={[
                { value: 'starter', label: 'Starter — ₹1,999 / mo (Up to 25 beds)' },
                { value: 'growth', label: 'Growth Pro — ₹4,499 / mo (Up to 100 beds)' },
                { value: 'enterprise', label: 'Enterprise — ₹8,999 / mo (Unlimited beds & API)' }
              ]}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
