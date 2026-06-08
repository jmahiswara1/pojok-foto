import { FlipHorizontal, SwitchCamera, Zap, Hand } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CameraControlsProps {
    isMirrored: boolean;
    onToggleMirror: () => void;
    onSwitchCamera: () => void;
    onCapture: () => void;
    isBusy: boolean;
    isComplete: boolean;
    captureMode: 'manual' | 'auto';
    onToggleMode: () => void;
    isAutoCapturing: boolean;
    selectedDelay: number;
    onSelectDelay: (delay: number) => void;
}

export function CameraControls({
    isMirrored,
    onToggleMirror,
    onSwitchCamera,
    onCapture,
    isBusy,
    isComplete,
    captureMode,
    onToggleMode,
    isAutoCapturing,
    selectedDelay,
    onSelectDelay
}: CameraControlsProps) {
    const delays = [0, 3, 5, 10];

    return (
        <div className="absolute bottom-0 left-0 w-full z-30 bg-white border-t-3 border-black pb-[env(safe-area-inset-bottom)]">
            <div className="max-w-md mx-auto w-full p-4 grid grid-cols-3 items-center gap-4">
                
                {/* Left: Tools */}
                <div className="flex flex-col gap-2 items-start">
                    <div className="flex gap-2">
                        <button
                            onClick={onToggleMirror}
                            className={`w-11 h-11 flex items-center justify-center border-2 border-black transition-colors ${isMirrored ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
                            aria-label="Mirror Camera"
                        >
                            <FlipHorizontal className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onSwitchCamera}
                            className="w-11 h-11 flex items-center justify-center border-2 border-black bg-white hover:bg-gray-100 transition-colors"
                            aria-label="Switch Camera"
                        >
                            <SwitchCamera className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Center: Shutter */}
                <div className="flex justify-center">
                    <button
                        onClick={onCapture}
                        disabled={isBusy || isComplete}
                        className={`w-20 h-20 rounded-full border-4 border-black bg-white hover:bg-gray-200 disabled:bg-gray-300 disabled:border-gray-500 transition-all flex items-center justify-center shadow-[0_6px_0_0_#000] active:translate-y-[6px] active:shadow-none disabled:translate-y-0 disabled:shadow-none disabled:cursor-not-allowed ${isAutoCapturing ? 'animate-pulse ring-4 ring-black/20' : ''}`}
                        aria-label={isAutoCapturing ? 'Stop Auto Capture' : 'Capture Photo'}
                    >
                        {isAutoCapturing ? (
                            <div className="text-sm font-black uppercase">STOP</div>
                        ) : (
                            <div className="w-14 h-14 rounded-full bg-black border-2 border-white" />
                        )}
                    </button>
                </div>

                {/* Right: Modes & Delay */}
                <div className="flex flex-col gap-2 items-end">
                    <div className="flex gap-2">
                        <button
                            onClick={onToggleMode}
                            className={`w-11 h-11 flex items-center justify-center border-2 border-black transition-colors ${captureMode === 'auto' ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
                            aria-label={captureMode === 'auto' ? 'Switch to Manual' : 'Switch to Auto'}
                        >
                            {captureMode === 'auto' ? <Zap className="w-5 h-5" /> : <Hand className="w-5 h-5" />}
                        </button>
                    </div>
                    {/* Segmented control for delay, accessible via horizontal scroll on very small screens or grid */}
                    <div className="flex bg-white border-2 border-black rounded-full overflow-hidden">
                        {delays.map(delay => (
                            <button
                                key={delay}
                                onClick={() => onSelectDelay(delay)}
                                className={`px-2 py-1 text-xs font-bold border-r-2 border-black last:border-r-0 transition-colors ${selectedDelay === delay ? 'bg-black text-white' : 'hover:bg-gray-200 text-black'}`}
                                aria-pressed={selectedDelay === delay}
                            >
                                {delay}s
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
