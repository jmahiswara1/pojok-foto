'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Camera, Edit, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/shared/LoadingScreen';

interface HoleConfig {
    top: number;
    left: number;
    width: number;
    height: number;
}

interface FrameLayout {
    id: string;
    name: string;
    description: string;
    thumbnailUrl: string | null;
    holesConfig: HoleConfig[];
    photoCount: number;
    aspectRatio: string;
    isPremium: boolean;
}

export default function LayoutSelectionPage() {
    const router = useRouter();
    const [layouts, setLayouts] = useState<FrameLayout[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [dataReady, setDataReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchLayouts();
    }, []);

    const fetchLayouts = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/frame-layouts`);
            const data = await response.json();

            if (data.success) {
                setLayouts(data.data);
            } else {
                setError('Failed to load layouts');
            }
        } catch (err) {
            setError('Network error');
            console.error('Error fetching layouts:', err);
        } finally {
            setDataReady(true);
        }
    };

    // ... handlePrevious/Next ... 
    // Wait, handlePrevious/Next are below. I need to keep them or not replace them.
    // The chunk ends at line 76 which is before handlePrevious.
    // So safe to replace up to there.

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? layouts.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === layouts.length - 1 ? 0 : prev + 1));
    };



    if (loading) {
        return (
            <LoadingScreen
                fullScreen
                finished={dataReady}
                onComplete={() => setLoading(false)}
            />
        );
    }

    if (error || layouts.length === 0) {
        return (
            <div className="min-h-[calc(100vh-88px)] bg-[#FAFAFA] flex items-center justify-center p-4">
                <div className="text-center bg-white border-3 border-black p-8 brutal-shadow max-w-md">
                    <h2 className="text-2xl font-black uppercase mb-4">No Layouts Found</h2>
                    <p className="text-[#B8B8B8] mb-6">{error || 'No frame layouts available'}</p>
                    <Button variant="black" onClick={() => router.push('/')}>
                        Go Home
                    </Button>
                </div>
            </div>
        );
    }

    const currentLayout = layouts[currentIndex];

    return (
        <div className="h-[calc(100vh-88px)] bg-[#FAFAFA] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b-3 border-black py-1 shrink-0">
                <h1 className="text-xl lg:text-2xl font-black text-center uppercase tracking-tight">
                    Choose Layout
                </h1>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0">
                <div className="w-full max-w-6xl h-full flex flex-col justify-center">
                    {/* Back Button */}
                    <button
                        onClick={() => router.push('/')}
                        className="absolute bottom-4 left-4 z-10 w-12 h-12 bg-black rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform shadow-lg border-2 border-white"
                        title="Back to Home"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    {/* Carousel Container */}
                    <div className="relative flex-1 flex items-center justify-center min-h-0 lg:gap-8">
                        {/* Previous Button */}
                        <button
                            onClick={handlePrevious}
                            className="absolute left-2 lg:static top-1/2 lg:top-auto -translate-y-1/2 lg:translate-y-0 z-20 w-12 h-12 lg:w-16 lg:h-16 bg-white border-3 border-black brutal-shadow-sm hover:brutal-shadow transition-all active:translate-y-1 active:shadow-none flex items-center justify-center shrink-0"
                            aria-label="Previous layout"
                        >
                            <ChevronLeft className="w-6 h-6 lg:w-8 lg:h-8" />
                        </button>

                        {/* Layout Preview */}
                        <div className="mx-16 lg:mx-0 h-full max-h-full flex flex-col justify-center w-full lg:w-auto z-10">
                            <div className="relative bg-white border-3 border-black brutal-shadow p-6 lg:p-8 flex flex-col items-center h-[60vh] w-[80vw] lg:w-[480px]">
                                {/* Layout Name */}
                                <div className="text-center mb-4 shrink-0 w-full">
                                    <h3 className="text-lg lg:text-xl font-black uppercase text-ellipsis overflow-hidden whitespace-nowrap">{currentLayout.name}</h3>
                                    <div className="flex items-center justify-center gap-2 mt-2 text-xs font-bold">
                                        <span className="bg-[#DEDEDE] px-2 py-0.5 border-2 border-black whitespace-nowrap">
                                            {currentLayout.photoCount} Photos
                                        </span>
                                        <span className="bg-[#DEDEDE] px-2 py-0.5 border-2 border-black whitespace-nowrap">
                                            {currentLayout.aspectRatio}
                                        </span>
                                    </div>
                                </div>

                                {/* Frame Preview */}
                                <div className="relative flex-1 flex items-center justify-center min-h-0 w-full p-4">
                                    <div
                                        className="relative border-4 border-black bg-[#DEDEDE] shadow-sm transition-all duration-300"
                                        style={{
                                            aspectRatio: currentLayout.aspectRatio.replace(':', '/'),
                                            height: '100%',
                                            width: 'auto',
                                            maxHeight: '100%',
                                            maxWidth: '100%',
                                        }}
                                    >
                                        {/* Holes */}
                                        {currentLayout.holesConfig.map((hole, idx) => (
                                            <div
                                                key={idx}
                                                className="absolute bg-white border-2 border-dashed border-black flex items-center justify-center text-[#B8B8B8] font-bold text-xs lg:text-sm"
                                                style={{
                                                    top: `${hole.top}%`,
                                                    left: `${hole.left}%`,
                                                    width: `${hole.width}%`,
                                                    height: `${hole.height}%`,
                                                }}
                                            >
                                                {idx + 1}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Pagination Dots */}
                                <div className="flex justify-center gap-1.5 mt-4 shrink-0 overflow-x-auto py-1 max-w-[200px] lg:max-w-none mx-auto no-scrollbar">
                                    {layouts.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentIndex(idx)}
                                            className={`w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full border-2 border-black transition-colors shrink-0 ${idx === currentIndex ? 'bg-black' : 'bg-white'
                                                }`}
                                            aria-label={`Go to layout ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Next Button */}
                        <button
                            onClick={handleNext}
                            className="absolute right-2 lg:static top-1/2 lg:top-auto -translate-y-1/2 lg:translate-y-0 z-20 w-12 h-12 lg:w-16 lg:h-16 bg-white border-3 border-black brutal-shadow-sm hover:brutal-shadow transition-all active:translate-y-1 active:shadow-none flex items-center justify-center shrink-0"
                            aria-label="Next layout"
                        >
                            <ChevronRight className="w-6 h-6 lg:w-8 lg:h-8" />
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 shrink-0 pb-4 w-full px-4">
                        <Button
                            variant="white"
                            onClick={() => {
                                if (layouts[currentIndex]) {
                                    localStorage.setItem('selectedFrameLayout', JSON.stringify(layouts[currentIndex]));
                                    router.push('/camera');
                                }
                            }}
                            className="w-full sm:w-auto min-w-[160px] text-lg py-6 border-b-[6px] active:border-b-2 active:translate-y-1 transition-all"
                        >
                            <Camera className="w-5 h-5 mr-2" />
                            USE CAMERA
                        </Button>

                        <Button
                            variant="black"
                            onClick={() => {
                                if (layouts[currentIndex]) {
                                    localStorage.setItem('selectedFrameLayout', JSON.stringify(layouts[currentIndex]));
                                    router.push('/editor');
                                }
                            }}
                            className="w-full sm:w-auto min-w-[160px] text-lg py-6"
                        >
                            <Edit className="w-5 h-5 mr-2" />
                            USE EDITOR
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
