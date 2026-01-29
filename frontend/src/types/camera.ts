export interface CameraConfig {
    facingMode: 'user' | 'environment';
    width: number;
    height: number;
    aspectRatio?: number;
}

export interface CameraConstraints {
    video: {
        facingMode: string;
        width?: { ideal: number };
        height?: { ideal: number };
        aspectRatio?: { ideal: number };
    };
    audio: false;
}

export interface CameraState {
    isActive: boolean;
    isReady: boolean;
    hasPermission: boolean | null;
    error: string | null;
    stream: MediaStream | null;
}
