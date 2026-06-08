import Image from 'next/image';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PhotoGridProps {
    photoCount: number;
    capturedPhotos: string[];
    onDeletePhoto: (index: number) => void;
    onProceed: () => void;
    isComplete: boolean;
    isActive: boolean;
}

export function PhotoGrid({
    photoCount,
    capturedPhotos,
    onDeletePhoto,
    onProceed,
    isComplete,
    isActive
}: PhotoGridProps) {
    if (!isActive) return null;

    return (
        <>
            {/* Desktop View: Right Sidebar Grid */}
            <div className="hidden lg:flex w-80 xl:w-96 bg-white border-l-3 border-black flex-col overflow-hidden shrink-0 z-10">
                <div className="flex-1 overflow-y-auto p-4 brutal-scrollbar">
                    {/* Progress */}
                    <div className="mb-6 pb-6 border-b-3 border-black">
                        <div className="text-center">
                            <div className="text-3xl font-black">
                                {capturedPhotos.length}/{photoCount}
                            </div>
                            <div className="text-xs text-[#B8B8B8] uppercase font-bold mt-1">
                                Photos Captured
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4 h-4 bg-[#DEDEDE] border-3 border-black overflow-hidden">
                            <div
                                className="h-full bg-black transition-all duration-300"
                                style={{ width: `${(capturedPhotos.length / photoCount) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-2 gap-4 pb-4">
                        {Array.from({ length: photoCount }).map((_, idx) => (
                            <div
                                key={idx}
                                className="relative aspect-square border-3 border-black bg-[#DEDEDE]"
                            >
                                {capturedPhotos[idx] ? (
                                    <>
                                        <Image
                                            src={capturedPhotos[idx]}
                                            alt={`Photo ${idx + 1}`}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                        <button
                                            onClick={() => onDeletePhoto(idx)}
                                            className="absolute top-2 right-2 w-8 h-8 bg-white text-black hover:bg-red-500 hover:text-white flex items-center justify-center border-2 border-black transition-colors brutal-shadow-sm active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-[#B8B8B8] font-black text-3xl opacity-50">
                                        {idx + 1}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Proceed Button - Fixed Bottom Desktop */}
                {isComplete && (
                    <div className="p-6 border-t-3 border-black bg-white shrink-0 z-10">
                        <Button
                            variant="black"
                            fullWidth
                            className="py-4 text-lg"
                            onClick={onProceed}
                        >
                            Proceed to Editor →
                        </Button>
                    </div>
                )}
            </div>

            {/* Mobile View: Horizontal Scrollable Strip (Floats above controls) */}
            <div className="lg:hidden absolute bottom-[140px] left-0 w-full z-20 px-4 pointer-events-none flex flex-col gap-2">
                {/* Status bar */}
                <div className="flex justify-between items-end">
                    <div className="bg-black text-white px-3 py-1 font-black text-sm border-2 border-white pointer-events-auto">
                        {capturedPhotos.length}/{photoCount} PHOTOS
                    </div>
                    {isComplete && (
                        <Button
                            variant="black"
                            onClick={onProceed}
                            className="pointer-events-auto shadow-lg animate-in slide-in-from-right"
                        >
                            Next →
                        </Button>
                    )}
                </div>

                {/* Horizontal Strip */}
                <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory pointer-events-auto no-scrollbar">
                    {Array.from({ length: photoCount }).map((_, idx) => (
                        <div
                            key={idx}
                            className="relative w-24 h-32 shrink-0 border-3 border-black bg-white/90 backdrop-blur-sm snap-center shadow-lg"
                        >
                            {capturedPhotos[idx] ? (
                                <>
                                    <Image
                                        src={capturedPhotos[idx]}
                                        alt={`Photo ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                    <button
                                        onClick={() => onDeletePhoto(idx)}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center border-2 border-black shadow-sm"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-300 font-black text-2xl">
                                    {idx + 1}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
