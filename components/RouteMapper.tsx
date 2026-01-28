import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Trash2, Download, Scissors, Plus, Minus, Type, Circle, MousePointer2 } from 'lucide-react';
import { MapperPoint, MapperStyle } from '../types';

const DEFAULT_STYLE: MapperStyle = {
    dotColor: '#ff0000',
    lineColor: '#ffffff',
    textColor: '#ffffff',
    circleColor: '#000000',
    circleSize: 20,
    dotSize: 5,
    lineWidth: 2,
    showCircle: true
};

const RouteMapper: React.FC = () => {
    const [img, setImg] = useState<HTMLImageElement | null>(null);
    const [points, setPoints] = useState<MapperPoint[]>([]);
    const [style, setStyle] = useState<MapperStyle>(DEFAULT_STYLE);
    const [insertMode, setInsertMode] = useState<number | null>(null);
    const [draggedPoint, setDraggedPoint] = useState<{ index: number, type: 'hold' | 'label' } | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [hoveredPoint, setHoveredPoint] = useState<{ index: number, type: 'hold' | 'label' } | null>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Load Image
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const newImg = new Image();
            newImg.onload = () => {
                const MAX_DIMENSION = 2000;
                let width = newImg.width;
                let height = newImg.height;

                if (width > height) {
                    if (width > MAX_DIMENSION) {
                        height *= MAX_DIMENSION / width;
                        width = MAX_DIMENSION;
                    }
                } else {
                    if (height > MAX_DIMENSION) {
                        width *= MAX_DIMENSION / height;
                        height = MAX_DIMENSION;
                    }
                }

                if (canvasRef.current) {
                    canvasRef.current.width = width;
                    canvasRef.current.height = height;
                }
                setImg(newImg);
                setPoints([]);
            };
            newImg.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !img) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        points.forEach((p, index) => {
            const number = index + 1;
            const isHovered = hoveredPoint?.index === index;

            // Draw Line
            ctx.beginPath();
            ctx.moveTo(p.holdX, p.holdY);
            ctx.lineTo(p.labelX, p.labelY);
            ctx.strokeStyle = style.lineColor;
            ctx.lineWidth = style.lineWidth;
            ctx.stroke();

            // Draw Hold Marker (Dot)
            ctx.beginPath();
            ctx.arc(p.holdX, p.holdY, style.dotSize, 0, Math.PI * 2);
            ctx.fillStyle = style.dotColor;
            ctx.fill();

            // Highlight Hold
            if (isHovered && hoveredPoint?.type === 'hold') {
                ctx.strokeStyle = '#deff4aff';
                ctx.lineWidth = style.lineWidth + 2;
                ctx.shadowColor = 'white';
                ctx.shadowBlur = 10;
            } else {
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 1;
                ctx.shadowBlur = 0;
            }
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Draw Label Circle
            if (style.showCircle) {
                ctx.beginPath();
                ctx.arc(p.labelX, p.labelY, style.circleSize, 0, Math.PI * 2);
                ctx.fillStyle = style.circleColor + 'B3'; // 70% opacity
                ctx.fill();

                if (isHovered && hoveredPoint?.type === 'label') {
                    ctx.strokeStyle = '#deff4aff';
                    ctx.lineWidth = style.lineWidth + 2;
                    ctx.shadowColor = 'white';
                    ctx.shadowBlur = 10;
                } else {
                    ctx.strokeStyle = style.lineColor;
                    ctx.lineWidth = style.lineWidth;
                    ctx.shadowBlur = 0;
                }
                ctx.stroke();
                ctx.shadowBlur = 0;
            }

            // Draw Number
            ctx.fillStyle = style.textColor;
            ctx.font = `bold ${Math.max(12, style.circleSize)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(number.toString(), p.labelX, p.labelY);
        });
    }, [img, points, style, hoveredPoint]);

    useEffect(() => {
        draw();
    }, [draw]);

    const addPoint = (x: number, y: number, index: number = -1) => {
        const newPoint: MapperPoint = {
            id: Date.now(),
            holdX: x,
            holdY: y,
            labelX: x + 60,
            labelY: y - 60
        };

        setPoints(prev => {
            const next = [...prev];
            if (index !== -1) {
                next.splice(index, 0, newPoint);
            } else {
                next.push(newPoint);
            }
            return next;
        });
    };

    const handleStart = (clientX: number, clientY: number) => {
        const canvas = canvasRef.current;
        if (!canvas || !img) return;

        const rect = canvas.getBoundingClientRect();
        const x = (clientX - rect.left) * (canvas.width / rect.width);
        const y = (clientY - rect.top) * (canvas.height / rect.height);

        if (insertMode !== null) {
            addPoint(x, y, insertMode - 1);
            setInsertMode(null);
            return;
        }

        const currentDotSize = style.dotSize + 10;
        const currentCircleSize = style.circleSize + 5;

        for (let i = points.length - 1; i >= 0; i--) {
            const p = points[i];
            const distHold = Math.sqrt((x - p.holdX) ** 2 + (y - p.holdY) ** 2);
            if (distHold < currentDotSize) {
                setDraggedPoint({ index: i, type: 'hold' });
                setDragOffset({ x: x - p.holdX, y: y - p.holdY });
                return;
            }

            const distLabel = Math.sqrt((x - p.labelX) ** 2 + (y - p.labelY) ** 2);
            if (distLabel < currentCircleSize) {
                setDraggedPoint({ index: i, type: 'label' });
                setDragOffset({ x: x - p.labelX, y: y - p.labelY });
                return;
            }
        }

        addPoint(x, y);
    };

    const handleMove = (clientX: number, clientY: number) => {
        const canvas = canvasRef.current;
        if (!canvas || !img) return;

        const rect = canvas.getBoundingClientRect();
        const x = (clientX - rect.left) * (canvas.width / rect.width);
        const y = (clientY - rect.top) * (canvas.height / rect.height);

        if (draggedPoint) {
            setPoints(prev => {
                const next = [...prev];
                const p = next[draggedPoint.index];
                if (draggedPoint.type === 'label') {
                    p.labelX = x - dragOffset.x;
                    p.labelY = y - dragOffset.y;
                } else {
                    p.holdX = x - dragOffset.x;
                    p.holdY = y - dragOffset.y;
                }
                return next;
            });
        } else {
            let newHovered: { index: number, type: 'hold' | 'label' } | null = null;
            const currentDotSize = style.dotSize + 5;
            const currentCircleSize = style.circleSize + 5;

            for (let i = points.length - 1; i >= 0; i--) {
                const p = points[i];
                const distLabel = Math.sqrt((x - p.labelX) ** 2 + (y - p.labelY) ** 2);
                const distHold = Math.sqrt((x - p.holdX) ** 2 + (y - p.holdY) ** 2);

                if (distLabel < currentCircleSize) {
                    newHovered = { index: i, type: 'label' };
                    break;
                } else if (distHold < currentDotSize) {
                    newHovered = { index: i, type: 'hold' };
                    break;
                }
            }
            setHoveredPoint(newHovered);
        }
    };

    const handleDelete = (index: number) => {
        setPoints(prev => prev.filter((_, i) => i !== index));
        setHoveredPoint(null);
    };

    const exportImage = (cropped: boolean) => {
        const canvas = canvasRef.current;
        if (!canvas || !img) return;

        let exportCanvas = canvas;
        let fileName = 'route_map.png';

        if (cropped && points.length > 0) {
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            points.forEach(p => {
                minX = Math.min(minX, p.holdX, p.labelX);
                minY = Math.min(minY, p.holdY, p.labelY);
                maxX = Math.max(maxX, p.holdX, p.labelX);
                maxY = Math.max(maxY, p.holdY, p.labelY);
            });

            const padding = style.circleSize + 20;
            minX = Math.max(0, minX - padding);
            minY = Math.max(0, minY - padding);
            maxX = Math.min(canvas.width, maxX + padding);
            maxY = Math.min(canvas.height, maxY + padding);

            const cropWidth = maxX - minX;
            const cropHeight = maxY - minY;

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = cropWidth;
            tempCanvas.height = cropHeight;
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
                tempCtx.drawImage(canvas, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
                exportCanvas = tempCanvas;
                fileName = 'route_map_cropped.png';
            }
        }

        const link = document.createElement('a');
        link.download = fileName;
        link.href = exportCanvas.toDataURL();
        link.click();
    };

    return (
        <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
            {/* Premium Toolbar */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-20">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <input
                            type="file"
                            id="mapper-upload"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                        />
                        <label
                            htmlFor="mapper-upload"
                            className="flex items-center gap-2 px-4 py-2 bg-[#00205B] text-white rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-[#003087] transition-all shadow-md active:scale-95"
                        >
                            <Upload size={16} />
                            Load Image
                        </label>
                    </div>

                    <div className="h-8 w-px bg-slate-200"></div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                const val = prompt(`Enter number (1-${points.length + 1}):`);
                                if (val) setInsertMode(parseInt(val));
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${insertMode
                                ? 'bg-amber-100 text-amber-700 border border-amber-200 animate-pulse'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-[#009CA6] hover:text-[#009CA6]'
                                }`}
                        >
                            <Plus size={16} />
                            {insertMode ? `Click to place #${insertMode}` : 'Insert Point'}
                        </button>
                        <button
                            onClick={() => confirm('Clear all points?') && setPoints([])}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-rose-500 border border-rose-100 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rose-50 transition-all active:scale-95"
                        >
                            <Trash2 size={16} />
                            Clear
                        </button>
                    </div>

                    <div className="h-8 w-px bg-slate-200"></div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => exportImage(false)}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-[#009CA6] border border-[#009CA6]/20 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#009CA6]/5 transition-all active:scale-95"
                        >
                            <Download size={16} />
                            Save Full
                        </button>
                        <button
                            onClick={() => exportImage(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-500 border border-indigo-100 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-sm"
                        >
                            <Scissors size={16} />
                            Save Cropped
                        </button>
                    </div>
                </div>

                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                    {points.length} Points Marked
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Style Panel */}
                <div className="w-80 bg-white border-r border-slate-200 overflow-y-auto p-6 space-y-8 no-scrollbar shadow-inner">
                    <section>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Color Palette</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Dot</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={style.dotColor}
                                        onChange={(e) => setStyle(s => ({ ...s, dotColor: e.target.value }))}
                                        className="w-10 h-10 rounded-lg cursor-pointer border-none p-0 overflow-hidden"
                                    />
                                    <span className="text-[10px] font-mono text-slate-400">{style.dotColor}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Line</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={style.lineColor}
                                        onChange={(e) => setStyle(s => ({ ...s, lineColor: e.target.value }))}
                                        className="w-10 h-10 rounded-lg cursor-pointer border-none p-0 overflow-hidden"
                                    />
                                    <span className="text-[10px] font-mono text-slate-400">{style.lineColor}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Text</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={style.textColor}
                                        onChange={(e) => setStyle(s => ({ ...s, textColor: e.target.value }))}
                                        className="w-10 h-10 rounded-lg cursor-pointer border-none p-0 overflow-hidden"
                                    />
                                    <span className="text-[10px] font-mono text-slate-400">{style.textColor}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Circle</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={style.circleColor}
                                        onChange={(e) => setStyle(s => ({ ...s, circleColor: e.target.value }))}
                                        className="w-10 h-10 rounded-lg cursor-pointer border-none p-0 overflow-hidden"
                                    />
                                    <span className="text-[10px] font-mono text-slate-400">{style.circleColor}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Geometry</p>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dot Size</label>
                                <span className="text-[10px] font-mono font-bold text-[#009CA6] bg-[#009CA6]/10 px-2 py-0.5 rounded">{style.dotSize}px</span>
                            </div>
                            <input
                                type="range" min="3" max="25" value={style.dotSize}
                                onChange={(e) => setStyle(s => ({ ...s, dotSize: parseInt(e.target.value) }))}
                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#009CA6]"
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Line Width</label>
                                <span className="text-[10px] font-mono font-bold text-[#009CA6] bg-[#009CA6]/10 px-2 py-0.5 rounded">{style.lineWidth}px</span>
                            </div>
                            <input
                                type="range" min="1" max="10" value={style.lineWidth}
                                onChange={(e) => setStyle(s => ({ ...s, lineWidth: parseInt(e.target.value) }))}
                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#009CA6]"
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Circle Radius</label>
                                <span className="text-[10px] font-mono font-bold text-[#009CA6] bg-[#009CA6]/10 px-2 py-0.5 rounded">{style.circleSize}px</span>
                            </div>
                            <input
                                type="range" min="10" max="80" value={style.circleSize}
                                onChange={(e) => setStyle(s => ({ ...s, circleSize: parseInt(e.target.value) }))}
                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#009CA6]"
                            />
                        </div>

                        <label className="flex items-center justify-between cursor-pointer group pt-4">
                            <div className="flex items-center gap-3">
                                <Circle size={16} className={style.showCircle ? "text-[#009CA6]" : "text-slate-300"} />
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Show Circles</span>
                            </div>
                            <div className={`w-9 h-5 rounded-full relative transition-colors ${style.showCircle ? 'bg-[#009CA6]' : 'bg-slate-200'}`}>
                                <input
                                    type="checkbox" className="hidden"
                                    checked={style.showCircle}
                                    onChange={(e) => setStyle(s => ({ ...s, showCircle: e.target.checked }))}
                                />
                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${style.showCircle ? 'left-5' : 'left-1'}`}></div>
                            </div>
                        </label>
                    </section>

                    <section className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Controls</p>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <MousePointer2 size={12} className="text-[#009CA6]" />
                                Tap to add new point
                            </li>
                            <li className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <Scissors size={12} className="text-[#009CA6]" />
                                Drag items to move
                            </li>
                            <li className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <Trash2 size={12} className="text-[#009CA6]" />
                                Right-Click to delete
                            </li>
                        </ul>
                    </section>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 relative overflow-auto bg-slate-200 flex items-center justify-center p-12 custom-scrollbar">
                    {!img ? (
                        <label id="tour-mapper-upload" className="w-full max-w-2xl aspect-video border-4 border-dashed border-slate-300 rounded-[40px] flex flex-col items-center justify-center cursor-pointer hover:border-[#009CA6]/40 hover:bg-white/40 transition-all group">
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            <div className="bg-white p-6 rounded-3xl shadow-xl mb-6 group-hover:scale-110 transition-transform">
                                <Upload size={48} className="text-[#00205B]" />
                            </div>
                            <h4 className="text-xl font-black text-[#00205B] uppercase tracking-tight">Drop photo to start mapping</h4>
                            <p className="text-slate-500 font-medium mt-2">Supports JPG, PNG, and HEIC up to 20MB</p>
                        </label>
                    ) : (
                        <div
                            className="relative shadow-2xl rounded-sm overflow-hidden bg-white"
                            onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
                            onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
                            onMouseUp={() => { setDraggedPoint(null); }}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                if (hoveredPoint) handleDelete(hoveredPoint.index);
                            }}
                        >
                            <canvas ref={canvasRef} className="cursor-crosshair block" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RouteMapper;
