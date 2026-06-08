import { forwardRef, useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ImagePlus, Trash2, X } from 'lucide-react';

interface HoleConfig {
    top: number;
    left: number;
    width: number;
    height: number;
}

interface FrameLayout {
    aspectRatio: string;
    holesConfig: HoleConfig[];
}

interface Asset {
    url?: string;
}

export interface PlacedSticker {
    id: string;
    url: string;
    x: number;
    y: number;
    scale: number;
    rotation: number;
}

type FilterType = 'NONE' | 'GRAYSCALE' | 'SEPIA' | 'BRIGHTNESS' | 'CONTRAST' | 'BLUR';
type PhotoShape = 'SQUARE' | 'CIRCLE' | 'HEART' | 'ROUNDED_SQUARE';

interface PhotostripPreviewProps {
    frameLayout: FrameLayout;
    photos: string[];
    backgroundColor: string;
    backgroundPattern: string | null;
    frameOverlay: Asset | null;
    filterType: FilterType;
    photoShape: PhotoShape;
    addDate: boolean;
    addLogo: boolean;
    placedStickers: PlacedSticker[];
    onSlotClick: (index: number) => void;
    onRemovePhoto: (index: number, e: React.MouseEvent) => void;
    onUpdateSticker: (id: string, updates: Partial<PlacedSticker>) => void;
    onRemoveSticker: (id: string) => void;
}

export const PhotostripPreview = forwardRef<HTMLDivElement, PhotostripPreviewProps>(({
    frameLayout,
    photos,
    backgroundColor,
    backgroundPattern,
    frameOverlay,
    filterType,
    photoShape,
    addDate,
    addLogo,
    placedStickers,
    onSlotClick,
    onRemovePhoto,
    onUpdateSticker,
    onRemoveSticker
}, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [draggingStickerId, setDraggingStickerId] = useState<string | null>(null);

    // Merge forwarded ref with local ref
    const setRefs = (element: HTMLDivElement) => {
        containerRef.current = element;
        if (typeof ref === 'function') {
            ref(element);
        } else if (ref) {
            ref.current = element;
        }
    };

    const getFilterCSS = (type: FilterType): string => {
        switch (type) {
            case 'GRAYSCALE': return 'grayscale(100%)';
            case 'SEPIA': return 'sepia(100%)';
            case 'BRIGHTNESS': return 'brightness(1.2)';
            case 'CONTRAST': return 'contrast(1.3)';
            case 'BLUR': return 'blur(2px)';
            default: return 'none';
        }
    };

    const getClipPath = (shape: PhotoShape): string => {
        switch (shape) {
            case 'CIRCLE': return 'circle(50%)';
            case 'HEART': return 'path("M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z")';
            case 'ROUNDED_SQUARE': return 'inset(0 round 20%)';
            default: return 'none';
        }
    };

    const handlePointerDown = (e: React.PointerEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        setDraggingStickerId(id);
        
        // Capture pointer events on the container so we can drag outside the sticker bounds
        if (containerRef.current) {
            containerRef.current.setPointerCapture(e.pointerId);
        }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!draggingStickerId || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        
        // Calculate new percentages
        const xPct = ((e.clientX - rect.left) / rect.width) * 100;
        const yPct = ((e.clientY - rect.top) / rect.height) * 100;

        onUpdateSticker(draggingStickerId, { x: xPct, y: yPct });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (draggingStickerId && containerRef.current) {
            containerRef.current.releasePointerCapture(e.pointerId);
        }
        setDraggingStickerId(null);
    };

    return (
        <div 
            className="relative w-full shadow-[0px_8px_24px_rgba(0,0,0,0.15)] transition-transform duration-300 hover:scale-[1.01]" 
            ref={setRefs}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            <div
                className="relative bg-white"
                style={{
                    paddingBottom: `${(parseInt(frameLayout.aspectRatio.split(':')[1]) / parseInt(frameLayout.aspectRatio.split(':')[0])) * 100}%`,
                    touchAction: draggingStickerId ? 'none' : 'auto' // Prevent scrolling while dragging on mobile
                }}
            >
                {/* Layer 1: Background */}
                <div
                    className="absolute inset-0 transition-colors duration-300 pointer-events-none"
                    style={{
                        backgroundColor: backgroundColor,
                        ...(backgroundPattern && {
                            backgroundImage: `url(${backgroundPattern})`,
                            backgroundSize: 'cover',
                            backgroundRepeat: 'repeat',
                        }),
                    }}
                />

                {/* Layer 2: User Photos & Upload UI */}
                {frameLayout.holesConfig.map((hole, idx) => (
                    <div
                        key={idx}
                        className="absolute overflow-hidden group border-2 border-transparent transition-colors hover:border-black/20"
                        style={{
                            top: `${hole.top}%`,
                            left: `${hole.left}%`,
                            width: `${hole.width}%`,
                            height: `${hole.height}%`,
                        }}
                    >
                        {photos[idx] && photos[idx] !== "" ? (
                            <div
                                className="relative w-full h-full transition-all duration-300"
                                style={{
                                    filter: getFilterCSS(filterType),
                                    clipPath: photoShape === 'ROUNDED_SQUARE' ? 'inset(0 round 5%)' : getClipPath(photoShape),
                                }}
                            >
                                <Image
                                    src={photos[idx]}
                                    alt={`Photo ${idx + 1}`}
                                    fill
                                    className="object-cover pointer-events-none"
                                    unoptimized
                                />
                                {/* Trash Overlay */}
                                <button
                                    onClick={(e) => onRemovePhoto(idx, e)}
                                    className="absolute top-2 right-2 bg-white/90 border-2 border-black p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-sm hover:scale-110 active:scale-95"
                                    title="Remove photo"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => onSlotClick(idx)}
                                className="w-full h-full bg-black/5 flex flex-col items-center justify-center text-black/40 gap-2 border-2 border-dashed border-black/20 hover:border-black/60 hover:bg-black/10 transition-all font-bold text-xs"
                            >
                                <ImagePlus className="w-6 h-6" />
                                <span>Click to Add</span>
                            </button>
                        )}
                    </div>
                ))}

                {/* Layer 3: Frame Overlay */}
                {frameOverlay && frameOverlay.url && (
                    <div className="absolute inset-0 pointer-events-none mix-blend-multiply">
                        <Image
                            src={frameOverlay.url}
                            alt="Frame overlay"
                            fill
                            className="object-contain"
                            unoptimized
                        />
                    </div>
                )}

                {/* Layer 4: Stickers */}
                {placedStickers.map((sticker) => (
                    <div
                        key={sticker.id}
                        className="absolute w-20 h-20 -translate-x-1/2 -translate-y-1/2 group cursor-grab active:cursor-grabbing"
                        style={{
                            top: `${sticker.y}%`,
                            left: `${sticker.x}%`,
                            transform: `translate(-50%, -50%) scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
                            zIndex: 20
                        }}
                        onPointerDown={(e) => handlePointerDown(e, sticker.id)}
                    >
                        <Image
                            src={sticker.url}
                            alt="Sticker"
                            fill
                            className="object-contain pointer-events-none"
                            unoptimized
                        />
                        {/* Remove Button - Only visible on hover/active */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemoveSticker(sticker.id);
                            }}
                            className="absolute -top-2 -right-2 bg-white border-2 border-black rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white shadow-sm"
                            onPointerDown={(e) => e.stopPropagation()} // Prevent dragging when clicking remove
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}

                {/* Layer 5: Text Overlays */}
                {addDate && (
                    <div className="absolute bottom-[2%] left-[3%] bg-white/90 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] z-30 pointer-events-none">
                        {new Date().toLocaleDateString()}
                    </div>
                )}
                {addLogo && (
                    <div className="absolute bottom-[2%] right-[3%] text-black px-2 py-0.5 text-[10px] sm:text-xs font-black uppercase tracking-widest bg-white/90 border-2 border-black shadow-[2px_2px_0px_0px_#000] z-30 pointer-events-none">
                        pojokfoto
                    </div>
                )}
            </div>
        </div>
    );
});
PhotostripPreview.displayName = 'PhotostripPreview';
