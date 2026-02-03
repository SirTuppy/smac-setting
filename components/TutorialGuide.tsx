import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, LayoutDashboard } from 'lucide-react';

export interface TutorialStep {
    targetId: string;
    title: string;
    description: string;
    position: 'right' | 'left' | 'top' | 'bottom' | 'center';
}

interface TutorialGuideProps {
    steps: TutorialStep[];
    isOpen: boolean;
    onClose: () => void;
    onStepChange?: (index: number) => void;
}

const TutorialGuide: React.FC<TutorialGuideProps> = ({ steps, isOpen, onClose, onStepChange }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
    const [modalStyle, setModalStyle] = useState<React.CSSProperties>({});
    const modalRef = useRef<HTMLDivElement>(null);

    const updateHighlight = useCallback(() => {
        if (!isOpen) return;

        const step = steps[currentStep];

        if (step.targetId === 'center') {
            setHighlightStyle({
                width: 2,
                height: 2,
                top: '50%',
                left: '50%',
                opacity: 1,
                position: 'fixed',
                border: 'none',
                boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.75)'
            });
            setModalStyle({});
            return;
        }

        const element = document.getElementById(step.targetId);
        if (element) {
            // 1. Scroll into view FIRST and INSTANTLY to ensure rects are correct
            element.scrollIntoView({ behavior: 'auto', block: 'center' });

            // 2. Wrap in a slight delay to ensure the browser has finished scrolling/rendering
            setTimeout(() => {
                const rect = element.getBoundingClientRect();
                const padding = 10;
                const top = rect.top - padding;
                const left = rect.left - padding;
                const width = rect.width + padding * 2;
                const height = rect.height + padding * 2;

                setHighlightStyle({
                    top,
                    left,
                    width,
                    height,
                    opacity: 1,
                    borderRadius: '16px',
                    position: 'fixed'
                });

                // Calculate modal position
                const viewportHeight = window.innerHeight;
                const viewportWidth = window.innerWidth;
                const modalHeight = modalRef.current?.offsetHeight || 280;
                const modalWidth = modalRef.current?.offsetWidth || 340;

                const spaceBelow = viewportHeight - (top + height);
                const spaceAbove = top;

                let verticalStyle: React.CSSProperties = {};
                if (spaceBelow < modalHeight + 20 && spaceAbove < modalHeight + 20) {
                    if (spaceBelow > spaceAbove) {
                        verticalStyle = { top: viewportHeight - modalHeight - 20, bottom: 'auto' };
                    } else {
                        verticalStyle = { top: 20, bottom: 'auto' };
                    }
                } else if (spaceBelow < modalHeight + 40 && spaceAbove > modalHeight + 40) {
                    verticalStyle = {
                        top: Math.max(20, top - modalHeight - 20),
                        bottom: 'auto'
                    };
                } else {
                    verticalStyle = {
                        top: Math.min(viewportHeight - modalHeight - 20, top + height + 20),
                        bottom: 'auto'
                    };
                }

                let leftPos = left + width / 2;
                const halfModal = modalWidth / 2;

                if (leftPos - halfModal < 20) {
                    leftPos = halfModal + 20;
                } else if (leftPos + halfModal > viewportWidth - 20) {
                    leftPos = viewportWidth - halfModal - 20;
                }

                setModalStyle({
                    ...verticalStyle,
                    left: leftPos,
                    transform: 'translateX(-50%)'
                });
            }, 10);
        }
    }, [currentStep, isOpen, steps]);

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
        }
    }, [isOpen]);

    // Notify parent on step change separately from rendering logic
    useEffect(() => {
        if (isOpen) {
            onStepChange?.(currentStep);
        }
    }, [isOpen, currentStep, onStepChange]);

    useEffect(() => {
        updateHighlight();
        const timer = setTimeout(updateHighlight, 100); // Slightly longer delay for initial render
        window.addEventListener('resize', updateHighlight);
        return () => {
            window.removeEventListener('resize', updateHighlight);
            clearTimeout(timer);
        };
    }, [updateHighlight]);

    if (!isOpen) return null;

    const step = steps[currentStep];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onClose();
            setCurrentStep(0);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] overflow-hidden pointer-events-none">
            {/* Backdrop Layer */}
            <div className="absolute inset-0 pointer-events-auto">
                {/* 
                    Visual Highlight Hole 
                    The box-shadow trick: A massive shadow on a transparent div 
                    creates a 100% clear window through a dark overlay.
                */}
                <div
                    className="absolute bg-transparent transition-all duration-500 ease-in-out z-10 border border-white/20 ring-1 ring-white/10 ring-inset pointer-events-auto"
                    style={{
                        ...highlightStyle,
                        boxShadow: highlightStyle.boxShadow || '0 0 0 9999px rgba(15, 23, 42, 0.75), inset 0 0 20px rgba(255, 255, 255, 0.1)'
                    }}
                ></div>
            </div>

            {/* Modal Content */}
            <div
                ref={modalRef}
                className={`absolute z-[1010] pointer-events-auto transition-all duration-500 ease-in-out
                    ${step.targetId === 'center'
                        ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                        : ''}
                `}
                style={step.targetId !== 'center' ? modalStyle : {}}
            >
                <div className="w-[340px] bg-white rounded-[32px] p-8 shadow-2xl border border-slate-100 relative overflow-hidden">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#009CA6]/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-4 text-slate-300 hover:text-slate-600 transition-colors z-[20]"
                        aria-label="Close Tutorial"
                    >
                        <X size={20} />
                    </button>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-white p-1 rounded-xl shadow-md border border-slate-100">
                                <img
                                    src={`${import.meta.env.BASE_URL}assets/justLogo.png`}
                                    className="w-6 h-6 object-contain"
                                    alt="Movement Logo"
                                />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Step {currentStep + 1} of {steps.length}</span>
                        </div>

                        <h3 className="text-2xl font-black text-[#00205B] uppercase tracking-tight mb-3 leading-tight">{step.title}</h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">{step.description}</p>

                        <div className="flex items-center justify-between">
                            <button
                                onClick={handleBack}
                                disabled={currentStep === 0}
                                className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${currentStep === 0 ? 'opacity-0' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <ChevronLeft size={16} />
                                Back
                            </button>

                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 bg-[#00205B] text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-lg active:scale-95"
                            >
                                <span>{currentStep === steps.length - 1 ? 'Finish' : 'Next Step'}</span>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TutorialGuide;
