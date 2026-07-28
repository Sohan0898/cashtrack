import { NavLink, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ArrowDownToLine, ArrowUpFromLine, PiggyBank, PieChart, Settings, X, Wallet, Database, Home, Landmark } from 'lucide-react';

import useAuthStore from '../store/authStore';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { theme } = useAuthStore();
  const location = useLocation();
  
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Income', path: '/income', icon: ArrowDownToLine },
    { name: 'Expenses', path: '/expenses', icon: ArrowUpFromLine },
    { name: 'Savings', path: '/savings', icon: PiggyBank },
    { name: 'Bank Interest', path: '/interest', icon: Landmark },
    { name: 'Reports', path: '/reports', icon: PieChart },
    { name: 'Restore & Backup', path: '/backup', icon: Database },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-base-100 border-r border-base-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-base-200">
          <Link 
            to="/dashboard" 
            className="flex items-center w-48 h-full -ml-2"
            onClick={() => {
              if (location.pathname === '/dashboard') {
                window.location.reload();
              }
              setIsOpen(false);
            }}
          >
            {theme === 'dark' ? (
              <img src="/logo-dark.png" alt="CashTrack" className="w-full h-full object-contain object-left scale-[1.8] origin-left" />
            ) : (
              <img src="/logo-light.png" alt="CashTrack" className="w-full h-full object-contain object-left scale-[1.8] origin-left" />
            )}
          </Link>
          <button 
            className="lg:hidden btn btn-ghost btn-circle btn-sm"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-3 rounded-xl transition-colors
                  ${isActive 
                    ? 'bg-primary text-primary-content font-medium shadow-md shadow-primary/20' 
                    : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'}
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="p-4 border-t border-base-200 mt-auto">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-base-content/70 hover:bg-base-200 hover:text-base-content w-full"
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
