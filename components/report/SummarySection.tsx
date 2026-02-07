import React from 'react';
import { FileText } from 'lucide-react';

interface SummarySectionProps {
    comments: string;
    showSummary: boolean;
}

const SummarySection: React.FC<SummarySectionProps> = ({ comments, showSummary }) => {
    if (!comments || !showSummary) return null;

    return (
        <div id="tour-report-summary-view" className="bg-indigo-50/50 rounded-[32px] p-8 border-2 border-indigo-100/50 relative overflow-hidden mt-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-600 p-1.5 rounded-lg">
                    <FileText className="text-white" size={14} />
                </div>
                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Head Setter Summary</h3>
            </div>
            <p className="text-sm font-bold text-[#00205B] leading-relaxed whitespace-pre-wrap relative z-10">
                {comments}
            </p>
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <FileText size={48} className="text-indigo-600" />
            </div>
        </div>
    );
};

export default SummarySection;
