import React from 'react';
import { Users, TrendingUp, Zap } from 'lucide-react';
import { ShiftAnalysisResult } from '../../utils/analyticsEngine';

interface AnalyzerKPIsProps {
    analysisData: ShiftAnalysisResult;
}

const AnalyzerKPIs: React.FC<AnalyzerKPIsProps> = ({ analysisData }) => {
    const avgOutput = analysisData.efficiencyData.length > 0
        ? (analysisData.efficiencyData.reduce((acc, curr) => acc + curr.outputPerSetter, 0) / analysisData.efficiencyData.length).toFixed(1)
        : '0.0';

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-emerald-50 rounded-2xl group-hover:bg-emerald-100 transition-colors">
                        <Users className="text-emerald-600" size={24} />
                    </div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Total Shifts Analyzed</h3>
                </div>
                <p className="text-4xl font-black text-[#00205B]">{analysisData.totalShifts}</p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-50 rounded-2xl group-hover:bg-blue-100 transition-colors">
                        <TrendingUp className="text-blue-600" size={24} />
                    </div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Avg Output / Setter</h3>
                </div>
                <p className="text-4xl font-black text-[#00205B]">{avgOutput}</p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-purple-50 rounded-2xl group-hover:bg-purple-100 transition-colors">
                        <Zap className="text-purple-600" size={24} />
                    </div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Data Health Score</h3>
                </div>
                <p className={`text-4xl font-black ${analysisData.dataHealth > 90 ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {analysisData.dataHealth.toFixed(0)}%
                </p>
            </div>
        </div>
    );
};

export default AnalyzerKPIs;
