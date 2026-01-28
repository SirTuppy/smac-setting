import React, { useState, useEffect, useRef, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react';
import { Download, Printer, Mail, Save, RotateCcw, HelpCircle, Edit3, X } from 'lucide-react';
import { GymSchedule, ScheduleEntry, EmailSettings } from '../types';
import { GYM_WALLS, TEMPLATE_COORDS, GYM_DISPLAY_NAMES } from '../constants/mapTemplates';

export interface MapGeneratorHandle {
    downloadAll: () => void;
}

interface MapGeneratorProps {
    schedules: Record<string, GymSchedule>;
    onUpdateSchedule: (gymCode: string, updatedSchedule: GymSchedule) => void;
    onClearAll: () => void;
    showInstructions: boolean;
    onCloseInstructions: () => void;
    showSettings: boolean;
    onCloseSettings: () => void;
    emailSettings: EmailSettings;
    onUpdateEmailSettings: (settings: EmailSettings) => void;
    onEmailSchedule: () => void;
}

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

const MapGenerator = forwardRef<MapGeneratorHandle, MapGeneratorProps>(({
    schedules,
    onUpdateSchedule,
    onClearAll,
    showInstructions,
    onCloseInstructions,
    showSettings,
    onCloseSettings,
    emailSettings,
    onUpdateEmailSettings,
    onEmailSchedule
}, ref) => {
    const [clickRegions, setClickRegions] = useState<ClickRegion[]>([]);
    const [editingRegion, setEditingRegion] = useState<{ region: ClickRegion, rect: DOMRect, canvas: HTMLCanvasElement } | null>(null);
    const [editValue, setEditValue] = useState('');
    const canvasRefs = useRef<Record<string, HTMLCanvasElement[]>>({});

    const activeGyms = useMemo(() => Object.keys(schedules), [schedules]);

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
        const gymConfig = TEMPLATE_COORDS[gymCode];
        let currentY = tableTop;

        weekData.forEach((day, rowIndex) => {
            const dayIndex = weekOffset + rowIndex;
            const currentDate = new Date(startDay);
            currentDate.setDate(currentDate.getDate() + dayIndex);
            const dateStr = `${currentDate.getMonth() + 1}/${currentDate.getDate()}`;
            const dayOfWeek = currentDate.getDay();

            if (gymConfig.displayMode === 'separate' && (dayOfWeek === 0 || dayOfWeek === 6)) return;

            const hasRoutes = day.routes && day.routes.length > 0;
            const hasBoulders = day.boulders && day.boulders.length > 0;

            let itemsForDay: ScheduleEntry[] = [];
            if (gymConfig.combined) {
                itemsForDay = [...day.routes, ...day.boulders];
            } else {
                if (type === 'routes') itemsForDay = day.routes;
                else if (type === 'boulders') itemsForDay = day.boulders;
                else itemsForDay = [...day.routes, ...day.boulders];
            }

            const textY = currentY - (rowHeight / 2);

            if (gymConfig.displayMode === 'separate') {
                if (!hasRoutes && !hasBoulders) {
                    ctx.fillText(dateStr, tableCoords.date.x, currentY);
                    ctx.fillText('---', tableCoords.location.x, currentY);
                    ctx.fillText('---', tableCoords.climbType.x, currentY);
                    ctx.fillText('---', tableCoords.setters.x, currentY);

                    regions.push({ gymCode, dayIndex, dataType: 'routes', field: 'location', value: '---', x: tableCoords.location.x, y: textY, width: tableCoords.location.width, height: rowHeight, canvasType: 'combined', id: null });
                    currentY += rowHeight;
                    return;
                }

                let dateDrawn = false;
                if (hasRoutes) {
                    const locationText = capitalizeWallNames(day.routes.map((i: any) => i.walls.join(', ')).join(', '));
                    ctx.fillText(dateStr, tableCoords.date.x, currentY);
                    ctx.fillText(truncateText(ctx, locationText, tableCoords.location.width), tableCoords.location.x, currentY);
                    ctx.fillText(day.routes[0].climbType, tableCoords.climbType.x, currentY);
                    ctx.fillText(String(day.routes.reduce((t: number, i: any) => t + i.setterCount, 0)), tableCoords.setters.x, currentY);

                    regions.push({ gymCode, dayIndex, dataType: 'routes', field: 'location', value: locationText, x: tableCoords.location.x, y: textY, width: tableCoords.location.width, height: rowHeight, canvasType: 'combined', id: day.routes[0].id });
                    currentY += rowHeight;
                    dateDrawn = true;
                }
                if (hasBoulders) {
                    const locationText = capitalizeWallNames(day.boulders.map((i: any) => i.walls.join(', ')).join(', '));
                    if (!dateDrawn) ctx.fillText(dateStr, tableCoords.date.x, currentY);
                    ctx.fillText(truncateText(ctx, locationText, tableCoords.location.width), tableCoords.location.x, currentY);
                    ctx.fillText(day.boulders[0].climbType, tableCoords.climbType.x, currentY);
                    ctx.fillText(String(day.boulders.reduce((t: number, i: any) => t + i.setterCount, 0)), tableCoords.setters.x, currentY);
                    regions.push({ gymCode, dayIndex, dataType: 'boulders', field: 'location', value: locationText, x: tableCoords.location.x, y: textY, width: tableCoords.location.width, height: rowHeight, canvasType: 'combined', id: day.boulders[0].id });
                    currentY += rowHeight;
                }
            } else {
                let climbTypeText = '---';
                if (itemsForDay.length > 0) {
                    climbTypeText = (hasRoutes && hasBoulders) ? 'Both' : itemsForDay[0].climbType;
                }
                const locationText = itemsForDay.length > 0 ? capitalizeWallNames(itemsForDay.map(i => i.walls.join(', ')).join(', ')) : '---';
                const setterCountText = itemsForDay.length > 0 ? String(itemsForDay.reduce((t, i) => t + i.setterCount, 0)) : '0';

                ctx.fillText(dateStr, tableCoords.date.x, currentY);
                ctx.fillText(truncateText(ctx, locationText, tableCoords.location.width), tableCoords.location.x, currentY);
                ctx.fillText(climbTypeText, tableCoords.climbType.x, currentY);
                ctx.fillText(setterCountText, tableCoords.setters.x, currentY);

                const firstItem = itemsForDay.length > 0 ? itemsForDay[0] : null;
                const dataType: 'routes' | 'boulders' = type === 'boulders' ? 'boulders' : 'routes';

                regions.push({ gymCode, dayIndex, dataType, field: 'location', value: locationText, x: tableCoords.location.x, y: textY, width: tableCoords.location.width, height: rowHeight, canvasType: type, id: firstItem?.id || null });
                regions.push({ gymCode, dayIndex, dataType, field: 'climbType', value: climbTypeText, x: tableCoords.climbType.x, y: textY, width: tableCoords.climbType.width, height: rowHeight, canvasType: type, id: firstItem?.id || null });
                regions.push({ gymCode, dayIndex, dataType, field: 'setterCount', value: setterCountText, x: tableCoords.setters.x, y: textY, width: tableCoords.setters.width, height: rowHeight, canvasType: type, id: firstItem?.id || null });
                currentY += rowHeight;
            }
        });
    }, [schedules]);

    const renderPage = useCallback(async (gymCode: string, type: string, canvas: HTMLCanvasElement, regions: ClickRegion[]) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 791;
        canvas.height = 1024;

        const gymData = schedules[gymCode];
        // --- PORT LOGIC: Map pathing to actual files in /public/templates ---
        let filename = `${gymCode}_${type}.png`;

        // For combined gyms, the PNG template is named '_routes.png' but it houses both
        if (type === 'combined') {
            filename = `${gymCode}_routes.png`;
        } else if (['HIL', 'DTN', 'FTW'].includes(gymCode)) {
            // These are boulder-only and the template is named '_boulders.png'
            filename = `${gymCode}_boulders.png`;
        }

        const templateFile = `/templates/${filename}`;

        return new Promise<void>((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                ctx.drawImage(img, 0, 0, 791, 1024);

                const configType = (gymCode === 'GVN' || gymCode === 'PLN' || gymCode === 'DSN') ? 'combined' : type;
                const coords = TEMPLATE_COORDS[gymCode][configType];

                if (!coords) {
                    console.error(`No coordinates found for ${gymCode} ${configType}`);
                    resolve();
                    return;
                }

                ctx.font = 'bold 24px Montserrat, Arial, sans-serif';
                ctx.fillStyle = '#1e3a5f';
                ctx.textAlign = 'right';
                ctx.fillText(gymData.dateRange, coords.header.x, coords.header.y);

                ctx.textAlign = 'left';
                ctx.font = '14px Montserrat, Arial, sans-serif';
                ctx.textBaseline = 'middle';

                renderTableData(ctx, gymData.scheduleByDay.slice(0, 7), type, coords.leftTable, coords.tableTop, coords.rowHeight, 0, gymCode, regions);
                renderTableData(ctx, gymData.scheduleByDay.slice(7, 14), type, coords.rightTable, coords.tableTop, coords.rowHeight, 7, gymCode, regions);
                resolve();
            };
            img.onerror = () => {
                console.error(`Failed to load template: ${templateFile}`);
                resolve(); // Don't block the loop
            };
            img.src = templateFile;
        });
    }, [schedules, renderTableData]);

    const getActiveTypes = useCallback((gymCode: string) => {
        const gymData = schedules[gymCode];
        if (!gymData) return [];
        if (gymCode === 'GVN' || gymCode === 'PLN' || gymCode === 'DSN') return ['combined'];
        if (['HIL', 'DTN', 'FTW'].includes(gymCode)) return ['boulders'];

        const types = [];
        const hasRoutes = gymData.scheduleByDay.some(d => d.routes?.length > 0);
        const hasBoulders = gymData.scheduleByDay.some(d => d.boulders?.length > 0);
        if (hasRoutes) types.push('routes');
        if (hasBoulders) types.push('boulders');
        return types.length > 0 ? types : ['boulders']; // Fallback
    }, [schedules]);

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
        const gymData = { ...schedules[region.gymCode] };
        const day = gymData.scheduleByDay[region.dayIndex];

        if (!day[region.dataType]) day[region.dataType] = [];
        let item = day[region.dataType].find(i => i.id === region.id);

        if (!item && editValue.trim() !== '') {
            item = {
                id: Math.random().toString(36).substr(2, 9),
                walls: [],
                setterCount: 0,
                climbType: region.dataType === 'routes' ? 'Rope' : 'Boulder'
            };
            day[region.dataType].push(item);
        }

        if (item) {
            if (region.field === 'location') {
                item.walls = editValue.split(/[,/]+/).map(s => s.trim()).filter(s => s);
            } else if (region.field === 'setterCount') {
                item.setterCount = parseInt(editValue) || 0;
            } else if (region.field === 'climbType') {
                item.climbType = editValue;
            }
        }

        onUpdateSchedule(region.gymCode, gymData);
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
        <div className="flex flex-row h-full bg-slate-50 relative">
            {/* Modal: Instructions */}
            {showInstructions && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-10 relative">
                        <button onClick={onCloseInstructions} className="absolute top-6 right-6 text-slate-400 hover:text-rose-500 transition-colors">
                            <X size={24} />
                        </button>

                        <h2 className="text-3xl font-black text-[#00205B] uppercase tracking-tight mb-8">How to Use the Schedule Generator</h2>

                        <div className="space-y-6">
                            <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-xl p-6">
                                <h3 className="text-emerald-800 font-black uppercase text-sm tracking-widest mb-3">Quick Start Workflow</h3>
                                <ol className="space-y-3 text-emerald-900/70 text-sm font-medium leading-relaxed">
                                    <li><span className="text-emerald-600 font-bold mr-2">1. Upload CSV(s):</span> Drag & drop one or more Humanity CSV files into the upload area.</li>
                                    <li><span className="text-emerald-600 font-bold mr-2">2. Auto-Generation:</span> Schedules for all detected gyms are generated instantly.</li>
                                    <li><span className="text-emerald-600 font-bold mr-2">3. Interactive Editing:</span> Click any field (location, climb type, setter count) to edit in-place.</li>
                                    <li><span className="text-emerald-600 font-bold mr-2">4. Export:</span> Download images, print to PDF, or email schedules using the sidebar.</li>
                                </ol>
                            </div>

                            <div className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-6">
                                <h3 className="text-amber-800 font-black uppercase text-sm tracking-widest mb-3">Saving & Loading Schedules</h3>
                                <ul className="space-y-3 text-amber-900/70 text-sm font-medium leading-relaxed">
                                    <li><span className="text-amber-600 font-bold mr-2">• Save Latest:</span> Stores current schedules to your browser's local storage.</li>
                                    <li><span className="text-amber-600 font-bold mr-2">• Load Latest:</span> Restore previously saved schedules instantly.</li>
                                    <li><span className="text-amber-600 font-bold mr-2">• Clear All:</span> Remove all schedules from view and start fresh.</li>
                                </ul>
                            </div>

                            <div className="bg-purple-50 border-l-4 border-purple-500 rounded-xl p-6">
                                <h3 className="text-purple-800 font-black uppercase text-sm tracking-widest mb-3">Email Integration</h3>
                                <p className="text-purple-900/70 text-sm font-medium leading-relaxed">
                                    Configure your email template in <span className="text-purple-600 font-bold">Settings</span>, then click <span className="text-purple-600 font-bold">Email Schedule</span> to auto-populate a draft email.
                                </p>
                                <p className="mt-2 text-[10px] text-purple-400 uppercase font-black tracking-widest">* Attachment must be added manually after download.</p>
                            </div>

                            <div className="bg-slate-100 rounded-xl p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                                Note: Saved schedules are stored locally in your browser, not in the cloud. They're only accessible on this device and browser.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Email Settings */}
            {showSettings && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl p-10 relative">
                        <button onClick={onCloseSettings} className="absolute top-6 right-6 text-slate-400 hover:text-rose-500 transition-colors">
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
                                    onChange={e => onUpdateEmailSettings({ ...emailSettings, to: e.target.value })}
                                    placeholder="manager@gym.com, lead@gym.com"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[#00205B]/40 mb-2">CC Recipients</label>
                                <input
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm font-bold text-[#00205B] outline-none focus:border-[#009CA6] transition-colors"
                                    value={emailSettings.cc}
                                    onChange={e => onUpdateEmailSettings({ ...emailSettings, cc: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[#00205B]/40 mb-2">Subject Template</label>
                                <input
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm font-bold text-[#00205B] outline-none focus:border-[#009CA6] transition-colors"
                                    value={emailSettings.subject}
                                    onChange={e => onUpdateEmailSettings({ ...emailSettings, subject: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[#00205B]/40 mb-2">Body Template</label>
                                <textarea
                                    rows={12}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm font-bold text-[#00205B] outline-none focus:border-[#009CA6] transition-colors resize-y min-h-[250px]"
                                    value={emailSettings.body}
                                    onChange={e => onUpdateEmailSettings({ ...emailSettings, body: e.target.value })}
                                />
                                <div className="mt-2 flex gap-4 text-[9px] font-bold text-[#009CA6] uppercase tracking-widest">
                                    <span>[GYM_NAME]</span>
                                    <span>[DATE_RANGE]</span>
                                </div>
                            </div>

                            <button onClick={onCloseSettings} className="w-full bg-[#009CA6] text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-[#009CA6]/20 hover:scale-[1.02] transition-all">
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
                                <h2 className="text-2xl font-black text-[#00205B] uppercase tracking-tight">{GYM_DISPLAY_NAMES[gymCode]} Regional Map</h2>
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
                                {['Rope', 'Boulder', 'Slab', 'Vert', 'Overhang', 'Steep'].map(opt => (
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
