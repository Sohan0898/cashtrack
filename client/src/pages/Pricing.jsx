import { useState } from 'react';
import PublicNavbar from '../components/PublicNavbar';
import { Check, Sparkles, Zap, Shield, HelpCircle, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { Link } from 'react-router-dom';

export default function Pricing() {
  const { isAuthenticated } = useAuthStore();
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Starter",
      description: "Essential tools for individuals taking their first steps in budgeting.",
      monthlyPrice: "৳0",
      annualPrice: "৳0",
      period: "forever free",
      popular: false,
      buttonText: "Get Started Free",
      features: [
        "Up to 50 transactions / month",
        "Basic Income & Expense tracking",
        "Taka (৳) currency support",
        "Multi-language (EN, BN, HI, AR)",
        "Standard dashboard overview",
      ]
    },
    {
      name: "Pro",
      description: "Everything you need to master your money and accelerate savings.",
      monthlyPrice: "৳499",
      annualPrice: "৳399",
      period: "per month",
      popular: true,
      buttonText: "Start 14-Day Free Trial",
      features: [
        "Unlimited transactions & categories",
        "Real-Time Foreign Currency Converter",
        "One-Click CSV & JSON Backup & Restore",
        "Advanced Recharts visual analytics",
        "Custom Savings Goals & Milestone tracking",
        "Priority customer support"
      ]
    },
    {
      name: "Lifetime",
      description: "One single payment for lifetime access with no monthly subscription fees.",
      monthlyPrice: "৳2,999",
      annualPrice: "৳2,999",
      period: "one-time payment",
      popular: false,
      buttonText: "Get Lifetime Access",
      features: [
        "All Pro features unlocked forever",
        "Multi-account family support (Up to 5 accounts)",
        "Automated AI spending recommendations",
        "Dedicated financial insights consultant",
        "Early access to new features & updates"
      ]
    }
  ];

  const faqs = [
    {
      q: "Can I use CashTrack for free?",
      a: "Yes! Our Starter plan is 100% free forever with generous monthly transaction limits."
    },
    {
      q: "How does the JSON/CSV data backup work?",
      a: "Pro and Lifetime members can export all income, expense, and savings data into JSON or CSV files with a single click. You can also upload backup files to restore your records instantly."
    },
    {
      q: "Can I change or cancel my plan anytime?",
      a: "Absolutely! You can upgrade, downgrade, or cancel your subscription at any time directly from your account management page."
    }
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
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
            <Zap className="w-4 h-4" /> Transparent Pricing
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-4">
            Simple Plans for <span className="text-primary italic font-serif">Every Budget</span>
          </h1>
          <p className="text-base-content/70 text-lg">
            Choose the plan that fits your financial goals. No hidden fees or surprise charges.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm font-semibold ${!isAnnual ? 'text-base-content' : 'text-base-content/60'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-14 h-8 rounded-full bg-base-300 p-1 flex items-center transition-colors relative cursor-pointer"
            >
              <div className={`w-6 h-6 rounded-full bg-primary transition-transform duration-300 ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm font-semibold flex items-center gap-1.5 ${isAnnual ? 'text-base-content' : 'text-base-content/60'}`}>
              Annual <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 items-stretch">
          {plans.map((plan, idx) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            return (
              <div 
                key={idx}
                className={`relative bg-base-200/40 dark:bg-base-200/20 backdrop-blur-xl border rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.popular 
                    ? 'border-primary shadow-2xl shadow-primary/10 scale-105 z-20 bg-base-100/90' 
                    : 'border-base-content/10 hover:border-base-content/30'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-content text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Most Popular
                  </div>
                )}

                <div>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-base-content/70 text-sm mb-6 min-h-[40px]">{plan.description}</p>
                  
                  <div className="mb-6 flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-extrabold text-primary">{price}</span>
                    <span className="text-xs font-medium text-base-content/60">{plan.period}</span>
                  </div>

                  <ul className="space-y-3.5 mb-8 border-t border-base-content/10 pt-6">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3 text-sm">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-base-content/80">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {isAuthenticated ? (
                  <Link 
                    to="/dashboard" 
                    className={`w-full btn rounded-2xl font-semibold gap-2 ${plan.popular ? 'btn-primary' : 'btn-outline'}`}
                  >
                    Go to Dashboard <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button 
                    onClick={() => document.getElementById('login_modal')?.showModal()}
                    className={`w-full btn rounded-2xl font-semibold gap-2 ${plan.popular ? 'btn-primary' : 'btn-outline'}`}
                  >
                    {plan.buttonText}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto bg-base-200/30 backdrop-blur-md border border-base-content/10 rounded-3xl p-8 sm:p-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-primary" /> Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="space-y-2 border-b border-base-content/10 pb-4 last:border-0">
                <h4 className="font-semibold text-base">{faq.q}</h4>
                <p className="text-sm text-base-content/70">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
