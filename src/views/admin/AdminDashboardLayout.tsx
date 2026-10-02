import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  CreditCard,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Settings,
  Activity,
  ChevronRight,
  ShieldAlert,
  PanelLeftClose,
  PanelLeftOpen,
  Maximize2,
  Minimize2,
  Sparkles,
  KeyRound,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/common/Logo';
import { Button } from '../../components/common/Button';
import { api } from '../../api';

interface AdminDashboardLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  navigate: (path: string) => void;
  children: React.ReactNode;
}

export const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({
  currentTab,
  onTabChange,
  navigate,
  children,
}) => {
  const { user, logout, isSuperAdmin, isTherapist, isBusinessOwnerAdmin, isPlatformAdmin } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isWidescreenFluid, setIsWidescreenFluid] = useState(true);

  // Password Change Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Ensure noindex meta tag is present on admin dashboard
  useEffect(() => {
    let metaTag = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    let created = false;
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = 'robots';
      document.head.appendChild(metaTag);
      created = true;
    }
    const previousContent = metaTag.content;
    metaTag.content = 'noindex, nofollow';

    return () => {
      if (metaTag) {
        if (created) {
          metaTag.remove();
        } else {
          metaTag.content = previousContent || 'index, follow';
        }
      }
    };
  }, []);

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileSidebarOpen(false);
        setShowPasswordModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus({ type: null, message: '' });

    if (newPassword.length < 8) {
      setPasswordStatus({ type: 'error', message: 'New password must be at least 8 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await api.changePassword({ currentPassword, newPassword });
      setPasswordStatus({ type: 'success', message: res.message || 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordStatus({ type: null, message: '' });
      }, 1500);
    } catch (err: any) {
      setPasswordStatus({ type: 'error', message: err.message || 'Failed to change password.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const navItems = [
    {
      id: 'overview',
      label: 'Executive Overview',
      subtitle: 'Analytics & KPIs',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'bookings',
      label: 'Bookings & Sessions',
      subtitle: 'Dispatch & Schedule',
      icon: <Calendar className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'therapists',
      label: 'Therapists & Verification',
      subtitle: 'Licensing & Roster',
      icon: <Users className="w-4 h-4 shrink-0" />,
      hideForTherapist: true,
    },
    {
      id: 'services',
      label: 'Services & Packages',
      subtitle: 'Catalog, Rates & Bundles',
      icon: <Sparkles className="w-4 h-4 shrink-0" />,
      hideForTherapist: true,
    },
    {
      id: 'settlements',
      label: 'Settlements & Payouts',
      subtitle: '80/20 Financial Ledger',
      icon: <CreditCard className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'audit',
      label: 'Security & Audit Trail',
      subtitle: 'Immutable Logs',
      icon: <ShieldAlert className="w-4 h-4 shrink-0" />,
      superAdminOnly: true,
    },
    {
      id: 'settings',
      label: 'Clinic & System Settings',
      subtitle: 'Hours, Till & Rates',
      icon: <Settings className="w-4 h-4 shrink-0" />,
    },
  ];

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentTabObj = navItems.find((item) => item.id === currentTab) || navItems[0];

  return (
    <div className="min-h-screen bg-[#FBF9F5] flex overflow-x-hidden">
      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Desktop Collapsible + Mobile Slide-over) */}
      <aside
        className={`fixed lg:sticky top-0 bottom-0 left-0 z-50 bg-white border-r border-[#E3DED6] flex flex-col justify-between transition-all duration-300 ease-in-out lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0 shadow-2xl w-72' : '-translate-x-full lg:translate-x-0'
        } ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-72'} h-screen shrink-0 select-none`}
      >
        <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden">
          {/* Brand Header */}
          <div className="p-4 sm:p-5 border-b border-[#EDE9E1] flex items-center justify-between">
            <button
              onClick={() => handleTabClick('overview')}
              className={`text-left cursor-pointer focus:outline-none transition-all ${
                isSidebarCollapsed ? 'mx-auto' : ''
              }`}
              aria-label="Be Sawa Admin Overview"
            >
              {!isSidebarCollapsed ? (
                <>
                  <Logo variant="horizontal" size="sm" />
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md bg-[#2D5A46] text-white">
                      Admin Console
                    </span>
                    <span className="text-[10px] text-[#78867E] font-medium">v2.5 Live</span>
                  </div>
                </>
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1E3F30] to-[#2D5A46] text-white flex items-center justify-center font-bold text-sm shadow-sm border border-[#C89D57]/30">
                  BS
                </div>
              )}
            </button>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-[#54635B] hover:text-[#1C2420] hover:bg-[#F4EFEA]"
              aria-label="Close Admin Navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card */}
          <div
            className={`p-3 mx-3 my-3 bg-[#FBF9F5] rounded-2xl border border-[#EDE9E1] transition-all ${
              isSidebarCollapsed ? 'text-center p-2 mx-2' : ''
            }`}
          >
            <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2D5A46] to-[#1E3F30] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 border border-[#C89D57]/30">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#1C2420] truncate">{user?.full_name}</div>
                  <div className="text-[11px] text-[#54635B] truncate">{user?.email}</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#EBF2EE] text-[#2D5A46] border border-[#2D5A46]/20 uppercase">
                      {user?.roles?.join(' • ') || 'ADMIN'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-1 flex-1">
            {!isSidebarCollapsed && (
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#78867E] px-3 mb-2 flex items-center justify-between">
                <span>Platform Modules</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              </div>
            )}
            <nav className="space-y-1">
              {navItems.map((item) => {
                if (item.superAdminOnly && !isSuperAdmin) return null;
                if (item.hideForTherapist && isTherapist && !isSuperAdmin) return null;

                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    title={isSidebarCollapsed ? `${item.label} (${item.subtitle})` : undefined}
                    className={`w-full flex items-center ${
                      isSidebarCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-3.5 py-2.5'
                    } rounded-xl text-left transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-[#2D5A46] text-white shadow-xs font-semibold'
                        : 'text-[#54635B] hover:text-[#1C2420] hover:bg-[#F4EFEA]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`transition-colors ${
                          isActive ? 'text-white' : 'text-[#78867E] group-hover:text-[#2D5A46]'
                        }`}
                      >
                        {item.icon}
                      </span>
                      {!isSidebarCollapsed && (
                        <div>
                          <div className="text-xs leading-tight font-medium">{item.label}</div>
                          <div
                            className={`text-[10px] leading-tight mt-0.5 ${
                              isActive ? 'text-[#C9DFC4]' : 'text-[#78867E]'
                            }`}
                          >
                            {item.subtitle}
                          </div>
                        </div>
                      )}
                    </div>
                    {!isSidebarCollapsed && isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-[#C9DFC4]" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick System Health Box (Shown when expanded) */}
          {!isSidebarCollapsed && (
            <div className="p-3.5 mx-3 mb-3 bg-[#EBF2EE]/70 rounded-2xl border border-[#2D5A46]/15">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#2D5A46] mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#286E47] animate-pulse" />
                  M-Pesa Till 174379
                </span>
                <Activity className="w-3.5 h-3.5 text-[#2D5A46]" />
              </div>
              <p className="text-[10px] text-[#54635B] leading-relaxed">
                Daraja C2B/STK Engine live with instant 80/20 practitioner split ledger.
              </p>
            </div>
          )}

          {/* Bottom Actions & Collapse Toggle */}
          <div className="p-3 border-t border-[#EDE9E1] space-y-2 bg-white">
            {/* Desktop Sidebar Collapse Toggle */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex w-full items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#54635B] hover:text-[#1C2420] hover:bg-[#F4EFEA] transition-colors cursor-pointer"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar to Icon Rail'}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-[#2D5A46]" />
              ) : (
                <>
                  <PanelLeftClose className="w-4 h-4 text-[#78867E]" />
                  <span>Collapse Rail</span>
                </>
              )}
            </button>

            <button
              onClick={() => navigate('/')}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#54635B] hover:text-[#1C2420] hover:bg-[#F4EFEA] border border-[#E3DED6] transition-colors cursor-pointer ${
                isSidebarCollapsed ? 'px-2' : ''
              }`}
              title="Return to Public Website"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#78867E]" />
              {!isSidebarCollapsed && <span>Public Website</span>}
            </button>

            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#A63B30] hover:bg-[#FCECE9] transition-colors cursor-pointer ${
                isSidebarCollapsed ? 'px-2' : ''
              }`}
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              {!isSidebarCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area: High-Density Maximized Horizontal Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Executive Command Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E3DED6] px-4 sm:px-6 lg:px-8 xl:px-10 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            {/* Mobile Navigation Menu Button */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#1C2420] bg-[#FBF9F5] hover:bg-[#EBF2EE] border border-[#E3DED6] transition-colors cursor-pointer"
              aria-label="Open Admin Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Trail */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#78867E]">
                <span>Admin Console</span>
                <span>/</span>
                <span className="font-semibold text-[#2D5A46]">{currentTabObj.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-[#1C2420] leading-tight">
                  {currentTabObj.label}
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF2EE] text-[#2D5A46] border border-[#2D5A46]/20">
                  <Sparkles className="w-2.5 h-2.5 text-[#C89D57]" />
                  <span>Phase 1 Verified</span>
                </span>
              </div>
            </div>
          </div>

          {/* Top Right Executive Command Ribbon */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Daraja Status Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF2EE] text-[#2D5A46] text-xs font-bold border border-[#2D5A46]/20 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>Daraja Till 174379</span>
            </div>

            {/* Widescreen Horizontal Maximizer Toggle */}
            <button
              onClick={() => setIsWidescreenFluid(!isWidescreenFluid)}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E3DED6] text-xs font-semibold text-[#54635B] hover:text-[#1C2420] hover:bg-[#F4EFEA] transition-colors cursor-pointer"
              title={isWidescreenFluid ? 'Switch to Standard Width' : 'Maximize Horizontal Widescreen Canvas'}
            >
              {isWidescreenFluid ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-[#2D5A46]" />
                  <span className="hidden xl:inline">Standard Width</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-[#2D5A46]" />
                  <span className="hidden xl:inline">Maximize Width</span>
                </>
              )}
            </button>

            {/* Public Site Link */}
            <button
              onClick={() => navigate('/')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E3DED6] text-xs font-semibold text-[#54635B] hover:text-[#1C2420] hover:bg-[#F4EFEA] transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Site</span>
            </button>

            {/* Change Password Button */}
            <button
              onClick={() => setShowPasswordModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E3DED6] text-xs font-semibold text-[#54635B] hover:text-[#1C2420] hover:bg-[#F4EFEA] transition-colors cursor-pointer"
              title="Change Password"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#2D5A46]" />
              <span className="hidden sm:inline">Password</span>
            </button>

            {/* Sign Out Button */}
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold text-[#A63B30] hover:bg-[#FCECE9] transition-colors cursor-pointer flex items-center gap-1.5"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Dynamic Content Body: Maximized Horizontal Spacing */}
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 w-full transition-all duration-300 ${
            isWidescreenFluid ? 'max-w-[2100px] mx-auto' : 'max-w-7xl mx-auto'
          }`}
        >
          {children}
        </main>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#E3DED6] shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE9E1]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EBF2EE] text-[#2D5A46] flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C2420]">Change Admin Password</h3>
                  <p className="text-xs text-[#54635B]">Update credentials securely for {user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1.5 text-[#78867E] hover:text-[#1C2420] rounded-lg hover:bg-[#F4EFEA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passwordStatus.message && (
              <div
                className={`p-3 rounded-xl text-xs font-medium ${
                  passwordStatus.type === 'success'
                    ? 'bg-[#EBF2EE] text-[#2D5A46] border border-[#2D5A46]/20'
                    : 'bg-[#FCECE9] text-[#A63B30] border border-[#A63B30]/20'
                }`}
              >
                {passwordStatus.message}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1C2420] mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3.5 py-2.5 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C2420] mb-1">New Password (Min 8 chars)</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3.5 py-2.5 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C2420] mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3.5 py-2.5 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isChangingPassword}
                  leftIcon={<Lock className="w-3.5 h-3.5" />}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
