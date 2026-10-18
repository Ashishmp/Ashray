import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Building2,
  Lock,
  Mail,
  User,
  Phone,
  Building,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  BedDouble,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { storageService } from '../../services/storageService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const LoginPage: React.FC = () => {
  const { login, quickLogin, loginAsSuperAdmin, loginAsTenant, register, isAuthenticated, registeredOwners, registeredTenants, superAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const defaultTab = (location.state as { defaultTab?: 'quick' | 'credentials' | 'register' })?.defaultTab || 'quick';
  const [activeTab, setActiveTab] = useState<'quick' | 'credentials' | 'register'>(defaultTab);

  // Credentials login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('owner123');
  const [preloadSample, setPreloadSample] = useState(true);
  const [regError, setRegError] = useState<string | null>(null);

  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!email.trim()) {
      setLoginError('Please enter your registered email address.');
      return;
    }

    setIsSubmitting(true);
    const result = login({ email: email.trim(), password });
    setIsSubmitting(false);

    if (result.success) {
      showToast('Welcome Back', 'Logged into StayNest Portal.', 'success');
      navigate('/', { replace: true });
    } else {
      setLoginError(result.error || 'Failed to sign in. Please verify your credentials.');
    }
  };

  const handleQuickSelectOwner = (ownerId: string, ownerName: string, businessName: string) => {
    const result = quickLogin(ownerId);
    if (result.success) {
      showToast('Logged In Successfully', `Managing ${businessName} as ${ownerName}.`, 'success');
      navigate('/', { replace: true });
    } else {
      showToast('Login Failed', result.error || 'Could not log in as owner.', 'error');
    }
  };

  const handleQuickSelectSuperAdmin = () => {
    loginAsSuperAdmin();
    showToast('Platform Console Active', 'Logged in as Platform Super Administrator.', 'success');
    navigate('/admin', { replace: true });
  };

  const handleQuickSelectTenant = (tenantId: string, tenantName: string) => {
    const result = loginAsTenant(tenantId);
    if (result.success) {
      showToast('Resident Portal Active', `Welcome, ${tenantName}!`, 'success');
      navigate('/tenant', { replace: true });
    } else {
      showToast('Login Failed', result.error || 'Could not log in as tenant.', 'error');
    }
  };


  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim() || !regBusinessName.trim() || !regEmail.trim() || !regPhone.trim()) {
      setRegError('Please fill in all mandatory fields.');
      return;
    }

    setIsSubmitting(true);
    const result = register({
      name: regName.trim(),
      businessName: regBusinessName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      password: regPassword || 'owner123',
      preloadDemoData: preloadSample
    });
    setIsSubmitting(false);

    if (result.success) {
      showToast('Account Created', `Welcome to StayNest, ${regName}! Your workspace is active.`, 'success');
      navigate('/', { replace: true });
    } else {
      setRegError(result.error || 'Registration failed.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--slate-900)',
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 40%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px 16px',
        color: '#ffffff',
        fontFamily: 'inherit'
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: 'var(--primary-600)',
            color: '#ffffff',
            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.5)',
            marginBottom: '16px'
          }}
        >
          <Building size={32} />
        </div>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 800,
            letterSpacing: '-0.5px',
            margin: '0 0 6px 0',
            color: '#ffffff'
          }}
        >
          StayNest <span style={{ color: 'var(--primary-400)', fontWeight: 600 }}>Owner Portal</span>
        </h1>
        <p style={{ color: 'var(--slate-300)', fontSize: '14.5px', maxWidth: '440px', margin: '0 auto' }}>
          Smart multi-property management for PGs, hostels, and modern co-living communities.
        </p>
      </div>

      {/* Main Card Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid var(--slate-700)',
          overflow: 'hidden',
          color: 'var(--text-primary)'
        }}
      >
        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--slate-50)',
            padding: '6px'
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('quick');
              setLoginError(null);
            }}
            style={{
              flex: 1,
              padding: '10px 14px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'quick' ? '#ffffff' : 'transparent',
              color: activeTab === 'quick' ? 'var(--primary-600)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'quick' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            ⚡ Select Owner (1-Click)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('credentials');
              setLoginError(null);
            }}
            style={{
              flex: 1,
              padding: '10px 14px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'credentials' ? '#ffffff' : 'transparent',
              color: activeTab === 'credentials' ? 'var(--primary-600)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'credentials' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Sign In with Email
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setRegError(null);
            }}
            style={{
              flex: 1,
              padding: '10px 14px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'register' ? '#ffffff' : 'transparent',
              color: activeTab === 'register' ? 'var(--primary-600)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'register' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            + New Owner
          </button>
        </div>

        {/* Tab 1: Quick Select Persona */}
        {activeTab === 'quick' && (
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0' }}>
                Select a Persona to Experience StayNest
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                Choose any persona below to immediately test data isolation, tenant portals, and management workflows:
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Persona 1: Platform Super Admin */}
              <div
                onClick={handleQuickSelectSuperAdmin}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-lg)',
                  border: '2px solid rgba(99, 102, 241, 0.4)',
                  backgroundColor: 'var(--primary-50)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--primary-600)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--primary-600)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '18px',
                      flexShrink: 0
                    }}
                  >
                    👑
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '14.5px', color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {superAdmin.name}
                      <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--primary-600)', color: '#ffffff', textTransform: 'uppercase' }}>
                        Super Admin
                      </span>
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--primary-700)', fontWeight: 600 }}>
                      Multi-Tenant Platform Administrator
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--slate-500)', marginTop: '2px' }}>
                      Onboard PG businesses, platform GMV analytics, audit compliance
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary-700)', fontWeight: 700, fontSize: '12.5px' }}>
                  <span>Launch</span>
                  <ArrowRight size={15} />
                </div>
              </div>

              {/* Section Header: PG Owners */}
              <div style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate-400)', letterSpacing: '0.05em', marginTop: '4px' }}>
                PG Business Owners & Landlords
              </div>

              {registeredOwners.map(owner => {
                const properties = storageService.getProperties(owner.id);
                const tenants = storageService.getTenants(owner.id);
                const rooms = storageService.getRooms(owner.id);

                return (
                  <div
                    key={owner.id}
                    onClick={() => handleQuickSelectOwner(owner.id, owner.name, owner.businessName)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-surface)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--primary-500)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          backgroundColor: 'var(--slate-100)',
                          color: 'var(--slate-800)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '14px',
                          flexShrink: 0
                        }}
                      >
                        {owner.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--text-primary)' }}>
                          {owner.name}
                        </div>
                        <div style={{ fontSize: '12.5px', color: 'var(--primary-600)', fontWeight: 600 }}>
                          {owner.businessName}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                          {properties.length} {properties.length === 1 ? 'Property' : 'Properties'} • {rooms.length} Rooms • {tenants.length} Tenants
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary-600)', fontWeight: 600, fontSize: '12.5px' }}>
                      <span>Manage</span>
                      <ArrowRight size={15} />
                    </div>
                  </div>
                );
              })}

              {/* Section Header: Resident Tenants */}
              <div style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate-400)', letterSpacing: '0.05em', marginTop: '4px' }}>
                Resident Tenants (Self-Service Portals)
              </div>

              {/* Tenant 1: Rohan Verma */}
              <div
                onClick={() => handleQuickSelectTenant('tnt_02', 'Rohan Verma')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--success-200)',
                  backgroundColor: 'var(--success-50)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--success-500)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--success-200)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--success-100)',
                      color: 'var(--success-700)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '14px',
                      flexShrink: 0
                    }}
                  >
                    RV
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      Rohan Verma
                      <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', backgroundColor: 'var(--success-600)', color: '#ffffff' }}>
                        Tenant
                      </span>
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--success-800)', fontWeight: 600 }}>
                      StayNest Elite (Room 102 - Bed A)
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--slate-500)', marginTop: '2px' }}>
                      Online UPI payments, KYC document center, Wi-Fi credentials
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success-700)', fontWeight: 700, fontSize: '12.5px' }}>
                  <span>Enter</span>
                  <ArrowRight size={15} />
                </div>
              </div>

              {/* Tenant 2: Karthik Subramanian (Overdue payment test) */}
              <div
                onClick={() => handleQuickSelectTenant('tnt_04', 'Karthik Subramanian')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--warning-200)',
                  backgroundColor: 'var(--warning-50)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--warning-500)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--warning-200)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--warning-100)',
                      color: 'var(--warning-800)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '14px',
                      flexShrink: 0
                    }}
                  >
                    KS
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      Karthik Subramanian
                      <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', backgroundColor: 'var(--danger-600)', color: '#ffffff' }}>
                        ₹14,000 Due
                      </span>
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--warning-800)', fontWeight: 600 }}>
                      StayNest Elite (Room 103 - Bed A)
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--slate-500)', marginTop: '2px' }}>
                      Ready to test instant online rent payment & receipt generation
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warning-800)', fontWeight: 700, fontSize: '12.5px' }}>
                  <span>Pay Due</span>
                  <ArrowRight size={15} />
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: '20px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--slate-50)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12.5px'
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>
                Want to register a brand-new owner with custom properties?
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                style={{
                  color: 'var(--primary-600)',
                  fontWeight: 700,
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                Create Account →
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Standard Credentials Login */}
        {activeTab === 'credentials' && (
          <form onSubmit={handleCredentialsLogin} style={{ padding: '24px' }}>
            <div style={{ marginBottom: '18px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0' }}>
                Owner Account Login
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                Enter your registered owner email and password to access your dashboard.
              </p>
            </div>

            {loginError && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--danger-50)',
                  border: '1px solid var(--danger-200)',
                  color: 'var(--danger-700)',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px'
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{loginError}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Input
                label="Owner Email Address"
                type="email"
                required
                placeholder="e.g. rajesh.sharma@staynest.in"
                value={email}
                onChange={e => setEmail(e.target.value)}
                prefixIcon={<Mail size={16} />}
              />

              <div className="form-group">
                <label className="form-label">
                  <span>Password</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter owner password (e.g. owner123)"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="form-input"
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'none',
                      color: 'var(--text-tertiary)',
                      cursor: 'pointer'
                    }}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Demo Credentials Quick Chips */}
              <div style={{ margin: '4px 0' }}>
                <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginBottom: '6px' }}>
                  Quick fill demo credentials (password: <code>owner123</code>):
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="badge badge-info"
                    style={{ cursor: 'pointer', border: 'none', padding: '4px 8px' }}
                    onClick={() => {
                      setEmail('rajesh.sharma@staynest.in');
                      setPassword('owner123');
                    }}
                  >
                    Rajesh (StayNest)
                  </button>
                  <button
                    type="button"
                    className="badge badge-success"
                    style={{ cursor: 'pointer', border: 'none', padding: '4px 8px' }}
                    onClick={() => {
                      setEmail('priya.sundaram@staynest.in');
                      setPassword('owner123');
                    }}
                  >
                    Priya (Blossom)
                  </button>
                  <button
                    type="button"
                    className="badge badge-neutral"
                    style={{ cursor: 'pointer', border: 'none', padding: '4px 8px' }}
                    onClick={() => {
                      setEmail('vikram.patel@staynest.in');
                      setPassword('owner123');
                    }}
                  >
                    Vikram (UrbanNest)
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                style={{ width: '100%', marginTop: '8px' }}
                isLoading={isSubmitting}
                icon={<ArrowRight size={18} />}
                iconPosition="right"
              >
                Sign In to Dashboard
              </Button>
            </div>
          </form>
        )}

        {/* Tab 3: Register New Owner */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} style={{ padding: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0' }}>
                Register as a New PG Owner
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                Set up a new owner profile with isolated property data and real-time tenant tracking.
              </p>
            </div>

            {regError && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--danger-50)',
                  border: '1px solid var(--danger-200)',
                  color: 'var(--danger-700)',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px'
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{regError}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Input
                  label="Owner Full Name"
                  required
                  placeholder="e.g. Suresh Gowda"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  prefixIcon={<User size={16} />}
                />
                <Input
                  label="PG / Business Name"
                  required
                  placeholder="e.g. Gowda Luxury PG"
                  value={regBusinessName}
                  onChange={e => setRegBusinessName(e.target.value)}
                  prefixIcon={<Building2 size={16} />}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Input
                  label="Email Address"
                  type="email"
                  required
                  placeholder="e.g. suresh@gowdapg.in"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  prefixIcon={<Mail size={16} />}
                />
                <Input
                  label="Contact Phone"
                  required
                  placeholder="e.g. 9845011999"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  prefixIcon={<Phone size={16} />}
                />
              </div>

              <Input
                label="Set Password"
                type="password"
                required
                placeholder="Create a password"
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                prefixIcon={<Lock size={16} />}
              />

              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'var(--slate-50)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={preloadSample}
                    onChange={e => setPreloadSample(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--primary-600)' }}
                  />
                  <span>Preload demo starter dataset (properties & tenants)</span>
                </label>
                <p style={{ margin: '4px 0 0 26px', fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
                  Uncheck to start with a completely empty clean slate (0 properties, 0 rooms, 0 tenants).
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                style={{ width: '100%', marginTop: '6px' }}
                isLoading={isSubmitting}
                icon={<ArrowRight size={18} />}
                iconPosition="right"
              >
                Create Account & Open Dashboard
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Feature Highlights Footer */}
      <div
        style={{
          marginTop: '36px',
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '720px',
          fontSize: '12.5px',
          color: 'var(--slate-400)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} color="var(--success-500)" />
          <span>Independent Owner Data Isolation</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BedDouble size={16} color="var(--primary-400)" />
          <span>Real-time Bed Allocation Engine</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CreditCard size={16} color="var(--warning-500)" />
          <span>Instant UPI & Cash Receipts</span>
        </div>
      </div>
    </div>
  );
};
