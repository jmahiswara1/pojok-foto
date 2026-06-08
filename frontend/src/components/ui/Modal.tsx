'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
    variant?: 'white' | 'black' | 'ash';
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
    variant = 'white',
}: ModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
        full: 'max-w-[95vw] h-[95vh]',
    };

    const variantStyles = {
        white: 'bg-white text-black',
        black: 'bg-black text-white',
        ash: 'bg-[#595959] text-white',
    };

    return (
        <div className="fixed inset-0 z-50 overflow-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-screen items-center justify-center p-4">
                <div
                    className={`relative w-full ${sizes[size]} ${variantStyles[variant]} border-3 border-black shadow-lg animate-in zoom-in-95 fade-in duration-200`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    {(title || showCloseButton) && (
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            {title && (
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {title}
                                </h2>
                            )}
                            {showCloseButton && (
                                <button
                                    onClick={onClose}
                                    className="ml-auto p-2 bg-white text-black border-2 border-black shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                                    aria-label="Close modal"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
