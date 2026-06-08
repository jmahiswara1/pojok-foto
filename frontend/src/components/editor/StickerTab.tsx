import { Sticker as StickerIcon } from 'lucide-react';
import Image from 'next/image';

interface Asset {
    id: string;
    name: string;
    url: string;
    [key: string]: any;
}

interface StickerTabProps {
    stickerAssets: Asset[];
    onAddSticker: (asset: Asset) => void;
}

export function StickerTab({ stickerAssets, onAddSticker }: StickerTabProps) {
    if (stickerAssets.length === 0) {
        return (
            <div className="text-center py-12 border-3 border-dashed border-[#B8B8B8] bg-white">
                <StickerIcon className="w-16 h-16 text-[#DEDEDE] mx-auto mb-4" />
                <p className="text-[#B8B8B8] font-black uppercase tracking-widest">No Stickers Available</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-sm font-black uppercase text-[#B8B8B8] mb-3">Choose Sticker</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {stickerAssets.map((asset) => (
                    <button
                        key={asset.id}
                        onClick={() => onAddSticker(asset)}
                        className="relative aspect-square border-3 border-black bg-white brutal-shadow-sm transition-transform hover:translate-y-[-2px] hover:translate-x-[-2px] active:translate-y-0 active:translate-x-0 active:shadow-none p-2 flex items-center justify-center group"
                        title={asset.name}
                    >
                        {asset.url ? (
                            <Image
                                src={asset.url}
                                alt={asset.name}
                                fill
                                className="object-contain p-2 group-hover:scale-110 transition-transform"
                                unoptimized
                            />
                        ) : (
                            <span className="text-xs font-bold text-gray-400">?</span>
                        )}
                    </button>
                ))}
            </div>
            <p className="text-xs text-[#B8B8B8] font-bold text-center mt-4">
                Click a sticker to add. Drag to move, click to remove.
            </p>
        </div>
    );
}
