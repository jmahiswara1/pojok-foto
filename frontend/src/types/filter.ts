export interface Filter {
    id: string;
    name: string;
    cssFilter?: string;
    canvasFilter?: (imageData: ImageData) => ImageData;
    preview: string;
}

export interface FilterConfig {
    brightness: number;
    contrast: number;
    saturation: number;
    blur: number;
    grayscale: number;
    sepia: number;
    hueRotate: number;
}

export interface Frame {
    id: string;
    name: string;
    url: string;
    thumbnail: string;
    category: 'classic' | 'modern' | 'vintage' | 'fun';
}

export interface TextOverlay {
    id: string;
    text: string;
    x: number;
    y: number;
    fontSize: number;
    fontFamily: string;
    color: string;
    rotation: number;
    shadow?: boolean;
}
