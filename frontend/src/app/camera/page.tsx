'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, ArrowLeft } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { usePhotoCapture } from '@/hooks/usePhotoCapture';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/shared/LoadingScreen';

// Components
import { PhotoGrid } from '@/components/camera/PhotoGrid';
import { CameraControls } from '@/components/camera/CameraControls';
import { CropGuideOverlay } from '@/components/camera/CropGuideOverlay';
import { CountdownOverlay } from '@/components/camera/CountdownOverlay';

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
    holesConfig: HoleConfig[];
    photoCount: number;
    aspectRatio: string;
}

export default function CameraPage() {
    const router = useRouter();
    const { videoRef, state, startCamera, stopCamera, switchCamera, activeFacingMode } = useCamera();
    const { capturePhoto } = usePhotoCapture();

    const [frameLayout, setFrameLayout] = useState<FrameLayout | null>(null);
    const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
    const [videoAR, setVideoAR] = useState<number | null>(null);

    // Loading State
    const [loading, setLoading] = useState(true);
    const [dataReady, setDataReady] = useState(false);

    const [countdown, setCountdown] = useState<number | null>(null);
    const [flash, setFlash] = useState(false);
    const [isMirrored, setIsMirrored] = useState(true);

    const [selectedDelay, setSelectedDelay] = useState(3);
    const [captureMode, setCaptureMode] = useState<'manual' | 'auto'>('manual');
    const [isAutoCapturing, setIsAutoCapturing] = useState(false);
    const processingRef = useRef(false);

    useEffect(() => {
        if (frameLayout) {
            setDataReady(true);
        }
    }, [frameLayout]);

    useEffect(() => {
        const savedLayout = localStorage.getItem('selectedFrameLayout');
        if (!savedLayout) {
            router.push('/layout-selection');
            return;
        }

        const parsedLocal = JSON.parse(savedLayout);

        const fetchLayoutFromDB = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL;
                const res = await fetch(`${API_URL}/frame-layouts`);
                const data = await res.json();

                if (data.success && Array.isArray(data.data)) {
                    const freshLayout = data.data.find((l: any) => l.id === parsedLocal.id);
                    if (freshLayout) {
                        setFrameLayout(freshLayout);
                        localStorage.setItem('selectedFrameLayout', JSON.stringify(freshLayout));
                    } else {
                        setFrameLayout(parsedLocal);
                    }
                } else {
                    setFrameLayout(parsedLocal);
                }
            } catch (e) {
                console.error("Failed to refresh layout from DB", e);
                setFrameLayout(parsedLocal);
            }
        };

        fetchLayoutFromDB();
    }, [router]);

    useEffect(() => {
        setIsMirrored(activeFacingMode === 'user');
    }, [activeFacingMode]);

    // Auto Capture Logic
    useEffect(() => {
        if (isAutoCapturing && frameLayout && capturedPhotos.length < frameLayout.photoCount && !processingRef.current) {
            performAutoCaptureStep();
        } else if (isAutoCapturing && frameLayout && capturedPhotos.length >= frameLayout.photoCount) {
            setIsAutoCapturing(false);
        }
    }, [isAutoCapturing, capturedPhotos.length, frameLayout]);

    const performAutoCaptureStep = async () => {
        processingRef.current = true;

        if (capturedPhotos.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (selectedDelay > 0) {
            for (let i = selectedDelay; i > 0; i--) {
                setCountdown(i);
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
            setCountdown(null);
        }

        setFlash(true);
        setTimeout(() => setFlash(false), 200);

        if (videoRef.current) {
            const dataUrl = capturePhoto(videoRef.current, { mirror: isMirrored });
            if (dataUrl) {
                setCapturedPhotos(prev => [...prev, dataUrl]);
            }
        }

        processingRef.current = false;
    };

    const handleCapture = async () => {
        if (!frameLayout || !videoRef.current) return;
        if (capturedPhotos.length >= frameLayout.photoCount) return;

        if (captureMode === 'auto') {
            setIsAutoCapturing(prev => !prev);
        } else {
            if (selectedDelay > 0) {
                for (let i = selectedDelay; i > 0; i--) {
                    setCountdown(i);
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }
                setCountdown(null);
            }

            setFlash(true);
            setTimeout(() => setFlash(false), 200);

            const dataUrl = capturePhoto(videoRef.current, { mirror: isMirrored });
            if (dataUrl) {
                setCapturedPhotos(prev => [...prev, dataUrl]);
            }
        }
    };

    const handleDeletePhoto = (index: number) => {
        setCapturedPhotos(prev => prev.filter((_, idx) => idx !== index));
        setIsAutoCapturing(false);
    };

    const handleProceedToEditor = () => {
        if (!frameLayout) return;
        localStorage.setItem('capturedPhotos', JSON.stringify(capturedPhotos));
        localStorage.setItem('selectedFrameLayout', JSON.stringify(frameLayout));
        router.push('/editor');
    };

    const getSlotAR = () => {
        if (!frameLayout) return 1;
        const currentSlot = frameLayout.holesConfig[capturedPhotos.length];
        if (!currentSlot) return 1;

        const parts = frameLayout.aspectRatio.split(':');
        const frameGeomW = parseFloat(parts[0].trim());
        const frameGeomH = parseFloat(parts[1].trim());

        const holeW = currentSlot.width * frameGeomW;
        const holeH = currentSlot.height * frameGeomH;

        return holeW / holeH;
    };

    const isComplete = frameLayout ? capturedPhotos.length === frameLayout.photoCount : false;
    const isBusy = countdown !== null || processingRef.current;

    if (loading) {
        return (
            <LoadingScreen
                fullScreen
                finished={dataReady}
                onComplete={() => setLoading(false)}
            />
        );
    }

    if (!frameLayout) return null;

    return (
        <div className="h-[100dvh] lg:h-[calc(100vh-88px)] bg-black lg:bg-[#FAFAFA] flex flex-col overflow-hidden relative">
            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 w-full relative">
                
                {/* Camera Preview Area */}
                <div className="flex-1 min-h-0 bg-black flex items-center justify-center lg:p-8 relative">
                    
                    {/* Back Button (Desktop top-left, Mobile top-left) */}
                    <button
                        onClick={() => router.push('/layout-selection')}
                        className="absolute top-4 left-4 lg:bottom-4 lg:top-auto z-40 w-12 h-12 bg-white lg:bg-black rounded-full flex items-center justify-center text-black lg:text-white border-2 border-black lg:border-white hover:scale-105 transition-transform shadow-lg"
                        title="Back to Layouts"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>

                    {!state.isActive && !state.error && (
                        <div className="text-center space-y-6 bg-white p-8 border-3 border-black brutal-shadow max-w-md mx-4">
                            <div className="w-24 h-24 mx-auto bg-black flex items-center justify-center border-3 border-black">
                                <Camera className="w-12 h-12 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black uppercase mb-2">Enable Camera</h2>
                                <p className="text-[#B8B8B8] text-sm">
                                    We need access to your camera for photostrip.
                                </p>
                                <p className="text-sm font-bold mt-2">
                                    Layout: {frameLayout.name} ({frameLayout.photoCount} photos)
                                </p>
                            </div>
                            <Button onClick={() => startCamera()} variant="black" fullWidth>
                                Start Camera
                            </Button>
                        </div>
                    )}

                    {state.error && (
                        <div className="text-center space-y-4 bg-white p-8 border-3 border-black brutal-shadow mx-4">
                            <div className="text-red-500 text-xl font-black uppercase">Camera Error</div>
                            <p className="text-[#B8B8B8] max-w-md mx-auto">{state.error}</p>
                            <Button onClick={() => startCamera()} variant="black" fullWidth>
                                Try Again
                            </Button>
                        </div>
                    )}

                    {state.isActive && (
                        <div className="relative w-full h-full lg:max-w-2xl lg:h-auto flex items-center justify-center overflow-hidden">
                            {!state.isReady && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                                    <div className="text-white font-bold animate-pulse">STARTING CAMERA...</div>
                                </div>
                            )}

                            <div className="relative w-full h-full lg:border-3 lg:border-black bg-black lg:brutal-shadow overflow-hidden group flex items-center justify-center">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    onLoadedMetadata={(e) => {
                                        const v = e.currentTarget;
                                        if (v.videoWidth && v.videoHeight) {
                                            setVideoAR(v.videoWidth / v.videoHeight);
                                        }
                                    }}
                                    className="w-full h-full object-cover lg:object-contain"
                                    style={{ transform: isMirrored ? 'scaleX(-1)' : 'none' }}
                                />

                                {/* Crop Guide */}
                                {capturedPhotos.length < frameLayout.photoCount && (
                                    <CropGuideOverlay slotAR={getSlotAR()} videoAR={videoAR} />
                                )}

                                {/* Countdown */}
                                <CountdownOverlay countdown={countdown} />

                                {/* Flash */}
                                {flash && (
                                    <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-200" />
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Photo Grid & Mobile Strip */}
                <PhotoGrid
                    photoCount={frameLayout.photoCount}
                    capturedPhotos={capturedPhotos}
                    onDeletePhoto={handleDeletePhoto}
                    onProceed={handleProceedToEditor}
                    isComplete={isComplete}
                    isActive={state.isActive && state.isReady}
                />
            </div>

            {/* Bottom Controls */}
            {state.isActive && state.isReady && (
                <CameraControls
                    isMirrored={isMirrored}
                    onToggleMirror={() => setIsMirrored(!isMirrored)}
                    onSwitchCamera={switchCamera}
                    onCapture={handleCapture}
                    isBusy={isBusy}
                    isComplete={isComplete}
                    captureMode={captureMode}
                    onToggleMode={() => {
                        setCaptureMode(prev => prev === 'manual' ? 'auto' : 'manual');
                        setIsAutoCapturing(false);
                    }}
                    isAutoCapturing={isAutoCapturing}
                    selectedDelay={selectedDelay}
                    onSelectDelay={setSelectedDelay}
                />
            )}
        </div>
    );
}
