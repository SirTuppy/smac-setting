import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { BudgetExpense, BudgetState } from '../../../types';
import { generateId } from '../utils';

interface BudgetExpenseModalProps {
    setShowExpenseModal: (show: false) => void;
    expenseModalTab: 'manual' | 'paste';
    setExpenseModalTab: (tab: 'manual' | 'paste') => void;
    editingExpense: BudgetExpense | null;
    expForm: { date: string; categoryId: string; vendor: string; amount: string; notes: string };
    setExpForm: (form: any) => void;
    handleSaveExpense: (e: React.FormEvent) => void;
    budgetState: BudgetState;
    stagedExpenses: any[];
    setStagedExpenses: (exps: any[]) => void;
    smartPasteText: string;
    setSmartPasteText: (text: string) => void;
    addBudgetExpense: (expense: BudgetExpense) => void;
    selectedLocation: string;
    activeConfig: any;
    locationOptions: string[];
}

export const BudgetExpenseModal: React.FC<BudgetExpenseModalProps> = ({
    setShowExpenseModal,
    expenseModalTab,
    setExpenseModalTab,
    editingExpense,
    expForm,
    setExpForm,
    handleSaveExpense,
    budgetState,
    stagedExpenses,
    setStagedExpenses,
    smartPasteText,
    setSmartPasteText,
    addBudgetExpense,
    selectedLocation,
    activeConfig,
    locationOptions
}) => {
    return (
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Date</label>
                                    <input required type="date" value={expForm.date} onChange={e => setExpForm({ ...expForm, date: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#10b981] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Location</label>
                                    <select required value={expForm.location} onChange={e => setExpForm({ ...expForm, location: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#10b981] outline-none">
                                        <option value="">Select Location...</option>
                                        {locationOptions.filter(loc => loc !== 'Regional Overview').map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1">Category</label>
                                <select required value={expForm.categoryId} onChange={e => setExpForm({ ...expForm, categoryId: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#10b981] outline-none">
                                    <option value="">Select Category...</option>
                                    {budgetState.categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    {editingExpense && !budgetState.categories.some((c: any) => c.id === expForm.categoryId) && <option value={expForm.categoryId}>Uncategorized (Deleted)</option>}
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
                                                location: (selectedLocation !== 'Regional Overview' ? selectedLocation : (budgetState.defaultLocation !== 'Regional Overview' ? budgetState.defaultLocation : '')) || '',
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
                                                    {budgetState.categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                                                    {locationOptions.map(loc => (
                                                        <option key={loc} value={loc}>{loc}</option>
                                                    ))}
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
    );
};
