interface HoleConfig {
    top: number;
    left: number;
    width: number;
    height: number;
}

export interface FrameLayout {
    id: string;
    name: string;
    description: string;
    thumbnailUrl: string | null;
    holesConfig: HoleConfig[];
    photoCount: number;
    aspectRatio: string;
    isPremium: boolean;
}

interface LayoutPreviewProps {
    layout: FrameLayout;
}

export function LayoutPreview({ layout }: LayoutPreviewProps) {
    return (
        <div className="relative bg-white border-3 border-black brutal-shadow p-6 lg:p-8 flex flex-col items-center h-[60vh] w-[80vw] lg:w-[480px]">
            {/* Layout Name */}
            <div className="text-center mb-4 shrink-0 w-full">
                <h3 className="text-lg lg:text-xl font-black uppercase text-ellipsis overflow-hidden whitespace-nowrap">{layout.name}</h3>
                <div className="flex items-center justify-center gap-2 mt-2 text-xs font-bold">
                    <span className="bg-[#DEDEDE] px-2 py-0.5 border-2 border-black whitespace-nowrap">
                        {layout.photoCount} Photos
                    </span>
                    <span className="bg-[#DEDEDE] px-2 py-0.5 border-2 border-black whitespace-nowrap">
                        {layout.aspectRatio}
                    </span>
                </div>
            </div>

            {/* Frame Preview */}
            <div className="relative flex-1 flex items-center justify-center min-h-0 w-full p-4">
                <div
                    className="relative border-4 border-black bg-[#DEDEDE] shadow-sm transition-all duration-300"
                    style={{
                        aspectRatio: layout.aspectRatio.replace(':', '/'),
                        height: '100%',
                        width: 'auto',
                        maxHeight: '100%',
                        maxWidth: '100%',
                    }}
                >
                    {/* Holes */}
                    {layout.holesConfig.map((hole, idx) => (
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
        </div>
    );
}
