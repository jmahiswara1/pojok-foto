export function CountdownOverlay({ countdown }: { countdown: number | null }) {
    if (countdown === null) return null;

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-30 pointer-events-none">
            <div className="text-white text-9xl font-black animate-pulse drop-shadow-2xl">
                {countdown}
            </div>
        </div>
    );
}
