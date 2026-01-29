'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    ArrowLeft,
    Download,
    Wand2,
    Frame as FrameIcon,
    Sticker as StickerIcon,
    Save,
    Check,
    RotateCcw,
    X,
    ImagePlus,
    Trash2
} from 'lucide-react';
import { useRef } from 'react';
import { HexAlphaColorPicker, HexColorInput } from 'react-colorful';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import { auth } from '@/lib/auth';

interface HoleConfig {
    top: number;
    left: number;
    width: number;
    height: number;
}

interface FrameLayout {
    id: string;
    name: string;
    holesConfig: HoleConfig[];
    photoCount: number;
    aspectRatio: string;
}

interface Asset {
    id: string;
    name: string;
    type: string;
    url: string;
    thumbnail: string | null;
    colorHex: string | null;
    patternUrl: string | null;
    isPremium: boolean;
    category: {
        name: string;
    } | null;
}

type FilterType = 'NONE' | 'GRAYSCALE' | 'SEPIA' | 'BRIGHTNESS' | 'CONTRAST' | 'BLUR';
type PhotoShape = 'SQUARE' | 'CIRCLE' | 'HEART' | 'ROUNDED_SQUARE';

function EditorContent() {
    const router = useRouter();

    const [frameLayout, setFrameLayout] = useState<FrameLayout | null>(null);
    const [photos, setPhotos] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [dataReady, setDataReady] = useState(false);

    // Per-slot upload state
    const [activeSlot, setActiveSlot] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isSaving, setIsSaving] = useState(false);
    const [isSavingFinished, setIsSavingFinished] = useState(false);
    const [saveText, setSaveText] = useState("SAVING PROJECT...");

    // Editor state
    const [activeTab, setActiveTab] = useState<'filter' | 'frame' | 'sticker'>('filter');
    const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
    const [backgroundPattern, setBackgroundPattern] = useState<string | null>(null);
    const [frameOverlay, setFrameOverlay] = useState<Asset | null>(null);
    const [filterType, setFilterType] = useState<FilterType>('NONE');
    const [photoShape, setPhotoShape] = useState<PhotoShape>('SQUARE');

    // Database assets
    const [frameAssets, setFrameAssets] = useState<Asset[]>([]);
    const [filterAssets, setFilterAssets] = useState<Asset[]>([]);
    const [stickerAssets, setStickerAssets] = useState<Asset[]>([]);

    // Options
    const [addDate, setAddDate] = useState(false);
    const [addLogo, setAddLogo] = useState(false);

    useEffect(() => {
        const loadProject = async () => {
            // Check for projectId in URL (mapped from photoId query param for compatibility)
            const params = new URLSearchParams(window.location.search);
            const projectId = params.get('photoId') || params.get('projectId');

            if (projectId) {
                try {
                    const token = auth.getToken();
                    if (!token) return; // Wait for auth or handle redirect

                    const API_URL = process.env.NEXT_PUBLIC_API_URL;
                    const res = await fetch(`${API_URL}/api/photo-projects/${projectId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await res.json();

                    if (data.success) {
                        const p = data.data;
                        setFrameLayout(p.frameLayout);
                        setPhotos(p.projectPhotos.sort((a: any, b: any) => a.slotIndex - b.slotIndex).map((pp: any) => pp.photoUrl));
                        setBackgroundColor(p.backgroundColor || '#FFFFFF');
                        setBackgroundPattern(p.backgroundPatternUrl);
                        setFilterType(p.filterType);
                        setPhotoShape(p.photoShape);
                        setAddDate(p.metadata?.addDate || false);
                        setAddLogo(p.metadata?.addLogo || false);

                        if (p.frameAsset) {
                            setFrameOverlay(p.frameAsset);
                        }

                        if (p.frameAsset) {
                            setFrameOverlay(p.frameAsset);
                        }

                        setDataReady(true);
                        return;
                    }
                } catch (e) {
                    console.error("Failed to load project", e);
                }
            }

            // Fallback to local storage if no project ID
            const savedLayout = localStorage.getItem('selectedFrameLayout');
            const savedPhotos = localStorage.getItem('capturedPhotos');

            if (!savedLayout) {
                router.push('/layout-selection'); // Redirect to layout selection if no layout
                return;
            }

            setFrameLayout(JSON.parse(savedLayout));
            if (savedPhotos) {
                setPhotos(JSON.parse(savedPhotos));
            }
            setDataReady(true);
        };

        loadProject();
        fetchAssets();
    }, [router]);

    const fetchAssets = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL;

            // Fetch frame assets (colors and overlays)
            const framesRes = await fetch(`${API_URL}/api/assets?type=FRAME`);
            const framesData = await framesRes.json();
            if (framesData.success) {
                setFrameAssets(framesData.data);
            }

            // Fetch stickers
            const stickersRes = await fetch(`${API_URL}/api/assets?type=STICKER`);
            const stickersData = await stickersRes.json();
            if (stickersData.success) {
                setStickerAssets(stickersData.data);
            }
        } catch (error) {
            console.error('Error fetching assets:', error);
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

    const previewRef = useRef<HTMLDivElement>(null);

    // ... (existing code)

    const handleSave = async () => {
        if (isSaving || !frameLayout) return;
        setIsSaving(true);
        setSaveText("SAVING TO GALLERY...");

        try {
            const token = auth.getToken();
            if (!token) {
                alert('Please login to save projects');
                router.push('/login');
                return;
            }

            const payload = {
                frameLayoutId: frameLayout.id,
                backgroundColor,
                backgroundPatternUrl: backgroundPattern,
                frameAssetId: frameOverlay?.id,
                filterType,
                photoShape,
                photos: photos.map(url => ({
                    url,
                    // We can add crop/transform data here later if we track it
                })),
                metadata: {
                    addDate,
                    addLogo
                }
            };

            const API_URL = process.env.NEXT_PUBLIC_API_URL;
            const res = await fetch(`${API_URL}/api/photo-projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                alert('Project saved to gallery!');
            } else {
                throw new Error(data.message || 'Failed to save');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save project');
        } finally {
            setIsSavingFinished(true); // Signal completion animation
        }
    };

    const handleDownload = async () => {
        if (!previewRef.current) return;

        setIsSaving(true);
        setSaveText("RENDERING IMAGE...");

        try {
            const dataUrl = await toPng(previewRef.current, {
                cacheBust: true,
                pixelRatio: 2 // Higher quality
            });

            setSaveText("DOWNLOADING FILE...");
            await new Promise(resolve => setTimeout(resolve, 500)); // Give user time to see message

            saveAs(dataUrl, `pojok-foto-${Date.now()}.png`);
        } catch (err) {
            console.error('Download failed:', err);
            alert('Failed to generate image');
        } finally {
            setIsSavingFinished(true); // Signal completion animation
        }
    };

    const handleSlotClick = (index: number) => {
        setActiveSlot(index);
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0 && activeSlot !== null) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    const newPhotos = [...photos];
                    // Ensure array is large enough if filling a later slot first
                    while (newPhotos.length <= activeSlot) {
                        newPhotos.push("");
                    }
                    newPhotos[activeSlot] = e.target.result as string;
                    setPhotos(newPhotos);
                    // Update localStorage
                    localStorage.setItem('capturedPhotos', JSON.stringify(newPhotos));
                }
            };
            reader.readAsDataURL(file);
        }
        // Reset input value to allow selecting same file again
        e.target.value = '';
    };

    const handleRemovePhoto = (index: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering slot click if overlapping
        const newPhotos = [...photos];
        if (index < newPhotos.length) {
            newPhotos[index] = ""; // Clear url
            setPhotos(newPhotos);
            localStorage.setItem('capturedPhotos', JSON.stringify(newPhotos));
        }
    };

    const handleRetake = () => {
        localStorage.removeItem('capturedPhotos');
        router.push('/camera');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            // Use Promise.all for reliable async loading
            Promise.all(Array.from(e.target.files).map(file => {
                return new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target?.result as string);
                    reader.readAsDataURL(file);
                });
            })).then(loadedPhotos => {
                // Limit photos to frame count
                const count = frameLayout?.photoCount || 4;
                const finalPhotos = loadedPhotos.slice(0, count);
                setPhotos(finalPhotos);
                localStorage.setItem('capturedPhotos', JSON.stringify(finalPhotos));
            });
        }
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

    // Safety check separately, though standard flow handles it
    if (!frameLayout) return null;

    // Split frame assets into colors and overlays
    const colorAssets = frameAssets.filter(a => a.colorHex);
    const overlayAssets = frameAssets.filter(a => a.url && a.url !== '');

    return (
        <div className="min-h-[calc(100vh-88px)] lg:h-[calc(100vh-88px)] bg-[#FAFAFA] flex flex-col overflow-visible lg:overflow-hidden">
            <div className="flex-1 flex flex-col lg:flex-row overflow-visible lg:overflow-hidden">
                {/* Preview Area - Left */}
                <div className="flex-1 bg-[#DEDEDE] flex justify-center p-4 lg:p-8 overflow-visible lg:overflow-y-auto">
                    <div className="relative max-w-2xl w-full">
                        <div className="relative " ref={previewRef}>
                            {/* 4-Layer Photostrip Preview (Clean Style) */}
                            <div
                                className="relative bg-white shadow-xl"
                                style={{
                                    paddingBottom: `${(parseInt(frameLayout.aspectRatio.split(':')[1]) / parseInt(frameLayout.aspectRatio.split(':')[0])) * 100}%`,
                                }}
                            >
                                {/* Layer 1: Background */}
                                <div
                                    className="absolute inset-0"
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
                                        className="absolute overflow-hidden group"
                                        style={{
                                            top: `${hole.top}%`,
                                            left: `${hole.left}%`,
                                            width: `${hole.width}%`,
                                            height: `${hole.height}%`,
                                        }}
                                    >
                                        {photos[idx] && photos[idx] !== "" ? (
                                            <div
                                                className="relative w-full h-full"
                                                style={{
                                                    filter: getFilterCSS(filterType),
                                                    clipPath: photoShape === 'ROUNDED_SQUARE' ? 'inset(0 round 5%)' : getClipPath(photoShape),
                                                }}
                                            >
                                                <Image
                                                    src={photos[idx]}
                                                    alt={`Photo ${idx + 1}`}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                                {/* Trash Overlay */}
                                                <button
                                                    onClick={(e) => handleRemovePhoto(idx, e)}
                                                    className="absolute top-2 right-2 bg-white/90 border-2 border-black p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                                                    title="Remove photo"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleSlotClick(idx)}
                                                className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400 gap-2 border-2 border-transparent hover:border-black hover:bg-gray-200 transition-all font-bold text-xs"
                                            >
                                                <ImagePlus className="w-6 h-6" />
                                                <span>Click to Add</span>
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {/* Layer 3: Frame Overlay */}
                                {frameOverlay && frameOverlay.url && (
                                    <div className="absolute inset-0 pointer-events-none">
                                        <Image
                                            src={frameOverlay.url}
                                            alt="Frame overlay"
                                            fill
                                            className="object-contain"
                                            unoptimized
                                        />
                                    </div>
                                )}

                                {/* Layer 4: Text Overlays */}
                                {addDate && (
                                    <div className="absolute bottom-[2%] left-[3%] bg-white/80 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-gray-800 rounded-sm">
                                        {new Date().toLocaleDateString()}
                                    </div>
                                )}
                                {addLogo && (
                                    <div className="absolute bottom-[2%] right-[3%] text-gray-800 px-2 py-0.5 text-[10px] sm:text-xs font-black uppercase tracking-widest opacity-80">
                                        pojokfoto
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editor Panel - Right */}
                <div className="w-full lg:w-96 bg-white border-t-3 lg:border-t-0 lg:border-l-3 border-black flex flex-col shrink-0">
                    {/* Tabs */}
                    <div className="flex border-b-3 border-black">
                        {[
                            { id: 'filter', icon: Wand2, label: 'Filter' },
                            { id: 'frame', icon: FrameIcon, label: 'Frame' },
                            { id: 'sticker', icon: StickerIcon, label: 'Sticker' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 font-bold transition-colors ${activeTab === tab.id
                                    ? 'bg-black text-white'
                                    : 'bg-white text-black hover:bg-[#F0F0F0]'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span className="text-xs uppercase tracking-wider">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 bg-[#FAFAFA] overflow-visible lg:overflow-y-auto min-h-[300px] lg:min-h-0">
                        {activeTab === 'filter' && (
                            <div className="space-y-4">
                                <p className="text-sm font-bold uppercase text-[#B8B8B8]">Filter Effect</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {(['NONE', 'GRAYSCALE', 'SEPIA', 'BRIGHTNESS', 'CONTRAST'] as FilterType[]).map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => setFilterType(filter)}
                                            className={`p-3 border-3 transition-all ${filterType === filter
                                                ? 'border-black bg-black text-white brutal-shadow-sm'
                                                : 'border-[#DEDEDE] bg-white hover:border-black'
                                                }`}
                                        >
                                            <div className="font-bold text-sm uppercase">{filter}</div>
                                        </button>
                                    ))}
                                </div>

                                <p className="text-sm font-bold uppercase text-[#B8B8B8] mt-6">Photo Shape</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {(['SQUARE', 'CIRCLE', 'ROUNDED_SQUARE'] as PhotoShape[]).map((shape) => (
                                        <button
                                            key={shape}
                                            onClick={() => setPhotoShape(shape)}
                                            className={`p-3 border-3 transition-all ${photoShape === shape
                                                ? 'border-black bg-black text-white brutal-shadow-sm'
                                                : 'border-[#DEDEDE] bg-white hover:border-black'
                                                }`}
                                        >
                                            <div className="font-bold text-sm uppercase">{shape.replace('_', ' ')}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'frame' && (
                            <div className="space-y-4">
                                <p className="text-sm font-bold uppercase text-[#B8B8B8]">Background Color</p>

                                {/* Advanced Color Picker */}
                                <div className="flex flex-col gap-4 mb-6">
                                    <div className="w-full">
                                        <HexAlphaColorPicker
                                            color={backgroundColor}
                                            onChange={setBackgroundColor}
                                            style={{ width: '100%', height: '200px' }}
                                        />
                                    </div>

                                    {/* Hex Input & Preview */}
                                    <div className="flex gap-2">
                                        <div className="flex-1 flex items-center border-2 border-black bg-white px-2">
                                            <span className="text-gray-500 font-bold mr-2">#</span>
                                            <HexColorInput
                                                color={backgroundColor}
                                                onChange={setBackgroundColor}
                                                alpha
                                                prefixed={false}
                                                className="w-full py-2 font-bold outline-none uppercase"
                                            />
                                        </div>
                                        <div
                                            className="w-10 h-10 border-2 border-black"
                                            style={{ backgroundColor }}
                                        />
                                    </div>
                                </div>

                                <p className="text-xs font-bold uppercase text-[#B8B8B8] mb-2">Presets</p>
                                <div className="grid grid-cols-5 gap-2">
                                    {colorAssets.map((asset) => (
                                        <button
                                            key={asset.id}
                                            onClick={() => {
                                                setBackgroundColor(asset.colorHex || '#FFFFFF');
                                                setBackgroundPattern(null);
                                            }}
                                            className="aspect-square border-2 border-black brutal-shadow-sm transition-all hover:scale-105"
                                            style={{ backgroundColor: asset.colorHex || '#FFFFFF' }}
                                            title={asset.name}
                                        />
                                    ))}
                                </div>

                                {overlayAssets.length > 0 && (
                                    <>
                                        <p className="text-sm font-bold uppercase text-[#B8B8B8] mt-6">Frame Overlay</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => setFrameOverlay(null)}
                                                className={`p-3 border-3 transition-all ${!frameOverlay
                                                    ? 'border-black bg-black text-white'
                                                    : 'border-[#DEDEDE] bg-white hover:border-black'
                                                    }`}
                                            >
                                                <div className="font-bold text-sm">None</div>
                                            </button>
                                            {overlayAssets.map((asset) => (
                                                <button
                                                    key={asset.id}
                                                    onClick={() => setFrameOverlay(asset)}
                                                    className={`p-3 border-3 transition-all ${frameOverlay?.id === asset.id
                                                        ? 'border-black brutal-shadow-sm'
                                                        : 'border-[#DEDEDE] hover:border-black'
                                                        }`}
                                                >
                                                    <div className="font-bold text-xs">{asset.name}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === 'sticker' && (
                            <div className="text-center py-12 border-3 border-dashed border-[#B8B8B8] bg-white">
                                <StickerIcon className="w-16 h-16 text-[#DEDEDE] mx-auto mb-4" />
                                <p className="text-[#B8B8B8] font-bold uppercase">Coming Soon</p>
                            </div>
                        )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="p-4 bg-white border-t-3 border-black space-y-3">
                        {/* Options */}
                        <div className="flex items-center gap-4 text-sm font-bold">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={addDate}
                                    onChange={(e) => setAddDate(e.target.checked)}
                                    className="w-4 h-4 border-2 border-black"
                                />
                                Add Date
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={addLogo}
                                    onChange={(e) => setAddLogo(e.target.checked)}
                                    className="w-4 h-4 border-2 border-black"
                                />
                                pojokfoto
                            </label>
                        </div>

                        {/* Buttons */}
                        <div className="grid grid-cols-3 gap-2">
                            <Button variant="white" onClick={handleRetake} className="text-xs">
                                <RotateCcw className="w-4 h-4 mr-1" />
                                Retake
                            </Button>
                            <Button variant="white" onClick={handleSave} className="text-xs">
                                <Save className="w-4 h-4 mr-1" />
                                Save
                            </Button>
                            <Button variant="black" onClick={handleDownload} className="text-xs">
                                <Download className="w-4 h-4 mr-1" />
                                Download
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Saving Overlay */}
            {isSaving && (
                <LoadingScreen
                    text={saveText}
                    fullScreen
                    finished={isSavingFinished}
                    onComplete={() => {
                        setIsSaving(false);
                        setIsSavingFinished(false);
                    }}
                />
            )}
            {/* Hidden File Input for Slot Upload */}
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
    );
}

export default function EditorPage() {
    return (
        <Suspense fallback={<LoadingScreen fullScreen text="LOADING EDITOR..." />}>
            <EditorContent />
        </Suspense>
    );
}
