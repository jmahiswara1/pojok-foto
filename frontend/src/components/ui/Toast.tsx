'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
    id: string;
    title: string;
    message?: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (title: string, message?: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context;
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((title: string, message?: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, title, message, type }]);
        
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toast: addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none md:bottom-8 md:right-8 max-w-[calc(100vw-2rem)] w-[350px]">
                {toasts.map(t => (
                    <div 
                        key={t.id} 
                        className={`pointer-events-auto border-3 border-black p-4 shadow-md bg-white animate-in slide-in-from-bottom-5 fade-in flex items-start gap-3
                            ${t.type === 'error' ? 'border-red-600 bg-red-50 text-red-900' : ''}
                            ${t.type === 'success' ? 'border-green-600 bg-green-50 text-green-900' : ''}
                        `}
                    >
                        <div className="mt-0.5 shrink-0">
                            {t.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
                            {t.type === 'info' && <Info className="w-5 h-5 text-black" />}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm uppercase tracking-tight">{t.title}</h4>
                            {t.message && <p className="text-sm mt-1 opacity-90">{t.message}</p>}
                        </div>
                        <button 
                            onClick={() => removeToast(t.id)}
                            className="p-1 hover:bg-black/5 transition-colors border-2 border-transparent hover:border-black"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
