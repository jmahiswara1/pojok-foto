"use client";

import * as React from "react";
import { Progress } from "@/components/ui/progress";

interface LoadingScreenProps {
    progress?: number;
    autoIncrement?: boolean;
    text?: string;
    fullScreen?: boolean;
    className?: string;
    finished?: boolean;
    onComplete?: () => void;
}

export function LoadingScreen({
    progress: initialProgress = 0,
    autoIncrement = true,
    text = "Loading...",
    fullScreen = true,
    className = "",
    finished = false,
    onComplete,
}: LoadingScreenProps) {
    const [progress, setProgress] = React.useState(initialProgress);
    const startTimeRef = React.useRef(Date.now());

    // Separate effect for completion callback to avoid state update warnings
    React.useEffect(() => {
        if (progress >= 100 && onComplete) {
            // Use timeout to ensure it runs after render
            const timer = setTimeout(() => {
                onComplete();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [progress, onComplete]);

    React.useEffect(() => {
        if (!autoIncrement) {
            setProgress(initialProgress);
            return;
        }

        const handleFinish = () => {
            const finishTimer = setInterval(() => {
                setProgress((prev) => {
                    const next = prev + 5;
                    if (next >= 100) {
                        clearInterval(finishTimer);
                        return 100;
                    }
                    return next;
                });
            }, 20);
            return () => clearInterval(finishTimer);
        };

        if (finished) {
            const elapsed = Date.now() - startTimeRef.current;
            const minDuration = 1500; // 1.5 detik minimum
            const remaining = minDuration - elapsed;

            if (remaining > 0) {
                const timeout = setTimeout(() => {
                    handleFinish();
                }, remaining);
                return () => clearTimeout(timeout);
            } else {
                return handleFinish();
            }
        }

        // Logic normal: 0 -> 90% dalam waktu sekitar 1.5 detik (sesuai request)
        const totalSteps = 90;
        const approxTime = 1500; // 1.5 detik
        const intervalTime = 50;
        const incrementPerStep = (totalSteps / (approxTime / intervalTime)) * 2; // Agak lebih cepat di awal

        const interval = setInterval(() => {
            setProgress((prev) => {
                // Stop di 90% kalau belum finished
                if (prev >= 90) return 90;

                // Randomness dikit biar natural
                const diff = (Math.random() * incrementPerStep) + 0.5;
                return Math.min(prev + diff, 90);
            });
        }, intervalTime);

        return () => clearInterval(interval);
    }, [autoIncrement, initialProgress, finished]);

    const content = (
        <div className={`flex flex-col items-center justify-center p-8 space-y-4 w-full max-w-md ${className}`}>
            {/* Header text removed */}
            <Progress value={progress} className="w-[80%] lg:w-[60%]" />
            {/* Percentage text removed */}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-[100] bg-white/30 backdrop-blur-sm flex items-center justify-center">
                {content}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            {content}
        </div>
    );
}
