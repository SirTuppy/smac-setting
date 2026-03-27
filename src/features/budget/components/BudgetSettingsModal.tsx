import React from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { BudgetState, BudgetCategory, GymBudgetConfig } from '../../../types';
import { generateId } from '../utils';

interface BudgetSettingsModalProps {
    setShowSettings: (show: false) => void;
    budgetState: BudgetState;
    setBudgetState: (state: Partial<BudgetState>) => void;
    selectedLocation: string;
    activeConfig: any;
    locationOptions: string[];
    addBudgetCategory: (category: BudgetCategory) => void;
    updateBudgetCategory: (category: BudgetCategory) => void;
    deleteBudgetCategory: (id: string) => void;
    setGymBudget: (location: string, annualBudget: number) => void;
    setGymCategoryLimit: (location: string, categoryId: string, limit: number) => void;
}

export const BudgetSettingsModal: React.FC<BudgetSettingsModalProps> = ({
    setShowSettings,
    budgetState,
    setBudgetState,
    selectedLocation,
    activeConfig,
    locationOptions,
    addBudgetCategory,
    updateBudgetCategory,
    deleteBudgetCategory,
    setGymBudget,
    setGymCategoryLimit
}) => {
    const isRegional = selectedLocation === 'Regional Overview';

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl relative max-h-[90vh] flex flex-col">
                <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
                <h2 className="text-2xl font-bold text-[#00205B] mb-2">Budget Settings</h2>
                <p className="text-slate-500 mb-6 text-sm">Manage global categories and gym-specific budget allocations.</p>

                <div className="flex-1 overflow-y-auto pr-2 space-y-8">
                    {/* Global Config */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <h3 className="text-sm font-black text-[#00205B] uppercase tracking-widest mb-4">Global Preferences</h3>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Default Expense Location</label>
                            <select
                                className="w-full max-w-xs bg-white border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#009CA6] outline-none font-bold text-slate-700"
                                value={budgetState.defaultLocation}
                                onChange={e => setBudgetState({ defaultLocation: e.target.value })}
                            >
                                {locationOptions.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Global Categories */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-sm font-black text-[#00205B] uppercase tracking-widest">Master Categories</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Define category names once, used across all gyms</p>
                            </div>
                            <button
                                className="text-xs text-[#009CA6] font-black uppercase tracking-widest hover:text-[#00205B] flex items-center gap-1 bg-[#009CA6]/10 px-3 py-1.5 rounded-lg transition-colors"
                                onClick={() => {
                                    addBudgetCategory({ id: generateId(), name: 'New Category' });
                                }}
                            >
                                <Plus size={14} /> Add Category
                            </button>
                        </div>
                        <div className="space-y-2">
                            {budgetState.categories.map((cat) => (
                                <div key={cat.id} className="flex gap-4 items-center bg-white p-1 rounded-xl group">
                                    <input
                                        className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-[#009CA6] outline-none"
                                        value={cat.name}
                                        placeholder="Category Name"
                                        onChange={e => updateBudgetCategory({ ...cat, name: e.target.value })}
                                    />
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Delete this category globally? This will affect all gym configurations.')) {
                                                deleteBudgetCategory(cat.id);
                                            }
                                        }}
                                        className="text-slate-300 hover:text-rose-500 p-2 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Gym Specific Budget Allocation */}
                    <div className={isRegional ? 'opacity-50 pointer-events-none' : ''}>
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-[#00205B] text-white text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest">{selectedLocation}</span>
                                <h3 className="text-sm font-black text-[#00205B] uppercase tracking-widest">Gym Allocation</h3>
                            </div>
                            
                            {isRegional ? (
                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4">
                                    <p className="text-xs font-bold text-amber-700">Regional Overview is an aggregate view. Select a specific gym to manage its budget.</p>
                                </div>
                            ) : (
                                <div className="bg-[#00205B]/5 rounded-2xl p-6 border border-[#00205B]/10 space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Annual Budget ($)</label>
                                        <input
                                            type="number"
                                            className="w-full max-w-xs bg-white border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-[#009CA6] outline-none font-black text-xl text-[#00205B]"
                                            value={activeConfig.annualBudget}
                                            onChange={e => setGymBudget(selectedLocation, parseFloat(e.target.value) || 0)}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Per-Category Limits</label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {budgetState.categories.map(cat => (
                                                <div key={cat.id} className="flex items-center justify-between gap-4 p-3 bg-white rounded-xl border border-slate-100 hover:border-[#009CA6]/30 transition-colors">
                                                    <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{cat.name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-400 text-xs font-bold">$</span>
                                                        <input
                                                            type="number"
                                                            className="w-24 bg-slate-50 border border-slate-100 rounded-lg p-2 text-xs font-black text-[#009CA6] focus:ring-2 focus:ring-[#009CA6] outline-none text-right"
                                                            value={activeConfig.categoryLimits[cat.id] || 0}
                                                            onChange={e => setGymCategoryLimit(selectedLocation, cat.id, parseFloat(e.target.value) || 0)}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            {budgetState.categories.length === 0 && (
                                                <p className="text-center py-4 text-xs font-bold text-slate-400 uppercase italic">Add master categories above to set limits</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 mt-6 flex justify-end">
                    <button 
                        onClick={() => setShowSettings(false)}
                        className="bg-[#00205B] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#009CA6] transition-all"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
