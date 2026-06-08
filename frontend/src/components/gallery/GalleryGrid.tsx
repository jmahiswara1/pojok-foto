import { ReactNode } from 'react';

interface GalleryGridProps {
    children: ReactNode;
}

export function GalleryGrid({ children }: GalleryGridProps) {
    return (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {children}
        </div>
    );
}
