import React, { useState } from 'react';
import {
  Shield,
  Sparkles,
  Building2,
  CheckCircle2,
  ArrowRight,
  UserPlus,
  UserCheck,
  Crown,
  Lock,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const LoginScreen: React.FC = () => {
  const { loginAs, registerPlatformOwner } = useAuth();
  const toast = useToast();

  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [phoneNumber, setPhoneNumber] = useState('9845012345');
  const [otp, setOtp] = useState('482910');
  const [isLoading, setIsLoading] = useState(false);

  // Registration Form State
  const [registerData, setRegisterData] = useState({
    name: 'Ashish Sharma',
    businessName: 'Ashray Living Spaces LLP',
    phone: '+91 98765 43210',
    email: 'ashish@ashray.in',
    city: 'Bengaluru',
    initialPropertyName: 'Ashray Comforts - Koramangala',
    initialPropertyAddress: '8th Main, 4th Block, Koramangala',
    initialRooms: 12,
    password: 'password123',
  });

  const handlePhoneLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginAs('pg_owner');
    toast.success('Signed In as PG Owner', 'Welcome back, Rajesh Sharma.');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.name.trim() || !registerData.businessName.trim() || !registerData.phone.trim()) {
      toast.error('Validation Error', 'Please complete all required fields.');
      return;
    }

    setIsLoading(true);
    try {
      await registerPlatformOwner({
        name: registerData.name.trim(),
        businessName: registerData.businessName.trim(),
        phone: registerData.phone.trim(),
        email: registerData.email.trim(),
        city: registerData.city.trim(),
        initialPropertyName: registerData.initialPropertyName.trim(),
        initialPropertyAddress: registerData.initialPropertyAddress.trim(),
        initialRooms: Number(registerData.initialRooms),
      });
      toast.success(
        'Admin Account Created!',
        `Welcome to Nivaas, ${registerData.name}! Your Platform Owner dashboard is ready.`
      );
    } catch (err: any) {
      toast.error('Registration Failed', err.message || 'Could not create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F2] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo & Name */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#B85C38] text-white shadow-lg mb-3">
          <svg
            className="w-8 h-8 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2L2 9.5V21C2 21.5523 2.44772 22 3 22H9V15C9 13.3431 10.3431 12 12 12C13.6569 12 15 13.3431 15 15V22H21C21.5523 22 22 21.5523 22 21V9.5L12 2Z" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-[#24211F] tracking-tight">Nivaas</h1>
        <p className="mt-1 text-sm font-medium text-[#716A63]">
          “Apne PG ka hisaab, ab aasaan.”
        </p>
        <p className="mt-1 text-xs text-[#9E968E]">
          PG & Hostel Management Platform Owner Portal
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-[#E8E1D9] sm:px-10 space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#F8F6F2] rounded-xl border border-[#E8E1D9] text-xs font-semibold">
            <button
              type="button"
              onClick={() => setAuthMode('signin')}
              className={`py-2 text-center rounded-lg transition-all ${
                authMode === 'signin'
                  ? 'bg-white text-[#B85C38] shadow-xs font-bold'
                  : 'text-[#716A63] hover:text-[#24211F]'
              }`}
            >
              Sign In to Admin Portal
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`py-2 text-center rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'register'
                  ? 'bg-[#B85C38] text-white shadow-xs font-bold'
                  : 'text-[#716A63] hover:text-[#24211F]'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Create Owner Account</span>
            </button>
          </div>

          {authMode === 'signin' ? (
            /* Sign In Mode */
            <div className="space-y-6 animate-fade-in">
              {/* Quick Demo Logins Section */}
              <div className="p-4 rounded-xl bg-[#FDF4F0] border border-[#F6E2DA]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#B85C38] mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Choose Your Role & Experience RBAC</span>
                </div>
                <p className="text-[11px] text-[#716A63] mb-3 leading-relaxed">
                  Notice how Platform Owner rights are limited to onboarding PG Owners, whereas PG Owners manage staff and tenants:
                </p>
                <div className="space-y-2">
                  {/* Option 1: Platform Super Admin */}
                  <button
                    type="button"
                    onClick={() => {
                      loginAs('platform_owner');
                      toast.info(
                        'Signed in as Platform Owner',
                        'Limited Rights: Solely authorized to onboard & manage PG Owners across India.'
                      );
                    }}
                    className="w-full text-left p-2.5 rounded-lg bg-white border border-[#E8E1D9] hover:border-purple-500 hover:shadow-xs transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-purple-600" />
                        <p className="text-xs font-bold text-[#24211F] group-hover:text-purple-700">
                          Platform Super Admin (SaaS Operator)
                        </p>
                        <span className="text-[9px] bg-purple-100 text-purple-800 font-extrabold px-1.5 py-0.2 rounded uppercase">
                          LIMITED: BOARDS PG OWNERS ONLY
                        </span>
                      </div>
                      <p className="text-[11px] text-[#716A63] mt-0.5">
                        Onboard PG businesses, configure SaaS tiers, manage Pan-India PG network. Cannot add PG tenants or branch staff.
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#716A63] group-hover:text-purple-600 shrink-0" />
                  </button>

                  {/* Option 2: PG Owner */}
                  <button
                    type="button"
                    onClick={() => {
                      loginAs('pg_owner');
                      toast.success(
                        'Signed in as PG Owner',
                        'Full PG Rights: Manage properties, rooms, beds, add PG staff & onboard tenants.'
                      );
                    }}
                    className="w-full text-left p-2.5 rounded-lg bg-white border border-[#E8E1D9] hover:border-[#B85C38] hover:shadow-xs transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#B85C38]" />
                        <p className="text-xs font-bold text-[#24211F] group-hover:text-[#B85C38]">
                          Rajesh Sharma (PG Business Owner)
                        </p>
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded uppercase">
                          FULL PG RIGHTS: STAFF & TENANTS
                        </span>
                      </div>
                      <p className="text-[11px] text-[#716A63] mt-0.5">
                        Owns Nivaas Living Spaces. Can add staff/managers for their PG, manage rooms, beds, and onboard tenants.
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#716A63] group-hover:text-[#B85C38] shrink-0" />
                  </button>

                  {/* Option 3: Property Manager */}
                  <button
                    type="button"
                    onClick={() => {
                      loginAs('manager');
                      toast.info(
                        'Signed in as Property Manager',
                        'Branch Operations: Assigned to Koramangala & HSR branches.'
                      );
                    }}
                    className="w-full text-left p-2.5 rounded-lg bg-white border border-[#E8E1D9] hover:border-blue-500 hover:shadow-xs transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                        <p className="text-xs font-bold text-[#24211F] group-hover:text-blue-700">
                          Vikram Gowda (Branch Property Manager)
                        </p>
                        <span className="text-[9px] bg-blue-100 text-blue-800 font-extrabold px-1.5 py-0.2 rounded uppercase">
                          BRANCH OPERATIONS
                        </span>
                      </div>
                      <p className="text-[11px] text-[#716A63] mt-0.5">
                        Staff member added by PG Owner to handle daily check-ins and payments for assigned properties.
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#716A63] group-hover:text-blue-600 shrink-0" />
                  </button>
                </div>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-[#E8E1D9] w-full" />
                <span className="bg-white px-3 text-[11px] uppercase font-bold text-[#9E968E] shrink-0">
                  Or Sign In With Mobile OTP
                </span>
              </div>

              {/* Standard Mobile OTP Form */}
              <form onSubmit={handlePhoneLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#24211F] mb-1">
                    Registered Mobile Number
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-[#E8E1D9] bg-[#F8F6F2] text-[#716A63] text-xs font-semibold">
                      +91
                    </span>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E8E1D9] rounded-r-lg bg-[#FFFEFC] text-[#24211F] outline-none font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-[#24211F]">One-Time Password (OTP)</label>
                    <span className="text-[10px] text-[#B85C38] font-semibold cursor-pointer">
                      Resend OTP
                    </span>
                  </div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none font-mono tracking-widest text-center"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#B85C38] hover:bg-[#984629] text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                >
                  Sign In with Mobile OTP
                </button>
              </form>
            </div>
          ) : (
            /* Create Platform Owner Account Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs animate-fade-in">
              <div className="p-3 bg-[#FDF4F0] border border-[#F6E2DA] rounded-xl flex items-start gap-2.5">
                <Crown className="w-4 h-4 text-[#B85C38] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#B85C38]">Platform Owner Setup</p>
                  <p className="text-[11px] text-[#716A63] mt-0.5">
                    Create your enterprise administrator account to start managing multiple PG locations, collecting rent, and tracking occupancy.
                  </p>
                </div>
              </div>

              {/* Owner Full Name & Business */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-[#24211F] mb-1">
                    Owner Full Name <span className="text-[#D64545]">*</span>
                  </label>
                  <input
                    type="text"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    placeholder="e.g. Ashish Sharma"
                    className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#24211F] mb-1">
                    PG Enterprise / Business Name <span className="text-[#D64545]">*</span>
                  </label>
                  <input
                    type="text"
                    value={registerData.businessName}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, businessName: e.target.value })
                    }
                    placeholder="e.g. Ashray Living Spaces LLP"
                    className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
                    required
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-[#24211F] mb-1">
                    Mobile Number <span className="text-[#D64545]">*</span>
                  </label>
                  <input
                    type="text"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#24211F] mb-1">
                    Business Email <span className="text-[#D64545]">*</span>
                  </label>
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    placeholder="owner@enterprise.in"
                    className="w-full px-3 py-2 border border-[#E8E1D9] rounded-lg bg-[#FFFEFC] text-[#24211F] outline-none"
                    required
                  />
                </div>
              </div>

              {/* First Property Details */}
              <div className="p-3.5 bg-[#F8F6F2] rounded-xl border border-[#E8E1D9] space-y-3">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#B85C38]" />
                  <span className="font-bold text-[#24211F] text-[11px] uppercase tracking-wider">
                    First Flagship Property Details
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#716A63] text-[11px] mb-1">
                      Property / Branch Name
                    </label>
                    <input
                      type="text"
                      value={registerData.initialPropertyName}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, initialPropertyName: e.target.value })
                      }
                      placeholder="e.g. Ashray Comforts - Koramangala"
                      className="w-full px-3 py-1.5 border border-[#E8E1D9] rounded-lg bg-white text-[#24211F] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#716A63] text-[11px] mb-1">City / Region</label>
                    <input
                      type="text"
                      value={registerData.city}
                      onChange={(e) => setRegisterData({ ...registerData, city: e.target.value })}
                      placeholder="Bengaluru"
                      className="w-full px-3 py-1.5 border border-[#E8E1D9] rounded-lg bg-white text-[#24211F] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#716A63] text-[11px] mb-1">
                      Initial Room Capacity
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={registerData.initialRooms}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          initialRooms: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full px-3 py-1.5 border border-[#E8E1D9] rounded-lg bg-white text-[#24211F] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#716A63] text-[11px] mb-1">
                      Admin Security Password
                    </label>
                    <input
                      type="password"
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, password: e.target.value })
                      }
                      className="w-full px-3 py-1.5 border border-[#E8E1D9] rounded-lg bg-white text-[#24211F] outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#B85C38] hover:bg-[#984629] text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Crown className="w-4 h-4 fill-current" />
                <span>{isLoading ? 'Creating Admin Account...' : 'Create Platform Owner Account'}</span>
              </button>
            </form>
          )}

          {/* Trust badges */}
          <div className="pt-2 border-t border-[#E8E1D9] flex items-center justify-around text-[11px] text-[#716A63]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16845B]" /> Bank-grade security
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16845B]" /> Multi-property RBAC
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16845B]" /> GST & Tax Compliant
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
