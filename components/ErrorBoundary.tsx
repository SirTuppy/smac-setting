import React, { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        const { fallback, children } = this.props;

        if (this.state.hasError) {
            return fallback || (
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <div className="text-center space-y-4 p-8">
                        <h2 className="text-2xl font-black text-rose-600 uppercase tracking-tight">Something went wrong</h2>
                        <p className="text-slate-600 font-medium">Please refresh the page or contact support.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-[#00205B] text-white rounded-lg font-bold uppercase tracking-wide hover:bg-[#003875] transition-colors"
                        >
                            Reload Dashboard
                        </button>
                    </div>
                </div>
            );
        }
        return children;
    }
}
