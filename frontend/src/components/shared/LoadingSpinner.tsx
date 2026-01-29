'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    text?: string;
    fullScreen?: boolean;
}

export function LoadingSpinner({
    size = 'md',
    text,
    fullScreen = false
}: LoadingSpinnerProps) {
    const sizes = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24',
    };

    const content = (
        <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className={`${sizes[size]} text-indigo-600 dark:text-indigo-400 animate-spin`} />
            {text && (
                <p className="text-gray-600 dark:text-gray-400 font-medium animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center">
                {content}
            </div>
        );
    }

    return content;
}
