export interface Photo {
    id: string;
    dataUrl: string;
    thumbnail?: string;
    timestamp: number;
    edited: boolean;
    metadata?: PhotoMetadata;
}

export interface PhotoMetadata {
    width?: number;
    height?: number;
    size?: number;
    format?: string;
    layout?: string;
    appliedFilters?: string[];
    appliedFrame?: string;
    appliedStickers?: Sticker[];
    hasText?: boolean;
}

export interface Sticker {
    id: string;
    url: string;
    x: number;
    y: number;
    scale: number;
    rotation: number;
}
