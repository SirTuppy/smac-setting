import React from 'react';
import { X, Check } from 'lucide-react';

const SETTINGS_GYMS = ['Design District', 'Grapevine', 'Plano', 'The Hill', 'Fort Worth', 'Denton'];

interface WSPSettingsModalProps {
    setShowSettings: (show: false) => void;
    settingsHeadSetterName: string;
    setSettingsHeadSetterName: (name: string) => void;
    settingsNameFormat: 'first' | 'full';
    setSettingsNameFormat: (format: 'first' | 'full') => void;
    settingsIncludeDefaults: boolean;
    setSettingsIncludeDefaults: (include: boolean) => void;
    settingsMarketingEmail: string;
    setSettingsMarketingEmail: (email: string) => void;
    settingsGymEmails: Record<string, { gd: string; agd: string }>;
    updateGymEmail: (gymName: string, field: 'gd' | 'agd', value: string) => void;
    saveSettings: () => void;
}

export const WSPSettingsModal: React.FC<WSPSettingsModalProps> = ({
    setShowSettings,
    settingsHeadSetterName,
    setSettingsHeadSetterName,
    settingsNameFormat,
    setSettingsNameFormat,
    settingsIncludeDefaults,
    setSettingsIncludeDefaults,
    settingsMarketingEmail,
    setSettingsMarketingEmail,
    settingsGymEmails,
    updateGymEmail,
    saveSettings
}) => {
    return (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-start justify-center pt-12 overflow-y-auto" onClick={() => setShowSettings(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-[600px] max-w-[90vw] p-8 mb-12 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-[#00205B]">WSP Settings</h2>
                    <button onClick={() => setShowSettings(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Head Setter Name</label>
                    <input
                        type="text"
                        value={settingsHeadSetterName}
                        onChange={(e) => setSettingsHeadSetterName(e.target.value)}
                        placeholder="e.g., Chris Smith"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008C95] focus:border-transparent"
                    />
                    <p className="text-xs text-slate-400 mt-1">Used to auto-sign the WSP email template</p>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Setter Name Format</label>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                            <input
                                type="radio"
                                name="nameFormat"
                                checked={settingsNameFormat === 'first'}
                                onChange={() => setSettingsNameFormat('first')}
                                className="accent-[#008C95]"
                            />
                            First Name Only (e.g., Chris)
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                            <input
                                type="radio"
                                name="nameFormat"
                                checked={settingsNameFormat === 'full'}
                                onChange={() => setSettingsNameFormat('full')}
                                className="accent-[#008C95]"
                            />
                            Full Name (e.g., Chris Smith)
                        </label>
                    </div>
                </div>

                <div className="mb-6 flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settingsIncludeDefaults}
                            onChange={(e) => setSettingsIncludeDefaults(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:ring-2 peer-focus:ring-[#008C95] rounded-full peer peer-checked:bg-[#008C95] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                    <span className="text-sm text-slate-700 font-medium">Include instructional placeholder text in generated plans</span>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Global Marketing Email</label>
                    <input
                        type="email"
                        value={settingsMarketingEmail}
                        onChange={(e) => setSettingsMarketingEmail(e.target.value)}
                        placeholder="marketing@movementgyms.com"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008C95] focus:border-transparent"
                    />
                </div>

                <h3 className="text-sm font-bold text-[#00205B] mb-3 mt-6">Gym-Specific Emails</h3>
                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                    {SETTINGS_GYMS.map(gymName => {
                        const emails = settingsGymEmails[gymName] || { gd: '', agd: '' };
                        return (
                            <div key={gymName} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                                <div className="text-sm font-bold text-slate-800 mb-2">{gymName}</div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Gym Director</label>
                                        <input
                                            type="email"
                                            value={emails.gd}
                                            onChange={(e) => updateGymEmail(gymName, 'gd', e.target.value)}
                                            placeholder="gd@movementgyms.com"
                                            className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#008C95] focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Asst. Gym Director</label>
                                        <input
                                            type="email"
                                            value={emails.agd}
                                            onChange={(e) => updateGymEmail(gymName, 'agd', e.target.value)}
                                            placeholder="agd@movementgyms.com"
                                            className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#008C95] focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                    <button onClick={() => setShowSettings(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                        Cancel
                    </button>
                    <button onClick={saveSettings} className="px-4 py-2 text-sm font-medium text-white bg-[#008C95] rounded-lg hover:bg-[#007A82] transition-colors flex items-center gap-2">
                        <Check size={16} /> Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};
