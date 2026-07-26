import { Menu, User as UserIcon, LogOut, Settings as SettingsIcon, Moon, Sun } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { logoutFirebase } from '../lib/firebase';
import toast from 'react-hot-toast';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout, theme, setTheme } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    try {
      await logoutFirebase();
      await logout();
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <header className="h-16 bg-base-100 border-b border-base-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 w-full">
      <div className="flex items-center">
        <Link 
          to="/dashboard" 
          className="lg:hidden flex items-center w-32 sm:w-48 lg:w-56 h-16 -ml-2"
          onClick={() => {
            if (location.pathname === '/dashboard') {
              window.location.reload();
            }
          }}
        >
          {theme === 'dark' ? (
            <img src="/logo-dark.png" alt="CashTrack" className="w-full h-full object-contain object-left scale-[1.4] sm:scale-[1.8] origin-left pointer-events-none" />
          ) : (
            <img src="/logo-light.png" alt="CashTrack" className="w-full h-full object-contain object-left scale-[1.4] sm:scale-[1.8] origin-left pointer-events-none" />
          )}
        </Link>
        <h1 className="text-lg font-semibold hidden md:block">Welcome back, {user?.name?.split(' ')[0]}!</h1>
      </div>

      <div className="flex items-center gap-1 sm:gap-4 relative z-50">
        <button 
          className="btn btn-ghost btn-circle shrink-0" 
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-base-200 flex items-center justify-center">
              {user?.avatar ? (
                <img alt="User avatar" src={user.avatar} className="rounded-full" />
              ) : (
                <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-base-content/50" />
              )}
            </div>
          </div>
          <ul tabIndex={0} className="mt-3 z-[1] p-3 shadow-xl menu menu-sm dropdown-content bg-base-100 rounded-2xl w-max min-w-[15rem] max-w-[20rem] border border-base-200">
            <li className="mb-1 pointer-events-none">
              <div className="flex flex-col items-start gap-0.5 bg-base-200/30 p-3 rounded-xl w-full overflow-hidden">
                <span className="font-bold text-base-content text-sm w-full truncate">{user?.name}</span>
                <span className="text-xs text-base-content/60 w-full truncate">{user?.email}</span>
              </div>
            </li>
            <div className="divider my-1"></div>
            <li>
              <Link to="/manage-account" className="hover:bg-base-200/50 rounded-xl py-2.5 font-medium transition-colors">
                <SettingsIcon className="w-4 h-4 mr-2" />
                Manage Account
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className="text-error hover:bg-error/10 hover:text-error rounded-xl py-2.5 transition-colors font-medium">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </li>
          </ul>
        </div>

        <button 
          className="lg:hidden btn btn-ghost btn-circle relative z-50 shrink-0 ml-1"
          onClick={toggleSidebar}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
