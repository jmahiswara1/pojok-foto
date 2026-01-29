'use client';

import { useCallback } from 'react';

export function usePhotoCapture() {
    const capturePhoto = useCallback(
        (videoElement: HTMLVideoElement, options?: { mirror?: boolean }): string | null => {
            if (!videoElement) return null;

            const canvas = document.createElement('canvas');
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;

            const ctx = canvas.getContext('2d');
            if (!ctx) return null;

            if (options?.mirror) {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }

            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

            return canvas.toDataURL('image/jpeg', 0.95);
        },
        []
    );

    const downloadPhoto = useCallback((dataUrl: string, filename?: string) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename || `pojok-foto-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, []);

    return {
        capturePhoto,
        downloadPhoto,
    };
}
