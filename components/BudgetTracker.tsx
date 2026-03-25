import React, { useState, useMemo, useRef } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import { Settings, Plus, Download, Search, X, Upload, FileText, ChevronDown, ChevronRight, Activity, PieChart, Target, DollarSign, Edit3, Trash2, LayoutDashboard, BarChart3, List, Calendar } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { BudgetExpense, BudgetCategory } from '../types';

// Chart Color Palette tailored for professional light mode
const CH_COLORS = [
    '#2563eb', // Blue
    '#10b981', // Emerald
    '#8b5cf6', // Violet
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#0ea5e9', // Sky
    '#f43f5e', // Rose
    '#14b8a6', // Teal
    '#eab308'  // Yellow
];

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const BudgetTracker: React.FC = () => {
    const { budgetState, setBudgetState, addBudgetExpense, updateBudgetExpense, deleteBudgetExpense } = useDashboardStore();

    // UI State
    const [showSettings, setShowSettings] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [smartPasteText, setSmartPasteText] = useState('');
    const [stagedExpenses, setStagedExpenses] = useState<any[]>([]);

    // Editing State
    const [editingExpense, setEditingExpense] = useState<BudgetExpense | null>(null);
    const [expForm, setExpForm] = useState({ date: new Date().toISOString().split('T')[0], categoryId: '', vendor: '', amount: '', notes: '' });

    // Expand state for monthly breakdown
    const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});
    const [expandedGlobalMonths, setExpandedGlobalMonths] = useState<Record<string, boolean>>({});

    const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'ledger'>('overview');
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [expenseModalTab, setExpenseModalTab] = useState<'manual' | 'paste'>('manual');

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

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const actualYear = new Date().getFullYear();
    const actualMonth = new Date().getMonth() + 1;
    const activeMonthForTarget = selectedYear < actualYear ? 12 : selectedYear > actualYear ? 1 : actualMonth;

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
        return budgetState.expenses.filter(e => parseInt(e.date.split('-')[0], 10) === selectedYear).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [budgetState.expenses, selectedYear]);

    const totalYtdSpend = expensesThisYear.reduce((sum, e) => sum + e.amount, 0);
    const totalAnnualLimit = budgetState.config.categories.reduce((sum, c) => sum + c.annualLimit, 0);

    const getCategoryById = (id: string) => budgetState.config.categories.find(c => c.id === id);

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
        let data = budgetState.config.categories.map(cat => ({
            name: cat.name,
            value: expensesThisYear.filter(e => e.categoryId === cat.id).reduce((s, e) => s + e.amount, 0)
        })).filter(d => d.value > 0);
        return data.length ? data : [{ name: 'No Data', value: 1 }];
    }, [budgetState.config.categories, expensesThisYear]);

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

    // Per-year limit resolution
    const getYearLimit = (catId: string): number => {
        const yl = budgetState.config.yearlyLimits;
        if (yl && yl[selectedYear] && yl[selectedYear].categories[catId] !== undefined) {
            return yl[selectedYear].categories[catId];
        }
        const cat = budgetState.config.categories.find(c => c.id === catId);
        return cat ? cat.annualLimit : 0;
    };

    const getYearBudget = (): number => {
        const yl = budgetState.config.yearlyLimits;
        if (yl && yl[selectedYear] && yl[selectedYear].annualBudget !== undefined) {
            return yl[selectedYear].annualBudget;
        }
        return budgetState.config.annualBudget;
    };

    const monthlyLimitToUse = budgetState.config.annualBudget ? budgetState.config.annualBudget / 12 : totalAnnualLimit / 12;

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

    // YoY comparison data
    const prevYearExpenses = useMemo(() => {
        return budgetState.expenses.filter(e => parseInt(e.date.split('-')[0], 10) === selectedYear - 1);
    }, [budgetState.expenses, selectedYear]);

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

    // Sorted & filtered ledger data
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

    const { allByMonth, sortedAllMonths } = useMemo(() => {
        const byMonth: Record<string, BudgetExpense[]> = {};
        expensesThisYear.forEach(e => {
            const m = e.date.substring(0, 7); // YYYY-MM
            if (!byMonth[m]) byMonth[m] = [];
            byMonth[m].push(e);
        });
        const sorted = Object.keys(byMonth).sort((a, b) => b.localeCompare(a));
        return { allByMonth: byMonth, sortedAllMonths: sorted };
    }, [expensesThisYear]);

    const handleSaveExpense = (e: React.FormEvent) => {
        e.preventDefault();
        const expenseData: BudgetExpense = {
            id: editingExpense ? editingExpense.id : generateId(),
            date: expForm.date,
            categoryId: expForm.categoryId,
            vendor: expForm.vendor,
            amount: parseFloat(expForm.amount),
            notes: expForm.notes,
            createdAt: editingExpense ? editingExpense.createdAt : new Date().toISOString()
        };

        if (editingExpense) {
            updateBudgetExpense(expenseData);
        } else {
            addBudgetExpense(expenseData);
        }
        setShowExpenseModal(false);
        setEditingExpense(null);
        setExpForm({ date: new Date().toISOString().split('T')[0], categoryId: '', vendor: '', amount: '', notes: '' });
    };

    const openEditModal = (expense: BudgetExpense) => {
        setEditingExpense(expense);
        setExpForm({
            date: expense.date,
            categoryId: expense.categoryId,
            vendor: expense.vendor || '',
            amount: expense.amount.toString(),
            notes: expense.notes || ''
        });
        setShowExpenseModal(true);
    };

    const handleExportBackup = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(budgetState, null, 2));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", `budget_tracker_backup_${new Date().toISOString().split('T')[0]}.json`);
        dlAnchorElem.click();
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
                    </div>
                    <p className="text-slate-500 mt-2 max-w-2xl">
                        Manage your regional gym budgets, track vendor expenses, and monitor monthly limits.
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => { setEditingExpense(null); setExpenseModalTab('manual'); setShowExpenseModal(true); }}
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
            <div className="flex gap-6  text-sm font-medium text-slate-600">
                <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                    <Target size={16} className="text-slate-400" />
                    Annual Budget: <span className="text-[#00205B] font-bold">{formatCurrency(budgetState.config.annualBudget || totalAnnualLimit)}</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                    <PieChart size={16} className="text-slate-400" />
                    Allocated Categories: <span className="text-[#00205B] font-bold">{formatCurrency(totalAnnualLimit)}</span>
                </div>
                <div className="bg-[#00205B] text-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 font-bold tracking-wide">
                    <Activity size={16} className="text-white/70" />
                    YTD Spend: <span>{formatCurrency(totalYtdSpend)}</span>
                </div>
            </div>

            {/* Category Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgetState.config.categories.length === 0 && (
                    <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed text-slate-500">
                        No categories configured. Open Settings to add some.
                    </div>
                )}
                {budgetState.config.categories.map(cat => {
                    const ytdSpend = expensesThisYear.filter(e => e.categoryId === cat.id).reduce((sum, e) => sum + e.amount, 0);
                    const monthlyBaseline = cat.annualLimit / 12;
                    const ytdTarget = monthlyBaseline * activeMonthForTarget;
                    const rollingBalance = ytdTarget - ytdSpend;
                    const isNegative = rollingBalance < 0;
                    const pctSpend = cat.annualLimit > 0 ? (ytdSpend / cat.annualLimit) * 100 : 0;

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
                                    <div className={`h-2.5 rounded-full ${ytdSpend > cat.annualLimit ? 'bg-rose-500' : 'bg-[#10b981]'}`} style={{ width: `${Math.min(pctSpend, 100)}%` }}></div>
                                </div>
                                <div className="text-xs text-slate-400 mt-2 font-medium tracking-wide">
                                    {pctSpend.toFixed(1)}% of {formatCurrency(cat.annualLimit)} limit
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
                <div className="animate-in fade-in duration-300 space-y-8">
                    {/* Recent Expenses Grid */}
                    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[600px]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-bold text-[#00205B]">Recent Expenses</h3>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#10b981] focus:border-transparent outline-none w-64 transition-all"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {recentExpenses.length === 0 ? (
                                <div className="text-center text-slate-400 py-12">No matching expenses found.</div>
                            ) : (
                                <div className="space-y-3">
                                    {recentExpenses.map(e => {
                                        const catObj = getCategoryById(e.categoryId);
                                        return (
                                            <div key={e.id} className="bg-white border border-slate-100 rounded-xl p-4 flex justify-between items-center hover:bg-slate-50 transition-colors group">
                                                <div>
                                                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                                        {e.date} &nbsp;·&nbsp; {e.vendor && <span style={{ color: vendorColorMap[e.vendor.trim()] || '#008C95' }}>{e.vendor} &nbsp;·&nbsp; </span>} {catObj ? catObj.name : 'Uncategorized'}
                                                    </div>
                                                    <div className="text-[15px] font-medium text-slate-800">{e.notes || 'No description'}</div>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">-{formatCurrency(e.amount)}</span>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                        <button onClick={() => openEditModal(e)} className="text-slate-400 hover:text-blue-500"><Edit3 size={16} /></button>
                                                        <button onClick={() => { if (confirm('Delete expense?')) deleteBudgetExpense(e.id); }} className="text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'analytics' && (
                <div className="animate-in fade-in duration-300 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Chart 1: Donut */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden shrink-0">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Category Spend YTD</h4>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPie>
                                        <Pie data={catDonutData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none" label={({ name, value }) => `${name}: ${formatCurrency(value)}`}>
                                            {catDonutData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CH_COLORS[index % CH_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                                    </RechartsPie>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Chart 2: Vendor Pie */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden shrink-0">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Top Vendors YTD</h4>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPie>
                                        <Pie data={vendorPieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" stroke="none" label={({ name, value }) => `${name}: ${formatCurrency(value)}`}>
                                            {vendorPieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CH_COLORS[index % CH_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                    </RechartsPie>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden flex flex-col h-[450px]">
                        <h3 className="text-lg font-bold text-[#00205B] mb-4">Month-Over-Month Burn Strategy</h3>
                        <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyBurnData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `$${val}`} />
                                    <RechartsTooltip
                                        formatter={(value: number) => formatCurrency(value)}
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend />
                                    <ReferenceLine y={monthlyLimitToUse} stroke="#f43f5e" strokeDasharray="3 3" label={{ position: 'top', value: 'Monthly Avg Limit', fill: '#f43f5e', fontSize: 12, fontWeight: 'bold' }} />
                                    <Bar dataKey="spend" name="Actual Spend" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {yoyBurnData && (
                        <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden flex flex-col h-[450px]">
                            <h3 className="text-lg font-bold text-[#00205B] mb-1">Year-over-Year Comparison</h3>
                            <p className="text-xs text-slate-400 mb-4">{selectedYear} vs {selectedYear - 1}</p>
                            <div className="flex-1 min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={yoyBurnData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `$${val}`} />
                                        <RechartsTooltip
                                            formatter={(value: number) => formatCurrency(value)}
                                            cursor={{ fill: '#f1f5f9' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Legend />
                                        <Bar dataKey="current" name={`${selectedYear}`} fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                        <Bar dataKey="previous" name={`${selectedYear - 1}`} fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'ledger' && (
                <div className="animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[750px]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                            <div>
                                <h3 className="text-lg font-bold text-[#00205B]">Full Expense Ledger — {selectedYear}</h3>
                                <p className="text-xs text-slate-400 mt-1">{ledgerData.length} entries</p>
                            </div>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Filter by vendor, category, notes..."
                                    value={ledgerFilter}
                                    onChange={(e) => setLedgerFilter(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#10b981] focus:border-transparent outline-none w-80 transition-all"
                                />
                            </div>
                        </div>
                        {/* Table Header */}
                        <div className="grid grid-cols-[120px_1fr_1fr_110px_1fr_60px] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-widest shrink-0">
                            {(['date', 'vendor', 'category', 'amount'] as const).map(key => (
                                <button
                                    key={key}
                                    onClick={() => { if (ledgerSortKey === key) setLedgerSortAsc(!ledgerSortAsc); else { setLedgerSortKey(key); setLedgerSortAsc(key === 'date' ? false : true); } }}
                                    className={`text-left flex items-center gap-1 hover:text-[#00205B] transition-colors ${ledgerSortKey === key ? 'text-[#00205B]' : ''}`}
                                >
                                    {key === 'date' ? 'Date' : key === 'vendor' ? 'Vendor' : key === 'category' ? 'Category' : 'Amount'}
                                    {ledgerSortKey === key && <span className="text-[10px]">{ledgerSortAsc ? '▲' : '▼'}</span>}
                                </button>
                            ))}
                            <span>Notes</span>
                            <span></span>
                        </div>
                        {/* Table Body */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {ledgerData.length === 0 ? (
                                <div className="text-center text-slate-400 py-12">No matching expenses found.</div>
                            ) : ledgerData.map(e => {
                                const catObj = getCategoryById(e.categoryId);
                                return (
                                    <div key={e.id} className="grid grid-cols-[120px_1fr_1fr_110px_1fr_60px] gap-4 px-6 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors group text-sm items-center">
                                        <span className="text-slate-600 font-medium">{e.date}</span>
                                        <span className="font-semibold truncate" style={{ color: vendorColorMap[(e.vendor || '').trim()] || '#334155' }}>{e.vendor || '—'}</span>
                                        <span className="text-slate-600 truncate">{catObj ? catObj.name : 'Uncategorized'}</span>
                                        <span className="font-bold text-slate-700">{formatCurrency(e.amount)}</span>
                                        <span className="text-slate-400 text-xs truncate">{e.notes || '—'}</span>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                            <button onClick={() => openEditModal(e)} className="text-slate-400 hover:text-blue-500"><Edit3 size={14} /></button>
                                            <button onClick={() => { if (confirm('Delete expense?')) deleteBudgetExpense(e.id); }} className="text-slate-400 hover:text-rose-500"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {/* Table Footer */}
                        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/50 flex justify-between items-center shrink-0">
                            <span className="text-sm text-slate-500">{ledgerData.length} expense{ledgerData.length !== 1 ? 's' : ''}</span>
                            <span className="text-sm font-bold text-[#00205B]">Total: {formatCurrency(ledgerData.reduce((s, e) => s + e.amount, 0))}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showExpenseModal && (
                <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-xl shadow-2xl relative max-h-[90vh] flex flex-col">
                        <button onClick={() => setShowExpenseModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        <h2 className="text-2xl font-bold text-[#00205B] mb-6">{editingExpense ? 'Edit Expense' : 'Add Expense(s)'}</h2>

                        {!editingExpense && (
                            <div className="flex space-x-2 mb-6 border-b border-slate-200 pb-px shrink-0">
                                <button onClick={() => setExpenseModalTab('manual')} className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${expenseModalTab === 'manual' ? 'border-[#10b981] text-[#10b981]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Manual Entry</button>
                                <button onClick={() => setExpenseModalTab('paste')} className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${expenseModalTab === 'paste' ? 'border-[#10b981] text-[#10b981]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Smart Paste</button>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {expenseModalTab === 'manual' ? (
                                <form onSubmit={handleSaveExpense} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-600 mb-1">Date</label>
                                        <input required type="date" value={expForm.date} onChange={e => setExpForm({ ...expForm, date: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#10b981] outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-600 mb-1">Category</label>
                                        <select required value={expForm.categoryId} onChange={e => setExpForm({ ...expForm, categoryId: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#10b981] outline-none">
                                            <option value="">Select Category...</option>
                                            {budgetState.config.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            {editingExpense && !budgetState.config.categories.some(c => c.id === expForm.categoryId) && <option value={expForm.categoryId}>Uncategorized (Deleted)</option>}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-600 mb-1">Vendor <span className="text-slate-400 font-normal">(Optional)</span></label>
                                        <input type="text" value={expForm.vendor} onChange={e => setExpForm({ ...expForm, vendor: e.target.value })} placeholder="e.g. Home Depot, Amazon" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#10b981] outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-600 mb-1">Amount ($)</label>
                                        <input required type="number" step="0.01" min="0" value={expForm.amount} onChange={e => setExpForm({ ...expForm, amount: e.target.value })} placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#10b981] outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-600 mb-1">Summary / Notes <span className="text-slate-400 font-normal">(Optional)</span></label>
                                        <textarea rows={2} value={expForm.notes} onChange={e => setExpForm({ ...expForm, notes: e.target.value })} placeholder="What was this for?" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#10b981] outline-none resize-none" />
                                    </div>
                                    <div className="pt-4">
                                        <button type="submit" className="w-full bg-[#10b981] text-white font-bold py-3 rounded-xl hover:bg-[#059669] shadow-md transition-colors hover:shadow-lg">
                                            {editingExpense ? 'Save Changes' : 'Log Expense'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Smart Paste</h4>
                                        {stagedExpenses.length > 0 && <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">{stagedExpenses.length} pending</span>}
                                    </div>
                                    <textarea
                                        value={smartPasteText}
                                        onChange={(e) => {
                                            setSmartPasteText(e.target.value);
                                            const text = e.target.value;
                                            if (!text.trim()) return;

                                            const blocks = text.split('Description').filter(b => b.trim() !== '');
                                            const parsed: any[] = [];

                                            blocks.forEach((block, index) => {
                                                const lines = block.split('\n').map(l => l.trim()).filter(l => l !== '');
                                                if (lines.length < 3) return;

                                                const vendorRaw = lines[0];
                                                let amount = 0;
                                                let date = '';

                                                lines.forEach(line => {
                                                    if (line.startsWith('Billing amount')) {
                                                        const match = line.match(/([\d\.]+)/);
                                                        if (match) amount = parseFloat(match[1]);
                                                    }
                                                    if (line.startsWith('Date')) {
                                                        const match = line.match(/(\d{2})\/(\d{2})\/(\d{4})/);
                                                        if (match) date = `${match[3]}-${match[1]}-${match[2]}`;
                                                    }
                                                });

                                                if (vendorRaw && amount && date) {
                                                    let v = vendorRaw.toLowerCase();
                                                    if (v.includes('amazon')) v = 'Amazon';
                                                    else if (v.includes('home depot')) v = 'Home Depot';
                                                    else if (v.includes('scarpa')) v = 'Scarpa';
                                                    else if (v.includes('escape')) v = 'Escape Climbing';
                                                    else if (v.includes('pie tap')) v = 'Pie Tap';
                                                    else if (v.includes('tension')) v = 'Tension';
                                                    else v = vendorRaw.trim();

                                                    parsed.push({
                                                        tempId: 'stage_' + index,
                                                        vendor: v,
                                                        amount,
                                                        date,
                                                        location: 'Dallas Glass',
                                                        categoryId: '',
                                                        notes: ''
                                                    });
                                                }
                                            });

                                            if (parsed.length > 0) {
                                                setStagedExpenses(parsed);
                                                setSmartPasteText(''); // clear it
                                            }
                                        }}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm resize-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent outline-none mb-4"
                                        rows={3}
                                        placeholder="Paste Spend Clarity text here..."
                                    />

                                    {stagedExpenses.length > 0 && (
                                        <div className="space-y-4">
                                            {stagedExpenses.map((exp, idx) => (
                                                <div key={exp.tempId} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                                                    <div className="flex justify-between font-semibold text-slate-700 mb-2">
                                                        <span>{exp.vendor}</span>
                                                        <span className="text-rose-500">${exp.amount.toFixed(2)}</span>
                                                    </div>
                                                    <div className="text-xs text-slate-500 mb-2">{exp.date}</div>
                                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                                        <select
                                                            className="bg-white border text-xs border-slate-200 rounded p-1"
                                                            value={exp.categoryId}
                                                            onChange={e => {
                                                                const draft = [...stagedExpenses];
                                                                draft[idx].categoryId = e.target.value;
                                                                setStagedExpenses(draft);
                                                            }}
                                                        >
                                                            <option value="">Select Category...</option>
                                                            {budgetState.config.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                        </select>
                                                        <select
                                                            className="bg-white border text-xs border-slate-200 rounded p-1"
                                                            value={exp.location}
                                                            onChange={e => {
                                                                const draft = [...stagedExpenses];
                                                                draft[idx].location = e.target.value;
                                                                setStagedExpenses(draft);
                                                            }}
                                                        >
                                                            <option value="Dallas Glass">Dallas Glass</option>
                                                            <option value="Denver">Denver</option>
                                                            <option value="Other">Other</option>
                                                        </select>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Notes..."
                                                        className="w-full bg-white border text-xs border-slate-200 rounded p-1"
                                                        value={exp.notes}
                                                        onChange={e => {
                                                            const draft = [...stagedExpenses];
                                                            draft[idx].notes = e.target.value;
                                                            setStagedExpenses(draft);
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                            <div className="flex gap-2">
                                                <button
                                                    className="flex-1 bg-[#10b981] text-white py-2 rounded-lg font-medium hover:bg-[#059669] text-sm"
                                                    onClick={() => {
                                                        if (stagedExpenses.some(e => !e.categoryId)) {
                                                            alert("Select a category for all staged expenses.");
                                                            return;
                                                        }
                                                        stagedExpenses.forEach(exp => {
                                                            addBudgetExpense({
                                                                id: generateId(),
                                                                date: exp.date,
                                                                categoryId: exp.categoryId,
                                                                location: exp.location,
                                                                vendor: exp.vendor,
                                                                amount: exp.amount,
                                                                notes: exp.notes,
                                                                createdAt: new Date().toISOString()
                                                            });
                                                        });
                                                        setStagedExpenses([]);
                                                        setShowExpenseModal(false);
                                                    }}
                                                >Save All</button>
                                                <button onClick={() => setStagedExpenses([])} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 text-sm">Clear</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}


            {showSettings && (
                <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl relative max-h-[90vh] flex flex-col">
                        <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        <h2 className="text-2xl font-bold text-[#00205B] mb-2">Settings & Categories</h2>
                        <p className="text-slate-500 mb-6 text-sm">Configure your annual tracker budget and expense categories.</p>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                            {/* Budget Config */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Total Annual Budget ($)</label>
                                <input
                                    type="number"
                                    className="w-full max-w-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#10b981] outline-none"
                                    value={budgetState.config.annualBudget}
                                    onChange={e => setBudgetState({ ...budgetState, config: { ...budgetState.config, annualBudget: parseFloat(e.target.value) || 0 } })}
                                />
                            </div>

                            <hr className="border-slate-100" />

                            {/* Categories */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-[#00205B]">Expense Categories</h3>
                                    <button
                                        className="text-sm text-[#10b981] font-semibold hover:text-[#059669] flex items-center gap-1"
                                        onClick={() => {
                                            const newCat: BudgetCategory = { id: generateId(), name: 'New Category', annualLimit: 0 };
                                            setBudgetState({ ...budgetState, config: { ...budgetState.config, categories: [...budgetState.config.categories, newCat] } });
                                        }}
                                    >
                                        <Plus size={16} /> Add Category
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {budgetState.config.categories.map((cat, idx) => (
                                        <div key={cat.id} className="flex gap-4 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <input
                                                className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#10b981] outline-none"
                                                value={cat.name}
                                                placeholder="Category Name"
                                                onChange={e => {
                                                    const draft = [...budgetState.config.categories];
                                                    draft[idx].name = e.target.value;
                                                    setBudgetState({ ...budgetState, config: { ...budgetState.config, categories: draft } });
                                                }}
                                            />
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-400 text-sm">$</span>
                                                <input
                                                    type="number"
                                                    className="w-32 bg-white border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#10b981] outline-none"
                                                    value={cat.annualLimit}
                                                    placeholder="Annual Limit"
                                                    onChange={e => {
                                                        const draft = [...budgetState.config.categories];
                                                        draft[idx].annualLimit = parseFloat(e.target.value) || 0;
                                                        setBudgetState({ ...budgetState, config: { ...budgetState.config, categories: draft } });
                                                    }}
                                                />
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Delete category? Expenses using this will become Uncategorized.')) {
                                                        const draft = budgetState.config.categories.filter(c => c.id !== cat.id);
                                                        setBudgetState({ ...budgetState, config: { ...budgetState.config, categories: draft } });
                                                    }
                                                }}
                                                className="text-slate-400 hover:text-rose-500 p-2"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {budgetState.config.categories.length === 0 && (
                                        <div className="text-center text-slate-400 py-4 text-sm">No categories defined. Please add one.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showCategoryModal && (
                <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-3xl shadow-2xl relative max-h-[90vh] flex flex-col">
                        <button onClick={() => setShowCategoryModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>

                        {(() => {
                            const cat = getCategoryById(showCategoryModal);
                            if (!cat) return null;
                            const catExps = expensesThisYear.filter(e => e.categoryId === cat.id);

                            // Group by month
                            const byMonth: Record<string, BudgetExpense[]> = {};
                            catExps.forEach(e => {
                                const m = e.date.substring(0, 7); // YYYY-MM
                                if (!byMonth[m]) byMonth[m] = [];
                                byMonth[m].push(e);
                            });

                            const sortedMonths = Object.keys(byMonth).sort((a, b) => b.localeCompare(a));

                            return (
                                <>
                                    <h2 className="text-2xl font-bold text-[#00205B] mb-2">{cat.name} Activity</h2>
                                    <p className="text-slate-500 mb-6 text-sm">Reviewing {selectedYear} spending for this category.</p>

                                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                                        {sortedMonths.length === 0 ? (
                                            <div className="text-center text-slate-400 py-12">No expenses logged for this category yet.</div>
                                        ) : sortedMonths.map(month => {
                                            const mTotal = byMonth[month].reduce((s, e) => s + e.amount, 0);
                                            const dt = new Date(month + "-02");
                                            const monthName = dt.toLocaleString('default', { month: 'long', year: 'numeric' });
                                            const isExpanded = expandedMonths[month];

                                            return (
                                                <div key={month} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                                                    <button
                                                        onClick={() => setExpandedMonths(prev => ({ ...prev, [month]: !prev[month] }))}
                                                        className="w-full flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                                                            <span className="font-bold text-[#00205B]">{monthName}</span>
                                                        </div>
                                                        <span className="font-medium text-slate-700">{formatCurrency(mTotal)}</span>
                                                    </button>

                                                    {isExpanded && (
                                                        <div className="p-4 border-t border-slate-100 space-y-2 bg-white">
                                                            {byMonth[month].map(e => (
                                                                <div key={e.id} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg group text-sm border-b border-transparent hover:border-slate-100">
                                                                    <div>
                                                                        <div className="font-semibold text-slate-700">{e.vendor || 'Unknown Vendor'}</div>
                                                                        <div className="text-xs text-slate-500">{e.date} {e.notes ? `· ${e.notes}` : ''}</div>
                                                                    </div>
                                                                    <div className="flex items-center gap-4">
                                                                        <span className="font-medium text-slate-600">${e.amount.toFixed(2)}</span>
                                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                                            <button onClick={() => { setShowCategoryModal(null); openEditModal(e); }} className="text-slate-400 hover:text-blue-500"><Edit3 size={14} /></button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}


        </div>
    );
};

export default BudgetTracker;
