import { Filter } from '@/types';

export const FILTERS: Filter[] = [
    {
        id: 'none',
        name: 'Original',
        cssFilter: 'none',
        preview: '/images/filter-none.jpg',
    },
    {
        id: 'grayscale',
        name: 'Grayscale',
        cssFilter: 'grayscale(100%)',
        preview: '/images/filter-grayscale.jpg',
    },
    {
        id: 'sepia',
        name: 'Sepia',
        cssFilter: 'sepia(100%)',
        preview: '/images/filter-sepia.jpg',
    },
    {
        id: 'vintage',
        name: 'Vintage',
        cssFilter: 'sepia(50%) contrast(1.2) brightness(0.9)',
        preview: '/images/filter-vintage.jpg',
    },
    {
        id: 'warm',
        name: 'Warm',
        cssFilter: 'saturate(1.4) hue-rotate(-15deg) brightness(1.1)',
        preview: '/images/filter-warm.jpg',
    },
    {
        id: 'cool',
        name: 'Cool',
        cssFilter: 'saturate(1.2) hue-rotate(15deg) brightness(0.95)',
        preview: '/images/filter-cool.jpg',
    },
    {
        id: 'vivid',
        name: 'Vivid',
        cssFilter: 'saturate(1.8) contrast(1.3)',
        preview: '/images/filter-vivid.jpg',
    },
    {
        id: 'dramatic',
        name: 'Dramatic',
        cssFilter: 'contrast(1.5) brightness(0.8) saturate(1.2)',
        preview: '/images/filter-dramatic.jpg',
    },
    {
        id: 'soft',
        name: 'Soft',
        cssFilter: 'brightness(1.1) contrast(0.9) saturate(0.8)',
        preview: '/images/filter-soft.jpg',
    },
];

export const DEFAULT_FILTER_CONFIG = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    hueRotate: 0,
};
