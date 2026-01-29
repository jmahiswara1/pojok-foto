'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, SwitchCamera, FlipHorizontal, X, Zap, Hand, ArrowLeft } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { usePhotoCapture } from '@/hooks/usePhotoCapture';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import Image from 'next/image';

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

    // Loading State
    const [loading, setLoading] = useState(true);
    const [dataReady, setDataReady] = useState(false);

    const [countdown, setCountdown] = useState<number | null>(null);
    const [flash, setFlash] = useState(false);
    const [isMirrored, setIsMirrored] = useState(true);

    useEffect(() => {
        // If layout is loaded, we are ready
        if (frameLayout) {
            setDataReady(true);
        }
    }, [frameLayout]);
    const [selectedDelay, setSelectedDelay] = useState(3);
    const [showDelayDropdown, setShowDelayDropdown] = useState(false);

    // Capture Mode State
    const [captureMode, setCaptureMode] = useState<'manual' | 'auto'>('manual');
    const [isAutoCapturing, setIsAutoCapturing] = useState(false);
    const processingRef = useRef(false);

    const delays = [
        { value: 0, label: '0s' },
        { value: 3, label: '3s' },
        { value: 5, label: '5s' },
        { value: 10, label: '10s' },
    ];

    useEffect(() => {
        // Load selected layout ID from localStorage
        const savedLayout = localStorage.getItem('selectedFrameLayout');
        if (!savedLayout) {
            router.push('/layout-selection');
            return;
        }

        const parsedLocal = JSON.parse(savedLayout);

        // Fetch fresh data from DB to ensure validity ("gunakan db")
        const fetchLayoutFromDB = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL;
                const res = await fetch(`${API_URL}/frame-layouts`);
                const data = await res.json();

                if (data.success && Array.isArray(data.data)) {
                    const freshLayout = data.data.find((l: any) => l.id === parsedLocal.id);
                    if (freshLayout) {
                        setFrameLayout(freshLayout);
                        // Update local storage with fresh data
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

        // Wait a small buffer if this is not the first photo, so user sees the preview
        if (capturedPhotos.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Countdown
        if (selectedDelay > 0) {
            for (let i = selectedDelay; i > 0; i--) {
                setCountdown(i);
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
            setCountdown(null);
        }

        // Flash & Capture
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
            setIsAutoCapturing(true);
        } else {
            // Manual Mode: Single capture
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
        // If we delete a photo while in auto mode (and not finished), it might resume? 
        // Better to stop auto if manual interaction happens.
        setIsAutoCapturing(false);
    };

    const handleProceedToEditor = () => {
        if (!frameLayout) return;

        // Save photos to localStorage
        localStorage.setItem('capturedPhotos', JSON.stringify(capturedPhotos));
        localStorage.setItem('selectedFrameLayout', JSON.stringify(frameLayout));

        // Navigate to editor
        router.push('/editor');
    };

    const isComplete = frameLayout && capturedPhotos.length === frameLayout.photoCount;
    const isBusy = countdown !== null || processingRef.current;

    if (loading) {
        return (
            <LoadingScreen
                fullScreen
                finished={dataReady}
                text="STARTING CAMERA..." // Text is ignored by component now but kept for prop compat if needed
                onComplete={() => setLoading(false)}
            />
        );
    }

    if (!frameLayout) return null;

    return (
        <div className="h-[calc(100vh-88px)] bg-[#FAFAFA] flex flex-col overflow-hidden">
            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Camera Preview - Left */}
                <div className="flex-1 bg-[#DEDEDE] flex items-center justify-center p-4 lg:p-8 relative">
                    {/* Back Button */}
                    <button
                        onClick={() => router.push('/layout-selection')}
                        className="absolute bottom-4 left-4 z-10 w-12 h-12 bg-black rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform shadow-lg border-2 border-white"
                        title="Back to Layouts"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>

                    {!state.isActive && !state.error && (
                        <div className="text-center space-y-6 bg-white p-8 border-3 border-black brutal-shadow max-w-md">
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
                        <div className="text-center space-y-4 bg-white p-8 border-3 border-black brutal-shadow">
                            <div className="text-red-500 text-xl font-black uppercase">Camera Error</div>
                            <p className="text-[#B8B8B8] max-w-md mx-auto">{state.error}</p>
                            <Button onClick={() => startCamera()} variant="black">
                                Try Again
                            </Button>
                        </div>
                    )}

                    {state.isActive && (
                        <div className="relative w-full max-w-2xl">
                            {!state.isReady && (
                                <LoadingScreen text="STARTING CAMERA..." />
                            )}

                            <div className="relative border-3 border-black bg-black brutal-shadow overflow-hidden group">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    onLoadedMetadata={(e) => {
                                        // Track video aspect ratio to maximize guide size
                                        const v = e.currentTarget;
                                        if (v.videoWidth && v.videoHeight) {
                                            // Store in a data attribute or state if we wanted, 
                                            // but triggering a re-render is easiest via a state update.
                                            // Since we don't have a new state for this yet, we'll assume standard webcam (4:3 or 16:9).
                                            // HOWEVER, React might not re-render just from this event unless we use state.
                                            // Let's force a re-calc by toggling a dummy state or just assuming 
                                            // Since this is a "fix", let's use a CSS-only trick first using 'vmin/vmax' or just '100%'.
                                            // Actually, the JS comparison is best.
                                            v.dataset.ar = (v.videoWidth / v.videoHeight).toString();
                                        }
                                    }}
                                    className="w-full h-auto object-cover"
                                    style={{ transform: isMirrored ? 'scaleX(-1)' : 'none' }}
                                />

                                {/* Crop Guide Overlay */}
                                {frameLayout && capturedPhotos.length < frameLayout.photoCount && (() => {
                                    // -----------------------------------------------------------
                                    // Aspect Ratio Calculation Logic
                                    // -----------------------------------------------------------
                                    const getCropRatio = () => {
                                        const currentSlot = frameLayout.holesConfig[capturedPhotos.length];
                                        if (!currentSlot) return 1;

                                        const parts = frameLayout.aspectRatio.split(':');
                                        const frameGeomW = parseFloat(parts[0].trim());
                                        const frameGeomH = parseFloat(parts[1].trim());

                                        const holeW = currentSlot.width * frameGeomW;
                                        const holeH = currentSlot.height * frameGeomH;

                                        return holeW / holeH;
                                    };

                                    const slotAR = getCropRatio();

                                    // Approximate Video AR (Webcams are usually 4:3 = 1.33 or 16:9 = 1.77)
                                    // Safe default is 1.33 (4:3).
                                    // If SlotAR > VideoAR, we are Width-Constrained (touch left/right).
                                    // If SlotAR < VideoAR, we are Height-Constrained (touch top/bottom).
                                    // Since we don't have 'videoAR' in state, let's try a CSS trick:
                                    // Use 'min-width' and 'min-height' combination? 
                                    // The most robust way without state is trying both and letting CSS 'contain' it.
                                    // But we CAN use the videoRef if available.
                                    const videoEl = videoRef.current;
                                    const videoAR = videoEl ? (videoEl.videoWidth / videoEl.videoHeight) : (4 / 3);

                                    const isWiderThanContainer = slotAR > videoAR;

                                    return (
                                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                                            <div
                                                className="border-2 border-dashed border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] transition-all duration-300 relative"
                                                style={{
                                                    aspectRatio: slotAR,
                                                    // Maximize based on limiting dimension logic
                                                    width: isWiderThanContainer ? '100%' : 'auto',
                                                    height: isWiderThanContainer ? 'auto' : '100%',
                                                    // Fallbacks
                                                    maxWidth: '100%',
                                                    maxHeight: '100%'
                                                }}
                                            >
                                                {/* Center Crosshair */}
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 opacity-70">
                                                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white shadow-sm"></div>
                                                    <div className="absolute left-1/2 top-0 h-full w-[1px] bg-white shadow-sm"></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Countdown */}
                                {countdown !== null && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                        <div className="text-white text-9xl font-black animate-pulse">
                                            {countdown}
                                        </div>
                                    </div>
                                )}

                                {/* Flash Effect */}
                                {flash && (
                                    <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-200" />
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Photo Grid - Right */}
                <div className="w-full lg:w-80 xl:w-96 bg-white border-t-3 lg:border-t-0 lg:border-l-3 border-black flex flex-col overflow-hidden">
                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {/* Progress */}
                        <div className="mb-4 pb-4 border-b-3 border-black">
                            <div className="text-center">
                                <div className="text-2xl font-black">
                                    {capturedPhotos.length}/{frameLayout.photoCount}
                                </div>
                                <div className="text-sm text-[#B8B8B8] uppercase font-bold mt-1">
                                    Photos Captured
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-3 h-3 bg-[#DEDEDE] border-2 border-black">
                                <div
                                    className="h-full bg-black transition-all duration-300"
                                    style={{ width: `${(capturedPhotos.length / frameLayout.photoCount) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-2 gap-3 pb-20 lg:pb-0">
                            {Array.from({ length: frameLayout.photoCount }).map((_, idx) => (
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
                                                onClick={() => handleDeletePhoto(idx)}
                                                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white flex items-center justify-center border-2 border-black hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-[#B8B8B8] font-bold text-2xl">
                                            {idx + 1}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Proceed Button - Fixed Bottom */}
                    {isComplete && (
                        <div className="p-4 border-t-3 border-black bg-white shrink-0 z-10">
                            <Button
                                variant="black"
                                fullWidth
                                onClick={handleProceedToEditor}
                            >
                                Proceed to Editor →
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Controls */}
            {state.isActive && state.isReady && (
                <div className="z-20 p-3 bg-white border-t-3 border-black">
                    <div className="brutal-container grid grid-cols-3 items-center gap-3">
                        {/* Left - Flip and Switch */}
                        <div className="flex items-center gap-2 justify-end">
                            <Button
                                variant="white"
                                onClick={() => setIsMirrored(!isMirrored)}
                                className={isMirrored ? 'bg-gray-200' : ''}
                            >
                                <FlipHorizontal className="w-5 h-5" />
                            </Button>
                            <Button variant="white" onClick={switchCamera}>
                                <SwitchCamera className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Center - Shutter */}
                        <div className="flex justify-center">
                            <button
                                onClick={handleCapture}
                                disabled={Boolean(isBusy || isComplete)}
                                className={`w-16 h-16 rounded-full border-4 border-black bg-white hover:bg-[#DEDEDE] disabled:bg-[#B8B8B8] transition-colors flex items-center justify-center brutal-shadow-sm active:translate-y-1 active:shadow-none disabled:cursor-not-allowed ${isAutoCapturing ? 'animate-pulse ring-4 ring-black/20' : ''
                                    }`}
                            >
                                {isAutoCapturing ? (
                                    <div className="text-xs font-black uppercase">STOP</div>
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-black border-2 border-white" />
                                )}
                            </button>
                        </div>

                        {/* Right - Delay & Auto Toggle */}
                        <div className="flex justify-start items-center gap-2">
                            {/* Auto/Manual Toggle */}
                            <Button
                                variant="white"
                                onClick={() => {
                                    setCaptureMode(prev => prev === 'manual' ? 'auto' : 'manual');
                                    setIsAutoCapturing(false);
                                }}
                                className={captureMode === 'auto' ? 'bg-black text-white hover:bg-black/90' : ''}
                                title={captureMode === 'auto' ? 'Auto Mode' : 'Manual Mode'}
                            >
                                {captureMode === 'auto' ? (
                                    <Zap className="w-5 h-5" />
                                ) : (
                                    <Hand className="w-5 h-5" />
                                )}
                            </Button>

                            {/* Delay Dropdown */}
                            <div className="relative">
                                <Button
                                    variant="white"
                                    onClick={() => setShowDelayDropdown(!showDelayDropdown)}
                                    className="px-4 py-2 bg-white border-2 border-black font-bold text-sm hover:bg-gray-100 transition-colors h-10 flex items-center justify-center min-w-[50px]"
                                >
                                    {delays.find(d => d.value === selectedDelay)?.label}
                                </Button>
                                {showDelayDropdown && (
                                    <div className="absolute bottom-full left-0 mb-1 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] z-50">
                                        {delays.map((delay) => (
                                            <button
                                                key={delay.value}
                                                onClick={() => {
                                                    setSelectedDelay(delay.value);
                                                    setShowDelayDropdown(false);
                                                }}
                                                className={`w-full px-4 py-2 text-left font-bold text-sm hover:bg-gray-100 whitespace-nowrap ${selectedDelay === delay.value ? 'bg-gray-200' : ''
                                                    }`}
                                            >
                                                {delay.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
