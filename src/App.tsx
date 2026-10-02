import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';

// Public views
import { HomeView } from './views/public/HomeView';
import { ServicesView } from './views/public/ServicesView';
import { TherapistsView } from './views/public/TherapistsView';
import { PackagesView } from './views/public/PackagesView';
import { HowItWorksView } from './views/public/HowItWorksView';
import { AboutView } from './views/public/AboutView';
import { FaqsView } from './views/public/FaqsView';
import { ContactView } from './views/public/ContactView';
import { LookupBookingView } from './views/public/LookupBookingView';
import { BookingFlowView } from './views/public/BookingFlowView';
import { LegalView } from './views/public/LegalView';
import { CrisisSupportView } from './views/public/CrisisSupportView';
import { FounderView } from './views/public/FounderView';
import { ResourcesView } from './views/public/ResourcesView';
import { WhatsAppFloatingButton } from './components/common/WhatsAppFloatingButton';
import { PlatformLoader } from './components/common/PlatformLoader';

// Admin views
import { AdminLoginView } from './views/admin/AdminLoginView';
import { AdminDashboardLayout } from './views/admin/AdminDashboardLayout';
import { AdminOverviewView } from './views/admin/AdminOverviewView';
import { AdminBookingsView } from './views/admin/AdminBookingsView';
import { AdminTherapistsView } from './views/admin/AdminTherapistsView';
import { AdminSettlementsView } from './views/admin/AdminSettlementsView';
import { AdminAuditLogsView } from './views/admin/AdminAuditLogsView';
import { AdminSettingsView } from './views/admin/AdminSettingsView';
import { AdminServicesView } from './views/admin/AdminServicesView';

const AppContent: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isPlatformLoading, setIsPlatformLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');
  const [bookingParams, setBookingParams] = useState<{ serviceId?: string; therapistId?: string }>({});

  // Sync with browser history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsPlatformLoading(false), 700);
    return () => window.clearTimeout(timer);
  }, []);

  if (isPlatformLoading || isAuthLoading) {
    return <PlatformLoader />;
  }

  const navigate = (path: string, options?: { serviceId?: string; therapistId?: string }) => {
    if (options) {
      setBookingParams({
        serviceId: options.serviceId,
        therapistId: options.therapistId,
      });
    } else if (path !== '/book') {
      setBookingParams({});
    }

    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAdminRoute =
    (currentPath.startsWith('/admin') || currentPath.startsWith('/portal-gateway')) &&
    currentPath !== '/admin/login' &&
    currentPath !== '/portal-gateway';

  const isLoginPage = currentPath === '/admin/login' || currentPath === '/portal-gateway';

  // Admin tabs dispatcher
  const renderAdminContent = () => {
    if (!user && !isAuthLoading) {
      return <AdminLoginView navigate={navigate} />;
    }

    if (currentPath.includes('/bookings')) {
      return <AdminBookingsView />;
    }
    if (currentPath.includes('/therapists')) {
      return <AdminTherapistsView />;
    }
    if (currentPath.includes('/services') || currentPath.includes('/packages')) {
      return <AdminServicesView />;
    }
    if (currentPath.includes('/settlements')) {
      return <AdminSettlementsView />;
    }
    if (currentPath.includes('/audit')) {
      return <AdminAuditLogsView />;
    }
    if (currentPath.includes('/settings')) {
      return <AdminSettingsView />;
    }

    // Default overview
    return <AdminOverviewView onTabChange={(tab) => navigate(`/admin/${tab === 'overview' ? 'dashboard' : tab}`)} />;
  };

  // If on admin route and authenticated
  if (isAdminRoute && user) {
    let currentTab = 'overview';
    if (currentPath.includes('bookings')) currentTab = 'bookings';
    else if (currentPath.includes('therapists')) currentTab = 'therapists';
    else if (currentPath.includes('services') || currentPath.includes('packages')) currentTab = 'services';
    else if (currentPath.includes('settlements')) currentTab = 'settlements';
    else if (currentPath.includes('audit')) currentTab = 'audit';
    else if (currentPath.includes('settings')) currentTab = 'settings';

    return (
      <AdminDashboardLayout
        currentTab={currentTab}
        onTabChange={(tab) => navigate(`/admin/${tab === 'overview' ? 'dashboard' : tab}`)}
        navigate={navigate}
      >
        {renderAdminContent()}
      </AdminDashboardLayout>
    );
  }

  // If on unauthenticated admin route or login portal, render clean login view without public distractions
  if ((isAdminRoute || isLoginPage) && !user) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex flex-col justify-center">
        <AdminLoginView navigate={navigate} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C2420]">
      <Header currentPath={currentPath} navigate={navigate} />

      <main className="flex-1">
        {currentPath === '/' && <HomeView navigate={navigate} />}
        {currentPath === '/services' && <ServicesView navigate={navigate} />}
        {currentPath === '/therapists' && <TherapistsView navigate={navigate} />}
        {currentPath === '/packages' && <PackagesView navigate={navigate} />}
        {currentPath === '/how-it-works' && <HowItWorksView navigate={navigate} />}
        {currentPath === '/about' && <AboutView navigate={navigate} />}
        {currentPath === '/faqs' && <FaqsView navigate={navigate} />}
        {currentPath === '/contact' && <ContactView />}
        {currentPath === '/resources' && <ResourcesView navigate={navigate} />}
        {currentPath === '/founder' && <FounderView navigate={navigate} />}
        {(currentPath === '/helen-maina' || currentPath === '/portfolio') && (
          <FounderView navigate={navigate} />
        )}
        {currentPath === '/lookup' && <LookupBookingView navigate={navigate} />}
        {currentPath === '/privacy' && <LegalView type="privacy" navigate={navigate} />}
        {currentPath === '/terms' && <LegalView type="terms" navigate={navigate} />}
        {currentPath === '/crisis' && <CrisisSupportView navigate={navigate} />}
        {currentPath === '/book' && (
          <BookingFlowView
            initialServiceId={bookingParams.serviceId}
            initialTherapistId={bookingParams.therapistId}
            navigate={navigate}
          />
        )}
        {currentPath.startsWith('/admin') && !user && <AdminLoginView navigate={navigate} />}
      </main>

      <Footer navigate={navigate} />
      <WhatsAppFloatingButton />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
