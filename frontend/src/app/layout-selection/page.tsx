'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Edit, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import { LayoutCarousel, FrameLayout } from '@/components/layout-selection/LayoutCarousel';

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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/frame-layouts`);
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

    return (
        <div className="h-[100dvh] lg:h-[calc(100vh-88px)] bg-[#FAFAFA] flex flex-col overflow-hidden relative">
            {/* Header */}
            <div className="bg-white border-b-3 border-black py-2 shrink-0">
                <h1 className="text-xl lg:text-2xl font-black text-center uppercase tracking-tight">
                    Choose Layout
                </h1>
            </div>

            {/* Back Button (Fixed top left) */}
            <button
                onClick={() => router.push('/')}
                className="absolute top-12 left-4 z-40 w-12 h-12 bg-white rounded-full flex items-center justify-center text-black border-2 border-black hover:scale-105 transition-transform shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                title="Back to Home"
            >
                <ArrowLeft className="w-6 h-6" />
            </button>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0 pt-16 lg:pt-4">
                <div className="w-full max-w-6xl h-full flex flex-col justify-center gap-6">
                    {/* Carousel */}
                    <LayoutCarousel 
                        layouts={layouts}
                        currentIndex={currentIndex}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                        onSelectIndex={setCurrentIndex}
                    />

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 shrink-0 pb-4 w-full px-4 mt-2">
                        <Button
                            variant="white"
                            onClick={() => {
                                if (layouts[currentIndex]) {
                                    localStorage.setItem('selectedFrameLayout', JSON.stringify(layouts[currentIndex]));
                                    router.push('/camera');
                                }
                            }}
                            className="w-full sm:w-auto min-w-[200px] text-lg py-5 border-b-[6px] active:border-b-3 active:translate-y-[3px] transition-all"
                        >
                            <Camera className="w-6 h-6 mr-3" />
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
                            className="w-full sm:w-auto min-w-[200px] text-lg py-5"
                        >
                            <Edit className="w-6 h-6 mr-3" />
                            USE EDITOR
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
