import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

export const TRANSLATIONS = {
  en: {
    // Navigation
    "Dashboard": "Dashboard",
    "Transactions": "Transactions",
    "Savings": "Savings",
    "Interest": "Interest",
    "Reports": "Reports",
    "Profile": "Profile",

    // Dashboard
    "Total Available Balance": "Total Available Balance",
    "Current Month Balance": "Current Month Balance",
    "Previous Month Balance": "Previous Month Balance",
    "Total Savings": "Total Savings",
    "Income": "Income",
    "Expenses": "Expenses",
    "Expense": "Expense",
    "Cash Flow": "Cash Flow",
    "Recent Transactions": "Recent Transactions",
    "Add New Income": "Add New Income",
    "Add New Expense": "Add New Expense",
    "Welcome back": "Welcome back",
    "No recent transactions": "No recent transactions",
    "Add Income": "Add Income",
    "Add Expense": "Add Expense",
    "Overview": "Overview",
    "Last 30 Days": "Last 30 Days",
    "All": "All",
    "No transactions found": "No transactions found",

    // Transactions
    "All Transactions": "All Transactions",
    "Income & Expense Overview": "Income & Expense Overview",

    // Savings
    "Savings Accounts": "Savings Accounts",
    "Add Account": "Add Account",
    "Total Savings Balance": "Total Savings Balance",
    "Your Accounts": "Your Accounts",
    "No savings accounts found": "No savings accounts yet. Create one above!",
    "Goal": "Goal",
    "Deposit": "Deposit",
    "Withdraw": "Withdraw",
    "Savings History": "Savings History",
    "No savings history found": "No savings history found.",
    "Create Savings Account": "Create Savings Account",
    "Account Name": "Account Name",
    "Type": "Type",
    "Goal Amount": "Goal Amount (Optional)",
    "Create Account": "Create Account",
    "to Savings": "to Savings",
    "Amount": "Amount",
    "Confirm": "Confirm",
    "Edit Account": "Edit Account",
    "Save Changes": "Save Changes",

    // Reports
    "Analytics & Reports": "Analytics & Reports",
    "Monthly Overview": "Monthly Overview",
    "Yearly Overview": "Yearly Overview",
    "Lifetime Overview": "Lifetime Overview",
    "Income by Category": "Income by Category",
    "Expense by Category": "Expense by Category",

    // Bank Interest
    "Bank Interest": "Bank Interest",
    "Clear Data": "Clear Data",
    "Total Accumulated Interest": "Total Accumulated Interest",
    "Add Interest": "Add Interest",
    "Withdraw Infaq": "Withdraw Infaq",
    "Interest History": "Interest History",
    "No interest history found": "No interest history found.",
    "Add New Interest": "Add New Interest",
    "Bank Name": "Bank Name",

    // Profile
    "User Profile": "User Profile",
    "Account & Settings": "Account & Settings",
    "Verified Account": "Verified Account",
    "Manage Account": "Manage Account",
    "Display Name": "Display Name",
    "Email Address": "Email Address",
    "Linked to your Google account": "Linked to your Google account",
    "Save Profile": "Save Profile",
    "Localization & Currency": "Localization & Currency",
    "Default Currency": "Default Currency",
    "App Language": "App Language",
    "Save Preferences": "Save Preferences",
    "Notifications & Reminders": "Notifications & Reminders",
    "Daily Reminders": "Daily Reminders",
    "Weekly Summary": "Weekly Summary",
    "Monthly Summary": "Monthly Summary",
    "Active Devices": "Active Devices",
    "Danger Zone": "Danger Zone",
    "Clear All Data": "Clear All Data",
    "Delete Account": "Delete Account",
    "Sign Out Account": "Sign Out",
  },

  bn: {
    // Navigation
    "Dashboard": "ড্যাশবোর্ড",
    "Transactions": "লেনদেন",
    "Savings": "সঞ্চয়",
    "Interest": "সুদ",
    "Reports": "রিপোর্ট",
    "Profile": "প্রোফাইল",

    // Dashboard
    "Total Available Balance": "মোট উপলব্ধ ব্যালেন্স",
    "Current Month Balance": "চলতি মাসের ব্যালেন্স",
    "Previous Month Balance": "গত মাসের ব্যালেন্স",
    "Total Savings": "মোট সঞ্চয়",
    "Income": "আয়",
    "Expenses": "ব্যয়",
    "Expense": "ব্যয়",
    "Cash Flow": "নগদ প্রবাহ",
    "Recent Transactions": "সাম্প্রতিক লেনদেন",
    "Add New Income": "নতুন আয় যোগ করুন",
    "Add New Expense": "নতুন ব্যয় যোগ করুন",
    "Welcome back": "স্বাগতম",
    "No recent transactions": "কোনো সাম্প্রতিক লেনদেন নেই",
    "Add Income": "আয় যোগ করুন",
    "Add Expense": "ব্যয় যোগ করুন",
    "Overview": "সারসংক্ষেপ",
    "Last 30 Days": "শেষ ৩০ দিন",
    "All": "সব",
    "No transactions found": "কোনো লেনদেন পাওয়া যায়নি",

    // Transactions
    "All Transactions": "সব লেনদেন",
    "Income & Expense Overview": "আয় ও ব্যয়ের সারসংক্ষেপ",

    // Savings
    "Savings Accounts": "সঞ্চয় অ্যাকাউন্ট",
    "Add Account": "অ্যাকাউন্ট যোগ করুন",
    "Total Savings Balance": "মোট সঞ্চয় ব্যালেন্স",
    "Your Accounts": "আপনার অ্যাকাউন্টসমূহ",
    "No savings accounts found": "কোনো সঞ্চয় অ্যাকাউন্ট নেই।",
    "Goal": "লক্ষ্য",
    "Deposit": "জমা",
    "Withdraw": "উত্তোলন",
    "Savings History": "সঞ্চয়ের ইতিহাস",
    "No savings history found": "কোনো সঞ্চয় ইতিহাস পাওয়া যায়নি।",
    "Create Savings Account": "সঞ্চয় অ্যাকাউন্ট তৈরি করুন",
    "Account Name": "অ্যাকাউন্টের নাম",
    "Type": "ধরন",
    "Goal Amount": "লক্ষ্য পরিমাণ (ঐচ্ছিক)",
    "Create Account": "অ্যাকাউন্ট তৈরি করুন",
    "to Savings": "সঞ্চয়ে",
    "Amount": "পরিমাণ",
    "Confirm": "নিশ্চিত করুন",
    "Edit Account": "অ্যাকাউন্ট সম্পাদনা করুন",
    "Save Changes": "পরিবর্তন সংরক্ষণ করুন",

    // Reports
    "Analytics & Reports": "বিশ্লেষণ ও রিপোর্ট",
    "Monthly Overview": "মাসিক সারসংক্ষেপ",
    "Yearly Overview": "বার্ষিক সারসংক্ষেপ",
    "Lifetime Overview": "সামগ্রিক সারসংক্ষেপ",
    "Income by Category": "বিভাগ অনুযায়ী আয়",
    "Expense by Category": "বিভাগ অনুযায়ী ব্যয়",

    // Bank Interest
    "Bank Interest": "ব্যাংক সুদের হিসাব",
    "Clear Data": "ডেটা মুছুন",
    "Total Accumulated Interest": "মোট সঞ্চিত সুদ",
    "Add Interest": "সুদ যোগ করুন",
    "Withdraw Infaq": "ইনফাক উত্তোলন",
    "Interest History": "সুদের ইতিহাস",
    "No interest history found": "কোনো সুদের ইতিহাস পাওয়া যায়নি।",
    "Add New Interest": "নতুন সুদ যোগ করুন",
    "Bank Name": "ব্যাংকের নাম",

    // Profile
    "User Profile": "ব্যবহারকারীর প্রোফাইল",
    "Account & Settings": "অ্যাকাউন্ট ও সেটিংস",
    "Verified Account": "যাচাইকৃত অ্যাকাউন্ট",
    "Manage Account": "অ্যাকাউন্ট পরিচালনা",
    "Display Name": "প্রদর্শনী নাম",
    "Email Address": "ইমেইল ঠিকানা",
    "Linked to your Google account": "আপনার গুগল অ্যাকাউন্টের সাথে যুক্ত",
    "Save Profile": "প্রোফাইল সংরক্ষণ করুন",
    "Localization & Currency": "মুদ্রা ও ভাষা",
    "Default Currency": "ডিফল্ট মুদ্রা",
    "App Language": "অ্যাপের ভাষা",
    "Save Preferences": "পছন্দসমূহ সংরক্ষণ করুন",
    "Notifications & Reminders": "বিজ্ঞপ্তি ও অনুস্মারক",
    "Daily Reminders": "দৈনিক অনুস্মারক",
    "Weekly Summary": "সাপ্তাহিক সারসংক্ষেপ",
    "Monthly Summary": "মাসিক সারসংক্ষেপ",
    "Active Devices": "সক্রিয় ডিভাইস",
    "Danger Zone": "বিপদ অঞ্চল",
    "Clear All Data": "সমস্ত ডেটা মুছুন",
    "Delete Account": "অ্যাকাউন্ট ডিলিট করুন",
    "Sign Out Account": "লগ আউট করুন",
  },

  ar: {
    // Navigation
    "Dashboard": "لوحة القيادة",
    "Transactions": "المعاملات",
    "Savings": "المدخرات",
    "Interest": "الفائدة",
    "Reports": "التقارير",
    "Profile": "الملف الشخصي",

    // Dashboard
    "Total Available Balance": "إجمالي الرصيد المتاح",
    "Current Month Balance": "رصيد الشهر الحالي",
    "Previous Month Balance": "رصيد الشهر السابق",
    "Total Savings": "إجمالي المدخرات",
    "Income": "الدخل",
    "Expenses": "النفقات",
    "Expense": "النفقة",
    "Cash Flow": "التدفق النقدي",
    "Recent Transactions": "المعاملات الأخيرة",
    "Add New Income": "إضافة دخل جديد",
    "Add New Expense": "إضافة نفقة جديدة",
    "Welcome back": "مرحباً بعودتك",
    "No recent transactions": "لا توجد معاملات حديثة",
    "Add Income": "إضافة دخل",
    "Add Expense": "إضافة نفقة",
    "Overview": "نظرة عامة",
    "Last 30 Days": "آخر 30 يوماً",
    "All": "الكل",
    "No transactions found": "لا توجد معاملات",

    // Transactions
    "All Transactions": "جميع المعاملات",
    "Income & Expense Overview": "نظرة عامة على الدخل والنفقات",

    // Savings
    "Savings Accounts": "حسابات الادخار",
    "Add Account": "إضافة حساب",
    "Total Savings Balance": "إجمالي رصيد المدخرات",
    "Your Accounts": "حساباتك",
    "No savings accounts found": "لا توجد حسابات ادخار.",
    "Goal": "الهدف",
    "Deposit": "إيداع",
    "Withdraw": "سحب",
    "Savings History": "سجل المدخرات",
    "No savings history found": "لا يوجد سجل للمدخرات.",
    "Create Savings Account": "إنشاء حساب ادخار",
    "Account Name": "اسم الحساب",
    "Type": "النوع",
    "Goal Amount": "المبلغ المستهدف (اختياري)",
    "Create Account": "إنشاء الحساب",
    "to Savings": "إلى المدخرات",
    "Amount": "المبلغ",
    "Confirm": "تأكيد",
    "Edit Account": "تعديل الحساب",
    "Save Changes": "حفظ التغييرات",

    // Reports
    "Analytics & Reports": "التحليلات والتقارير",
    "Monthly Overview": "نظرة عامة شهرية",
    "Yearly Overview": "نظرة عامة سنوية",
    "Lifetime Overview": "نظرة عامة شاملة",
    "Income by Category": "الدخل حسب الفئة",
    "Expense by Category": "النفقات حسب الفئة",

    // Bank Interest
    "Bank Interest": "الفائدة المصرفية",
    "Clear Data": "مسح البيانات",
    "Total Accumulated Interest": "إجمالي الفوائد المتراكمة",
    "Add Interest": "إضافة فائدة",
    "Withdraw Infaq": "سحب الإنفاق",
    "Interest History": "سجل الفوائد",
    "No interest history found": "لا يوجد سجل للفوائد.",
    "Add New Interest": "إضافة فائدة جديدة",
    "Bank Name": "اسم البنك",

    // Profile
    "User Profile": "ملف المستخدم",
    "Account & Settings": "الحساب والإعدادات",
    "Verified Account": "حساب موثق",
    "Manage Account": "إدارة الحساب",
    "Display Name": "الاسم المعروض",
    "Email Address": "عنوان البريد الإلكتروني",
    "Linked to your Google account": "مرتبط بحسابك في Google",
    "Save Profile": "حفظ الملف الشخصي",
    "Localization & Currency": "اللغة والعملة",
    "Default Currency": "العملة الافتراضية",
    "App Language": "لغة التطبيق",
    "Save Preferences": "حفظ التفضيلات",
    "Notifications & Reminders": "الإشعارات والتذكيرات",
    "Daily Reminders": "التذكيرات اليومية",
    "Weekly Summary": "الملخص الأسبوعي",
    "Monthly Summary": "الملخص الشهري",
    "Active Devices": "الأجهزة النشطة",
    "Danger Zone": "منطقة الخطر",
    "Clear All Data": "مسح جميع البيانات",
    "Delete Account": "حذف الحساب",
    "Sign Out Account": "تسجيل الخروج",
  },

  hi: {
    // Navigation
    "Dashboard": "डैशबोर्ड",
    "Transactions": "लेनदेन",
    "Savings": "बचत",
    "Interest": "ब्याज",
    "Reports": "रिपोर्ट",
    "Profile": "प्रोफ़ाइल",

    // Dashboard
    "Total Available Balance": "कुल उपलब्ध शेष",
    "Current Month Balance": "वर्तमान माह का शेष",
    "Previous Month Balance": "पिछले माह का शेष",
    "Total Savings": "कुल बचत",
    "Income": "आय",
    "Expenses": "व्यय",
    "Expense": "खर्च",
    "Cash Flow": "नकद प्रवाह",
    "Recent Transactions": "हाल के लेनदेन",
    "Add New Income": "नई आय जोड़ें",
    "Add New Expense": "नया खर्च जोड़ें",
    "Welcome back": "वापस स्वागत है",
    "No recent transactions": "कोई हालिया लेनदेन नहीं",
    "Add Income": "आय जोड़ें",
    "Add Expense": "खर्च जोड़ें",
    "Overview": "अवलोकन",
    "Last 30 Days": "पिछले 30 दिन",
    "All": "सभी",
    "No transactions found": "कोई लेनदेन नहीं मिला",

    // Transactions
    "All Transactions": "सभी लेनदेन",
    "Income & Expense Overview": "आय और खर्च का सारांश",

    // Savings
    "Savings Accounts": "बचत खाते",
    "Add Account": "खाता जोड़ें",
    "Total Savings Balance": "कुल बचत शेष",
    "Your Accounts": "आपके खाते",
    "No savings accounts found": "कोई बचत खाता नहीं।",
    "Goal": "लक्ष्य",
    "Deposit": "जमा",
    "Withdraw": "निकासी",
    "Savings History": "बचत इतिहास",
    "No savings history found": "कोई बचत इतिहास नहीं।",
    "Create Savings Account": "बचत खाता बनाएं",
    "Account Name": "खाते का नाम",
    "Type": "प्रकार",
    "Goal Amount": "लक्ष्य राशि (वैकल्पिक)",
    "Create Account": "खाता बनाएं",
    "to Savings": "बचत में",
    "Amount": "राशि",
    "Confirm": "पुष्टि करें",
    "Edit Account": "खाता संपादित करें",
    "Save Changes": "परिवर्तन सहेजें",

    // Reports
    "Analytics & Reports": "विश्लेषण और रिपोर्ट",
    "Monthly Overview": "मासिक अवलोकन",
    "Yearly Overview": "वार्षिक अवलोकन",
    "Lifetime Overview": "संपूर्ण अवलोकन",
    "Income by Category": "श्रेणी के अनुसार आय",
    "Expense by Category": "श्रेणी के अनुसार खर्च",

    // Bank Interest
    "Bank Interest": "बैंक ब्याज",
    "Clear Data": "डेटा साफ़ करें",
    "Total Accumulated Interest": "कुल संचित ब्याज",
    "Add Interest": "ब्याज जोड़ें",
    "Withdraw Infaq": "इन्फाक निकालें",
    "Interest History": "ब्याज इतिहास",
    "No interest history found": "कोई ब्याज इतिहास नहीं।",
    "Add New Interest": "नया ब्याज जोड़ें",
    "Bank Name": "बैंक का नाम",

    // Profile
    "User Profile": "उपयोगकर्ता प्रोफ़ाइल",
    "Account & Settings": "खाता और सेटिंग्स",
    "Verified Account": "सत्यापित खाता",
    "Manage Account": "खाता प्रबंधित करें",
    "Display Name": "प्रदर्शन नाम",
    "Email Address": "ईमेल पता",
    "Linked to your Google account": "आपके Google खाते से जुड़ा है",
    "Save Profile": "प्रोफ़ाइल सहेजें",
    "Localization & Currency": "मुद्रा और भाषा",
    "Default Currency": "डिफ़ॉल्ट मुद्रा",
    "App Language": "ऐप भाषा",
    "Save Preferences": "प्राथमिकताएं सहेजें",
    "Notifications & Reminders": "सूचनाएं और रिमाइंडर",
    "Daily Reminders": "दैनिक अनुस्मारक",
    "Weekly Summary": "साप्ताहिक सारांश",
    "Monthly Summary": "मासिक सारांश",
    "Active Devices": "सक्रिय उपकरण",
    "Danger Zone": "खतरा क्षेत्र",
    "Clear All Data": "सभी डेटा साफ़ करें",
    "Delete Account": "खाता हटाएं",
    "Sign Out Account": "साइन आउट करें",
  }
};

let currentLanguage = 'en';

export const setAppLanguage = async (langCode) => {
  if (TRANSLATIONS[langCode]) {
    currentLanguage = langCode;
    await AsyncStorage.setItem('app_language', langCode);
  }
};

export const getAppLanguage = async () => {
  try {
    const saved = await AsyncStorage.getItem('app_language');
    if (saved && TRANSLATIONS[saved]) {
      currentLanguage = saved;
    }
  } catch (e) {}
  return currentLanguage;
};

export const t = (key, customLang = null) => {
  const lang = customLang || currentLanguage;
  if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
    return TRANSLATIONS[lang][key];
  }
  return key;
};

export const useTranslation = () => {
  // Lazily read authStore to break circular module dependency:
  // authStore imports i18n (setAppLanguage), so i18n cannot import authStore at top-level.
  const [language, setLang] = useState(() => {
    try {
      const store = require('../store/authStore').default;
      return store.getState().language || 'en';
    } catch (e) {
      return currentLanguage;
    }
  });

  useEffect(() => {
    try {
      const store = require('../store/authStore').default;
      // Subscribe to store changes; only update when language differs
      const unsub = store.subscribe((state) => {
        const newLang = state.language || 'en';
        setLang(prev => (prev !== newLang ? newLang : prev));
      });
      return unsub;
    } catch (e) {}
  }, []);

  return {
    t: (key) => t(key, language),
    language
  };
};
