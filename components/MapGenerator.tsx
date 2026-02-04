import React, { useState, useEffect, useRef, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react';
import { Download, Printer, Mail, Save, RotateCcw, HelpCircle, Edit3, X, Map, ChevronRight } from 'lucide-react';
import { GymSchedule, ScheduleEntry, EmailSettings, GymMeta } from '../types';
import { GYM_WALLS, TEMPLATE_COORDS } from '../constants/mapTemplates';
import { GYMS, getGymDisplayName, getGymByCode } from '../constants/gyms';

export interface MapGeneratorHandle {
    downloadAll: () => void;
}

import { useDashboardStore } from '../store/useDashboardStore';

interface ClickRegion {
    gymCode: string;
    dayIndex: number;
    dataType: 'routes' | 'boulders';
    field: 'location' | 'climbType' | 'setterCount';
    value: string;
    x: number;
    y: number;
    width: number;
    height: number;
    canvasType: string;
    id: string | null;
}

const MapGenerator = forwardRef<MapGeneratorHandle>((_, ref) => {
    const {
        gymSchedules: schedules,
        selectedGyms,
        setGymSchedule,
        setGymSchedules,
        showInstructions,
        setShowInstructions,
        showSettings,
        setShowSettings,
        emailSettings,
        setEmailSettings,
        gymSettings,
        scheduleOverrides,
        setScheduleOverride,
        clearScheduleOverrides
    } = useDashboardStore();

    const [clickRegions, setClickRegions] = useState<ClickRegion[]>([]);
    const [editingRegion, setEditingRegion] = useState<{ region: ClickRegion, rect: DOMRect, canvas: HTMLCanvasElement } | null>(null);
    const [editValue, setEditValue] = useState('');
    const canvasRefs = useRef<Record<string, HTMLCanvasElement[]>>({});

    const allGymCodes = useMemo(() => Object.keys(schedules || {}).sort(), [schedules]);

    const gymDisplayNames = useMemo(() => {
        const names: Record<string, string> = {};
        allGymCodes.forEach(code => {
            names[code] = getGymDisplayName(code);
        });
        return names;
    }, [allGymCodes]);

    const activeGyms = useMemo(() => {
        if (selectedGyms.includes("Regional Overview")) return allGymCodes;
        return allGymCodes.filter(code => selectedGyms.includes(code));
    }, [allGymCodes, selectedGyms]);

    const handleEmailSchedule = () => {
        if (!schedules) return;
        const firstGym = Object.keys(schedules)[0];
        const schedule = schedules[firstGym];

        let subject = emailSettings.subject
            .replace('[GYM_NAME]', firstGym)
            .replace('[DATE_RANGE]', schedule.fileDateRange);

        let body = emailSettings.body
            .replace('[GYM_NAME]', firstGym)
            .replace('[DATE_RANGE]', schedule.fileDateRange);

        window.location.href = `mailto:${emailSettings.to}?cc=${emailSettings.cc}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    if (!schedules) return null;

    const capitalizeWallNames = (text: string) => {
        if (!text || text === '---') return text;
        return text.split(', ').map(wallName => {
            return wallName.split(' ').map(word => {
                return word.charAt(0).toUpperCase() + word.slice(1);
            }).join(' ');
        }).join(', ');
    };

    const truncateText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
        if (ctx.measureText(text).width <= maxWidth) return text;
        let truncated = text;
        while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
            truncated = truncated.slice(0, -1);
        }
        return truncated + '...';
    };

    const renderTableData = useCallback((ctx: CanvasRenderingContext2D, weekData: any[], type: string, tableCoords: any, tableTop: number, rowHeight: number, weekOffset: number, gymCode: string, regions: ClickRegion[]) => {
        const gymData = schedules[gymCode];
        const startDay = gymData.startDay;
        const templateConfig = TEMPLATE_COORDS[gymCode] || TEMPLATE_COORDS['GENERIC'];
        const settings = gymSettings[gymCode] || {
            displayMode: templateConfig.displayMode || 'separate',
            climbTypeDisplay: 'type'
        };
        let currentY = tableTop;

        const getOverrideValue = (dayIdx: number, dataType: 'routes' | 'boulders', field: 'location' | 'climbType' | 'setterCount', fallback: string) => {
            const dStr = new Date(startDay);
            dStr.setDate(dStr.getDate() + dayIdx);
            const dateKey = dStr.toISOString().split('T')[0];
            const key = `${gymCode}-${dateKey}-${dataType}-${field}`;
            return scheduleOverrides[key]?.value ?? fallback;
        };

        weekData.forEach((day, rowIndex) => {
            const dayIndex = weekOffset + rowIndex;
            const currentDate = new Date(startDay);
            currentDate.setDate(currentDate.getDate() + dayIndex);
            const dateStr = `${currentDate.getMonth() + 1}/${currentDate.getDate()}`;
            const dayOfWeek = currentDate.getDay();

            if (settings.displayMode === 'separate' && (dayOfWeek === 0 || dayOfWeek === 6)) return;

            const hasRoutes = day.routes && day.routes.length > 0;
            const hasBoulders = day.boulders && day.boulders.length > 0;

            let itemsForDay: ScheduleEntry[] = [];
            if (templateConfig.combined) {
                itemsForDay = [...day.routes, ...day.boulders];
            } else {
                if (type === 'routes') itemsForDay = day.routes;
                else if (type === 'boulders') itemsForDay = day.boulders;
                else itemsForDay = [...day.routes, ...day.boulders];
            }

            const textY = currentY - (rowHeight / 2);

            // DRAW ZEBRA STRIPE (Behind text) - Start on row 0
            if (rowIndex % 2 === 0) {
                ctx.fillStyle = '#efeff2';
                // Fine-tuned boundaries to align perfectly with headers
                const stripeX = tableCoords.date.x - 2;
                const tableEnd = tableCoords.setters.x + tableCoords.setters.width + 1;
                const stripeWidth = tableEnd - stripeX;

                // Adjust Y calculation to be centred on the row
                const stripeY = currentY - (rowHeight * 0.55);
                ctx.fillRect(stripeX, stripeY, stripeWidth, rowHeight);
                ctx.fillStyle = '#1e3a5f'; // Restore text color
            }

            if (settings.displayMode === 'separate') {
                if (!hasRoutes && !hasBoulders) {
                    const locationVal = getOverrideValue(dayIndex, 'routes', 'location', '---');
                    const typeVal = getOverrideValue(dayIndex, 'routes', 'climbType', '---');
                    const settersVal = getOverrideValue(dayIndex, 'routes', 'setterCount', '---');

                    ctx.fillText(dateStr, tableCoords.date.x, currentY);
                    ctx.fillText(truncateText(ctx, locationVal, tableCoords.location.width), tableCoords.location.x, currentY);
                    ctx.fillText(typeVal, tableCoords.climbType.x, currentY);
                    ctx.fillText(settersVal, tableCoords.setters.x, currentY);

                    regions.push({ gymCode, dayIndex, dataType: 'routes', field: 'location', value: locationVal, x: tableCoords.location.x, y: textY, width: tableCoords.location.width, height: rowHeight, canvasType: 'combined', id: null });
                    regions.push({ gymCode, dayIndex, dataType: 'routes', field: 'climbType', value: typeVal, x: tableCoords.climbType.x, y: textY, width: tableCoords.climbType.width, height: rowHeight, canvasType: 'combined', id: null });
                    regions.push({ gymCode, dayIndex, dataType: 'routes', field: 'setterCount', value: settersVal, x: tableCoords.setters.x, y: textY, width: tableCoords.setters.width, height: rowHeight, canvasType: 'combined', id: null });
                    currentY += rowHeight;
                    return;
                }

                let dateDrawn = false;
                if (hasRoutes) {
                    const fallbackLocation = capitalizeWallNames(day.routes.map((i: any) => i.walls.join(', ')).join(', '));
                    const locationText = getOverrideValue(dayIndex, 'routes', 'location', fallbackLocation);

                    let climbTypeFallback = day.routes[0].climbType;
                    if (settings.climbTypeDisplay === 'steepness') {
                        const wall = day.routes[0].walls[0]?.toLowerCase();
                        climbTypeFallback = GYM_WALLS[gymCode]?.[wall]?.climb_type || climbTypeFallback;
                    }
                    const climbTypeText = getOverrideValue(dayIndex, 'routes', 'climbType', climbTypeFallback);

                    const currentSetterCount = String(day.routes.reduce((t: number, i: any) => t + i.setterCount, 0));
                    const setterText = getOverrideValue(dayIndex, 'routes', 'setterCount', currentSetterCount);

                    ctx.fillText(dateStr, tableCoords.date.x, currentY);
                    ctx.fillText(truncateText(ctx, locationText, tableCoords.location.width), tableCoords.location.x, currentY);
                    ctx.fillText(climbTypeText, tableCoords.climbType.x, currentY);
                    ctx.fillText(setterText, tableCoords.setters.x, currentY);

                    regions.push({ gymCode, dayIndex, dataType: 'routes', field: 'location', value: locationText, x: tableCoords.location.x, y: textY, width: tableCoords.location.width, height: rowHeight, canvasType: type, id: day.routes[0].id });
                    regions.push({ gymCode, dayIndex, dataType: 'routes', field: 'climbType', value: climbTypeText, x: tableCoords.climbType.x, y: textY, width: tableCoords.climbType.width, height: rowHeight, canvasType: type, id: day.routes[0].id });
                    regions.push({ gymCode, dayIndex, dataType: 'routes', field: 'setterCount', value: setterText, x: tableCoords.setters.x, y: textY, width: tableCoords.setters.width, height: rowHeight, canvasType: type, id: day.routes[0].id });

                    currentY += rowHeight;
                    dateDrawn = true;
                }
                if (hasBoulders) {
                    const fallbackLocation = capitalizeWallNames(day.boulders.map((i: any) => i.walls.join(', ')).join(', '));
                    const locationText = getOverrideValue(dayIndex, 'boulders', 'location', fallbackLocation);

                    let climbTypeFallback = day.boulders[0].climbType;
                    if (settings.climbTypeDisplay === 'steepness') {
                        const wall = day.boulders[0].walls[0]?.toLowerCase();
                        climbTypeFallback = GYM_WALLS[gymCode]?.[wall]?.climb_type || climbTypeFallback;
                    }
                    const climbTypeText = getOverrideValue(dayIndex, 'boulders', 'climbType', climbTypeFallback);

                    const currentSetterCount = String(day.boulders.reduce((t: number, i: any) => t + i.setterCount, 0));
                    const setterText = getOverrideValue(dayIndex, 'boulders', 'setterCount', currentSetterCount);

                    if (!dateDrawn) ctx.fillText(dateStr, tableCoords.date.x, currentY);
                    ctx.fillText(truncateText(ctx, locationText, tableCoords.location.width), tableCoords.location.x, currentY);
                    ctx.fillText(climbTypeText, tableCoords.climbType.x, currentY);
                    ctx.fillText(setterText, tableCoords.setters.x, currentY);

                    regions.push({ gymCode, dayIndex, dataType: 'boulders', field: 'location', value: locationText, x: tableCoords.location.x, y: textY, width: tableCoords.location.width, height: rowHeight, canvasType: type, id: day.boulders[0].id });
                    regions.push({ gymCode, dayIndex, dataType: 'boulders', field: 'climbType', value: climbTypeText, x: tableCoords.climbType.x, y: textY, width: tableCoords.climbType.width, height: rowHeight, canvasType: type, id: day.boulders[0].id });
                    regions.push({ gymCode, dayIndex, dataType: 'boulders', field: 'setterCount', value: setterText, x: tableCoords.setters.x, y: textY, width: tableCoords.setters.width, height: rowHeight, canvasType: type, id: day.boulders[0].id });

                    currentY += rowHeight;
                }
            } else {
                const combinedType: 'routes' | 'boulders' = type === 'boulders' ? 'boulders' : 'routes';
                const fallbackLocation = itemsForDay.length > 0 ? capitalizeWallNames(itemsForDay.map(i => i.walls.join(', ')).join(', ')) : '---';
                const locationText = getOverrideValue(dayIndex, combinedType, 'location', fallbackLocation);

                let climbTypeFallback = '---';
                if (itemsForDay.length > 0) {
                    if (settings.climbTypeDisplay === 'steepness') {
                        const wall = itemsForDay[0].walls[0]?.toLowerCase();
                        climbTypeFallback = (hasRoutes && hasBoulders) ? 'Mixed' : (GYM_WALLS[gymCode]?.[wall]?.climb_type || itemsForDay[0].climbType);
                    } else {
                        if (hasRoutes && hasBoulders) climbTypeFallback = 'Both';
                        else if (hasRoutes) climbTypeFallback = 'Rope';
                        else if (hasBoulders) climbTypeFallback = 'Boulder';
                        else climbTypeFallback = itemsForDay[0].climbType;
                    }
                }
                const climbTypeText = getOverrideValue(dayIndex, combinedType, 'climbType', climbTypeFallback);

                const currentSetters = itemsForDay.length > 0 ? String(itemsForDay.reduce((t, i) => t + i.setterCount, 0)) : '0';
                const setterCountText = getOverrideValue(dayIndex, combinedType, 'setterCount', currentSetters);

                ctx.fillText(dateStr, tableCoords.date.x, currentY);
                ctx.fillText(truncateText(ctx, locationText, tableCoords.location.width), tableCoords.location.x, currentY);
                ctx.fillText(climbTypeText, tableCoords.climbType.x, currentY);
                ctx.fillText(setterCountText, tableCoords.setters.x, currentY);

                const firstItem = itemsForDay.length > 0 ? itemsForDay[0] : null;

                regions.push({ gymCode, dayIndex, dataType: combinedType, field: 'location', value: locationText, x: tableCoords.location.x, y: textY, width: tableCoords.location.width, height: rowHeight, canvasType: type, id: firstItem?.id || null });
                regions.push({ gymCode, dayIndex, dataType: combinedType, field: 'climbType', value: climbTypeText, x: tableCoords.climbType.x, y: textY, width: tableCoords.climbType.width, height: rowHeight, canvasType: type, id: firstItem?.id || null });
                regions.push({ gymCode, dayIndex, dataType: combinedType, field: 'setterCount', value: setterCountText, x: tableCoords.setters.x, y: textY, width: tableCoords.setters.width, height: rowHeight, canvasType: type, id: firstItem?.id || null });
                currentY += rowHeight;
            }
        });
    }, [schedules, gymSettings, scheduleOverrides]);

    const renderPage = useCallback(async (gymCode: string, type: string, canvas: HTMLCanvasElement, regions: ClickRegion[]) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 791;
        canvas.height = 1024;

        const gymData = schedules[gymCode];

        // Define ALL possible filenames we could try for this gym
        const possibleFilenames = [
            `${gymCode}_${type}.png`,
            `${gymCode}_routes.png`, // Mega-gym default
            `${gymCode}_boulders.png` // Boulder-only default
        ];

        // Remove duplicates and prioritize 'combined' if applicable
        if (type === 'combined') {
            possibleFilenames.unshift(`${gymCode}_routes.png`);
        }

        const tryFilenames = [...new Set(possibleFilenames)];

        return new Promise<void>((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";

            const renderFinal = (isFallback: boolean) => {
                const settings = gymSettings[gymCode] || { displayMode: 'separate' };
                const isMerged = settings.displayMode === 'merged';
                const configType = (gymCode === 'GVN' || gymCode === 'PLN' || gymCode === 'DSN' || isMerged || type === 'combined') ? 'combined' : type;

                let coords = (TEMPLATE_COORDS[gymCode] || {})[configType];
                const hasSpecificCoords = !!coords;

                if (!coords) {
                    coords = TEMPLATE_COORDS['GENERIC']['combined'];
                }

                if (isFallback) {
                    // Draw a clean white background if template fails to load
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, 791, 1024);

                    // Simple Branding for dynamic gyms
                    ctx.fillStyle = '#00205B';
                    ctx.font = '900 32px Montserrat, Arial, sans-serif';
                    ctx.textAlign = 'left';
                    ctx.fillText(gymDisplayNames[gymCode] || gymCode, 50, 80);

                    ctx.fillStyle = '#1e3a5f';
                    ctx.fillRect(40, 100, 711, 2);
                } else {
                    ctx.drawImage(img, 0, 0, 791, 1024);
                }

                ctx.font = 'bold 24px Montserrat, Arial, sans-serif';
                ctx.fillStyle = '#1e3a5f';
                ctx.textAlign = 'right';
                ctx.fillText(gymData.dateRange, coords.header.x, coords.header.y);

                ctx.textAlign = 'left';
                ctx.font = '14px Montserrat, Arial, sans-serif';
                ctx.textBaseline = 'middle';

                const tableType = configType === 'combined' ? 'combined' : type;
                renderTableData(ctx, gymData.scheduleByDay.slice(0, 7), tableType, coords.leftTable, coords.tableTop, coords.rowHeight, 0, gymCode, regions);
                renderTableData(ctx, gymData.scheduleByDay.slice(7, 14), tableType, coords.rightTable, coords.tableTop, coords.rowHeight, 7, gymCode, regions);

                resolve();
            };

            let tryIndex = 0;
            const loadNext = () => {
                if (tryIndex >= tryFilenames.length) {
                    console.error(`Failed to load any templates for ${gymCode}. Tried: ${tryFilenames.join(', ')}`);
                    renderFinal(true);
                    return;
                }

                const currentFile = tryFilenames[tryIndex];
                const fullPath = `${import.meta.env.BASE_URL}templates/${currentFile}`;

                img.onload = () => renderFinal(false);
                img.onerror = () => {
                    console.warn(`Could not find ${currentFile}, retrying...`);
                    tryIndex++;
                    loadNext();
                };
                img.src = fullPath;
            };

            loadNext();
        });
    }, [schedules, renderTableData]);

    const getActiveTypes = useCallback((gymCode: string) => {
        const gymData = schedules[gymCode];
        if (!gymData) return [];

        const gymMeta = getGymByCode(gymCode);
        const settings = gymSettings[gymCode];

        // Priority 1: User-set display mode customization
        if (settings?.displayMode === 'merged') return ['combined'];

        const hasRoutes = gymData.scheduleByDay.some(d => d.routes?.length > 0);
        const hasBoulders = gymData.scheduleByDay.some(d => d.boulders?.length > 0);

        if (settings?.displayMode === 'separate') {
            const types = [];
            if (hasRoutes) types.push('routes');
            if (hasBoulders) types.push('boulders');
            return types.length > 0 ? types : ['routes'];
        }

        // Priority 2: Dictionary default for this gym
        if (gymMeta?.displayMode === 'merged') return ['combined'];
        if (gymMeta?.isBoulderOnly) return ['boulders'];

        // Fallback: Smart detection based on data
        const types = [];
        if (hasRoutes) types.push('routes');
        if (hasBoulders) types.push('boulders');
        return types.length > 0 ? types : ['boulders'];
    }, [schedules, gymSettings]);

    useEffect(() => {
        const drawAll = async () => {
            const newRegions: ClickRegion[] = [];
            for (const gymCode of activeGyms) {
                const types = getActiveTypes(gymCode);
                const gymCanvases = canvasRefs.current[gymCode] || [];

                for (let i = 0; i < types.length; i++) {
                    if (gymCanvases[i]) {
                        await renderPage(gymCode, types[i], gymCanvases[i], newRegions);
                    }
                }
            }
            setClickRegions(newRegions);
        };
        drawAll();
    }, [activeGyms, schedules, renderPage, getActiveTypes]);

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>, gymCode: string) => {
        const canvas = e.currentTarget;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const region = clickRegions.find(r =>
            r.gymCode === gymCode &&
            x > r.x && x < r.x + r.width &&
            y > r.y && y < r.y + r.height
        );

        if (region) {
            setEditingRegion({ region, rect, canvas });
            setEditValue(region.value === '---' ? '' : region.value);
        }
    };

    const handleEditorBlur = () => {
        if (!editingRegion) return;
        const { region } = editingRegion;
        const gymData = schedules[region.gymCode];
        if (!gymData) return;

        const dateObj = new Date(gymData.startDay);
        dateObj.setDate(dateObj.getDate() + region.dayIndex);
        const dateKey = dateObj.toISOString().split('T')[0];

        setScheduleOverride({
            gymCode: region.gymCode,
            dateKey,
            dataType: region.dataType,
            field: region.field,
            value: editValue
        });

        setEditingRegion(null);
    };

    const downloadAll = useCallback(() => {
        activeGyms.forEach(gymCode => {
            const canvases = canvasRefs.current[gymCode] || [];
            canvases.forEach((canvas, i) => {
                const link = document.createElement('a');
                link.download = `${schedules[gymCode].fileDateRange}_${gymCode}_map_${i}.png`;
                link.href = canvas.toDataURL();
                link.click();
            });
        });
    }, [activeGyms, schedules]);

    useImperativeHandle(ref, () => ({
        downloadAll
    }), [downloadAll]);

    return (
        <div className="h-full bg-slate-50 relative overflow-hidden flex flex-col min-w-0">
            {/* Modal: Instructions */}
            {/* Modal: Instructions */}
            {showInstructions && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-10 relative">
                        <button onClick={() => setShowInstructions(false)} className="absolute top-6 right-6 text-slate-400 hover:text-rose-500 transition-colors">
                            <X size={24} />
                        </button>

                        <h2 className="text-3xl font-black text-[#00205B] uppercase tracking-tight mb-8">How to Use the Schedule Generator</h2>

                        <div className="space-y-6">
                            <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-xl p-6">
                                <h3 className="text-emerald-800 font-black uppercase text-sm tracking-widest mb-3">Quick Start Workflow</h3>
                                <ol className="space-y-3 text-emerald-900/70 text-sm font-medium leading-relaxed">
                                    <li><span className="text-emerald-600 font-bold mr-2">1. Upload CSV:</span> Drag & drop your Humanity CSV files into the upload area.</li>
                                    <li><span className="text-emerald-600 font-bold mr-2">2. Map Walls:</span> If new wall labels are found, a "Wall Discovery" window will pop up to help you categorize them.</li>
                                    <li><span className="text-emerald-600 font-bold mr-2">3. Customize Layout:</span> Use the "Gym Customization" tab in the Discovery window to toggle between Consolidated (merged) vs. Split styles and Climb Type vs. Steepness display.</li>
                                    <li><span className="text-emerald-600 font-bold mr-2">4. Live Editing:</span> Click any field on the generated maps to override the value manually.</li>
                                </ol>
                            </div>

                            <div className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-6">
                                <h3 className="text-amber-800 font-black uppercase text-sm tracking-widest mb-3">Saving & Local Storage</h3>
                                <ul className="space-y-3 text-amber-900/70 text-sm font-medium leading-relaxed">
                                    <li><span className="text-amber-600 font-bold mr-2">• Browser Persistent:</span> All wall mappings, gym customizations, and email settings are saved to your local browser storage.</li>
                                    <li><span className="text-amber-600 font-bold mr-2">• Export Options:</span> Download high-res PNGs or use the sidebar to print/email the schedules directly.</li>
                                </ul>
                            </div>

                            <div className="bg-purple-50 border-l-4 border-purple-500 rounded-xl p-6">
                                <h3 className="text-purple-800 font-black uppercase text-sm tracking-widest mb-3">Advanced Controls</h3>
                                <p className="text-purple-900/70 text-sm font-medium leading-relaxed">
                                    The schedule generator uses preset templates for each gym. If a template looks incorrect, ensure you've mapped your walls correctly in the <span className="text-purple-600 font-bold">Wall Discovery</span> modal.
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Email Settings */}
            {showSettings && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl p-10 relative">
                        <button onClick={() => setShowSettings(false)} className="absolute top-6 right-6 text-slate-400 hover:text-rose-500 transition-colors">
                            <X size={24} />
                        </button>

                        <h2 className="text-3xl font-black text-[#00205B] uppercase tracking-tight mb-2">Email Settings</h2>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">Configure your default email template</p>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[#00205B]/40 mb-2">Recipients (To)</label>
                                <input
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm font-bold text-[#00205B] outline-none focus:border-[#009CA6] transition-colors"
                                    value={emailSettings.to}
                                    onChange={e => setEmailSettings({ ...emailSettings, to: e.target.value })}
                                    placeholder="manager@gym.com, lead@gym.com"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[#00205B]/40 mb-2">CC Recipients</label>
                                <input
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm font-bold text-[#00205B] outline-none focus:border-[#009CA6] transition-colors"
                                    value={emailSettings.cc}
                                    onChange={e => setEmailSettings({ ...emailSettings, cc: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[#00205B]/40 mb-2">Subject Template</label>
                                <input
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm font-bold text-[#00205B] outline-none focus:border-[#009CA6] transition-colors"
                                    value={emailSettings.subject}
                                    onChange={e => setEmailSettings({ ...emailSettings, subject: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[#00205B]/40 mb-2">Body Template</label>
                                <textarea
                                    rows={12}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm font-bold text-[#00205B] outline-none focus:border-[#009CA6] transition-colors resize-y min-h-[250px]"
                                    value={emailSettings.body}
                                    onChange={e => setEmailSettings({ ...emailSettings, body: e.target.value })}
                                />
                                <div className="mt-2 flex gap-4 text-[9px] font-bold text-[#009CA6] uppercase tracking-widest">
                                    <span>[GYM_NAME]</span>
                                    <span>[DATE_RANGE]</span>
                                </div>
                            </div>

                            <button onClick={() => setShowSettings(false)} className="w-full bg-[#009CA6] text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-[#009CA6]/20 hover:scale-[1.02] transition-all">
                                Save Configuration
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="flex-1 overflow-x-auto p-12 pt-20 no-scrollbar">
                <div id="map-print-section" className="flex flex-row gap-12 items-start h-full">
                    {activeGyms.map(gymCode => (
                        <div key={gymCode} id={activeGyms.indexOf(gymCode) === 0 ? "tour-generator-card" : undefined} className="space-y-6 flex-shrink-0 w-[850px] border-r border-slate-200 last:border-r-0 pr-12">
                            <div className="flex items-center gap-4 print:hidden">
                                <span className="bg-[#00205B] text-white px-3 py-1 rounded-lg font-black text-xs uppercase tracking-widest shadow-sm">{gymCode}</span>
                                <h2 className="text-2xl font-black text-[#00205B] uppercase tracking-tight flex-1">{gymDisplayNames[gymCode] || gymCode} Map Preview</h2>
                                <button
                                    onClick={() => {
                                        if (confirm(`Clear all manual edits for ${gymDisplayNames[gymCode] || gymCode}?`)) {
                                            clearScheduleOverrides(gymCode);
                                        }
                                    }}
                                    className="text-[10px] font-black uppercase text-slate-300 hover:text-rose-500 transition-colors flex items-center gap-1"
                                >
                                    <RotateCcw size={12} />
                                    Reset Gym
                                </button>
                            </div>

                            <div className="flex flex-col gap-8">
                                {getActiveTypes(gymCode).map((type, i) => (
                                    <div key={type} className="bg-white p-4 rounded-2xl shadow-2xl shadow-slate-200 border border-slate-200 inline-block self-start overflow-hidden">
                                        <canvas
                                            ref={el => {
                                                if (!canvasRefs.current[gymCode]) canvasRefs.current[gymCode] = [];
                                                if (el) canvasRefs.current[gymCode][i] = el;
                                            }}
                                            onClick={(e) => handleCanvasClick(e, gymCode)}
                                            className="cursor-crosshair hover:opacity-95 transition-opacity"
                                            style={{ width: '791px', height: '1024px' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Inline Editor Overlay */}
            {editingRegion && (
                <div className="fixed inset-0 z-50 pointer-events-none">
                    <div
                        className="absolute bg-white shadow-2xl border-2 border-[#009CA6] rounded-lg pointer-events-auto flex flex-col overflow-hidden"
                        style={{
                            left: editingRegion.rect.left + (editingRegion.region.x * (editingRegion.rect.width / 791)),
                            top: editingRegion.rect.top + (editingRegion.region.y * (editingRegion.rect.height / 1024)),
                            width: editingRegion.region.width * (editingRegion.rect.width / 791),
                            minHeight: editingRegion.region.height * (editingRegion.rect.height / 1024)
                        }}
                    >
                        {editingRegion.region.field === 'climbType' ? (
                            <select
                                autoFocus
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={handleEditorBlur}
                                className="w-full h-full text-[12px] font-bold p-1 outline-none appearance-none bg-emerald-50 text-emerald-900"
                            >
                                {['---', 'Rope', 'Boulder', 'Slab', 'Vert', 'Overhang', 'Steep'].map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                autoFocus
                                type={editingRegion.region.field === 'setterCount' ? 'number' : 'text'}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={handleEditorBlur}
                                onKeyDown={(e) => e.key === 'Enter' && handleEditorBlur()}
                                className="w-full h-full text-[12px] font-bold p-1 outline-none bg-white text-[#00205B]"
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});

MapGenerator.displayName = 'MapGenerator';

export default MapGenerator;
