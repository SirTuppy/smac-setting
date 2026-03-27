import React, { useState, useRef, useCallback } from 'react';
import { Settings, Download, Mail, Image as ImageIcon, Building2 } from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { parseWSPCSV } from '../../utils/wspParser';
import { WSPGymData } from '../../types';
import * as htmlToImage from 'html-to-image';
import { GYMS } from '../../constants/gyms';

// Extracted Components
import { WSPPrintContainer } from './components/WSPPrintContainer';
import { WSPSettingsModal } from './components/WSPSettingsModal';
import { WSPWallMapperModal } from './components/WSPWallMapperModal';

const WSPGenerator: React.FC = () => {
    const {
        wspSettings,
        setWspSettings,
        userWallMappings,
        addUserWallMapping,
        lastWspData,
        setLastWspData
    } = useDashboardStore();

    const [wspData, setWspDataLocal] = useState<Record<string, WSPGymData & { dateRange: string }>>(lastWspData || {});
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showWallMapper, setShowWallMapper] = useState(false);
    const [pendingUnrecognized, setPendingUnrecognized] = useState<Record<string, string[]>>({});

    // Settings modal local state
    const [settingsNameFormat, setSettingsNameFormat] = useState<'first' | 'full'>(wspSettings.nameFormat);
    const [settingsMarketingEmail, setSettingsMarketingEmail] = useState(wspSettings.marketingEmail);
    const [settingsGymEmails, setSettingsGymEmails] = useState<Record<string, { gd: string; agd: string }>>(wspSettings.gymEmails);
    const [settingsIncludeDefaults, setSettingsIncludeDefaults] = useState(wspSettings.includeDefaultText);
    const [settingsHeadSetterName, setSettingsHeadSetterName] = useState(wspSettings.headSetterName);

    // Wall mapper local state
    const [wallMapperEntries, setWallMapperEntries] = useState<Record<string, Record<string, 'rope' | 'boulder' | 'ignored'>>>({});

    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const rawCsvRef = useRef<string | null>(null);

    const runParse = useCallback((csvText: string) => {
        const { plans, unrecognized } = parseWSPCSV(csvText, wspSettings.nameFormat, userWallMappings, wspSettings.includeDefaultText);

        if (Object.keys(unrecognized).length > 0) {
            setPendingUnrecognized(unrecognized);
            // Pre-populate wall mapper entries from unrecognized
            const entries: Record<string, Record<string, 'rope' | 'boulder' | 'ignored'>> = {};
            Object.entries(unrecognized).forEach(([gymCode, walls]) => {
                entries[gymCode] = {};
                walls.forEach(w => { entries[gymCode][w] = 'boulder'; });
            });
            setWallMapperEntries(entries);
            setShowWallMapper(true);
        } else {
            const result = plans as Record<string, WSPGymData & { dateRange: string }>;
            setWspDataLocal(result);
            setLastWspData(result);
        }
    }, [wspSettings.nameFormat, userWallMappings]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        const reader = new FileReader();
        reader.onload = (event) => {
            const csvData = event.target?.result as string;
            rawCsvRef.current = csvData;
            runParse(csvData);
            setIsProcessing(false);
        };
        reader.readAsText(file);

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleApplyWallMappings = () => {
        // Save all entries to Zustand
        Object.entries(wallMapperEntries).forEach(([gymCode, walls]) => {
            Object.entries(walls).forEach(([wallName, type]) => {
                addUserWallMapping(gymCode, wallName, type);
            });
        });

        setShowWallMapper(false);
        setPendingUnrecognized({});
        setWallMapperEntries({});

        // Re-parse with updated mappings if we have cached CSV
        if (rawCsvRef.current) {
            setTimeout(() => {
                const currentMappings = useDashboardStore.getState().userWallMappings;
                const { plans, unrecognized } = parseWSPCSV(rawCsvRef.current!, wspSettings.nameFormat, currentMappings, wspSettings.includeDefaultText);
                if (Object.keys(unrecognized).length > 0) {
                    setPendingUnrecognized(unrecognized);
                    const entries: Record<string, Record<string, 'rope' | 'boulder' | 'ignored'>> = {};
                    Object.entries(unrecognized).forEach(([gymCode, walls]) => {
                        entries[gymCode] = {};
                        walls.forEach(w => { entries[gymCode][w] = 'boulder'; });
                    });
                    setWallMapperEntries(entries);
                    setShowWallMapper(true);
                } else {
                    const result = plans as Record<string, WSPGymData & { dateRange: string }>;
                    setWspDataLocal(result);
                    setLastWspData(result);
                }
            }, 50);
        }
    };

    // Open global wall mapper (not triggered by unrecognized walls)
    const openGlobalWallMapper = () => {
        // Load existing mappings into local state
        const entries: Record<string, Record<string, 'rope' | 'boulder' | 'ignored'>> = {};
        Object.entries(userWallMappings).forEach(([gymCode, walls]) => {
            entries[gymCode] = {};
            Object.entries(walls).forEach(([wallName, data]) => {
                entries[gymCode][wallName] = data.type;
            });
        });
        setWallMapperEntries(entries);
        setPendingUnrecognized({});
        setShowWallMapper(true);
    };

    const exportImage = async (gymName: string, dateRange: string) => {
        const el = containerRefs.current[gymName];
        if (!el) return;

        try {
            const dataUrl = await htmlToImage.toPng(el, {
                pixelRatio: 2,
                backgroundColor: '#ffffff',
                style: { margin: '0' },
            });
            const link = document.createElement('a');
            const safeGym = gymName.replace(/\s+/g, '_');
            const safeDate = dateRange.replace(/\s+/g, '').replace(/[^\w\.\-]/g, '_');
            link.download = `Weekly_Setting_Plan_${safeGym}_${safeDate}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Failed to export image', err);
            alert('Failed to export image.');
        }
    };

    const emailPlan = (gymName: string, data: WSPGymData & { dateRange: string }) => {
        const gymEmails = wspSettings.gymEmails[gymName] || { gd: '', agd: '' };

        const ccList = [gymEmails.gd, gymEmails.agd].filter(e => e).join(';');
        const toStr = wspSettings.marketingEmail || '';
        const subject = encodeURIComponent(`Weekly Setting Plan - ${gymName} (${data.dateRange})`);

        const signer = wspSettings.headSetterName || '[Head Setter Name]';
        const bodyStr = `Hello Team,\n\nPlease see the attached weekly setting plan (Note: please attach the downloaded image before sending) and let me know if you have any questions or concerns with our plans for next week.\n\nMy best,\n${signer}`;
        const body = encodeURIComponent(bodyStr);

        window.location.href = `mailto:${toStr}?cc=${ccList}&subject=${subject}&body=${body}`;
    };

    const updateCell = (gymName: string, rowId: string, field: string, value: string) => {
        setWspDataLocal(prev => {
            const draft = { ...prev };
            const gymData = draft[gymName];
            if (gymData) {
                gymData.rows = gymData.rows.map(r => r.id === rowId ? { ...r, [field]: value } : r);
            }
            return draft;
        });
    };

    const updateList = (gymName: string, listType: 'generalNotes' | 'settersChoice', index: number, value: string) => {
        setWspDataLocal(prev => {
            const draft = { ...prev };
            const gymData = draft[gymName];
            if (gymData) {
                const newList = [...gymData[listType]];
                if (value === '' && newList.length > 1) {
                    // Delete the line if emptied (keep at least one)
                    newList.splice(index, 1);
                } else {
                    newList[index] = value;
                }
                gymData[listType] = newList;
            }
            return draft;
        });
    };

    const addListNote = (gymName: string, listType: 'generalNotes' | 'settersChoice', afterIndex: number) => {
        setWspDataLocal(prev => {
            const draft = { ...prev };
            const gymData = draft[gymName];
            if (gymData) {
                const newList = [...gymData[listType]];
                newList.splice(afterIndex + 1, 0, '');
                gymData[listType] = newList;
            }
            return draft;
        });
    };

    // --- Settings Modal Handlers ---
    const openSettings = () => {
        setSettingsNameFormat(wspSettings.nameFormat);
        setSettingsHeadSetterName(wspSettings.headSetterName);
        setSettingsMarketingEmail(wspSettings.marketingEmail);
        setSettingsGymEmails({ ...wspSettings.gymEmails });
        setSettingsIncludeDefaults(wspSettings.includeDefaultText);
        setShowSettings(true);
    };

    const saveSettings = () => {
        setWspSettings({
            nameFormat: settingsNameFormat,
            headSetterName: settingsHeadSetterName,
            marketingEmail: settingsMarketingEmail,
            gymEmails: settingsGymEmails,
            includeDefaultText: settingsIncludeDefaults
        });
        setShowSettings(false);

        // Re-parse if we have cached CSV
        if (rawCsvRef.current) {
            setTimeout(() => {
                runParse(rawCsvRef.current!);
            }, 50);
        }
    };

    const updateGymEmail = (gymName: string, field: 'gd' | 'agd', value: string) => {
        setSettingsGymEmails(prev => ({
            ...prev,
            [gymName]: { ...(prev[gymName] || { gd: '', agd: '' }), [field]: value }
        }));
    };

    // --- Wall Mapper Handlers ---
    const updateWallMapperEntry = (gymCode: string, wallName: string, type: 'rope' | 'boulder' | 'ignored') => {
        setWallMapperEntries(prev => ({
            ...prev,
            [gymCode]: { ...(prev[gymCode] || {}), [wallName]: type }
        }));
    };

    const deleteWallMapperEntry = (gymCode: string, wallName: string) => {
        setWallMapperEntries(prev => {
            const newEntries = { ...prev };
            if (newEntries[gymCode]) {
                const { [wallName]: _, ...rest } = newEntries[gymCode];
                newEntries[gymCode] = rest;
                if (Object.keys(newEntries[gymCode]).length === 0) {
                    delete newEntries[gymCode];
                }
            }
            return newEntries;
        });
    };

    const addWallMapperEntry = (gymCode: string, wallName: string, mapping: 'rope' | 'boulder' | 'ignored') => {
        setWallMapperEntries(prev => ({
            ...prev,
            [gymCode]: { ...(prev[gymCode] || {}), [wallName.toLowerCase()]: mapping }
        }));
    };

    const hasPendingUnrecognized = Object.keys(pendingUnrecognized).length > 0;

    return (
        <div className="wsp-content p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">

            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-[#00205B] tracking-tight">Weekly Setting Plan Generator</h1>
                    <p className="text-slate-500 mt-2 max-w-2xl">
                        Upload your Humanity Schedule Export to generate structured weekly setting plans perfectly synced to your gym's walls.
                    </p>
                </div>

                <div className="flex space-x-4">
                    <button
                        onClick={openGlobalWallMapper}
                        className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium border border-slate-200"
                    >
                        <Building2 size={18} />
                        <span>Global Zone Mapper</span>
                    </button>
                    <button
                        onClick={openSettings}
                        className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium border border-slate-200"
                    >
                        <Settings size={18} />
                        <span>Settings</span>
                    </button>
                    {Object.keys(wspData).length > 0 && (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center space-x-2 px-4 py-2 bg-[#008C95] text-white rounded-lg hover:bg-[#007A82] transition-colors font-medium shadow-sm"
                        >
                            <Download size={18} />
                            <span>Upload New Data</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Upload Box */}
            {Object.keys(wspData).length === 0 && (
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-16 flex flex-col items-center justify-center bg-white shadow-sm hover:border-[#008C95] hover:bg-slate-50 transition-all cursor-pointer relative group"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".csv"
                        onChange={handleFileUpload}
                    />
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:text-[#008C95] group-hover:scale-110 transition-transform mb-6">
                        <Download size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">Upload Humanity Export</h3>
                    <p className="text-slate-500 text-center max-w-md">
                        Drop your Shift Planning CSV here or click to browse. The generator will automatically parse and group the shifts by gym.
                    </p>
                    {isProcessing && (
                        <div className="mt-4 text-[#008C95] font-medium animate-pulse">Processing CSV...</div>
                    )}
                </div>
            )}

            {/* Generated Plans */}
            <div className="space-y-16">
                {Object.entries(wspData).map(([gymName, data]: [string, any]) => (
                    <div key={gymName} className="mb-16">
                        {/* Action buttons */}
                        <div className="flex justify-end space-x-3 mb-4 max-w-[900px] mx-auto">
                            <button onClick={() => emailPlan(gymName, data)} className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium">
                                <Mail size={16} /> <span>Email Plan</span>
                            </button>
                            <button onClick={() => exportImage(gymName, data.dateRange)} className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-[#008C95] text-white rounded-lg hover:bg-[#007A82] transition-colors font-medium">
                                <ImageIcon size={16} /> <span>Download Image</span>
                            </button>
                        </div>

                        {/* Print Container Component */}
                        <WSPPrintContainer
                            ref={(el) => containerRefs.current[gymName] = el}
                            gymName={gymName}
                            data={data}
                            updateCell={updateCell}
                            updateList={updateList}
                            addListNote={addListNote}
                        />
                    </div>
                ))}
            </div>

            {/* Hidden Input for generic use */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv"
                onChange={handleFileUpload}
            />

            {/* Modals */}
            {showSettings && (
                <WSPSettingsModal
                    setShowSettings={setShowSettings}
                    settingsHeadSetterName={settingsHeadSetterName}
                    setSettingsHeadSetterName={setSettingsHeadSetterName}
                    settingsNameFormat={settingsNameFormat}
                    setSettingsNameFormat={setSettingsNameFormat}
                    settingsIncludeDefaults={settingsIncludeDefaults}
                    setSettingsIncludeDefaults={setSettingsIncludeDefaults}
                    settingsMarketingEmail={settingsMarketingEmail}
                    setSettingsMarketingEmail={setSettingsMarketingEmail}
                    settingsGymEmails={settingsGymEmails}
                    updateGymEmail={updateGymEmail}
                    saveSettings={saveSettings}
                />
            )}

            {showWallMapper && (
                <WSPWallMapperModal
                    setShowWallMapper={setShowWallMapper}
                    hasPendingUnrecognized={hasPendingUnrecognized}
                    setPendingUnrecognized={setPendingUnrecognized}
                    wallMapperEntries={wallMapperEntries}
                    updateWallMapperEntry={updateWallMapperEntry}
                    deleteWallMapperEntry={deleteWallMapperEntry}
                    addWallMapperEntry={addWallMapperEntry}
                    handleApplyWallMappings={handleApplyWallMappings}
                />
            )}
        </div>
    );
};

export default WSPGenerator;
