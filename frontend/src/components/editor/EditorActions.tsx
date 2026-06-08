import { RotateCcw, Save, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EditorActionsProps {
    addDate: boolean;
    setAddDate: (val: boolean) => void;
    addLogo: boolean;
    setAddLogo: (val: boolean) => void;
    onRetake: () => void;
    onSave: () => void;
    onDownload: () => void;
}

export function EditorActions({
    addDate,
    setAddDate,
    addLogo,
    setAddLogo,
    onRetake,
    onSave,
    onDownload
}: EditorActionsProps) {
    return (
        <div className="p-4 bg-white border-t-3 border-black space-y-4 shadow-[0_-4px_0_0_rgba(0,0,0,0.05)] lg:shadow-none">
            {/* Options */}
            <div className="flex items-center gap-6 text-sm font-black uppercase">
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                    <div className="relative flex items-center justify-center w-5 h-5 border-2 border-black bg-white group-hover:bg-gray-100 transition-colors">
                        <input
                            type="checkbox"
                            checked={addDate}
                            onChange={(e) => setAddDate(e.target.checked)}
                            className="absolute opacity-0 w-full h-full cursor-pointer"
                        />
                        {addDate && <div className="w-2.5 h-2.5 bg-black" />}
                    </div>
                    Add Date
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                    <div className="relative flex items-center justify-center w-5 h-5 border-2 border-black bg-white group-hover:bg-gray-100 transition-colors">
                        <input
                            type="checkbox"
                            checked={addLogo}
                            onChange={(e) => setAddLogo(e.target.checked)}
                            className="absolute opacity-0 w-full h-full cursor-pointer"
                        />
                        {addLogo && <div className="w-2.5 h-2.5 bg-black" />}
                    </div>
                    pojokfoto
                </label>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-3 gap-3">
                <Button variant="white" onClick={onRetake} className="text-xs h-12 brutal-shadow-sm">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retake
                </Button>
                <Button variant="white" onClick={onSave} className="text-xs h-12 brutal-shadow-sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                </Button>
                <Button variant="black" onClick={onDownload} className="text-xs h-12 brutal-shadow-sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                </Button>
            </div>
        </div>
    );
}
