import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/candidates', label: 'Candidates', icon: Users },
  { to: '/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/chat', label: 'Chat with RIYA', icon: MessageSquare },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function UserAvatar({ name, size = 32 }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className="rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center font-semibold shrink-0 select-none"
    >
      {initials}
    </div>
  );
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-surface-secondary">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-sidebar flex flex-col transform transition-all duration-150 ease-in-out lg:static lg:z-auto border-r border-sidebar-border ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${collapsed ? 'w-14' : 'w-52'}`}
      >
        {/* Brand */}
        <div className={`flex items-center h-12 border-b border-sidebar-border ${collapsed ? 'justify-center px-2' : 'px-3.5'}`}>
          {!collapsed ? (
            <span className="text-[13px] font-bold text-white tracking-wide uppercase">
              Clockwork
              <span className="text-sidebar-text font-normal text-[10px] ml-1.5 tracking-widest">ATS</span>
            </span>
          ) : (
            <span className="text-xs font-bold text-white">C</span>
          )}

          {/* Mobile close */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-sidebar-text hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <nav className={`flex-1 py-2 space-y-px overflow-y-auto ${collapsed ? 'px-1.5' : 'px-1'}`}>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-r text-[13px] transition-colors duration-75 ${
                  collapsed ? 'justify-center p-2 rounded' : 'px-2.5 py-[6px]'
                } ${
                  isActive
                    ? 'bg-sidebar-active text-white font-medium border-l-2 border-white'
                    : 'text-sidebar-text hover:text-sidebar-text-active hover:bg-sidebar-hover border-l-2 border-transparent'
                }`
              }
            >
              <Icon size={15} className="shrink-0" strokeWidth={1.7} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle — desktop */}
        <div className={`hidden lg:flex border-t border-sidebar-border ${collapsed ? 'justify-center p-2' : 'px-2 py-1.5'}`}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-sidebar-text hover:text-sidebar-text-active transition-colors p-1 rounded hover:bg-sidebar-hover"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
          </button>
        </div>

        {/* User */}
        <div className={`border-t border-sidebar-border ${collapsed ? 'p-1.5' : 'p-2'}`}>
          {!collapsed && (
            <div className="flex items-center gap-2 px-2.5 py-1.5 mb-1">
              <UserAvatar name={user?.name || 'U'} size={26} />
              <div className="min-w-0">
                <p className="text-sidebar-text-active text-[12px] font-medium truncate leading-tight">
                  {user?.name}
                </p>
                <p className="text-sidebar-text text-[10px] truncate leading-tight capitalize">
                  {user?.role || 'recruiter'}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={collapsed ? 'Sign out' : undefined}
            className={`flex items-center gap-2 rounded text-[12px] text-sidebar-text hover:text-red-400 hover:bg-red-500/10 transition-colors w-full ${
              collapsed ? 'justify-center p-2' : 'px-2.5 py-[5px]'
            }`}
          >
            <LogOut size={14} strokeWidth={1.7} />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-12 bg-surface border-b border-border flex items-center justify-between px-4 lg:px-5 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-text-secondary hover:text-text-primary transition-colors"
          >
            <Menu size={18} />
          </button>
          <div className="hidden lg:block" />

          <div className="flex items-center gap-2.5">
            <div className="text-right hidden sm:block">
              <p className="text-[12px] font-medium text-text-primary leading-tight">
                {user?.name}
              </p>
              <p className="text-[10px] text-text-muted leading-tight">
                {user?.agencyName}
              </p>
            </div>
            <UserAvatar name={user?.name || 'U'} size={28} />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-5 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
