import PublicNavbar from '../components/PublicNavbar';
import { Wallet, TrendingUp, PieChart, ArrowLeftRight, ShieldCheck, Globe, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Features() {
  const { isAuthenticated } = useAuthStore();

  const features = [
    {
      icon: <Wallet className="w-8 h-8 text-primary" />,
      title: "Smart Income & Expense Tracker",
      description: "Log your daily expenses, monthly salary, and side-hustle revenue with instant categorization and auto-balancing in Taka (৳).",
      badge: "Core Feature"
    },
    {
      icon: <ArrowLeftRight className="w-8 h-8 text-[#BFDF4F]" />,
      title: "Real-Time Currency Converter",
      description: "Convert rates dynamically between BDT, USD, EUR, INR, SAR, and 10+ currencies using live financial market data.",
      badge: "Real-Time API"
    },
    {
      icon: <PieChart className="w-8 h-8 text-emerald-400" />,
      title: "Visual Financial Analytics",
      description: "Interactive Recharts visualizer showing expense distribution, income vs. spending ratios, and historical trend charts.",
      badge: "Analytics"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-cyan-400" />,
      title: "Savings Goals & Milestones",
      description: "Define custom savings targets, track progress bars in real-time, and get smart warnings when approaching budgets.",
      badge: "Goals"
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-indigo-400" />,
      title: "Backup & Instant Data Restore",
      description: "Export full financial backups to CSV or JSON with a single click and restore anytime with zero data loss.",
      badge: "Data Security"
    },
    {
      icon: <Globe className="w-8 h-8 text-amber-400" />,
      title: "Multi-Language & Localization",
      description: "Built for global & local users. Native support for English, Bengali (বাংলা), Hindi (हिन्दी), and Arabic (العربية).",
      badge: "Localization"
    }
  ];

  return (
    <div className="min-h-screen bg-base-100 text-base-content font-sans overflow-hidden relative">
      <PublicNavbar />

      {/* Grid Background */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-6">
            <Zap className="w-4 h-4" /> Cutting-Edge Financial Tools
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
            Designed for <span className="text-primary italic font-serif">Absolute Mastery</span> Over Your Money
          </h1>
          <p className="text-base-content/70 text-lg sm:text-xl">
            CashTrack combines intuitive design with powerful tracking algorithms, giving you complete visibility into where every single Taka goes.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((item, idx) => (
            <div 
              key={idx}
              className="bg-base-200/40 dark:bg-base-200/20 backdrop-blur-xl border border-base-content/10 hover:border-primary/40 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-base-100 flex items-center justify-center border border-base-content/10 shadow-sm group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-base-content/5 border border-base-content/10 text-base-content/70">
                  {item.badge}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-base-content/70 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Interactive Highlight Section */}
        <div className="bg-gradient-to-br from-primary/10 via-base-200 to-base-100 border border-primary/20 rounded-3xl p-8 sm:p-12 mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Why CashTrack Stands Out</h2>
              <p className="text-base-content/70 mb-6 leading-relaxed">
                Traditional banking apps are complex and bloated. CashTrack provides a slick, modern workspace focused entirely on speed, privacy, and actionable clarity.
              </p>
              <ul className="space-y-3">
                {[
                  "No hidden bank sync delays — lightning-fast manual entry",
                  "Encrypted session security with Firebase Auth",
                  "Beautiful Dark & Light Mode theme adaptation",
                  "Instant CSV & JSON data mobility"
                ].map((text, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-md bg-base-100 p-6 rounded-2xl border border-base-300 shadow-2xl space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-base-200">
                  <span className="font-semibold text-sm">Monthly Summary</span>
                  <span className="text-xs bg-primary/20 text-primary font-bold px-2.5 py-1 rounded-full">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-base-content/70">Total Income</span>
                  <span className="font-bold text-emerald-500">৳300,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-base-content/70">Total Expenses</span>
                  <span className="font-bold text-error">৳46,000</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-base-200">
                  <span className="font-bold">Net Savings</span>
                  <span className="font-bold text-primary text-lg">৳254,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-base-200/50 border border-base-content/10 rounded-3xl p-10 sm:p-14">
          <h2 className="text-3xl font-bold mb-4">Start Tracking Your Finances Today</h2>
          <p className="text-base-content/70 max-w-xl mx-auto mb-8">
            Join thousands of users optimizing their budgets and building real wealth with CashTrack.
          </p>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary btn-lg rounded-2xl gap-2 font-semibold">
              Go to Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <button 
              onClick={() => document.getElementById('login_modal')?.showModal()}
              className="btn btn-primary btn-lg rounded-2xl gap-2 font-semibold"
            >
              Get Started for Free <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
