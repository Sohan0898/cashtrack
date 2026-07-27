import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { ArrowRight, Moon, Sun, User as UserIcon, LogOut, Settings as SettingsIcon, LayoutDashboard, Menu, X, RefreshCw, Calculator, Sparkles, DollarSign, Info } from 'lucide-react';
import { logoutFirebase, signInWithGoogle } from '../lib/firebase';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function PublicNavbar() {
  const { t } = useTranslation();
  const { isAuthenticated, user, login, logout, isLoading, theme, setTheme } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    try {
      await logoutFirebase();
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      const idToken = await result.user.getIdToken();
      const success = await login(idToken);
      if (success) {
        toast.success('Login successful!');
        document.getElementById('login_modal')?.close();
        navigate('/dashboard');
      } else {
        toast.error('Failed to authenticate with server');
      }
    } catch (error) {
      toast.error('Google Sign-In failed');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'Currency Converter', path: '/currency-converter' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'About Us', path: '/about' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-base-100/70 backdrop-blur-md border-b border-base-content/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center w-32 sm:w-44 lg:w-52 h-16 -ml-2">
            {theme === 'dark' ? (
              <img src="/logo-dark.png" alt="CashTrack" className="w-full h-full object-contain object-left scale-[1.4] sm:scale-[1.7] origin-left pointer-events-none" />
            ) : (
              <img src="/logo-light.png" alt="CashTrack" className="w-full h-full object-contain object-left scale-[1.4] sm:scale-[1.7] origin-left pointer-events-none" />
            )}
          </Link>
          
          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`transition-all duration-200 ${
                    isActive
                      ? 'text-primary font-semibold border-b-2 border-primary py-1'
                      : 'text-base-content/70 hover:text-base-content hover:scale-105'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4 relative z-50">
            {/* Theme Toggle */}
            <button 
              className="btn btn-ghost btn-circle shrink-0" 
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-[#BFDF4F]" />}
            </button>
            
            {/* Auth Dropdown / Sign In Button */}
            {isLoading ? (
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-base-content/10 animate-pulse rounded-full shrink-0"></div>
            ) : isAuthenticated ? (
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-base-200 flex items-center justify-center border border-base-300">
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
                    <Link to="/dashboard" className="hover:bg-base-200/50 rounded-xl py-2.5 font-medium transition-colors">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </li>
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
            ) : (
              <button 
                onClick={() => document.getElementById('login_modal')?.showModal()} 
                className="flex bg-primary text-primary-content px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold items-center gap-1 sm:gap-2 hover:opacity-90 transition-all shadow-sm shrink-0"
              >
                {t('Sign In') || 'Sign In'} <ArrowRight className="w-4 h-4 -rotate-45 hidden sm:block" />
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button 
              className="lg:hidden btn btn-ghost btn-circle shrink-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-base-content/10 bg-base-100/95 backdrop-blur-xl px-6 py-4 space-y-3 shadow-2xl transition-all">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl font-medium text-base transition-colors ${
                    isActive 
                      ? 'bg-primary/10 text-primary font-bold' 
                      : 'text-base-content/80 hover:bg-base-200'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Login Glass Modal (shared) */}
      <dialog id="login_modal" className="modal modal-bottom sm:modal-middle backdrop-blur-md">
        <div className="modal-box bg-base-100/70 dark:bg-black/60 backdrop-blur-2xl border border-base-content/10 rounded-3xl p-8 max-w-md shadow-2xl relative">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-base-content/60 hover:text-base-content">
              <X className="w-5 h-5" />
            </button>
          </form>

          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <img src="/logo-icon.png" alt="CashTrack" className="w-10 h-10 object-contain" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">Welcome to CashTrack</h3>
            <p className="text-sm text-base-content/60 mt-1">Sign in to sync your income, expenses & savings seamlessly</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              className="w-full btn btn-lg bg-base-100 border border-base-300 hover:bg-base-200 text-base-content font-medium rounded-2xl flex items-center justify-center gap-3 shadow-sm hover:shadow transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Continue with Google
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-base-content/50">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      </dialog>
    </>
  );
}
