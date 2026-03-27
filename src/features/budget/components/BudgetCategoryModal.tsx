import React from 'react';
import { X, ChevronDown, ChevronRight, Edit3 } from 'lucide-react';
import { BudgetExpense, BudgetCategory } from '../../../types';
import { formatCurrency } from '../utils';

interface BudgetCategoryModalProps {
    showCategoryModal: string;
    setShowCategoryModal: (id: string | null) => void;
    getCategoryById: (id: string) => BudgetCategory | undefined;
    expensesThisYear: BudgetExpense[];
    selectedYear: number;
    expandedMonths: Record<string, boolean>;
    setExpandedMonths: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    openEditModal: (e: BudgetExpense) => void;
}

export const BudgetCategoryModal: React.FC<BudgetCategoryModalProps> = ({
    showCategoryModal,
    setShowCategoryModal,
    getCategoryById,
    expensesThisYear,
    selectedYear,
    expandedMonths,
    setExpandedMonths,
    openEditModal
}) => {
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
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-8 w-full max-w-3xl shadow-2xl relative max-h-[90vh] flex flex-col">
                <button onClick={() => setShowCategoryModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>

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
            </div>
        </div>
    );
};
