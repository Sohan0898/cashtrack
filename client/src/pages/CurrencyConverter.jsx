import { useState, useEffect } from 'react';
import PublicNavbar from '../components/PublicNavbar';
import { ArrowLeftRight, RefreshCw, DollarSign, TrendingUp, Sparkles, CheckCircle2, Clock, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

const CURRENCIES = [
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: '$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: '$', flag: '🇦🇺' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
];

// Fallback rates relative to USD if API fails
const FALLBACK_RATES = {
  USD: 1,
  BDT: 117.5,
  EUR: 0.92,
  GBP: 0.78,
  INR: 83.5,
  SAR: 3.75,
  AED: 3.67,
  CAD: 1.37,
  AUD: 1.51,
  JPY: 155.2
};

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('BDT');
  const [rates, setRates] = useState(FALLBACK_RATES);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await res.json();
      if (data && data.rates) {
        setRates(data.rates);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        toast.success('Live rates updated');
      }
    } catch (err) {
      console.error('Failed to fetch live rates:', err);
      toast.error('Using cached exchange rates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  // Calculation
  const numAmount = parseFloat(amount) || 0;
  const fromRateInUSD = rates[fromCurrency] || FALLBACK_RATES[fromCurrency] || 1;
  const toRateInUSD = rates[toCurrency] || FALLBACK_RATES[toCurrency] || 1;
  const convertedValue = (numAmount / fromRateInUSD) * toRateInUSD;
  const singleUnitRate = (1 / fromRateInUSD) * toRateInUSD;

  const fromObj = CURRENCIES.find(c => c.code === fromCurrency);
  const toObj = CURRENCIES.find(c => c.code === toCurrency);

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

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
            <Globe className="w-4 h-4" /> Real-Time Foreign Exchange
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Live <span className="text-primary italic font-serif">Currency Converter</span>
          </h1>
          <p className="text-base-content/70 text-base sm:text-lg">
            Convert global currencies into Bangladeshi Taka (৳) and vice versa with real-time financial market exchange rates.
          </p>
        </div>

        {/* Converter Main Card */}
        <div className="bg-base-200/50 dark:bg-base-200/30 backdrop-blur-2xl border border-base-content/10 rounded-3xl p-6 sm:p-10 shadow-2xl mb-12">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-base-content/10">
            <div className="flex items-center gap-2 text-xs font-medium text-base-content/70">
              <Clock className="w-4 h-4 text-primary" />
              <span>Rates last updated: {lastUpdated || 'Just now'}</span>
            </div>
            <button
              onClick={fetchRates}
              disabled={loading}
              className="btn btn-sm btn-ghost gap-2 text-xs hover:bg-base-300 rounded-xl"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Rates
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Amount Input */}
            <div className="md:col-span-5 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-base-content/60">Amount</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-base-100 border border-base-300 focus:border-primary rounded-2xl px-4 py-3.5 text-xl font-bold focus:outline-none transition-all"
                  placeholder="Enter amount"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-base-content/50">
                  {fromObj?.symbol}
                </span>
              </div>
            </div>

            {/* From Selector */}
            <div className="md:col-span-3 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-base-content/60">From</label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full bg-base-100 border border-base-300 focus:border-primary rounded-2xl px-4 py-3.5 text-base font-semibold focus:outline-none cursor-pointer"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="md:col-span-1 flex justify-center pt-4 md:pt-6">
              <button
                onClick={handleSwap}
                className="btn btn-circle btn-primary shadow-lg hover:rotate-180 transition-transform duration-300"
                title="Swap Currencies"
              >
                <ArrowLeftRight className="w-5 h-5" />
              </button>
            </div>

            {/* To Selector */}
            <div className="md:col-span-3 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-base-content/60">To</label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full bg-base-100 border border-base-300 focus:border-primary rounded-2xl px-4 py-3.5 text-base font-semibold focus:outline-none cursor-pointer"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Result Display Box */}
          <div className="mt-8 bg-base-100/90 border border-primary/20 rounded-2xl p-6 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-sm font-medium text-base-content/60 mb-1">
                {numAmount.toLocaleString()} {fromCurrency} =
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">
                {toObj?.symbol} {convertedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xl font-semibold text-base-content/70">{toCurrency}</span>
              </h2>
            </div>
            <div className="text-xs font-medium bg-base-200 px-4 py-2 rounded-xl text-base-content/70 border border-base-300">
              1 {fromCurrency} = {singleUnitRate.toFixed(4)} {toCurrency}
            </div>
          </div>
        </div>

        {/* Quick Conversion Matrix */}
        <div className="bg-base-200/30 backdrop-blur-md border border-base-content/10 rounded-3xl p-6 sm:p-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Popular Conversion Table
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 10, 50, 100, 500, 1000, 5000, 10000].map((val) => {
              const res = (val / fromRateInUSD) * toRateInUSD;
              return (
                <div key={val} className="bg-base-100 p-4 rounded-xl border border-base-200 flex flex-col justify-center">
                  <span className="text-xs text-base-content/60">{fromObj?.symbol}{val.toLocaleString()} {fromCurrency}</span>
                  <span className="text-base font-bold text-primary mt-1">
                    {toObj?.symbol}{res.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
