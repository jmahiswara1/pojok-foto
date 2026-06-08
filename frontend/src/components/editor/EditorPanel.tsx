import { useState } from 'react';
import { Wand2, Frame as FrameIcon, Sticker as StickerIcon } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';

interface EditorPanelProps {
    children: (activeTab: 'filter' | 'frame' | 'sticker') => React.ReactNode;
}

export function EditorPanel({ children }: EditorPanelProps) {
    const [activeTab, setActiveTab] = useState<'filter' | 'frame' | 'sticker'>('filter');
    const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

    const tabs = [
        { id: 'filter' as const, icon: Wand2, label: 'Filter' },
        { id: 'frame' as const, icon: FrameIcon, label: 'Frame' },
        { id: 'sticker' as const, icon: StickerIcon, label: 'Sticker' },
    ];

    const handleTabClick = (tabId: 'filter' | 'frame' | 'sticker') => {
        setActiveTab(tabId);
        // On mobile, this will open the sheet
        if (window.innerWidth < 1024) {
            setIsMobileSheetOpen(true);
        }
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex w-96 bg-white border-l-3 border-black flex-col shrink-0 z-10 relative">
                {/* Tabs */}
                <div className="flex border-b-3 border-black bg-white shrink-0">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={`flex-1 flex flex-col items-center justify-center gap-2 py-4 font-black transition-all ${activeTab === tab.id
                                ? 'bg-black text-white'
                                : 'bg-white text-black hover:bg-gray-100 hover:-translate-y-0.5'
                                }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            <span className="text-xs uppercase tracking-wider">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 p-6 bg-[#FAFAFA] overflow-y-auto brutal-scrollbar">
                    {children(activeTab)}
                </div>
            </div>

            {/* Mobile Bottom Bar (Triggers Sheet) */}
            <div className="lg:hidden flex border-t-3 border-black bg-white shrink-0">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className="flex-1 flex flex-col items-center justify-center gap-1 py-3 font-bold transition-all bg-white text-black hover:bg-gray-100 active:bg-gray-200"
                    >
                        <tab.icon className="w-5 h-5" />
                        <span className="text-[10px] uppercase tracking-wider">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Mobile Bottom Sheet */}
            <Sheet
                isOpen={isMobileSheetOpen}
                onClose={() => setIsMobileSheetOpen(false)}
                title={tabs.find(t => t.id === activeTab)?.label || 'Editor'}
            >
                <div className="py-2">
                    {children(activeTab)}
                </div>
            </Sheet>
        </>
    );
}
