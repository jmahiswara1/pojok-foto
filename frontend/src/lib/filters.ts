import type { FilterConfig } from '@/types';

export function applyFilters(
    canvas: HTMLCanvasElement,
    filterConfig: FilterConfig
): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Apply brightness
    const brightnessFactor = filterConfig.brightness / 100;

    // Apply contrast
    const contrastFactor = (filterConfig.contrast / 100) * 2;
    const intercept = 128 * (1 - contrastFactor);

    // Apply saturation
    const saturationFactor = filterConfig.saturation / 100;

    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Brightness
        r *= brightnessFactor;
        g *= brightnessFactor;
        b *= brightnessFactor;

        // Contrast
        r = r * contrastFactor + intercept;
        g = g * contrastFactor + intercept;
        b = b * contrastFactor + intercept;

        // Saturation
        const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
        r = gray + (r - gray) * saturationFactor;
        g = gray + (g - gray) * saturationFactor;
        b = gray + (b - gray) * saturationFactor;

        // Grayscale
        if (filterConfig.grayscale > 0) {
            const grayValue = 0.299 * r + 0.587 * g + 0.114 * b;
            const grayAmount = filterConfig.grayscale / 100;
            r = r * (1 - grayAmount) + grayValue * grayAmount;
            g = g * (1 - grayAmount) + grayValue * grayAmount;
            b = b * (1 - grayAmount) + grayValue * grayAmount;
        }

        // Sepia
        if (filterConfig.sepia > 0) {
            const sepiaAmount = filterConfig.sepia / 100;
            const tr = 0.393 * r + 0.769 * g + 0.189 * b;
            const tg = 0.349 * r + 0.686 * g + 0.168 * b;
            const tb = 0.272 * r + 0.534 * g + 0.131 * b;
            r = r * (1 - sepiaAmount) + tr * sepiaAmount;
            g = g * (1 - sepiaAmount) + tg * sepiaAmount;
            b = b * (1 - sepiaAmount) + tb * sepiaAmount;
        }

        // Clamp values
        data[i] = Math.max(0, Math.min(255, r));
        data[i + 1] = Math.max(0, Math.min(255, g));
        data[i + 2] = Math.max(0, Math.min(255, b));
    }

    ctx.putImageData(imageData, 0, 0);
}

export function createFilterCSS(config: FilterConfig): string {
    const filters: string[] = [];

    if (config.brightness !== 100) {
        filters.push(`brightness(${config.brightness}%)`);
    }
    if (config.contrast !== 100) {
        filters.push(`contrast(${config.contrast}%)`);
    }
    if (config.saturation !== 100) {
        filters.push(`saturate(${config.saturation}%)`);
    }
    if (config.blur > 0) {
        filters.push(`blur(${config.blur}px)`);
    }
    if (config.grayscale > 0) {
        filters.push(`grayscale(${config.grayscale}%)`);
    }
    if (config.sepia > 0) {
        filters.push(`sepia(${config.sepia}%)`);
    }
    if (config.hueRotate !== 0) {
        filters.push(`hue-rotate(${config.hueRotate}deg)`);
    }

    return filters.length > 0 ? filters.join(' ') : 'none';
}
