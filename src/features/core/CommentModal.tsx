import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Save } from 'lucide-react';

interface CommentModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialComment: string;
    onSave: (comment: string) => void;
}

const CommentModal: React.FC<CommentModalProps> = ({ isOpen, onClose, initialComment, onSave }) => {
    const [comment, setComment] = useState(initialComment);

    useEffect(() => {
        setComment(initialComment);
    }, [initialComment, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>

                <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-rose-500 transition-colors z-20">
                    <X size={24} />
                </button>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-indigo-600 p-2 rounded-xl shadow-lg">
                            <MessageSquare className="text-white" size={20} />
                        </div>
                        <h2 className="text-3xl font-black text-[#00205B] uppercase tracking-tight">Report Summary</h2>
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8 ml-11">Add context for leadership</p>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00205B]/40 ml-1">Comments & Explanations</label>
                            <textarea
                                className="w-full h-64 bg-slate-50 border-2 border-slate-100 rounded-[24px] p-6 text-sm font-bold text-[#00205B] outline-none focus:border-indigo-500 transition-colors resize-none placeholder:text-slate-300"
                                placeholder="Explain any anomalies (e.g., 'Prep for Boulder Comp - high shifts due to heavy stripping, low rope counts expected this week')"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={() => {
                                onSave(comment);
                                onClose();
                            }}
                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20 hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                        >
                            <Save size={16} />
                            Save Summary
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommentModal;
