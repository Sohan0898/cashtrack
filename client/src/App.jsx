import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Lottie from 'lottie-react';
import useAuthStore from './store/authStore';
import loadingAnimation from './assets/loading_data.json';

// Layout
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Savings from './pages/Savings';
import Reports from './pages/Reports';
import BankInterest from './pages/BankInterest';
import RestoreBackup from './pages/RestoreBackup';
import Settings from './pages/Settings';
import ManageAccount from './pages/ManageAccount';
import NotFound from './pages/NotFound';

// Public Marketing Pages
import Features from './pages/Features';
import CurrencyConverter from './pages/CurrencyConverter';
import Pricing from './pages/Pricing';
import About from './pages/About';

function App() {
  const { theme, checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-100">
        <div className="w-24 h-24 sm:w-32 sm:h-32">
          <Lottie animationData={loadingAnimation} loop={true} />
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster 
        position="top-center" 
        containerStyle={{ zIndex: 99999 }}
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '1rem',
            padding: '12px 24px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          }
        }} 
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/features" element={<Features />} />
        <Route path="/currency-converter" element={<CurrencyConverter />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/income" element={<Income />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="/interest" element={<BankInterest />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/backup" element={<RestoreBackup />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/manage-account" element={<ManageAccount />} />
        </Route>

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
