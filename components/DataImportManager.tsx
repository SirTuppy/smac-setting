
import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';
import { parsePlastickData, parseHumanityData, parsePayrollData } from '../utils/dataEngine';

const ImportZone: React.FC<{
    label: string,
    accept: string,
    onDrop: (file: File) => void,
    status: 'idle' | 'success' | 'error',
    message?: string
}> = ({ label, accept, onDrop, status, message }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await onDrop(e.dataTransfer.files[0]);
        }
    };

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            await onDrop(e.target.files[0]);
        }
    };

    return (
        <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors min-h-[140px] flex flex-col justify-center
                ${isDragging ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:border-slate-300'}
                ${status === 'success' ? 'bg-emerald-50 border-emerald-200' : ''}
                ${status === 'error' ? 'bg-rose-50 border-rose-200' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
                type="file"
                id={`file-${label}`}
                className="hidden"
                accept={accept}
                onChange={handleChange}
            />
            <label htmlFor={`file-${label}`} className="cursor-pointer flex flex-col items-center gap-2">
                {status === 'success' ? <CheckCircle className="text-emerald-500" size={24} /> :
                    status === 'error' ? <AlertCircle className="text-rose-500" size={24} /> :
                        <Upload className="text-slate-400" size={24} />}

                <span className="font-bold text-slate-700">{label}</span>
                <span className="text-xs text-slate-500 max-w-[180px]">
                    {message || "Drag & drop CSV or click to browse"}
                </span>
            </label>
        </div>
    );
};

export const DataImportManager: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
    const { addFinancialRecord, setClimbData, climbData, financialRecords } = useDashboardStore();
    const [statuses, setStatuses] = useState<Record<string, { status: 'idle' | 'success' | 'error', message?: string }>>({
        production: { status: 'idle' },
        humanity: { status: 'idle' },
        payroll: { status: 'idle' }
    });

    const handleProductionDrop = async (file: File) => {
        try {
            const result = await parsePlastickData(file);
            // Merge results into climbData
            const currentData = { ...(climbData || {}) };
            Object.entries(result).forEach(([gym, data]) => {
                if (currentData[gym]) {
                    // TODO: Deduplicate logic? For now replace or append?
                    // Assuming raw import replaces for given range or gym
                    currentData[gym] = data;
                } else {
                    currentData[gym] = data;
                }
            });
            setClimbData(currentData);
            setStatuses(prev => ({ ...prev, production: { status: 'success', message: `Imported ${Object.keys(result).length} Gyms` } }));
        } catch (e) {
            setStatuses(prev => ({ ...prev, production: { status: 'error', message: "Failed to parse CSV" } }));
            console.error(e);
        }
    };

    const handleHumanityDrop = async (file: File) => {
        try {
            const records = await parseHumanityData(file);
            records.forEach(r => addFinancialRecord(r)); // Merge logic inside store handles duplication?
            // Actually addFinancialRecord appends. We might need update logic.
            // For MVP: We append and let UI sort it out or clear first?
            // Better: parseHumanityData returns Partial<FinancialRecord> and we merge.

            setStatuses(prev => ({ ...prev, humanity: { status: 'success', message: `Imported Hours for ${records.length} periods` } }));
        } catch (e) {
            setStatuses(prev => ({ ...prev, humanity: { status: 'error', message: "Failed to load Hours" } }));
            console.error(e);
        }

    };

    const handlePayrollDrop = async (file: File) => {
        try {
            const records = await parsePayrollData(file);
            records.forEach(r => addFinancialRecord(r));
            setStatuses(prev => ({ ...prev, payroll: { status: 'success', message: `Imported Wages for ${records.length} periods` } }));
        } catch (e) {
            setStatuses(prev => ({ ...prev, payroll: { status: 'error', message: "Failed to load Payroll" } }));
            console.error(e);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
            <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-[#00205B]" />
                Data Aggregator (Import)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ImportZone
                    label="Production (Plastick/Kaya)"
                    accept=".csv"
                    onDrop={handleProductionDrop}
                    status={statuses.production.status}
                    message={statuses.production.message}
                />
                <ImportZone
                    label="Labor Hours (Humanity)"
                    accept=".csv"
                    onDrop={handleHumanityDrop}
                    status={statuses.humanity.status}
                    message={statuses.humanity.message}
                />
                <ImportZone
                    label="Financials (Payroll/Excel)"
                    accept=".xlsx,.csv"
                    onDrop={handlePayrollDrop}
                    status={statuses.payroll.status}
                    message={statuses.payroll.message}
                />
            </div>
            {(statuses.production.status === 'success' || statuses.humanity.status === 'success' || statuses.payroll.status === 'success') && (
                <div className="mt-4 flex justify-end">
                    <button onClick={onComplete} className="text-sm font-bold text-[#00205B] hover:underline">
                        Hide Importer
                    </button>
                </div>
            )}
        </div>
    );
};
