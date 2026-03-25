import re
from pathlib import Path

file_path = "f:/Projects/smac-setting-dashboard/components/BudgetTracker.tsx"
content = Path(file_path).read_text(encoding="utf-8")

def extract_block(doc, start_marker, end_marker):
    start = doc.find(start_marker)
    if start == -1: return ""
    if end_marker:
        end = doc.find(end_marker, start)
        return doc[start:end].strip()
    return doc[start:].strip()

stats_block = extract_block(content, "{/* Overview Stats */}", "{/* Category Dashboard Cards */}")
cards_block = extract_block(content, "{/* Category Dashboard Cards */}", "{/* Smart Paste & Recent Expenses Grid */}")
recent_expenses_block = extract_block(content, "                 <div className=\\"lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[750px]\\">", "                 {/* Analytics Sidebar */}")
smart_paste_block = extract_block(content, "                    {/* Add Smart Paste */}", "                    {/* Chart 1: Donut */}")
donut_chart_block = extract_block(content, "                    {/* Chart 1: Donut */}", "                    {/* Chart 2: Vendor Pie */}")
vendor_chart_block = extract_block(content, "                    {/* Chart 2: Vendor Pie */}", "                 </div>\\n            </div>\\n\\n            {/* Global Monthly Breakdown & Burn Strategy */}")
burn_chart_block = extract_block(content, "                {/* Burn Strategy Chart */}", "                {/* Global Monthly Breakdown */}")
ledger_block = extract_block(content, "                {/* Global Monthly Breakdown */}", "            </div>\\n\\n            {/* Modals */}")

# Remove lg:col-span-2 from blocks so they can be full width or flex
recent_expenses_block = recent_expenses_block.replace('lg:col-span-2 ', '')
burn_chart_block = burn_chart_block.replace('lg:col-span-2 ', '')
ledger_block = ledger_block.replace('h-[450px]', 'h-[750px]')

smart_paste_block = smart_paste_block.replace('bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden', 'overflow-hidden')


new_return_block = f'''    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
            {{/* Header */}}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-[#00205B] tracking-tight">Budget Tracker</h1>
                    <p className="text-slate-500 mt-2 max-w-2xl">
                        Manage your regional gym budgets, track vendor expenses, and monitor monthly limits.
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="relative group flex items-center bg-white border border-slate-200 rounded-lg px-3 py-2 text-[15px] font-bold text-[#00205B] shadow-sm cursor-pointer hover:border-[#10b981] transition-colors">
                        <Calendar size={{18}} className="mr-2 text-slate-400 group-hover:text-[#10b981]" />
                        <select 
                            className="bg-transparent outline-none cursor-pointer appearance-none pr-4 font-bold"
                            value={{selectedYear}}
                            onChange={{(e) => setSelectedYear(Number(e.target.value))}}
                        >
                            {{availableYears.map(y => <option key={{y}} value={{y}}>{{y}}</option>)}}
                        </select>
                        <ChevronDown size={{16}} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#00205B] pointer-events-none" />
                    </div>
                    <button 
                        onClick={{() => {{ setEditingExpense(null); setExpenseModalTab('manual'); setShowExpenseModal(true); }}}}
                        className="flex items-center space-x-2 px-4 py-2 bg-[#10b981] text-white rounded-lg hover:bg-[#059669] transition-colors font-medium shadow-sm"
                    >
                        <Plus size={{18}} />
                        <span>Add Expense(s)</span>
                    </button>
                    <button 
                        onClick={{() => setShowSettings(true)}}
                        className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium border border-slate-200"
                    >
                        <Settings size={{18}} />
                        <span>Categories & Config</span>
                    </button>
                    <button 
                        onClick={{() => fileInputRef.current?.click()}}
                        className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium border border-slate-200"
                        title="Import Backup"
                    >
                        <Upload size={{18}} />
                    </button>
                    <button 
                        onClick={{handleExportBackup}}
                        className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium border border-slate-200"
                        title="Export Backup"
                    >
                        <Download size={{18}} />
                    </button>
                    <input 
                        type="file" 
                        accept=".json" 
                        ref={{fileInputRef}} 
                        style={{{{ display: 'none' }}}} 
                        onChange={{handleImportBackup}} 
                    />
                </div>
            </div>

            {{/* Tabs Navigation */}}
            <div className="flex space-x-2 border-b border-slate-200 pb-px mb-6">
                <button 
                    onClick={{() => setActiveTab('overview')}} 
                    className={{`flex items-center space-x-2 px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${{activeTab === 'overview' ? 'border-[#00205B] text-[#00205B]' : 'border-transparent text-slate-500 hover:text-slate-700'}}`}}
                >
                    <LayoutDashboard size={{18}} /><span>Overview</span>
                </button>
                <button 
                    onClick={{() => setActiveTab('analytics')}} 
                    className={{`flex items-center space-x-2 px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${{activeTab === 'analytics' ? 'border-[#00205B] text-[#00205B]' : 'border-transparent text-slate-500 hover:text-slate-700'}}`}}
                >
                    <BarChart3 size={{18}} /><span>Analytics</span>
                </button>
                <button 
                    onClick={{() => setActiveTab('ledger')}} 
                    className={{`flex items-center space-x-2 px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${{activeTab === 'ledger' ? 'border-[#00205B] text-[#00205B]' : 'border-transparent text-slate-500 hover:text-slate-700'}}`}}
                >
                    <List size={{18}} /><span>Full Ledger</span>
                </button>
            </div>

            {{activeTab === 'overview' && (
                <div className="animate-in fade-in duration-300 space-y-8">
                    {stats_block}
                    {cards_block}
                    <div className="w-full">
                         {recent_expenses_block}
                    </div>
                </div>
            )}}

            {{activeTab === 'analytics' && (
                <div className="animate-in fade-in duration-300 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {donut_chart_block}
                        {vendor_chart_block}
                    </div>
                    <div className="w-full">
                        {burn_chart_block}
                    </div>
                </div>
            )}}

            {{activeTab === 'ledger' && (
                <div className="animate-in fade-in duration-300">
                    <div className="w-full">
                        {ledger_block}
                    </div>
                </div>
            )}}

'''


modals_target = """            {/* Modals */}
            {showExpenseModal && (
                <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative">
                        <button onClick={() => setShowExpenseModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        <h2 className="text-2xl font-bold text-[#00205B] mb-6">{editingExpense ? 'Edit Expense' : 'Log New Expense'}</h2>
                        
                        <form onSubmit={handleSaveExpense} className="space-y-4">"""

modals_replacement = """            {/* Modals */}
            {showExpenseModal && (
                <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-xl shadow-2xl relative max-h-[90vh] flex flex-col">
                        <button onClick={() => setShowExpenseModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        <h2 className="text-2xl font-bold text-[#00205B] mb-6">{editingExpense ? 'Edit Expense' : 'Add Expense(s)'}</h2>
                        
                        {!editingExpense && (
                            <div className="flex space-x-2 mb-6 border-b border-slate-200 pb-px">
                                <button onClick={() => setExpenseModalTab('manual')} className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${expenseModalTab === 'manual' ? 'border-[#10b981] text-[#10b981]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Manual Entry</button>
                                <button onClick={() => setExpenseModalTab('paste')} className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${expenseModalTab === 'paste' ? 'border-[#10b981] text-[#10b981]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Smart Paste</button>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {expenseModalTab === 'manual' ? (
                                <form onSubmit={handleSaveExpense} className="space-y-4">"""

close_modal_tgt = """                                <button type="submit" className="w-full bg-[#10b981] text-white font-bold py-3 rounded-xl hover:bg-[#059669] shadow-md transition-colors hover:shadow-lg">
                                    {editingExpense ? 'Save Changes' : 'Log Expense'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}"""

close_modal_rep = f"""                                <button type="submit" className="w-full bg-[#10b981] text-white font-bold py-3 rounded-xl hover:bg-[#059669] shadow-md transition-colors hover:shadow-lg">
                                    {{editingExpense ? 'Save Changes' : 'Log Expense'}}
                                </button>
                            </div>
                        </form>
                            ) : (
                                <div className="space-y-4">
                                {smart_paste_block}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}}"""

actual_return_start = content.find("    return (")
modals_idx = content.find("            {/* Modals */}")

content = content[:actual_return_start] + new_return_block + content[modals_idx:]

content = content.replace(modals_target, modals_replacement)
content = content.replace(close_modal_tgt, close_modal_rep)

Path(file_path).write_text(content, encoding="utf-8")
print("Successfully refactored BudgetTracker.tsx")
