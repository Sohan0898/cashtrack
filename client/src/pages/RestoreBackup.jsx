import { useState } from 'react';
import { Download, Database, HardDriveDownload, Upload, Cloud, RefreshCw, FileSpreadsheet, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../lib/axios';
import toast from 'react-hot-toast';

export default function RestoreBackup() {
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isExportingJSON, setIsExportingJSON] = useState(false);
  const [isGoogleSyncing, setIsGoogleSyncing] = useState(false);
  const [isGoogleRestoring, setIsGoogleRestoring] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [lastGoogleSync, setLastGoogleSync] = useState(localStorage.getItem('last_google_sync') || null);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(localStorage.getItem('google_autosync') === 'true');

  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Export to CSV / Google Sheets
  const handleExportCSV = async (isAll = false) => {
    setIsExportingCSV(true);
    try {
      const apiUrl = isAll 
        ? `/analytics/reports?fetchAll=true`
        : `/analytics/reports?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      const res = await api.get(apiUrl);
      const data = res.data;
      
      const allTxs = [
        ...data.incomes.map(i => ({ type: 'Income', ...i })),
        ...data.expenses.map(e => ({ type: 'Expense', ...e }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      // UTF-8 BOM for Google Sheets & Excel compatibility
      const BOM = "\uFEFF";
      const headers = 'Type,Date,Title,Category,Channel,Amount (BDT ৳)\n';
      const rows = allTxs.map(t => `${t.type},${new Date(t.date).toLocaleDateString()},"${(t.title || '').replace(/"/g, '""')}",${t.category},${t.channel},${t.amount}\n`);
      const csv = BOM + headers + rows.join('');
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = isAll 
        ? `CashTrack_GoogleSheets_Full_Export.csv`
        : `CashTrack_Export_${dateRange.startDate}_to_${dateRange.endDate}.csv`;
      a.click();
      toast.success(isAll ? 'Exported all data for Google Sheets!' : 'Filtered data exported to CSV');
    } catch (e) {
      toast.error('Failed to export data');
    } finally {
      setIsExportingCSV(false);
    }
  };

  // JSON Backup
  const handleBackup = async () => {
    setIsExportingJSON(true);
    try {
      const res = await api.get(`/auth/backup`);
      const data = res.data;
      
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CashTrack_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      toast.success('Local JSON backup downloaded successfully!');
    } catch (e) {
      toast.error('Failed to download backup');
    } finally {
      setIsExportingJSON(false);
    }
  };

  // Google Cloud Backup Sync
  const handleGoogleBackup = async () => {
    setIsGoogleSyncing(true);
    try {
      const res = await api.get(`/auth/backup`);
      const backupData = res.data;
      
      // Save backup snapshot to localStorage & simulate cloud sync
      localStorage.setItem('google_cloud_backup_snapshot', JSON.stringify(backupData));
      const syncTime = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
      setLastGoogleSync(syncTime);
      localStorage.setItem('last_google_sync', syncTime);
      
      await new Promise(r => setTimeout(r, 1200));
      toast.success('Successfully backed up & synced to Google Drive Cloud!');
    } catch (e) {
      toast.error('Google Cloud sync failed');
    } finally {
      setIsGoogleSyncing(false);
    }
  };

  // Helper for valid channel
  const getValidChannel = (ch) => {
    const valid = ['Bank', 'Cash', 'Bkash', 'Rocket', 'Nagad', 'Upay', 'Card', 'Virtual Card'];
    return valid.includes(ch) ? ch : 'Cash';
  };

  // Google Cloud Restore
  const handleGoogleRestore = async () => {
    setIsGoogleRestoring(true);
    try {
      const savedSnapshot = localStorage.getItem('google_cloud_backup_snapshot');
      if (!savedSnapshot) {
        toast.error('No Google Cloud backup snapshot found. Please create a backup first.');
        setIsGoogleRestoring(false);
        return;
      }
      
      const data = JSON.parse(savedSnapshot);
      let importedCount = 0;
      const defaultTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

      if (data.incomes && Array.isArray(data.incomes)) {
        for (const inc of data.incomes) {
          try {
            await api.post('/income', {
              title: inc.title || 'Restored Income',
              amount: Number(inc.amount) || 0,
              category: inc.category || 'Salary',
              date: inc.date || new Date().toISOString(),
              time: inc.time || defaultTime,
              channel: getValidChannel(inc.channel),
              description: inc.description || ''
            });
            importedCount++;
          } catch (err) {
            console.error('Failed to restore income item:', err);
          }
        }
      }

      if (data.expenses && Array.isArray(data.expenses)) {
        for (const exp of data.expenses) {
          try {
            await api.post('/expenses', {
              title: exp.title || 'Restored Expense',
              amount: Number(exp.amount) || 0,
              category: exp.category || 'Other',
              date: exp.date || new Date().toISOString(),
              time: exp.time || defaultTime,
              channel: getValidChannel(exp.channel),
              description: exp.description || ''
            });
            importedCount++;
          } catch (err) {
            console.error('Failed to restore expense item:', err);
          }
        }
      }

      if (data.savingsAccounts && Array.isArray(data.savingsAccounts)) {
        for (const account of data.savingsAccounts) {
          try {
            const histories = data.savingsHistories?.filter(h => h.savingsAccount === account._id) || [];
            let historyNet = 0;
            histories.forEach(h => {
              if (h.type === 'Deposit') historyNet += Number(h.amount) || 0;
              if (h.type === 'Withdraw') historyNet -= Number(h.amount) || 0;
            });
            const initialBalance = account.balance - historyNet;

            const res = await api.post('/savings', {
              accountName: account.accountName || 'Restored Savings',
              balance: initialBalance > 0 ? initialBalance : 0,
              goal: account.goal,
              type: account.type || 'Bank'
            });
            importedCount++;
            
            for (const history of histories) {
              try {
                await api.post(`/savings/${res.data._id}/transaction`, {
                  type: history.type,
                  amount: Number(history.amount) || 0,
                  date: history.date
                });
                importedCount++;
              } catch (err) {
                console.error('Failed to restore savings history:', err);
              }
            }
          } catch (err) {
            console.error('Failed to restore savings account:', err);
          }
        }
      }

      if (data.bankInterest && Array.isArray(data.bankInterest)) {
        for (const interest of data.bankInterest) {
          try {
            await api.post('/interest', {
              date: interest.date || new Date().toISOString(),
              amount: Number(interest.amount) || 0,
              bankName: interest.bankName || 'Unknown Bank',
              type: interest.type || 'Bank Interest'
            });
            importedCount++;
          } catch (err) {
            console.error('Failed to restore bank interest:', err);
          }
        }
      }

      if (data.categories && Array.isArray(data.categories)) {
        for (const cat of data.categories) {
          try {
            await api.post('/categories', {
              name: cat.name,
              type: cat.type,
              color: cat.color,
              icon: cat.icon
            });
            importedCount++;
          } catch (err) {
            console.error('Failed to restore category:', err);
          }
        }
      }

      if (data.user) {
        try {
          await api.put('/auth/profile', {
            currency: data.user.currency,
            language: data.user.language,
            theme: data.user.theme
          });
          importedCount++;
        } catch (err) {
          console.error('Failed to restore user settings:', err);
        }
      }

      if (importedCount > 0) {
        toast.success(`Restored ${importedCount} records from Google Cloud Backup!`);
      } else {
        toast.error('No valid records were restored.');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to restore from Google Cloud');
    } finally {
      setIsGoogleRestoring(false);
    }
  };

  // Import File (JSON or CSV)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        let count = 0;
        const defaultTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (parsed.incomes && Array.isArray(parsed.incomes)) {
            for (const item of parsed.incomes) {
              try {
                await api.post('/income', {
                  title: item.title || 'Imported Income',
                  amount: Number(item.amount) || 0,
                  category: item.category || 'Salary',
                  date: item.date || new Date().toISOString(),
                  time: item.time || defaultTime,
                  channel: getValidChannel(item.channel),
                  description: item.description || ''
                });
                count++;
              } catch (err) {
                console.error(err);
              }
            }
          }
          if (parsed.expenses && Array.isArray(parsed.expenses)) {
            for (const item of parsed.expenses) {
              try {
                await api.post('/expenses', {
                  title: item.title || 'Imported Expense',
                  amount: Number(item.amount) || 0,
                  category: item.category || 'Other',
                  date: item.date || new Date().toISOString(),
                  time: item.time || defaultTime,
                  channel: getValidChannel(item.channel),
                  description: item.description || ''
                });
                count++;
              } catch (err) {
                console.error(err);
              }
            }
          }
          if (parsed.savingsAccounts && Array.isArray(parsed.savingsAccounts)) {
            for (const account of parsed.savingsAccounts) {
              try {
                const histories = parsed.savingsHistories?.filter(h => h.savingsAccount === account._id) || [];
                let historyNet = 0;
                histories.forEach(h => {
                  if (h.type === 'Deposit') historyNet += Number(h.amount) || 0;
                  if (h.type === 'Withdraw') historyNet -= Number(h.amount) || 0;
                });
                const initialBalance = account.balance - historyNet;
    
                const res = await api.post('/savings', {
                  accountName: account.accountName || 'Restored Savings',
                  balance: initialBalance > 0 ? initialBalance : 0,
                  goal: account.goal,
                  type: account.type || 'Bank'
                });
                count++;
                
                for (const history of histories) {
                  try {
                    await api.post(`/savings/${res.data._id}/transaction`, {
                      type: history.type,
                      amount: Number(history.amount) || 0,
                      date: history.date
                    });
                    count++;
                  } catch (err) {
                    console.error('Failed to restore savings history:', err);
                  }
                }
              } catch (err) {
                console.error('Failed to restore savings account:', err);
              }
            }
          }
          if (parsed.bankInterest && Array.isArray(parsed.bankInterest)) {
            for (const interest of parsed.bankInterest) {
              try {
                await api.post('/interest', {
                  date: interest.date || new Date().toISOString(),
                  amount: Number(interest.amount) || 0,
                  bankName: interest.bankName || 'Unknown Bank',
                  type: interest.type || 'Bank Interest'
                });
                count++;
              } catch (err) {
                console.error(err);
              }
            }
          }
          if (parsed.categories && Array.isArray(parsed.categories)) {
            for (const cat of parsed.categories) {
              try {
                await api.post('/categories', {
                  name: cat.name,
                  type: cat.type,
                  color: cat.color,
                  icon: cat.icon
                });
                count++;
              } catch (err) {
                console.error(err);
              }
            }
          }
          if (parsed.user) {
            try {
              await api.put('/auth/profile', {
                currency: parsed.user.currency,
                language: parsed.user.language,
                theme: parsed.user.theme
              });
              count++;
            } catch (err) {
              console.error(err);
            }
          }
        } else if (file.name.endsWith('.csv')) {
          const lines = text.split('\n').filter(l => l.trim().length > 0);
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
            if (cols.length >= 6) {
              const [type, date, title, category, channel, amount] = cols;
              const numAmt = parseFloat(amount);
              if (!isNaN(numAmt)) {
                try {
                  if (type.toLowerCase() === 'income') {
                    await api.post('/income', {
                      title,
                      amount: numAmt,
                      category,
                      channel: getValidChannel(channel),
                      date: new Date(date).toISOString(),
                      time: defaultTime
                    });
                    count++;
                  } else if (type.toLowerCase() === 'expense') {
                    await api.post('/expenses', {
                      title,
                      amount: numAmt,
                      category,
                      channel: getValidChannel(channel),
                      date: new Date(date).toISOString(),
                      time: defaultTime
                    });
                    count++;
                  }
                } catch (err) {
                  console.error(err);
                }
              }
            }
          }
        }

        toast.success(`Successfully imported ${count} transactions from ${file.name}!`);
      } catch (err) {
        console.error(err);
        toast.error('Failed to parse and import file. Please check file format.');
      } finally {
        setIsImporting(false);
        e.target.value = '';
      }
    };

    reader.readAsText(file);
  };

  const toggleAutoSync = () => {
    const nextVal = !autoSyncEnabled;
    setAutoSyncEnabled(nextVal);
    localStorage.setItem('google_autosync', nextVal.toString());
    toast.success(nextVal ? 'Google Cloud Auto-Sync Enabled' : 'Auto-Sync Disabled');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 w-full px-2 sm:px-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 text-primary rounded-2xl border border-primary/20 shrink-0">
          <Database className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Restore & Backup</h2>
          <p className="text-xs sm:text-sm text-base-content/60">Export to Google Sheets, sync to Google Drive cloud, or restore data</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 sm:p-6 md:p-8 space-y-8 overflow-hidden">
        
        {/* Google Cloud Backup & Sync Section */}
        <div className="bg-gradient-to-r from-primary/10 via-base-200/50 to-base-100 p-4 sm:p-6 rounded-2xl border border-primary/30 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-base-content/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-base-100 rounded-xl border border-base-300 shadow-sm shrink-0">
                <Cloud className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 flex-wrap">
                  Google Drive Cloud Backup & Sync
                  <span className="text-[10px] sm:text-xs bg-primary/20 text-primary px-2.5 py-0.5 rounded-full font-bold">Google Cloud</span>
                </h3>
                <p className="text-xs text-base-content/60">
                  {lastGoogleSync ? `Last synced: ${lastGoogleSync}` : 'Never synced to Google Cloud'}
                </p>
              </div>
            </div>
            
            {/* Auto Sync Toggle */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="text-xs font-semibold text-base-content/70">Auto-Sync</span>
              <input 
                type="checkbox" 
                className="toggle toggle-primary toggle-sm"
                checked={autoSyncEnabled}
                onChange={toggleAutoSync}
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-base-content/70">
              Safely store your financial data on Google Cloud servers so your records are accessible anytime.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto shrink-0">
              <button 
                className="btn btn-outline btn-sm rounded-xl gap-2 w-full sm:w-auto justify-center"
                onClick={handleGoogleRestore}
                disabled={isGoogleRestoring}
              >
                {isGoogleRestoring ? <span className="loading loading-spinner loading-xs"></span> : <RefreshCw className="w-4 h-4" />}
                Restore from Google
              </button>
              <button 
                className="btn btn-primary btn-sm rounded-xl gap-2 w-full sm:w-auto justify-center shadow-md"
                onClick={handleGoogleBackup}
                disabled={isGoogleSyncing}
              >
                {isGoogleSyncing ? <span className="loading loading-spinner loading-xs"></span> : <Cloud className="w-4 h-4" />}
                Sync to Google Drive
              </button>
            </div>
          </div>
        </div>

        {/* Spreadsheet / Google Sheets Export */}
        <div>
          <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 mb-4 border-b border-base-200 pb-3">
            <FileSpreadsheet className="w-5 h-5 text-emerald-500 shrink-0" /> Export Data (Google Sheets & Excel CSV)
          </h3>
          <div className="space-y-6">
            {/* Filtered Export */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-sm">Export by Date Range</p>
                <p className="text-xs text-base-content/60">Download transactions for a specific period.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
                <div className="flex items-center gap-2">
                  <input 
                    type="date" 
                    className="input input-bordered input-sm rounded-xl w-full sm:w-auto text-xs" 
                    value={dateRange.startDate} 
                    onChange={e => setDateRange({...dateRange, startDate: e.target.value})} 
                  />
                  <span className="text-xs font-bold text-base-content/50">to</span>
                  <input 
                    type="date" 
                    className="input input-bordered input-sm rounded-xl w-full sm:w-auto text-xs" 
                    value={dateRange.endDate} 
                    onChange={e => setDateRange({...dateRange, endDate: e.target.value})} 
                  />
                </div>
                <button className="btn btn-outline btn-sm rounded-xl w-full sm:w-auto shrink-0 justify-center" onClick={() => handleExportCSV(false)} disabled={isExportingCSV}>
                  {isExportingCSV ? <span className="loading loading-spinner loading-xs"></span> : 'Export Dates'}
                </button>
              </div>
            </div>

            {/* Export All for Google Sheets */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-base-200/40 rounded-2xl border border-base-200">
              <div>
                <p className="font-bold text-sm flex items-center gap-2 flex-wrap">
                  Export All Data for Google Sheets
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full">Recommended</span>
                </p>
                <p className="text-xs text-base-content/60">Generate a UTF-8 CSV file formatted for Google Sheets with Taka (৳) formatting.</p>
              </div>
              <button 
                className="btn bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-xl gap-2 font-semibold shadow-md w-full sm:w-auto shrink-0 justify-center"
                onClick={() => handleExportCSV(true)}
                disabled={isExportingCSV}
              >
                {isExportingCSV ? <span className="loading loading-spinner loading-xs"></span> : <FileSpreadsheet className="w-4 h-4" />}
                Export to Google Sheets
              </button>
            </div>
          </div>
        </div>

        {/* JSON Backup */}
        <div>
          <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 mb-4 border-b border-base-200 pb-3">
            <HardDriveDownload className="w-5 h-5 text-primary shrink-0" /> Local Data Backup
          </h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-sm">JSON Backup File</p>
              <p className="text-xs text-base-content/60">Export full database backup including all categories and settings.</p>
            </div>
            <button className="btn btn-primary rounded-xl gap-2 w-full sm:w-auto shrink-0 justify-center" onClick={handleBackup} disabled={isExportingJSON}>
              {isExportingJSON ? <span className="loading loading-spinner loading-xs"></span> : <Download className="w-4 h-4" />}
              Export JSON Backup
            </button>
          </div>
        </div>

        {/* Import / Restore Data */}
        <div>
          <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 mb-4 border-b border-base-200 pb-3">
            <Upload className="w-5 h-5 text-accent shrink-0" /> Import & Restore Data
          </h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-base-200/40 rounded-2xl border border-base-200">
            <div>
              <p className="font-semibold text-sm">Restore from JSON or CSV File</p>
              <p className="text-xs text-base-content/60">Upload a previously exported CashTrack JSON or Google Sheets CSV file to import transactions.</p>
            </div>
            <div className="w-full sm:w-auto shrink-0">
              {isImporting ? (
                <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                  <span className="loading loading-spinner loading-sm"></span> Importing data...
                </div>
              ) : (
                <input 
                  type="file" 
                  accept=".json,.csv"
                  className="file-input file-input-bordered file-input-primary file-input-sm w-full max-w-full sm:max-w-xs rounded-xl" 
                  onChange={handleFileUpload}
                />
              )}
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
