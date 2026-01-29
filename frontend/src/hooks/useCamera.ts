'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { CameraConfig, CameraState } from '@/types';

const DEFAULT_CONFIG: CameraConfig = {
    facingMode: 'user',
    width: 1280,
    height: 720,
};

export function useCamera(config: CameraConfig = DEFAULT_CONFIG) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [activeFacingMode, setActiveFacingMode] = useState<'user' | 'environment'>(config.facingMode || 'user');
    const [state, setState] = useState<CameraState>({
        isActive: false,
        isReady: false,
        hasPermission: null,
        error: null,
        stream: null,
    });

    const startCamera = useCallback(async () => {
        try {
            setState((prev) => ({ ...prev, error: null }));

            const constraints = {
                video: {
                    facingMode: activeFacingMode,
                    width: { ideal: config.width },
                    height: { ideal: config.height },
                },
                audio: false,
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            setState({
                isActive: true,
                isReady: false,
                hasPermission: true,
                error: null,
                stream,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to access camera';
            setState({
                isActive: false,
                isReady: false,
                hasPermission: false,
                error: errorMessage,
                stream: null,
            });
        }
    }, [config.width, config.height, activeFacingMode]);

    const stopCamera = useCallback(() => {
        if (state.stream) {
            state.stream.getTracks().forEach((track) => track.stop());
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            setState({
                isActive: false,
                isReady: false,
                hasPermission: null,
                error: null,
                stream: null,
            });
        }
    }, [state.stream]);

    const switchCamera = useCallback(() => {
        setActiveFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    }, []);

    // Restart camera when facing mode changes if it was already active
    useEffect(() => {
        if (state.isActive) {
            stopCamera();
            startCamera();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFacingMode]);

    useEffect(() => {
        if (state.stream && videoRef.current) {
            const video = videoRef.current;
            video.srcObject = state.stream;
            video.onloadedmetadata = () => {
                video.play().then(() => {
                    setState((prev) => ({ ...prev, isReady: true }));
                }).catch((e) => {
                    console.error('Error playing video:', e);
                });
            };
        }

        return () => {
            if (state.stream) {
                state.stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [state.stream]);

    return {
        videoRef,
        state,
        activeFacingMode,
        startCamera,
        stopCamera,
        switchCamera,
    };
}
