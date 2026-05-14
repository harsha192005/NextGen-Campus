import { ReactNode, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  Award,
  BarChart3,
  Bell,
  Calendar,
  CreditCard,
  FileText,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  QrCode,
  Search,
  Settings,
  Shield,
  Sparkles,
  Sun,
  Trophy,
  UserCircle,
  Users,
  X,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const studentNavItems = [
    { label: 'Home', icon: Home, path: '/student/dashboard' },
    { label: 'Events', icon: Calendar, path: '/student/events' },
    { label: 'Registrations', icon: Trophy, path: '/student/my-events' },
    { label: 'Certificates', icon: Award, path: '/student/certificates' },
    { label: 'Analytics', icon: BarChart3, path: '/student/leaderboard' },
    { label: 'Teams', icon: Users, path: '/student/teams' },
    { label: 'AI Assistant', icon: Sparkles, path: '/student/ai-chat' },
  ];

  const adminNavItems = [
    { label: 'Home', icon: Home, path: '/admin/dashboard' },
    { label: 'Events', icon: Calendar, path: '/admin/events' },
    { label: 'Registrations', icon: Trophy, path: '/admin/registrations' },
    { label: 'Payments', icon: CreditCard, path: '/admin/payments' },
    { label: 'Attendance Scanner', icon: QrCode, path: '/admin/attendance' },
    { label: 'Certificates', icon: FileText, path: '/admin/certificates' },
    { label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { label: 'Reports', icon: FileText, path: '/admin/reports' },
    { label: 'Students', icon: Users, path: '/admin/students' },
    { label: 'Admin Management', icon: Shield, path: '/admin/admins' },
    { label: 'Notifications', icon: Bell, path: '/admin/notifications' },
    { label: 'Profile', icon: UserCircle, path: '/admin/profile' },
    { label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : studentNavItems;

  const filteredNav = useMemo(
    () => navItems.filter((item) => item.label.toLowerCase().includes(search.toLowerCase())),
    [navItems, search],
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-white">
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-white/10 bg-white/80 backdrop-blur-xl dark:bg-slate-950/80">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen((value) => !value)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
                aria-label="Toggle navigation"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <button onClick={() => navigate(user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard')} className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-fuchsia-500 shadow-lg shadow-cyan-500/20" />
                <span className="hidden sm:block text-lg font-bold">NextGen Campus</span>
              </button>
            </div>

            <div className="hidden md:flex max-w-xl flex-1">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search navigation"
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-white/10 border border-transparent focus:border-cyan-400 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 relative">
              <button
                onClick={() => setIsDark((value) => !value)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
                title="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setShowNotifications((value) => !value)}
                className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
              </button>
              <button
                onClick={() => setShowProfile((value) => !value)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-400 flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold leading-tight">{user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
                </div>
              </button>

              {showNotifications ? (
                <div className="absolute right-12 top-12 w-80 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-xl p-4">
                  <h3 className="font-bold mb-3">Notifications</h3>
                  <div className="space-y-3">
                    {['Attendance scanner ready', 'Dashboard analytics synced', 'MongoDB connection active'].map((item) => (
                      <div key={item} className="p-3 rounded-lg bg-slate-50 dark:bg-white/10 text-sm">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {showProfile ? (
                <div className="absolute right-0 top-12 w-64 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-xl p-4">
                  <p className="font-bold">{user?.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{user?.email}</p>
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => navigate(user?.role === 'admin' ? '/admin/profile' : '/student/dashboard')}>
                    Profile
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => navigate(user?.role === 'admin' ? '/admin/settings' : '/student/dashboard')}>
                    Settings
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </nav>

      <aside
        className={`fixed top-16 left-0 bottom-0 z-30 w-72 border-r border-white/10 bg-white/85 dark:bg-slate-950/90 backdrop-blur-xl transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="h-full flex flex-col">
          <div className="md:hidden p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-white/10 outline-none"
              />
            </div>
          </div>
          <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
            {filteredNav.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.button
                  key={item.path}
                  whileHover={{ x: 4 }}
                  onClick={() => {
                    navigate(item.path);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-lg shadow-cyan-500/20'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              );
            })}
          </nav>
          <div className="p-4 border-t border-slate-200 dark:border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="pt-16 transition-all duration-300 lg:pl-72">{children}</main>

      {isSidebarOpen ? (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      ) : null}
    </div>
  );
};

export default Layout;
