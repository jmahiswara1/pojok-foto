export async function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

export function resizeImage(
    image: HTMLImageElement,
    maxWidth: number,
    maxHeight: number
): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    let width = image.width;
    let height = image.height;

    // Calculate new dimensions while maintaining aspect ratio
    if (width > height) {
        if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
        }
    } else {
        if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
        }
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.drawImage(image, 0, 0, width, height);
    }

    return canvas;
}

export function cropImage(
    image: HTMLImageElement,
    x: number,
    y: number,
    width: number,
    height: number
): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
    }

    return canvas;
}

export function canvasToBlob(
    canvas: HTMLCanvasElement,
    type = 'image/jpeg',
    quality = 0.95
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Canvas to Blob conversion failed'));
            },
            type,
            quality
        );
    });
}

export async function mergeImages(
    baseImage: string,
    overlayImage: string,
    x: number,
    y: number,
    scale = 1
): Promise<string> {
    const base = await loadImage(baseImage);
    const overlay = await loadImage(overlayImage);

    const canvas = document.createElement('canvas');
    canvas.width = base.width;
    canvas.height = base.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    // Draw base image
    ctx.drawImage(base, 0, 0);

    // Draw overlay with scale
    const overlayWidth = overlay.width * scale;
    const overlayHeight = overlay.height * scale;
    ctx.drawImage(overlay, x, y, overlayWidth, overlayHeight);

    return canvas.toDataURL('image/jpeg', 0.95);
}
