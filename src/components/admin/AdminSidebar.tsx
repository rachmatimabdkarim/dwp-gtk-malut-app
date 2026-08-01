import React from 'react';
import { useApp } from '../../context/AppContext';
import { hasTabAccess, getRoleDescription, AdminSubTab } from '../../utils/RoleAccessControl';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  UserCheck, 
  Globe,
  ScrollText,
  UserCog
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const { currentRole, activePersona, adminSubTab, setAdminSubTab, proposals, notifications } = useApp();

  const roleInfo = getRoleDescription(currentRole);
  const pendingApprovalCount = proposals.filter(p => p.currentStage !== 'approved' && p.currentStage !== 'rejected').length;
  const unreadRoleNotifs = notifications.filter(n => (n.targetRole === currentRole || n.targetRole === 'all') && !n.isRead).length;

  const activityBadge = unreadRoleNotifs > 0 ? unreadRoleNotifs : (pendingApprovalCount > 0 ? pendingApprovalCount : null);

  const rawNavItems = [
    {
      id: 'dashboard' as AdminSubTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'proposals' as AdminSubTab,
      label: 'Kegiatan',
      icon: CheckSquare,
      badge: activityBadge
    },
    {
      id: 'members' as AdminSubTab,
      label: 'Data Anggota',
      icon: Users,
      badge: null
    },
    {
      id: 'users' as AdminSubTab,
      label: 'Akun User & Hak Akses',
      icon: UserCheck,
      badge: null
    },
    {
      id: 'cms' as AdminSubTab,
      label: 'CMS Customizer',
      icon: Globe,
      badge: null
    },
    {
      id: 'logs' as AdminSubTab,
      label: 'Log Audit & Aktivitas',
      icon: ScrollText,
      badge: null
    },
    {
      id: 'profile' as AdminSubTab,
      label: 'Profil Saya',
      icon: UserCog,
      badge: null
    }
  ];

  // Dynamically filter nav items based on active role permissions
  const navItems = rawNavItems.filter(item => hasTabAccess(currentRole, item.id));

  return (
    <aside className="w-56 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col flex-shrink-0 min-h-[calc(100vh-60px)] p-3 space-y-4">
      
      {/* Role Active Info Card */}
      <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-xs space-y-1.5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[9px] uppercase font-bold text-dwp-gold tracking-wider">Akses Role Aktif</span>
          <span className="text-sm">{roleInfo.icon}</span>
        </div>
        <div className="font-bold text-white text-xs truncate">
          {activePersona.name}
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          {roleInfo.description}
        </p>
      </div>

      <div className="space-y-1">
        <p className="px-2 text-[9px] uppercase font-bold tracking-widest text-slate-500 mb-1.5 flex items-center justify-between">
          <span>Menu Pengelolaan</span>
          <span className="text-dwp-gold font-mono">[{navItems.length} Menu]</span>
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = adminSubTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setAdminSubTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-dwp-burgundy text-white shadow border border-dwp-gold/40'
                  : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-dwp-gold' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-dwp-gold text-slate-950' : 'bg-slate-800 text-dwp-gold border border-slate-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Official Footer Note */}
      <div className="mt-auto pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 text-center space-y-0.5">
        <div className="font-bold text-slate-400">DWP GTK Maluku Utara</div>
        <div>Sistem Informasi Organisasi V1.0</div>
      </div>
    </aside>
  );
};
