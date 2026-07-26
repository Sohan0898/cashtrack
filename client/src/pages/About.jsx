import PublicNavbar from '../components/PublicNavbar';
import { Target, Heart, Shield, Users, Award, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function About() {
  const { isAuthenticated } = useAuthStore();

  const values = [
    {
      icon: <Target className="w-6 h-6 text-primary" />,
      title: "Simplicity First",
      desc: "We eliminate complex financial jargon and clutter, providing a streamlined workspace designed for fast, frictionless tracking."
    },
    {
      icon: <Shield className="w-6 h-6 text-[#BFDF4F]" />,
      title: "Complete Data Control",
      desc: "Your data belongs to you. We enable full JSON/CSV backups and encrypted authentication so you maintain absolute privacy."
    },
    {
      icon: <Heart className="w-6 h-6 text-emerald-400" />,
      title: "Local & Global Focus",
      desc: "Built with first-class support for Bangladeshi Taka (৳), multi-currency conversions, and localized multi-language features."
    },
    {
      icon: <Users className="w-6 h-6 text-cyan-400" />,
      title: "Empowering People",
      desc: "Our mission is to help individuals, freelancers, and families build real financial freedom through mindful spending habits."
    }
  ];

  const stats = [
    { number: "৳100M+", label: "Financial Data Tracked" },
    { number: "50,000+", label: "Active Budgeters" },
    { number: "99.9%", label: "Platform Uptime" },
    { number: "4.9 / 5.0", label: "User Satisfaction" }
  ];

  return (
    <div className="min-h-screen bg-base-100 text-base-content font-sans relative overflow-hidden">
      <PublicNavbar />

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
            <Award className="w-4 h-4" /> About CashTrack
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
            Democratizing <span className="text-primary italic font-serif">Financial Clarity</span> for Everyone
          </h1>
          <p className="text-base-content/70 text-lg sm:text-xl leading-relaxed">
            CashTrack was created to revolutionize how people manage their daily cash flow. We believe financial peace of mind shouldn't require complex spreadsheets or expensive financial planners.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, i) => (
            <div key={i} className="bg-base-200/50 dark:bg-base-200/30 backdrop-blur-md border border-base-content/10 rounded-3xl p-6 text-center">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-primary mb-1">{stat.number}</h3>
              <p className="text-xs sm:text-sm text-base-content/70 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Mission Story Section */}
        <div className="bg-gradient-to-br from-base-200/80 via-base-100 to-primary/5 border border-base-content/10 rounded-3xl p-8 sm:p-12 mb-20">
          <div className="max-w-3xl mx-auto space-y-6 text-base-content/80 text-base sm:text-lg leading-relaxed">
            <h2 className="text-3xl font-bold text-base-content text-center mb-6">Our Journey & Purpose</h2>
            <p>
              In today's fast-paced world, money flows in and out from countless sources — mobile wallets, bank accounts, cash, and digital transactions. Keeping track of where your hard-earned money goes can quickly become overwhelming.
            </p>
            <p>
              CashTrack bridges this gap with an all-in-one financial dashboard tailored specifically for local and international users. Whether you are calculating monthly living expenses in Dhaka, tracking freelance income in USD, or converting foreign exchange rates on the fly, CashTrack gives you instant, stress-free control.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((v, i) => (
              <div key={i} className="bg-base-200/40 border border-base-content/10 rounded-3xl p-8 flex items-start gap-5 hover:border-primary/40 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-base-100 flex items-center justify-center shrink-0 border border-base-300">
                  {v.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{v.title}</h3>
                  <p className="text-sm text-base-content/70 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-primary/10 border border-primary/20 rounded-3xl p-10 sm:p-14">
          <h2 className="text-3xl font-bold mb-4">Be Part of the CashTrack Movement</h2>
          <p className="text-base-content/70 max-w-xl mx-auto mb-8">
            Take the first step toward complete financial independence and stress-free money management.
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
