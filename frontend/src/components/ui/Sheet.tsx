'use client';

import { ReactNode, useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface SheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
}

export function Sheet({ isOpen, onClose, title, children }: SheetProps) {
    const [render, setRender] = useState(isOpen);

    useEffect(() => {
        if (isOpen) setRender(true);
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const handleAnimationEnd = () => {
        if (!isOpen) setRender(false);
    };

    if (!render) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden md:hidden">
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />
            
            {/* Bottom Sheet */}
            <div 
                className={`absolute bottom-0 left-0 right-0 max-h-[85vh] bg-white border-t-3 border-black shadow-[0_-6px_0px_0px_#000] flex flex-col transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
                onClick={(e) => e.stopPropagation()}
                onTransitionEnd={handleAnimationEnd}
            >
                {/* Header / Pull Bar */}
                <div className="flex items-center justify-between p-4 border-b-3 border-black bg-white sticky top-0 z-10">
                    <h3 className="font-black text-lg uppercase tracking-tight">{title}</h3>
                    <button 
                        onClick={onClose}
                        className="p-2 border-2 border-black bg-white text-black shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Content */}
                <div className="p-4 overflow-y-auto pb-[env(safe-area-inset-bottom,20px)]">
                    {children}
                </div>
            </div>
        </div>
    );
}
