import React from 'react';
import { Search, Edit3, Trash2 } from 'lucide-react';
import { BudgetExpense, BudgetCategory } from '../../../types';
import { formatCurrency } from '../utils';

interface BudgetLedgerTabProps {
    ledgerData: BudgetExpense[];
    ledgerFilter: string;
    setLedgerFilter: (val: string) => void;
    ledgerSortKey: 'date' | 'vendor' | 'category' | 'amount' | 'location';
    setLedgerSortKey: (val: 'date' | 'vendor' | 'category' | 'amount' | 'location') => void;
    ledgerSortAsc: boolean;
    setLedgerSortAsc: (val: boolean) => void;
    selectedYear: number;
    vendorColorMap: Record<string, string>;
    getCategoryById: (id: string) => BudgetCategory | undefined;
    openEditModal: (e: BudgetExpense) => void;
    deleteBudgetExpense: (id: string) => void;
}

export const BudgetLedgerTab: React.FC<BudgetLedgerTabProps> = ({
    ledgerData,
    ledgerFilter,
    setLedgerFilter,
    ledgerSortKey,
    setLedgerSortKey,
    ledgerSortAsc,
    setLedgerSortAsc,
    selectedYear,
    vendorColorMap,
    getCategoryById,
    openEditModal,
    deleteBudgetExpense
}) => {
    return (
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
                <div className="grid grid-cols-[110px_1fr_120px_1fr_100px_1fr_60px] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-widest shrink-0">
                    {(['date', 'vendor', 'location', 'category', 'amount'] as const).map(key => (
                        <button
                            key={key}
                            onClick={() => { if (ledgerSortKey === key) setLedgerSortAsc(!ledgerSortAsc); else { setLedgerSortKey(key); setLedgerSortAsc(key === 'date' ? false : true); } }}
                            className={`text-left flex items-center gap-1 hover:text-[#00205B] transition-colors ${ledgerSortKey === key ? 'text-[#00205B]' : ''}`}
                        >
                            {key === 'date' ? 'Date' : key === 'vendor' ? 'Vendor' : key === 'location' ? 'Location' : key === 'category' ? 'Category' : 'Amount'}
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
                            <div key={e.id} className="grid grid-cols-[110px_1fr_120px_1fr_100px_1fr_60px] gap-4 px-6 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors group text-sm items-center">
                                <span className="text-slate-600 font-medium">{e.date}</span>
                                <span className="font-semibold truncate" style={{ color: vendorColorMap[(e.vendor || '').trim()] || '#334155' }}>{e.vendor || '—'}</span>
                                <span className="text-slate-500 text-xs truncate">{e.location || 'Regional Overview'}</span>
                                <span className="text-slate-600 truncate">{catObj ? catObj.name : 'Uncategorized'}</span>
                                <span className="font-bold text-slate-700">{formatCurrency(e.amount)}</span>
                                <span className="text-slate-400 text-xs truncate">{e.notes || '—'}</span>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <button onClick={() => openEditModal(e)} className="text-slate-400 hover:text-blue-500"><Edit3 size={14} /></button>
                                    <button onClick={() => { if (window.confirm('Delete expense?')) deleteBudgetExpense(e.id); }} className="text-slate-400 hover:text-rose-500"><Trash2 size={14} /></button>
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
    );
};
