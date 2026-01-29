import { Frame } from '@/types';

export const FRAMES: Frame[] = [
    {
        id: 'none',
        name: 'No Frame',
        url: '',
        thumbnail: '/images/no-frame.png',
        category: 'classic',
    },
    {
        id: 'classic-1',
        name: 'Classic Frame',
        url: '/frames/classic.png',
        thumbnail: '/frames/classic-thumb.png',
        category: 'classic',
    },
    {
        id: 'vintage-1',
        name: 'Vintage Frame',
        url: '/frames/vintage.png',
        thumbnail: '/frames/vintage-thumb.png',
        category: 'vintage',
    },
    {
        id: 'modern-1',
        name: 'Modern Frame',
        url: '/frames/modern.png',
        thumbnail: '/frames/modern-thumb.png',
        category: 'modern',
    },
    {
        id: 'polaroid',
        name: 'Polaroid',
        url: '/frames/polaroid.png',
        thumbnail: '/frames/polaroid-thumb.png',
        category: 'vintage',
    },
    {
        id: 'film-strip',
        name: 'Film Strip',
        url: '/frames/film-strip.png',
        thumbnail: '/frames/film-strip-thumb.png',
        category: 'vintage',
    },
];
