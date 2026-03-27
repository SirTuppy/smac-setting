import React from 'react';
import { Search, Edit3, Trash2 } from 'lucide-react';
import { BudgetExpense, BudgetCategory } from '../../../types';
import { formatCurrency } from '../utils';
import { BudgetHealthBanner } from './BudgetHealthBanner';

interface BudgetOverviewTabProps {
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    recentExpenses: BudgetExpense[];
    vendorColorMap: Record<string, string>;
    getCategoryById: (id: string) => BudgetCategory | undefined;
    openEditModal: (e: BudgetExpense) => void;
    deleteBudgetExpense: (id: string) => void;
    annualBudget: number;
    ytdSpend: number;
    monthsElapsed: number;
    pctYearElapsed: number;
    selectedYear: number;
    isCurrentYear: boolean;
}

export const BudgetOverviewTab: React.FC<BudgetOverviewTabProps> = ({
    searchTerm,
    setSearchTerm,
    recentExpenses,
    vendorColorMap,
    getCategoryById,
    openEditModal,
    deleteBudgetExpense,
    annualBudget,
    ytdSpend,
    monthsElapsed,
    pctYearElapsed,
    selectedYear,
    isCurrentYear
}) => {
    return (
        <div className="animate-in fade-in duration-300 space-y-8">
            <BudgetHealthBanner
                annualBudget={annualBudget}
                ytdSpend={ytdSpend}
                monthsElapsed={monthsElapsed}
                pctYearElapsed={pctYearElapsed}
                selectedYear={selectedYear}
                isCurrentYear={isCurrentYear}
            />
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
                                                <button onClick={() => { if (window.confirm('Delete expense?')) deleteBudgetExpense(e.id); }} className="text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
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
    );
};
