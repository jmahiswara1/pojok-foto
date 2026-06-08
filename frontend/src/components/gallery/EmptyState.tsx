import { Camera, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
    onAction: () => void;
}

export function EmptyState({ onAction }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-24 border-4 border-black brutal-shadow bg-white rounded-none">
            <div className="w-24 h-24 bg-[#DEDEDE] border-4 border-black flex items-center justify-center mb-6">
                <ImageOff className="w-12 h-12 text-black" />
            </div>
            <h2 className="text-3xl font-black uppercase mb-4 tracking-tight">No Projects Yet</h2>
            <p className="text-neutral-600 font-bold mb-8 text-center max-w-sm">
                Your gallery is empty. Start a new photo booth session to see your moments here!
            </p>
            <Button onClick={onAction} variant="black" className="text-lg py-6 px-8 shadow-[4px_4px_0px_0px_#B8B8B8] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                <Camera className="w-6 h-6 mr-3" />
                START CAMERA
            </Button>
        </div>
    );
}
