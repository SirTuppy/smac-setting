import React, { useState, useMemo, useRef } from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { Settings, Plus, Download, Upload, Calendar, Target, PieChart, Activity, LayoutDashboard, BarChart3, List, ChevronDown, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';
import { BudgetExpense, BudgetCategory } from '../../types';

// Extracted Components
import { CH_COLORS, generateId, formatCurrency } from './utils';
import { BudgetOverviewTab } from './components/BudgetOverviewTab';
import { BudgetAnalyticsTab } from './components/BudgetAnalyticsTab';
import { BudgetLedgerTab } from './components/BudgetLedgerTab';
import { BudgetExpenseModal } from './components/BudgetExpenseModal';
import { BudgetSettingsModal } from './components/BudgetSettingsModal';
import { BudgetCategoryModal } from './components/BudgetCategoryModal';
import { RegionalSnapshot } from './components/RegionalSnapshot';
import { BudgetHealthBanner } from './components/BudgetHealthBanner';

const BudgetTracker: React.FC = () => {
    const { 
        budgetState, setBudgetState, addBudgetExpense, updateBudgetExpense, deleteBudgetExpense, 
        addBudgetCategory, updateBudgetCategory, deleteBudgetCategory, setGymBudget, setGymCategoryLimit,
        gymDisplayNames 
    } = useDashboardStore();

    // UI State
    const [showSettings, setShowSettings] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [smartPasteText, setSmartPasteText] = useState('');
    const [stagedExpenses, setStagedExpenses] = useState<any[]>([]);

    // Editing State
    const [editingExpense, setEditingExpense] = useState<BudgetExpense | null>(null);
    const [expForm, setExpForm] = useState({ 
        date: new Date().toISOString().split('T')[0], 
        categoryId: '', 
        location: '',
        vendor: '', 
        amount: '', 
        notes: '' 
    });

    // Expand state for monthly breakdown
    const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

    const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'ledger'>('overview');
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedLocation, setSelectedLocation] = useState<string>(budgetState.defaultLocation || 'Regional Overview');
    const [expenseModalTab, setExpenseModalTab] = useState<'manual' | 'paste'>('manual');

    const DFW_GYMS = ['Design District', 'Plano', 'Fort Worth', 'Denton', 'Grapevine', 'The Hill'];
    const locationOptions = ['Regional Overview', ...DFW_GYMS];

    // Computed Active Config (with Regional Aggregation)
    const activeConfig = useMemo(() => {
        if (selectedLocation !== 'Regional Overview') {
            return budgetState.configs[selectedLocation] || { annualBudget: 0, categoryLimits: {} };
        }

        // Aggregate ALL gyms for Regional Overview
        let totalAnnualBudget = 0;
        const aggregateLimits: Record<string, number> = {};

        Object.values(budgetState.configs).forEach(cfg => {
            totalAnnualBudget += cfg.annualBudget || 0;
            Object.entries(cfg.categoryLimits || {}).forEach(([catId, limit]) => {
                aggregateLimits[catId] = (aggregateLimits[catId] || 0) + limit;
            });
        });

        return {
            annualBudget: totalAnnualBudget,
            categoryLimits: aggregateLimits
        };
    }, [budgetState.configs, selectedLocation]);

    // Ledger state
    const [ledgerSortKey, setLedgerSortKey] = useState<'date' | 'vendor' | 'category' | 'amount'>('date');
    const [ledgerSortAsc, setLedgerSortAsc] = useState(false);
    const [ledgerFilter, setLedgerFilter] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                if (json && json.config && json.expenses) {
                    setBudgetState(json);
                    alert("Budget data imported successfully!");
                } else {
                    alert("Invalid backup file format.");
                }
            } catch (error) {
                alert("Error parsing JSON file.");
            }
        };
        reader.readAsText(file);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleExportBackup = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(budgetState, null, 2));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", `budget_tracker_backup_${new Date().toISOString().split('T')[0]}.json`);
        dlAnchorElem.click();
    };

    const actualYear = new Date().getFullYear();
    const actualMonth = new Date().getMonth() + 1;
    const actualDay = new Date().getDate();
    const activeMonthForTarget = selectedYear < actualYear ? 12 : selectedYear > actualYear ? 1 : actualMonth;

    // Year elapsed percentage (for pace calculations)
    const isCurrentYear = selectedYear === actualYear;
    const daysInYear = (selectedYear % 4 === 0 && (selectedYear % 100 !== 0 || selectedYear % 400 === 0)) ? 366 : 365;
    const dayOfYear = isCurrentYear
        ? Math.floor((Date.now() - new Date(selectedYear, 0, 1).getTime()) / 86400000) + 1
        : (selectedYear < actualYear ? daysInYear : 1);
    const pctYearElapsed = (dayOfYear / daysInYear) * 100;
    const monthsElapsed = isCurrentYear ? actualMonth - 1 + (actualDay / 30) : (selectedYear < actualYear ? 12 : 0);

    const availableYears = useMemo(() => {
        const setYears = new Set<number>([actualYear]);
        budgetState.expenses.forEach(e => {
            const y = parseInt(e.date.split('-')[0], 10);
            if (!isNaN(y)) setYears.add(y);
        });
        return Array.from(setYears).sort((a, b) => b - a);
    }, [budgetState.expenses, actualYear]);

    // Derived Data
    const expensesThisYear = useMemo(() => {
        return budgetState.expenses.filter(e => {
            if (parseInt(e.date.split('-')[0], 10) !== selectedYear) return false;
            
            if (selectedLocation === 'Regional Overview') {
                return true; // Show ALL expenses in Regional Overview
            }
            
            const expLoc = e.location || 'Regional Overview';
            return expLoc === selectedLocation;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [budgetState.expenses, selectedYear, selectedLocation]);

    const totalYtdSpend = expensesThisYear.reduce((sum, e) => sum + e.amount, 0);
    
    // Sum up the limits for all global categories for this view (Regional or Local)
    const totalAnnualLimit = useMemo(() => {
        return budgetState.categories.reduce((sum, cat) => {
            return sum + (activeConfig.categoryLimits[cat.id] || 0);
        }, 0);
    }, [budgetState.categories, activeConfig.categoryLimits]);

    const getCategoryById = (id: string) => budgetState.categories.find(c => c.id === id);

    // Filtered Recent Expenses
    const recentExpenses = useMemo(() => {
        if (!searchTerm) return expensesThisYear.slice(0, 15);
        const term = searchTerm.toLowerCase();
        return expensesThisYear.filter(e => {
            const cat = getCategoryById(e.categoryId);
            const catStr = cat ? cat.name.toLowerCase() : "uncategorized";
            return (e.vendor?.toLowerCase() || "").includes(term) ||
                (e.notes?.toLowerCase() || "").includes(term) ||
                catStr.includes(term) ||
                e.date.includes(term);
        });
    }, [expensesThisYear, searchTerm]);

    // Analytics Data (Pie/Donut/Bar)
    const catDonutData = useMemo(() => {
        let data = budgetState.categories.map(cat => ({
            name: cat.name,
            value: expensesThisYear.filter(e => e.categoryId === cat.id).reduce((s, e) => s + e.amount, 0)
        })).filter(d => d.value > 0);
        return data.length ? data : [{ name: 'No Data', value: 1 }];
    }, [budgetState.categories, expensesThisYear]);

    const vendorPieData = useMemo(() => {
        const vMap: Record<string, number> = {};
        expensesThisYear.forEach(e => {
            const v = (e.vendor && e.vendor.trim() !== "") ? e.vendor.trim() : "Unknown/Other";
            vMap[v] = (vMap[v] || 0) + e.amount;
        });
        const sorted = Object.entries(vMap).sort((a, b) => b[1] - a[1]);
        const top = sorted.slice(0, 7).map(v => ({ name: v[0], value: v[1] }));
        const other = sorted.slice(7).reduce((s, v) => s + v[1], 0);
        if (other > 0) top.push({ name: 'Other', value: other });
        return top.length ? top : [{ name: 'No Data', value: 1 }];
    }, [expensesThisYear]);

    const vendorColorMap = useMemo(() => {
        const map: Record<string, string> = {};
        vendorPieData.forEach((entry, index) => {
            if (entry.name !== 'No Data') {
                map[entry.name] = CH_COLORS[index % CH_COLORS.length];
            }
        });
        return map;
    }, [vendorPieData]);

    const monthlyLimitToUse = activeConfig.annualBudget ? activeConfig.annualBudget / 12 : totalAnnualLimit / 12;

    const monthlyBurnData = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const data = months.map(m => ({ name: m, spend: 0 }));

        expensesThisYear.forEach(e => {
            const mIdx = parseInt(e.date.split('-')[1], 10) - 1;
            if (mIdx >= 0 && mIdx < 12) {
                data[mIdx].spend += e.amount;
            }
        });
        return data;
    }, [expensesThisYear]);

    const prevYearExpenses = useMemo(() => {
        return budgetState.expenses.filter(e => {
            if (parseInt(e.date.split('-')[0], 10) !== selectedYear - 1) return false;
            const expLoc = e.location || 'Regional Overview';
            return expLoc === selectedLocation;
        });
    }, [budgetState.expenses, selectedYear, selectedLocation]);

    const yoyBurnData = useMemo(() => {
        if (prevYearExpenses.length === 0) return null;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const data = months.map(m => ({ name: m, current: 0, previous: 0 }));
        expensesThisYear.forEach(e => {
            const mIdx = parseInt(e.date.split('-')[1], 10) - 1;
            if (mIdx >= 0 && mIdx < 12) data[mIdx].current += e.amount;
        });
        prevYearExpenses.forEach(e => {
            const mIdx = parseInt(e.date.split('-')[1], 10) - 1;
            if (mIdx >= 0 && mIdx < 12) data[mIdx].previous += e.amount;
        });
        return data;
    }, [expensesThisYear, prevYearExpenses]);

    const ledgerData = useMemo(() => {
        let data = [...expensesThisYear];
        if (ledgerFilter) {
            const term = ledgerFilter.toLowerCase();
            data = data.filter(e => {
                const cat = getCategoryById(e.categoryId);
                return (e.vendor?.toLowerCase() || '').includes(term) ||
                    (e.notes?.toLowerCase() || '').includes(term) ||
                    (cat?.name.toLowerCase() || 'uncategorized').includes(term) ||
                    e.date.includes(term);
            });
        }
        data.sort((a, b) => {
            let cmp = 0;
            switch (ledgerSortKey) {
                case 'date': cmp = a.date.localeCompare(b.date); break;
                case 'vendor': cmp = (a.vendor || '').localeCompare(b.vendor || ''); break;
                case 'category': {
                    const ca = getCategoryById(a.categoryId)?.name || '';
                    const cb = getCategoryById(b.categoryId)?.name || '';
                    cmp = ca.localeCompare(cb); break;
                }
                case 'amount': cmp = a.amount - b.amount; break;
            }
            return ledgerSortAsc ? cmp : -cmp;
        });
        return data;
    }, [expensesThisYear, ledgerFilter, ledgerSortKey, ledgerSortAsc]);

    const handleSaveExpense = (e: React.FormEvent) => {
        e.preventDefault();
        const expenseData: BudgetExpense = {
            id: editingExpense ? editingExpense.id : generateId(),
            date: expForm.date,
            categoryId: expForm.categoryId,
            vendor: expForm.vendor,
            amount: parseFloat(expForm.amount),
            notes: expForm.notes,
            location: expForm.location || selectedLocation,
            createdAt: editingExpense ? editingExpense.createdAt : new Date().toISOString()
        };

        if (editingExpense) {
            updateBudgetExpense(expenseData);
        } else {
            addBudgetExpense(expenseData);
        }
        setShowExpenseModal(false);
        setEditingExpense(null);
        setExpForm({ 
            date: new Date().toISOString().split('T')[0], 
            categoryId: '', 
            location: (selectedLocation !== 'Regional Overview' ? selectedLocation : (budgetState.defaultLocation !== 'Regional Overview' ? budgetState.defaultLocation : '')) || '',
            vendor: '', 
            amount: '', 
            notes: '' 
        });
    };

    const openEditModal = (expense: BudgetExpense) => {
        setEditingExpense(expense);
        setExpForm({
            date: expense.date,
            categoryId: expense.categoryId,
            location: expense.location || 'Regional Overview',
            vendor: expense.vendor || '',
            amount: expense.amount.toString(),
            notes: expense.notes || ''
        });
        setShowExpenseModal(true);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-[#00205B] tracking-tight">Budget Tracker</h1>
                        <div className="relative group flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[15px] font-bold text-[#00205B] shadow-sm cursor-pointer hover:border-[#10b981] transition-colors">
                            <Calendar size={16} className="mr-2 text-slate-400 group-hover:text-[#10b981]" />
                            <select
                                className="bg-transparent outline-none cursor-pointer appearance-none pr-5 font-bold"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                            >
                                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                        <div className="relative group flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[15px] font-bold text-[#00205B] shadow-sm cursor-pointer hover:border-[#10b981] transition-colors">
                            <Target size={16} className="mr-2 text-slate-400 group-hover:text-[#10b981]" />
                            <select
                                className="bg-transparent outline-none cursor-pointer appearance-none pr-5 font-bold max-w-[200px] truncate"
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                            >
                                {locationOptions.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                    <p className="text-slate-500 mt-2 max-w-2xl">
                        Manage your regional gym budgets, track vendor expenses, and monitor monthly limits.
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => { 
                            setEditingExpense(null); 
                            setExpenseModalTab('manual'); 
                            setExpForm({
                                ...expForm,
                                date: new Date().toISOString().split('T')[0],
                                location: (selectedLocation !== 'Regional Overview' ? selectedLocation : (budgetState.defaultLocation !== 'Regional Overview' ? budgetState.defaultLocation : '')) || ''
                            });
                            setShowExpenseModal(true); 
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-[#10b981] text-white rounded-lg hover:bg-[#059669] transition-colors font-medium shadow-sm"
                    >
                        <Plus size={18} />
                        <span>Add Expense(s)</span>
                    </button>
                    <button
                        onClick={() => setShowSettings(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium border border-slate-200"
                    >
                        <Settings size={18} />
                        <span>Categories & Config</span>
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center space-x-2 px-4 py-5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium border border-slate-200"
                    >
                        <Upload size={18} />
                        <span>Import</span>
                    </button>
                    <button
                        onClick={handleExportBackup}
                        className="flex items-center space-x-2 px-4 py-5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium border border-slate-200"
                    >
                        <Download size={18} />
                        <span>Export</span>
                    </button>
                    <input
                        type="file"
                        accept=".json"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleImportBackup}
                    />
                </div>
            </div>

            {/* Overview Stats */}
            <div className="flex gap-4 flex-wrap text-sm font-medium text-slate-600">
                <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                    <Target size={16} className="text-slate-400" />
                    Annual Budget: <span className="text-[#00205B] font-bold">{formatCurrency(activeConfig.annualBudget || totalAnnualLimit)}</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                    <PieChart size={16} className="text-slate-400" />
                    Allocated: <span className="text-[#00205B] font-bold">{formatCurrency(totalAnnualLimit)}</span>
                </div>
                <div className="bg-[#00205B] text-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 font-bold tracking-wide">
                    <Activity size={16} className="text-white/70" />
                    YTD Spend: <span>{formatCurrency(totalYtdSpend)}</span>
                </div>
                <div className={`px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 font-bold tracking-wide border ${
                    (activeConfig.annualBudget || totalAnnualLimit) - totalYtdSpend >= 0
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}>
                    <span className="text-xs">
                        {(activeConfig.annualBudget || totalAnnualLimit) - totalYtdSpend >= 0 ? '✓' : '✗'}
                    </span>
                    Remaining: <span>{formatCurrency((activeConfig.annualBudget || totalAnnualLimit) - totalYtdSpend)}</span>
                </div>
                {(() => {
                    const budget = activeConfig.annualBudget || totalAnnualLimit;
                    if (budget <= 0) return null;
                    const pctSpent = (totalYtdSpend / budget) * 100;
                    const paceRatio = pctYearElapsed > 0 ? pctSpent / pctYearElapsed : 0;
                    let icon, label, cls;
                    if (paceRatio > 1.1) {
                        icon = <TrendingUp size={14} />; label = 'Over Pace'; cls = 'bg-rose-50 border-rose-200 text-rose-600';
                    } else if (paceRatio < 0.9) {
                        icon = <TrendingDown size={14} />; label = 'Under Pace'; cls = 'bg-sky-50 border-sky-200 text-sky-600';
                    } else {
                        icon = <CheckCircle size={14} />; label = 'On Track'; cls = 'bg-emerald-50 border-emerald-200 text-emerald-600';
                    }
                    return (
                        <div className={`px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 font-bold tracking-wide border ${cls}`}>
                            {icon} {label}
                        </div>
                    );
                })()}
            </div>

            {/* Regional Snapshot (only in Regional Overview) */}
            {selectedLocation === 'Regional Overview' && (
                <RegionalSnapshot
                    gymNames={DFW_GYMS}
                    configs={budgetState.configs}
                    expenses={budgetState.expenses}
                    selectedYear={selectedYear}
                    categories={budgetState.categories}
                    pctYearElapsed={pctYearElapsed}
                />
            )}

            {/* Category Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgetState.categories.length === 0 && (
                    <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed text-slate-500">
                        No categories configured for this location. Open Settings to add some.
                    </div>
                )}
                {budgetState.categories.map(cat => {
                    const annualLimit = activeConfig.categoryLimits[cat.id] || 0;
                    const ytdSpend = expensesThisYear.filter(e => e.categoryId === cat.id).reduce((sum, e) => sum + e.amount, 0);
                    const monthlyBaseline = annualLimit / 12;
                    const ytdTarget = monthlyBaseline * activeMonthForTarget;
                    const rollingBalance = ytdTarget - ytdSpend;
                    const isNegative = rollingBalance < 0;
                    const pctSpend = annualLimit > 0 ? (ytdSpend / annualLimit) * 100 : 0;

                    return (
                        <div key={cat.id} onClick={() => setShowCategoryModal(cat.id)} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-[#10b981] hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group">
                            <h3 className="text-xl font-bold text-[#00205B] mb-4 group-hover:text-[#10b981] transition-colors">{cat.name}</h3>

                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Monthly Baseline</span>
                                    <span className="font-medium text-slate-700">{formatCurrency(monthlyBaseline)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">YTD Target (M{activeMonthForTarget})</span>
                                    <span className="font-medium text-slate-700">{formatCurrency(ytdTarget)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">YTD Spend</span>
                                    <span className="font-bold text-[#00205B]">{formatCurrency(ytdSpend)}</span>
                                </div>
                                <div className="pt-2 mt-2 border-t border-slate-100 flex justify-between text-[15px] font-black">
                                    <span className="text-slate-700">Rolling Balance</span>
                                    <span className={isNegative ? 'text-rose-500' : 'text-emerald-500'}>
                                        {isNegative ? '' : '+'}{formatCurrency(rollingBalance)}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                    <div className={`h-2.5 rounded-full ${ytdSpend > annualLimit ? 'bg-rose-500' : 'bg-[#10b981]'}`} style={{ width: `${Math.min(pctSpend, 100)}%` }}></div>
                                </div>
                                <div className="text-xs text-slate-400 mt-2 font-medium tracking-wide">
                                    {pctSpend.toFixed(1)}% of {formatCurrency(annualLimit)} limit
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Tabs Navigation */}
            <div className="flex space-x-2 border-b border-slate-200 pb-px mb-6">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center space-x-2 px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'overview' ? 'border-[#00205B] text-[#00205B]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <LayoutDashboard size={18} /><span>Overview</span>
                </button>
                <button
                    onClick={() => setActiveTab('analytics')}
                    className={`flex items-center space-x-2 px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'analytics' ? 'border-[#00205B] text-[#00205B]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <BarChart3 size={18} /><span>Analytics</span>
                </button>
                <button
                    onClick={() => setActiveTab('ledger')}
                    className={`flex items-center space-x-2 px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'ledger' ? 'border-[#00205B] text-[#00205B]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <List size={18} /><span>Full Ledger</span>
                </button>
            </div>

            {activeTab === 'overview' && (
                <BudgetOverviewTab
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    recentExpenses={recentExpenses}
                    vendorColorMap={vendorColorMap}
                    getCategoryById={getCategoryById}
                    openEditModal={openEditModal}
                    deleteBudgetExpense={deleteBudgetExpense}
                    annualBudget={activeConfig.annualBudget || totalAnnualLimit}
                    ytdSpend={totalYtdSpend}
                    monthsElapsed={monthsElapsed}
                    pctYearElapsed={pctYearElapsed}
                    selectedYear={selectedYear}
                    isCurrentYear={isCurrentYear}
                />
            )}

            {activeTab === 'analytics' && (
                <BudgetAnalyticsTab
                    catDonutData={catDonutData}
                    vendorPieData={vendorPieData}
                    monthlyBurnData={monthlyBurnData}
                    yoyBurnData={yoyBurnData}
                    monthlyLimitToUse={monthlyLimitToUse}
                    selectedYear={selectedYear}
                />
            )}

            {activeTab === 'ledger' && (
                <BudgetLedgerTab
                    ledgerData={ledgerData}
                    ledgerFilter={ledgerFilter}
                    setLedgerFilter={setLedgerFilter}
                    ledgerSortKey={ledgerSortKey}
                    setLedgerSortKey={setLedgerSortKey}
                    ledgerSortAsc={ledgerSortAsc}
                    setLedgerSortAsc={setLedgerSortAsc}
                    selectedYear={selectedYear}
                    vendorColorMap={vendorColorMap}
                    getCategoryById={getCategoryById}
                    openEditModal={openEditModal}
                    deleteBudgetExpense={deleteBudgetExpense}
                />
            )}

            {/* Modals */}
            {showExpenseModal && (
                <BudgetExpenseModal
                    setShowExpenseModal={setShowExpenseModal}
                    expenseModalTab={expenseModalTab}
                    setExpenseModalTab={setExpenseModalTab}
                    editingExpense={editingExpense}
                    expForm={expForm}
                    setExpForm={setExpForm}
                    handleSaveExpense={handleSaveExpense}
                    budgetState={budgetState}
                    stagedExpenses={stagedExpenses}
                    setStagedExpenses={setStagedExpenses}
                    smartPasteText={smartPasteText}
                    setSmartPasteText={setSmartPasteText}
                    addBudgetExpense={addBudgetExpense}
                    selectedLocation={selectedLocation}
                    activeConfig={activeConfig}
                    locationOptions={locationOptions}
                />
            )}

            {showSettings && (
                <BudgetSettingsModal
                    setShowSettings={setShowSettings}
                    budgetState={budgetState}
                    setBudgetState={setBudgetState}
                    selectedLocation={selectedLocation}
                    activeConfig={activeConfig}
                    locationOptions={locationOptions}
                    addBudgetCategory={addBudgetCategory}
                    updateBudgetCategory={updateBudgetCategory}
                    deleteBudgetCategory={deleteBudgetCategory}
                    setGymBudget={setGymBudget}
                    setGymCategoryLimit={setGymCategoryLimit}
                />
            )}

            {showCategoryModal && (
                <BudgetCategoryModal
                    showCategoryModal={showCategoryModal}
                    setShowCategoryModal={setShowCategoryModal}
                    getCategoryById={getCategoryById}
                    expensesThisYear={expensesThisYear}
                    selectedYear={selectedYear}
                    expandedMonths={expandedMonths}
                    setExpandedMonths={setExpandedMonths}
                    openEditModal={openEditModal}
                />
            )}
        </div>
    );
};

export default BudgetTracker;
