import React from 'react';
import { AppProvider, useApp } from './context/AppContext';

// Public Components
import { Navbar } from './components/public/Navbar';
import { Hero } from './components/public/Hero';
import { SambutanKetua } from './components/public/SambutanKetua';
import { VisiMisi } from './components/public/VisiMisi';
import { OrgChart } from './components/public/OrgChart';
import { NewsSection } from './components/public/NewsSection';
import { AgendaSection } from './components/public/AgendaSection';
import { PublicFooter } from './components/public/PublicFooter';

// Admin Components
import { AdminHeader } from './components/admin/AdminHeader';
import { AdminSidebar } from './components/admin/AdminSidebar';
import { DashboardOverview } from './components/admin/DashboardOverview';
import { FiveStageApprovalWorkflow } from './components/admin/FiveStageApprovalWorkflow';
import { MemberManagement } from './components/admin/MemberManagement';
import { UserManagement } from './components/admin/UserManagement';
import { CMSCustomizer } from './components/admin/CMSCustomizer';

// Auth & Security Components
import { LoginPage } from './components/auth/LoginPage';
import { hasTabAccess } from './utils/RoleAccessControl';
import { Lock, ArrowLeft } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, adminSubTab, currentRole, setAdminSubTab, activePersona, isAuthenticated } = useApp();

  // Check if current URL path is explicitly /login
  const isLoginPage = window.location.pathname === '/login';

  // 1. Render Login Page if /login URL is accessed OR if trying to access admin without authentication
  if (isLoginPage || (activeTab === 'admin' && !isAuthenticated)) {
    return <LoginPage />;
  }

  // 2. Render Public Website
  if (activeTab === 'public') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1">
          <Hero />
          <SambutanKetua />
          <VisiMisi />
          <OrgChart />
          <NewsSection />
          <AgendaSection />
        </main>
        <PublicFooter />
      </div>
    );
  }

  // 3. Render Admin Portal (Protected Route & Role Guarded)
  const isTabAllowed = hasTabAccess(currentRole, adminSubTab);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <AdminHeader />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto overflow-x-hidden">
          {!isTabAllowed ? (
            <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm text-center max-w-lg mx-auto space-y-4 my-10">
              <div className="w-16 h-16 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center mx-auto border border-rose-200 shadow-inner">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  Akses Terkunci / Dibatasi
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Role Anda saat ini (<strong>{activePersona.title}</strong>) tidak memiliki izin wewenang untuk membuka menu halaman ini.
                </p>
              </div>
              <button
                onClick={() => setAdminSubTab('dashboard')}
                className="bg-dwp-burgundy hover:bg-dwp-darkBurgundy text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow flex items-center justify-center gap-2 mx-auto transition-all"
              >
                <ArrowLeft className="w-4 h-4 text-dwp-gold" />
                <span>Kembali ke Dashboard Utama</span>
              </button>
            </div>
          ) : (
            <>
              {adminSubTab === 'dashboard' && <DashboardOverview />}
              {adminSubTab === 'proposals' && <FiveStageApprovalWorkflow />}
              {adminSubTab === 'members' && <MemberManagement />}
              {adminSubTab === 'users' && <UserManagement />}
              {adminSubTab === 'cms' && <CMSCustomizer />}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
