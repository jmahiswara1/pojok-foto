'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import { useToast } from '@/components/ui';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import { auth } from '@/lib/auth';

// Components
import {
    PhotostripPreview,
    EditorPanel,
    FilterTab,
    FrameTab,
    StickerTab,
    EditorActions
} from '@/components/editor';

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
    const { toast } = useToast();

    const [frameLayout, setFrameLayout] = useState<FrameLayout | null>(null);
    const [photos, setPhotos] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [dataReady, setDataReady] = useState(false);

    // Per-slot upload state
    const [activeSlot, setActiveSlot] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    const [isSaving, setIsSaving] = useState(false);
    const [isSavingFinished, setIsSavingFinished] = useState(false);
    const [saveText, setSaveText] = useState("SAVING PROJECT...");

    // Editor state
    const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
    const [backgroundPattern, setBackgroundPattern] = useState<string | null>(null);
    const [frameOverlay, setFrameOverlay] = useState<Asset | null>(null);
    const [filterType, setFilterType] = useState<FilterType>('NONE');
    const [photoShape, setPhotoShape] = useState<PhotoShape>('SQUARE');

    // Database assets
    const [frameAssets, setFrameAssets] = useState<Asset[]>([]);
    const [stickerAssets, setStickerAssets] = useState<Asset[]>([]);

    // Options
    const [addDate, setAddDate] = useState(false);
    const [addLogo, setAddLogo] = useState(false);

    // Stickers state
    const [placedStickers, setPlacedStickers] = useState<any[]>([]);

    useEffect(() => {
        const loadProject = async () => {
            const params = new URLSearchParams(window.location.search);
            const projectId = params.get('photoId') || params.get('projectId');

            if (projectId) {
                try {
                    const token = auth.getToken();
                    if (!token) return; // Wait for auth or handle redirect

                    const API_URL = process.env.NEXT_PUBLIC_API_URL;
                    const res = await fetch(`${API_URL}/photo-projects/${projectId}`, {
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

                        if (p.metadata?.placedStickers) {
                            setPlacedStickers(p.metadata.placedStickers);
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
            const framesRes = await fetch(`${API_URL}/assets?type=FRAME`);
            const framesData = await framesRes.json();
            if (framesData.success) {
                setFrameAssets(framesData.data);
            }

            // Fetch stickers
            const stickersRes = await fetch(`${API_URL}/assets?type=STICKER`);
            const stickersData = await stickersRes.json();
            if (stickersData.success) {
                setStickerAssets(stickersData.data);
            }
        } catch (error) {
            console.error('Error fetching assets:', error);
        }
    };

    const handleSave = async () => {
        if (isSaving || !frameLayout) return;
        setIsSaving(true);
        setSaveText("SAVING TO GALLERY...");

        try {
            const token = auth.getToken();
            if (!token) {
                toast('Info', 'Please login to save projects', 'info');
                // Don't clear localstorage here! So when they login they keep the state
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
                })),
                metadata: {
                    addDate,
                    addLogo,
                    placedStickers
                }
            };

            const API_URL = process.env.NEXT_PUBLIC_API_URL;
            const res = await fetch(`${API_URL}/photo-projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                toast('Success', 'Project saved to gallery!', 'success');
                // Only clear state if save succeeds
                localStorage.removeItem('capturedPhotos');
                router.push('/gallery');
            } else {
                throw new Error(data.message || 'Failed to save');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast('Error', 'Failed to save project', 'error');
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
            toast('Success', 'Image downloaded successfully', 'success');
        } catch (err) {
            console.error('Download failed:', err);
            toast('Error', 'Failed to generate image', 'error');
        } finally {
            setIsSavingFinished(true); // Signal completion animation
        }
    };

    const handleAddSticker = (asset: any) => {
        const newSticker = {
            id: `sticker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            url: asset.url,
            x: 50, // Center X
            y: 50, // Center Y
            scale: 1,
            rotation: 0
        };
        setPlacedStickers([...placedStickers, newSticker]);
    };

    const handleUpdateSticker = (id: string, updates: any) => {
        setPlacedStickers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const handleRemoveSticker = (id: string) => {
        setPlacedStickers(prev => prev.filter(s => s.id !== id));
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
                    localStorage.setItem('capturedPhotos', JSON.stringify(newPhotos));
                }
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleRemovePhoto = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const newPhotos = [...photos];
        if (index < newPhotos.length) {
            newPhotos[index] = "";
            setPhotos(newPhotos);
            localStorage.setItem('capturedPhotos', JSON.stringify(newPhotos));
        }
    };

    const handleRetake = () => {
        localStorage.removeItem('capturedPhotos');
        router.push('/camera');
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

    if (!frameLayout) return null;

    const colorAssets = frameAssets.filter(a => a.colorHex);
    const overlayAssets = frameAssets.filter(a => a.url && a.url !== '');

    return (
        <div className="h-[100dvh] lg:h-[calc(100vh-88px)] bg-[#FAFAFA] flex flex-col overflow-hidden relative">
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 w-full relative">
                
                {/* Back Button (Desktop top-left, Mobile top-left) */}
                <button
                    onClick={() => router.push('/camera')}
                    className="absolute top-4 left-4 z-40 w-12 h-12 bg-white rounded-full flex items-center justify-center text-black border-2 border-black hover:scale-105 transition-transform shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                    title="Back to Camera"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>

                {/* Preview Area - Left */}
                <div className="flex-1 bg-[#DEDEDE] flex flex-col items-center p-4 pt-20 lg:p-8 overflow-y-auto brutal-scrollbar pb-[180px] lg:pb-8">
                    <div className="max-w-md w-full my-auto">
                        <PhotostripPreview
                            ref={previewRef}
                            frameLayout={frameLayout}
                            photos={photos}
                            backgroundColor={backgroundColor}
                            backgroundPattern={backgroundPattern}
                            frameOverlay={frameOverlay}
                            filterType={filterType}
                            photoShape={photoShape}
                            addDate={addDate}
                            addLogo={addLogo}
                            placedStickers={placedStickers}
                            onSlotClick={handleSlotClick}
                            onRemovePhoto={handleRemovePhoto}
                            onUpdateSticker={handleUpdateSticker}
                            onRemoveSticker={handleRemoveSticker}
                        />
                    </div>
                </div>

                {/* Editor Panel - Right (Desktop) / Bottom Sheet (Mobile) */}
                <EditorPanel>
                    {(activeTab) => (
                        <>
                            {activeTab === 'filter' && (
                                <FilterTab
                                    filterType={filterType}
                                    setFilterType={setFilterType}
                                    photoShape={photoShape}
                                    setPhotoShape={setPhotoShape}
                                />
                            )}
                            {activeTab === 'frame' && (
                                <FrameTab
                                    backgroundColor={backgroundColor}
                                    setBackgroundColor={setBackgroundColor}
                                    setBackgroundPattern={setBackgroundPattern}
                                    frameOverlay={frameOverlay}
                                    setFrameOverlay={setFrameOverlay}
                                    colorAssets={colorAssets}
                                    overlayAssets={overlayAssets}
                                />
                            )}
                            {activeTab === 'sticker' && (
                                <StickerTab 
                                    stickerAssets={stickerAssets}
                                    onAddSticker={handleAddSticker}
                                />
                            )}
                        </>
                    )}
                </EditorPanel>

                {/* Desktop Editor Actions (Inside Sidebar) */}
                <div className="hidden lg:block w-96 border-t-3 border-l-3 border-black bg-white shrink-0 absolute bottom-0 right-0 z-20">
                    <EditorActions
                        addDate={addDate}
                        setAddDate={setAddDate}
                        addLogo={addLogo}
                        setAddLogo={setAddLogo}
                        onRetake={handleRetake}
                        onSave={handleSave}
                        onDownload={handleDownload}
                    />
                </div>
            </div>

            {/* Mobile Editor Actions (Floats above bottom bar) */}
            <div className="lg:hidden absolute bottom-[72px] left-0 w-full z-20 pointer-events-none px-4 pb-4">
                <div className="pointer-events-auto">
                    <EditorActions
                        addDate={addDate}
                        setAddDate={setAddDate}
                        addLogo={addLogo}
                        setAddLogo={setAddLogo}
                        onRetake={handleRetake}
                        onSave={handleSave}
                        onDownload={handleDownload}
                    />
                </div>
            </div>

            {/* Saving Overlay */}
            {isSaving && (
                <div className="absolute inset-0 z-50">
                    <LoadingScreen
                        text={saveText}
                        fullScreen
                        finished={isSavingFinished}
                        onComplete={() => {
                            setIsSaving(false);
                            setIsSavingFinished(false);
                        }}
                    />
                </div>
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
