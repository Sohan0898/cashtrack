import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { ArrowRight, Activity, TrendingUp, DollarSign, Bitcoin, Wallet, Bell, Search, Star, Moon, Sun, User as UserIcon, LogOut, Settings as SettingsIcon, LayoutDashboard, X } from 'lucide-react';
import { logoutFirebase, signInWithGoogle } from '../lib/firebase';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../lib/currency';
import toast from 'react-hot-toast';

import PublicNavbar from '../components/PublicNavbar';

export default function Landing() {
  const { t } = useTranslation();
  const { isAuthenticated, user, login, logout, isLoading, theme, setTheme } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-base-100 text-base-content font-sans overflow-hidden relative transition-colors duration-300">
      {/* Grid Pattern Background */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-10"
        style={{
          backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Radial Glows */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent rounded-full blur-[150px] opacity-10 dark:opacity-20 -translate-y-1/2 translate-x-1/3 z-0 transition-opacity"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent rounded-full blur-[150px] opacity-10 dark:opacity-20 translate-y-1/3 -translate-x-1/3 z-0 transition-opacity"></div>

      <div className="relative z-10 w-full flex flex-col items-center">
        <PublicNavbar />

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 mt-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-base-content/5 border border-base-content/10 text-xs text-base-content/80 mb-8 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-base-content/40"></div>
            Take absolute control of your personal finances
          </div>
          
          <h1 className="text-5xl md:text-7xl font-sans font-bold tracking-tight mb-6 leading-[1.1]">
            Master Your <span style={{ fontFamily: 'Georgia, serif' }} className="font-bold italic dark:text-[#BFDF4F]">Financial Future</span> with Smart Tracking
          </h1>
          
          <p className="text-base-content/60 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Track your income, monitor daily expenses, and achieve your savings goals effortlessly with a beautifully simple, all-in-one financial dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isLoading ? (
              <div className="w-full sm:w-48 h-12 bg-base-content/10 animate-pulse rounded-xl"></div>
            ) : isAuthenticated ? (
              <Link to="/dashboard" className="w-full sm:w-auto bg-primary text-primary-content px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                Go to Dashboard <ArrowRight className="w-4 h-4 -rotate-45" />
              </Link>
            ) : (
              <button onClick={() => document.getElementById('login_modal').showModal()} className="w-full sm:w-auto bg-primary text-primary-content px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                Get Started <ArrowRight className="w-4 h-4 -rotate-45" />
              </button>
            )}
          </div>
        </div>

        {/* Floating Widgets Area */}
        <div className="relative w-full max-w-4xl h-[400px] mt-10">
          
          {/* Center Phone Mockup */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[280px] h-[360px] bg-base-200 rounded-t-3xl border-t-8 border-x-8 border-base-300 overflow-hidden flex flex-col z-10 shadow-2xl">
            <div className="px-5 py-4">
              <div className="flex justify-between items-center mb-6">
                <span className="font-medium text-lg text-base-content">Statistic</span>
                <div className="flex gap-3">
                  <Search className="w-4 h-4 text-base-content/40" />
                  <Bell className="w-4 h-4 text-base-content/40" />
                </div>
              </div>
              
              <div className="flex justify-between bg-base-content/5 rounded-full p-1 mb-6 text-[10px]">
                <button className="px-3 py-1 rounded-full text-base-content/60 hover:text-base-content">Day</button>
                <button className="px-3 py-1 rounded-full bg-primary text-primary-content font-medium">Week</button>
                <button className="px-3 py-1 rounded-full text-base-content/60 hover:text-base-content">Month</button>
                <button className="px-3 py-1 rounded-full text-base-content/60 hover:text-base-content">Year</button>
              </div>

              <div className="text-center mb-6">
                <div className="text-base-content/60 text-xs mb-1">Total Spendings</div>
                <div className="text-2xl font-semibold text-base-content">{formatCurrency(6340, user?.currency)}</div>
              </div>
            </div>
            
            {/* Fake Chart in Phone */}
            <div className="relative flex-1 bg-gradient-to-t from-accent/20 to-transparent mt-auto overflow-hidden">
              <svg className="absolute bottom-0 w-full h-[120px]" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,80 Q20,20 40,60 T80,40 T100,50 L100,100 L0,100 Z" className="fill-primary/10" />
                <path d="M0,80 Q20,20 40,60 T80,40 T100,50" fill="none" className="stroke-primary" strokeWidth="2" />
                <path d="M0,60 Q30,90 50,40 T100,30" fill="none" className="stroke-accent" strokeWidth="2" opacity="0.5" />
              </svg>
              {/* Tooltip dot */}
              <div className="absolute top-[30px] left-[45%] w-3 h-3 bg-base-100 border-2 border-primary rounded-full shadow-[0_0_10px_rgba(var(--tw-colors-primary),0.8)]"></div>
              <div className="absolute top-[5px] left-[45%] -translate-x-1/2 bg-primary text-primary-content text-[10px] font-bold px-2 py-0.5 rounded-full">
                {formatCurrency(69, user?.currency)}
              </div>
            </div>
          </div>

          {/* Left Floating Card - Incomes */}
          <div className="absolute left-[0%] md:left-[5%] top-[40%] md:top-[30%] w-[220px] bg-base-200/80 backdrop-blur-md rounded-2xl p-4 border border-base-content/10 shadow-2xl z-20">
            <div className="flex justify-between items-center mb-3">
              <span className="text-base-content/80 text-sm">Incomes</span>
              <button className="bg-accent text-accent-content text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                {t('See all') || 'See all'} <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-end gap-3 mb-4">
              <div className="text-2xl font-semibold text-base-content">{formatCurrency(18060, user?.currency)}</div>
              <div className="flex items-center gap-1 text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                <ArrowRight className="w-3 h-3 -rotate-45" /> 2.8%
              </div>
            </div>
            <div className="h-12 w-full">
               <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,80 Q10,60 20,70 T40,50 T60,60 T80,30 T100,40" fill="none" className="stroke-accent" strokeWidth="3" />
              </svg>
            </div>
          </div>

          {/* Right Floating Card 1 - Bitcoin */}
          <div className="absolute right-[5%] md:right-[15%] top-[20%] w-[180px] bg-base-200/80 backdrop-blur-md rounded-2xl p-4 border border-base-content/10 shadow-2xl z-0 hidden sm:block">
             <div className="flex items-center gap-2 mb-2">
                <div className="bg-orange-500 rounded-full p-1"><Bitcoin className="w-4 h-4 text-white" /></div>
                <span className="text-xl font-semibold text-base-content">958.042</span>
             </div>
             <div className="flex items-center gap-1 text-[10px] text-accent mb-3 bg-accent/10 w-fit px-1.5 rounded font-medium">
                <TrendingUp className="w-3 h-3" /> +12.7%
             </div>
             <div className="text-xs text-base-content/80">Bitcoin / BTC</div>
             <div className="text-[10px] text-base-content/50 mt-1">Balance: 2,750.99 USD</div>
          </div>

          {/* Right Floating Card 2 - GBP Balance */}
          <div className="absolute right-[0%] md:right-[5%] bottom-[15%] w-[240px] bg-base-200/80 backdrop-blur-md rounded-2xl p-4 border border-base-content/10 shadow-2xl z-20 hidden md:block">
             <div className="flex justify-between items-start mb-2">
               <span className="text-base-content/60 text-sm">GBP Balance</span>
               <div className="w-5 h-5 rounded-full bg-base-content/5 flex items-center justify-center">
                 <div className="w-1 h-1 rounded-full bg-base-content/40"></div>
                 <div className="w-1 h-1 rounded-full bg-base-content/40 ml-0.5"></div>
               </div>
             </div>
             <div className="flex items-end gap-3 mb-2">
              <div className="text-2xl font-semibold text-base-content">{formatCurrency(48650, user?.currency)}</div>
              <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                <ArrowRight className="w-3 h-3 -rotate-45" /> 2.8%
              </div>
            </div>
             <div className="h-10 w-full opacity-50 relative">
               <svg className="w-full h-full absolute bottom-0" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,50 Q20,30 40,60 T80,40 T100,50 L100,100 L0,100 Z" className="fill-primary/10" />
                <path d="M0,50 Q20,30 40,60 T80,40 T100,50" fill="none" className="stroke-primary" strokeWidth="2" />
              </svg>
            </div>
          </div>

        </div>
      </div>
      
      {/* Login Modal */}
      <dialog id="login_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box p-0 bg-transparent shadow-none w-full max-w-md">
          <div className="glass-card p-10 w-full mx-auto text-center relative border border-base-content/10 bg-base-100/60 backdrop-blur-xl rounded-2xl shadow-2xl">
            <form method="dialog" className="absolute right-4 top-4">
              <button className="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:text-base-content">
                <X className="w-4 h-4" />
              </button>
            </form>
            
            <div className="flex justify-center mb-6 mt-2">
              <div className="bg-primary/10 p-4 rounded-full border border-primary/20">
                <img src="/logo-icon.png" alt="Logo" className="w-12 h-12 object-contain" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold mb-2 text-[#C0E250]">CashTrack</h2>
            <p className="text-base-content/60 mb-8 text-sm">Premium Personal Finance Manager</p>

            <button 
              onClick={(e) => {
                e.preventDefault();
                handleGoogleLogin();
              }}
              className="btn btn-primary w-full gap-3 shadow-lg shadow-primary/30"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current bg-white rounded-full p-0.5">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop bg-black/40 backdrop-blur-sm">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}
