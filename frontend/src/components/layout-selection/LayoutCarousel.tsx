import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FrameLayout, LayoutPreview } from './LayoutPreview';

interface LayoutCarouselProps {
    layouts: FrameLayout[];
    currentIndex: number;
    onNext: () => void;
    onPrevious: () => void;
    onSelectIndex: (index: number) => void;
}

export function LayoutCarousel({ layouts, currentIndex, onNext, onPrevious, onSelectIndex }: LayoutCarouselProps) {
    if (!layouts || layouts.length === 0) return null;

    const currentLayout = layouts[currentIndex];

    return (
        <div className="relative flex-1 flex items-center justify-center min-h-0 lg:gap-8 w-full">
            {/* Previous Button */}
            <button
                onClick={onPrevious}
                className="absolute left-2 lg:static top-1/2 lg:top-auto -translate-y-1/2 lg:translate-y-0 z-20 w-14 h-14 lg:w-16 lg:h-16 bg-white border-3 border-black brutal-shadow-sm hover:brutal-shadow transition-all active:translate-y-1 active:shadow-none flex items-center justify-center shrink-0"
                aria-label="Previous layout"
            >
                <ChevronLeft className="w-8 h-8" />
            </button>

            {/* Layout Preview Container */}
            <div className="mx-16 lg:mx-0 h-full max-h-full flex flex-col justify-center w-full lg:w-auto z-10">
                <LayoutPreview layout={currentLayout} />

                {/* Pagination Indicators & "Layout X of N" */}
                <div className="mt-4 flex flex-col items-center gap-2">
                    <p className="text-sm font-black uppercase text-[#B8B8B8]">
                        Layout {currentIndex + 1} of {layouts.length}
                    </p>
                    <div className="flex justify-center gap-2 overflow-x-auto py-1 max-w-[200px] lg:max-w-none no-scrollbar">
                        {layouts.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => onSelectIndex(idx)}
                                className={`w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full border-2 border-black transition-colors shrink-0 ${
                                    idx === currentIndex ? 'bg-black scale-125' : 'bg-white'
                                }`}
                                aria-label={`Go to layout ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Next Button */}
            <button
                onClick={onNext}
                className="absolute right-2 lg:static top-1/2 lg:top-auto -translate-y-1/2 lg:translate-y-0 z-20 w-14 h-14 lg:w-16 lg:h-16 bg-white border-3 border-black brutal-shadow-sm hover:brutal-shadow transition-all active:translate-y-1 active:shadow-none flex items-center justify-center shrink-0"
                aria-label="Next layout"
            >
                <ChevronRight className="w-8 h-8" />
            </button>
        </div>
    );
}
