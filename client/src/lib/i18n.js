import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "Dashboard": "Dashboard",
      "Income": "Income",
      "Expenses": "Expenses",
      "Savings": "Savings",
      "Reports": "Reports",
      "Restore & Backup": "Restore & Backup",
      "Settings": "Settings",
      "Welcome back": "Welcome back",
      "Manage Account": "Manage Account",
      "Logout": "Logout",
      "Total Available Balance": "Total Available Balance",
      "Previous Month Balance": "Previous Month Balance",
      "Current Month Balance": "Current Month Balance",
      "Total Savings": "Total Savings",
      "Recent Transactions": "Recent Transactions",
      "Financial Overview": "Financial Overview",
      "Cash Flow": "Cash Flow",
      "See all": "See all",
      "Statistic": "Statistic",
      "Sign In": "Sign In"
    }
  },
  bn: {
    translation: {
      "Dashboard": "ড্যাশবোর্ড",
      "Income": "আয়",
      "Expenses": "ব্যয়",
      "Savings": "সঞ্চয়",
      "Reports": "রিপোর্ট",
      "Restore & Backup": "পুনরুদ্ধার এবং ব্যাকআপ",
      "Settings": "সেটিংস",
      "Welcome back": "স্বাগতম",
      "Manage Account": "অ্যাকাউন্ট পরিচালনা",
      "Logout": "লগ আউট",
      "Total Available Balance": "মোট উপলব্ধ ব্যালেন্স",
      "Previous Month Balance": "আগের মাসের ব্যালেন্স",
      "Current Month Balance": "বর্তমান মাসের ব্যালেন্স",
      "Total Savings": "মোট সঞ্চয়",
      "Recent Transactions": "সাম্প্রতিক লেনদেন",
      "Financial Overview": "আর্থিক ওভারভিউ",
      "Cash Flow": "নগদ প্রবাহ",
      "See all": "সব দেখুন",
      "Statistic": "পরিসংখ্যান",
      "Sign In": "লগ ইন"
    }
  },
  ar: {
    translation: {
      "Dashboard": "لوحة القيادة",
      "Income": "الدخل",
      "Expenses": "النفقات",
      "Savings": "المدخرات",
      "Reports": "التقارير",
      "Restore & Backup": "استعادة ونسخ احتياطي",
      "Settings": "الإعدادات",
      "Welcome back": "مرحباً بعودتك",
      "Manage Account": "إدارة الحساب",
      "Logout": "تسجيل خروج",
      "Total Available Balance": "إجمالي الرصيد المتاح",
      "Previous Month Balance": "رصيد الشهر السابق",
      "Current Month Balance": "رصيد الشهر الحالي",
      "Total Savings": "إجمالي المدخرات",
      "Recent Transactions": "المعاملات الأخيرة",
      "Financial Overview": "نظرة عامة مالية",
      "Cash Flow": "التدفق النقدي",
      "See all": "عرض الكل",
      "Statistic": "إحصائية",
      "Sign In": "تسجيل الدخول"
    }
  },
  hi: {
    translation: {
      "Dashboard": "डैशबोर्ड",
      "Income": "आय",
      "Expenses": "व्यय",
      "Savings": "बचत",
      "Reports": "रिपोर्ट",
      "Restore & Backup": "रिस्टोर और बैकअप",
      "Settings": "सेटिंग्स",
      "Welcome back": "वापसी पर स्वागत है",
      "Manage Account": "खाता प्रबंधित करें",
      "Logout": "लॉग आउट",
      "Total Available Balance": "कुल उपलब्ध शेष",
      "Previous Month Balance": "पिछले महीने का शेष",
      "Current Month Balance": "वर्तमान महीने का शेष",
      "Total Savings": "कुल बचत",
      "Recent Transactions": "हाल के लेनदेन",
      "Financial Overview": "वित्तीय अवलोकन",
      "Cash Flow": "नकद प्रवाह",
      "See all": "सभी देखें",
      "Statistic": "आंकड़े",
      "Sign In": "साइन इन"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('cashtrack_language') || 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
