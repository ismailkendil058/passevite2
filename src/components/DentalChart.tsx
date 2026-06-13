import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type ToothType = 'central-incisor' | 'lateral-incisor' | 'canine' | 'premolar' | 'molar' | 'wisdom';

const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_LEFT = [48, 47, 46, 45, 44, 43, 42, 41];
const LOWER_RIGHT = [31, 32, 33, 34, 35, 36, 37, 38];

function getToothType(fdi: number): ToothType {
    const unit = fdi % 10;
    if (unit === 8) return 'wisdom';
    if (unit === 7 || unit === 6) return 'molar';
    if (unit === 5 || unit === 4) return 'premolar';
    if (unit === 3) return 'canine';
    if (unit === 2) return 'lateral-incisor';
    return 'central-incisor';
}

/** Rotation in degrees to follow natural arch curvature */
function getArchRotation(fdi: number): number {
    const quadrant = Math.floor(fdi / 10);
    const unit = fdi % 10;
    const pos = unit - 1;

    if (quadrant === 1) return 14 - pos * 3.5;
    if (quadrant === 2) return -14 + pos * 3.5;
    if (quadrant === 3) return -14 + pos * 3.5;
    return 14 - pos * 3.5;
}

function getToothWidth(type: ToothType): number {
    switch (type) {
        case 'wisdom': return 30;
        case 'molar': return 36;
        case 'premolar': return 28;
        case 'canine': return 24;
        case 'lateral-incisor': return 22;
        default: return 26;
    }
}

interface ToothSvgProps {
    type: ToothType;
    selected: boolean;
    upper: boolean;
    mirrored?: boolean;
}

function ToothSvg({ type, selected, upper, mirrored }: ToothSvgProps) {
    const fill = selected ? 'currentColor' : '#f8fafc';
    const fillOpacity = selected ? 0.25 : 1;
    const stroke = 'currentColor';
    const gumY = 24;

    const crown = (() => {
        switch (type) {
            case 'central-incisor':
                return (
                    <>
                        <path
                            d="M13 3 L27 3 C29 3 30 5 29 7 L28 18 C27.5 21 25 22 20 22 C15 22 12.5 21 12 18 L11 7 C10 5 11 3 13 3 Z"
                            fill={fill} fillOpacity={fillOpacity} stroke={stroke} strokeWidth="1.2"
                        />
                        <path d="M13 3 L20 6 L27 3" fill="none" stroke={stroke} strokeWidth="0.8" opacity="0.5" />
                        <path d="M20 7 L20 17" fill="none" stroke={stroke} strokeWidth="0.6" opacity="0.35" />
                    </>
                );
            case 'lateral-incisor':
                return (
                    <>
                        <path
                            d="M14 4 L26 4 C28 4 29 6 28 8 L27 17 C26.5 20 24 21 20 21 C16 21 13.5 20 13 17 L12 8 C11 6 12 4 14 4 Z"
                            fill={fill} fillOpacity={fillOpacity} stroke={stroke} strokeWidth="1.2"
                        />
                        <path d="M14 4 L20 6.5 L26 4" fill="none" stroke={stroke} strokeWidth="0.8" opacity="0.5" />
                    </>
                );
            case 'canine':
                return (
                    <>
                        <path
                            d="M16 2 L24 2 C26 2 27 4 26 7 L24 20 C23 22 21.5 23 20 23 C18.5 23 17 22 16 20 L14 7 C13 4 14 2 16 2 Z"
                            fill={fill} fillOpacity={fillOpacity} stroke={stroke} strokeWidth="1.2"
                        />
                        <path d="M20 2 L20 8" fill="none" stroke={stroke} strokeWidth="0.8" opacity="0.45" />
                        <path d="M16 2 L20 5 L24 2" fill="none" stroke={stroke} strokeWidth="0.7" opacity="0.4" />
                    </>
                );
            case 'premolar':
                return (
                    <>
                        <path
                            d="M10 6 C10 3 13 2 16 2 L24 2 C27 2 30 3 30 6 L31 19 C31.5 22 28 24 24 24 L16 24 C12 24 8.5 22 9 19 Z"
                            fill={fill} fillOpacity={fillOpacity} stroke={stroke} strokeWidth="1.2"
                        />
                        <path d="M10 6 L16 10 L20 6 L24 10 L30 6" fill="none" stroke={stroke} strokeWidth="0.8" opacity="0.45" />
                        <path d="M14 10 L14 18 M26 10 L26 18" fill="none" stroke={stroke} strokeWidth="0.5" opacity="0.3" />
                    </>
                );
            case 'wisdom':
                return (
                    <>
                        <path
                            d="M8 8 C8 5 11 3 15 3 L25 3 C29 3 32 5 32 8 L33 18 C33.5 21 30 23 26 23 L14 23 C10 23 7.5 21 8 18 Z"
                            fill={fill} fillOpacity={fillOpacity} stroke={stroke} strokeWidth="1.2"
                        />
                        <path d="M8 8 L14 11 L20 8 L26 11 L32 8" fill="none" stroke={stroke} strokeWidth="0.7" opacity="0.4" />
                    </>
                );
            default:
                return (
                    <>
                        <path
                            d="M6 6 C6 3 10 1 14 1 L26 1 C30 1 34 3 34 6 L35 18 C35.5 22 31 25 26 25 L14 25 C9 25 4.5 22 5 18 Z"
                            fill={fill} fillOpacity={fillOpacity} stroke={stroke} strokeWidth="1.2"
                        />
                        <path d="M6 6 L12 10 L18 6 L22 10 L28 6 L34 6" fill="none" stroke={stroke} strokeWidth="0.8" opacity="0.45" />
                        <path d="M14 8 L14 16 M26 8 L26 16" fill="none" stroke={stroke} strokeWidth="0.5" opacity="0.3" />
                    </>
                );
        }
    })();

    const roots = (() => {
        switch (type) {
            case 'central-incisor':
            case 'lateral-incisor':
                return (
                    <path
                        d="M17 22 C16 30 15.5 46 17 50 C18.5 53 21.5 53 23 50 C24.5 46 24 30 23 22"
                        fill="none" stroke={stroke} strokeWidth="1.2" strokeLinecap="round"
                    />
                );
            case 'canine':
                return (
                    <path
                        d="M17 23 C16 32 15 48 18 52 C20 54 20 54 22 52 C25 48 24 32 23 23"
                        fill="none" stroke={stroke} strokeWidth="1.3" strokeLinecap="round"
                    />
                );
            case 'premolar':
                return (
                    <>
                        <path d="M14 24 C13 34 12 48 15 51 C17 53 19 52 19 48 L20 24" fill="none" stroke={stroke} strokeWidth="1.1" strokeLinecap="round" />
                        <path d="M26 24 C27 34 28 48 25 51 C23 53 21 52 21 48 L20 24" fill="none" stroke={stroke} strokeWidth="1.1" strokeLinecap="round" />
                    </>
                );
            case 'wisdom':
                return (
                    <>
                        <path d="M13 23 C12 34 11 46 14 49 C16 51 18 50 18 46 L19 23" fill="none" stroke={stroke} strokeWidth="1" strokeLinecap="round" />
                        <path d="M27 23 C28 34 29 46 26 49 C24 51 22 50 22 46 L21 23" fill="none" stroke={stroke} strokeWidth="1" strokeLinecap="round" />
                    </>
                );
            default:
                return (
                    <>
                        <path d="M12 25 C10 36 9 48 12 51 C14 53 16 52 16 48 L17 25" fill="none" stroke={stroke} strokeWidth="1.1" strokeLinecap="round" />
                        <path d="M20 25 L20 52" fill="none" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
                        <path d="M28 25 C30 36 31 48 28 51 C26 53 24 52 24 48 L23 25" fill="none" stroke={stroke} strokeWidth="1.1" strokeLinecap="round" />
                    </>
                );
        }
    })();

    return (
        <svg
            width={getToothWidth(type)}
            height={56}
            viewBox="0 0 40 56"
            fill="none"
            className={cn(!upper && 'scale-y-[-1]', mirrored && 'scale-x-[-1]')}
        >
            {crown}
            <line x1="8" y1={gumY} x2="32" y2={gumY} stroke={stroke} strokeWidth="0.8" opacity="0.25" strokeDasharray="2 2" />
            {roots}
        </svg>
    );
}

interface ToothButtonProps {
    num: number;
    selected: boolean;
    upper: boolean;
    onToggle: (num: number) => void;
}

function ToothButton({ num, selected, upper, onToggle }: ToothButtonProps) {
    const type = getToothType(num);
    const rotation = getArchRotation(num);
    const quadrant = Math.floor(num / 10);
    const mirrored = quadrant === 1 || quadrant === 4;

    return (
        <button
            type="button"
            onClick={() => onToggle(num)}
            className={cn(
                'flex flex-col items-center gap-1 cursor-pointer transition-all hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-lg p-0.5',
                selected ? 'text-primary' : 'text-slate-400 hover:text-slate-500',
            )}
            aria-label={`Dent ${num}`}
            aria-pressed={selected}
        >
            <div style={{ transform: `rotate(${rotation}deg)` }} className="flex flex-col items-center gap-1">
                {upper && (
                    <ToothSvg type={type} selected={selected} upper mirrored={mirrored} />
                )}
                <span className={cn('text-[9px] font-black leading-none', selected ? 'text-primary' : 'text-slate-400')}>
                    {num}
                </span>
                {!upper && (
                    <ToothSvg type={type} selected={selected} upper={false} mirrored={mirrored} />
                )}
            </div>
        </button>
    );
}

interface DentalChartProps {
    selectedTeeth: number[];
    onToggle: (num: number) => void;
    onClear: () => void;
}

export function DentalChart({ selectedTeeth, onToggle, onClear }: DentalChartProps) {
    return (
        <div className="space-y-6 py-6 border-y border-slate-100/50 bg-slate-50/30 rounded-[2.5rem] -mx-4 px-4 overflow-x-auto no-scrollbar">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 text-center mb-2">
                Schéma Dentaire Anatomique
            </p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-300 text-center mb-4">
                Numérotation FDI — Vue vestibulaire
            </p>

            <div className="min-w-[620px] flex flex-col gap-6 items-center py-2">
                {/* Upper arch */}
                <div className="relative w-full flex justify-center">
                    <svg className="absolute inset-x-8 top-1/2 -translate-y-1/2 w-[calc(100%-4rem)] h-16 pointer-events-none" viewBox="0 0 500 60" preserveAspectRatio="none">
                        <path d="M10 50 Q250 -10 490 50" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200" strokeDasharray="4 4" />
                    </svg>
                    <div className="flex gap-3 sm:gap-5 items-end relative z-10">
                        <div className="flex gap-0.5 sm:gap-1 items-end px-3 border-r border-slate-200/80">
                            {UPPER_RIGHT.map(num => (
                                <ToothButton key={num} num={num} selected={selectedTeeth.includes(num)} upper onToggle={onToggle} />
                            ))}
                        </div>
                        <div className="flex gap-0.5 sm:gap-1 items-end px-3">
                            {UPPER_LEFT.map(num => (
                                <ToothButton key={num} num={num} selected={selectedTeeth.includes(num)} upper onToggle={onToggle} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full max-w-md px-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-slate-300" />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-300 whitespace-nowrap">Plan occlusal</span>
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-200 to-slate-300" />
                </div>

                {/* Lower arch */}
                <div className="relative w-full flex justify-center">
                    <svg className="absolute inset-x-8 top-1/2 -translate-y-1/2 w-[calc(100%-4rem)] h-16 pointer-events-none" viewBox="0 0 500 60" preserveAspectRatio="none">
                        <path d="M10 10 Q250 70 490 10" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200" strokeDasharray="4 4" />
                    </svg>
                    <div className="flex gap-3 sm:gap-5 items-start relative z-10">
                        <div className="flex gap-0.5 sm:gap-1 items-start px-3 border-r border-slate-200/80">
                            {LOWER_LEFT.map(num => (
                                <ToothButton key={num} num={num} selected={selectedTeeth.includes(num)} upper={false} onToggle={onToggle} />
                            ))}
                        </div>
                        <div className="flex gap-0.5 sm:gap-1 items-start px-3">
                            {LOWER_RIGHT.map(num => (
                                <ToothButton key={num} num={num} selected={selectedTeeth.includes(num)} upper={false} onToggle={onToggle} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 px-2">
                {(['Incisive centrale', 'Incisive latérale', 'Canine', 'Prémolaire', 'Molaire', 'Dents de sagesse'] as const).map(label => (
                    <span key={label} className="text-[8px] font-bold uppercase tracking-wider text-slate-300">{label}</span>
                ))}
            </div>

            {selectedTeeth.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <Badge variant="outline" className="rounded-full bg-primary/5 text-primary border-primary/20 font-black animate-in zoom-in-95">
                        {selectedTeeth.length} dent{selectedTeeth.length > 1 ? 's' : ''} sélectionnée{selectedTeeth.length > 1 ? 's' : ''} : {[...selectedTeeth].sort((a, b) => a - b).join(', ')}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={onClear} className="h-6 text-[10px] font-bold text-rose-500 hover:bg-rose-50 rounded-full px-3">
                        Réinitialiser
                    </Button>
                </div>
            )}
        </div>
    );
}
