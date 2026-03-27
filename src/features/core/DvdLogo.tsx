import React, { useState, useEffect, useRef } from 'react';
import { X, Trophy } from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';

interface DvdLogoProps {
    isOpen: boolean;
    onClose: () => void;
}

const COLORS = [
    '#009CA6', // SMaC Teal
    '#00205B', // SMaC Navy
    '#F43F5E', // Rose
    '#10B981', // Emerald
    '#8B5CF6', // Violet
    '#F59E0B', // Amber
    '#3B82F6', // Blue
];

const DvdLogo: React.FC<DvdLogoProps> = ({ isOpen, onClose }) => {
    const { isDarkMode } = useDashboardStore();
    const [pos, setPos] = useState({ x: 100, y: 100 });
    const [vel, setVel] = useState({ x: 3, y: 3 });
    const [color, setColor] = useState(COLORS[0]);
    const [cornerStrikes, setCornerStrikes] = useState(0);
    const [showStrikeMsg, setShowStrikeMsg] = useState(false);
    
    const requestRef = useRef<number>();
    const logoRef = useRef<HTMLDivElement>(null);
    const posRef = useRef({ x: 100, y: 100 });
    const velRef = useRef({ x: 3, y: 3 });

    useEffect(() => {
        if (!isOpen) {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            return;
        }

        const animate = () => {
            if (!logoRef.current) return;

            const logoWidth = logoRef.current.offsetWidth;
            const logoHeight = logoRef.current.offsetHeight;
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;

            let nextX = posRef.current.x + velRef.current.x;
            let nextY = posRef.current.y + velRef.current.y;

            let hitX = false;
            let hitY = false;

            // Collision X
            if (nextX <= 0 || nextX + logoWidth >= screenWidth) {
                velRef.current.x *= -1;
                nextX = posRef.current.x + velRef.current.x;
                hitX = true;
            }

            // Collision Y
            if (nextY <= 0 || nextY + logoHeight >= screenHeight) {
                velRef.current.y *= -1;
                nextY = posRef.current.y + velRef.current.y;
                hitY = true;
            }

            if (hitX || hitY) {
                // Change color on any hit
                const nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
                setColor(nextColor);

                // Corner strike check
                if (hitX && hitY) {
                    setCornerStrikes(prev => prev + 1);
                    setShowStrikeMsg(true);
                    setTimeout(() => setShowStrikeMsg(false), 2000);
                }
            }

            posRef.current = { x: nextX, y: nextY };
            setPos({ x: nextX, y: nextY });
            
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] pointer-events-none select-none overflow-hidden bg-black/40">
            {/* UI Layer */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 pointer-events-auto shadow-2xl animate-in slide-in-from-top duration-500">
                <div className="flex items-center gap-2">
                    <Trophy size={18} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-white">
                        Corner Strikes: {cornerStrikes}
                    </span>
                </div>
                <div className="h-4 w-px bg-white/10" />
                <button 
                    onClick={onClose}
                    className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group"
                >
                    <span className="text-[10px] font-black uppercase tracking-widest">End Session</span>
                    <X size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
            </div>

            {/* Corner Strike Message */}
            {showStrikeMsg && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="bg-[#009CA6] text-white px-6 py-2 rounded-xl font-black uppercase tracking-tighter text-2xl shadow-[0_0_30px_rgba(0,156,166,0.6)]">
                         CORNER STRIKE!! 
                    </div>
                </div>
            )}

            {/* Bouncing Logo */}
            <div 
                ref={logoRef}
                style={{ 
                    transform: `translate(${pos.x}px, ${pos.y}px)`,
                    filter: `drop-shadow(0 0 15px ${color})`
                }}
                className="absolute top-0 left-0 transition-shadow duration-300"
            >
                <img 
                    src={`${import.meta.env.BASE_URL}assets/justLogo.png`}
                    className="w-24 h-24 object-contain brightness-110"
                    style={{ filter: `drop-shadow(0 0 5px ${color})` }}
                    alt="Bouncing Logo"
                    onLoad={() => {
                        // Ensure we don't start off-screen
                        const w = window.innerWidth;
                        const h = window.innerHeight;
                        posRef.current = { x: Math.random() * (w - 100), y: Math.random() * (h - 100) };
                    }}
                />
            </div>
        </div>
    );
};

export default DvdLogo;
