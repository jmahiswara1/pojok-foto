interface CropGuideOverlayProps {
    slotAR: number;
    videoAR: number | null;
}

export function CropGuideOverlay({ slotAR, videoAR }: CropGuideOverlayProps) {
    if (!videoAR) return null;

    // If SlotAR > VideoAR, we are Width-Constrained (touch left/right).
    // If SlotAR < VideoAR, we are Height-Constrained (touch top/bottom).
    const isWiderThanContainer = slotAR > videoAR;

    return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20 overflow-hidden">
            <div
                className="border-2 border-dashed border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] transition-all duration-300 relative"
                style={{
                    aspectRatio: slotAR,
                    width: isWiderThanContainer ? '100%' : 'auto',
                    height: isWiderThanContainer ? 'auto' : '100%',
                    maxWidth: '100%',
                    maxHeight: '100%'
                }}
            >
                {/* Center Crosshair */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 opacity-80">
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white shadow-sm"></div>
                    <div className="absolute left-1/2 top-0 h-full w-[2px] bg-white shadow-sm"></div>
                </div>
            </div>
        </div>
    );
}
