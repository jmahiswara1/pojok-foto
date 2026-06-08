import { useState, useEffect } from 'react';
import { HexAlphaColorPicker, HexColorInput } from 'react-colorful';

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

interface FrameTabProps {
    backgroundColor: string;
    setBackgroundColor: (color: string) => void;
    setBackgroundPattern: (pattern: string | null) => void;
    frameOverlay: Asset | null;
    setFrameOverlay: (asset: Asset | null) => void;
    colorAssets: Asset[];
    overlayAssets: Asset[];
}

export function FrameTab({
    backgroundColor,
    setBackgroundColor,
    setBackgroundPattern,
    frameOverlay,
    setFrameOverlay,
    colorAssets,
    overlayAssets
}: FrameTabProps) {
    // Fix Hydration mismatch for react-colorful
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm font-black uppercase text-[#B8B8B8] mb-3">Background Color</p>

                {/* Advanced Color Picker */}
                <div className="flex flex-col gap-4 mb-6">
                    <div className="w-full">
                        {mounted ? (
                            <HexAlphaColorPicker
                                color={backgroundColor}
                                onChange={setBackgroundColor}
                                style={{ width: '100%', height: '180px' }}
                            />
                        ) : (
                            <div className="w-full h-[180px] bg-gray-200 animate-pulse border-2 border-black" />
                        )}
                    </div>

                    {/* Hex Input & Preview */}
                    <div className="flex gap-2">
                        <div className="flex-1 flex items-center border-3 border-black bg-white px-3 shadow-sm">
                            <span className="text-gray-400 font-black mr-2">#</span>
                            <HexColorInput
                                color={backgroundColor}
                                onChange={setBackgroundColor}
                                alpha
                                prefixed={false}
                                className="w-full py-2 font-black outline-none uppercase text-lg"
                            />
                        </div>
                        <div
                            className="w-14 h-14 border-3 border-black shadow-sm"
                            style={{ backgroundColor }}
                        />
                    </div>
                </div>

                <p className="text-xs font-black uppercase text-[#B8B8B8] mb-3">Presets</p>
                <div className="grid grid-cols-5 gap-2">
                    {colorAssets.map((asset) => (
                        <button
                            key={asset.id}
                            onClick={() => {
                                setBackgroundColor(asset.colorHex || '#FFFFFF');
                                setBackgroundPattern(null);
                            }}
                            className="aspect-square border-3 border-black brutal-shadow-sm transition-transform hover:translate-y-[-2px] hover:translate-x-[-2px] active:translate-y-0 active:translate-x-0 active:shadow-none"
                            style={{ backgroundColor: asset.colorHex || '#FFFFFF' }}
                            title={asset.name}
                        />
                    ))}
                </div>
            </div>

            {overlayAssets.length > 0 && (
                <div>
                    <p className="text-sm font-black uppercase text-[#B8B8B8] mb-3">Frame Overlay</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setFrameOverlay(null)}
                            className={`p-3 border-3 transition-all ${!frameOverlay
                                ? 'border-black bg-black text-white brutal-shadow-sm translate-y-[-2px] translate-x-[-2px]'
                                : 'border-black bg-white hover:bg-gray-100'
                                }`}
                        >
                            <div className="font-bold text-sm">None</div>
                        </button>
                        {overlayAssets.map((asset) => (
                            <button
                                key={asset.id}
                                onClick={() => setFrameOverlay(asset)}
                                className={`p-3 border-3 transition-all ${frameOverlay?.id === asset.id
                                    ? 'border-black bg-black text-white brutal-shadow-sm translate-y-[-2px] translate-x-[-2px]'
                                    : 'border-black bg-white hover:bg-gray-100'
                                    }`}
                            >
                                <div className="font-bold text-sm truncate">{asset.name}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
