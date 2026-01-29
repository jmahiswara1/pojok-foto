import type { Photo } from '@/types';

const STORAGE_KEY = 'pojok-foto-gallery';

export const storage = {
    // Get all photos from localStorage
    getAllPhotos(): Photo[] {
        if (typeof window === 'undefined') return [];

        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load photos from storage:', error);
            return [];
        }
    },

    // Save a new photo
    savePhoto(photo: Photo): void {
        try {
            const photos = this.getAllPhotos();
            photos.unshift(photo); // Add to beginning
            localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
        } catch (error) {
            console.error('Failed to save photo:', error);
            throw error;
        }
    },

    // Update an existing photo
    updatePhoto(id: string, updatedPhoto: Partial<Photo>): void {
        try {
            const photos = this.getAllPhotos();
            const index = photos.findIndex((p) => p.id === id);

            if (index !== -1) {
                photos[index] = { ...photos[index], ...updatedPhoto };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
            }
        } catch (error) {
            console.error('Failed to update photo:', error);
            throw error;
        }
    },

    // Delete a photo
    deletePhoto(id: string): void {
        try {
            const photos = this.getAllPhotos();
            const filtered = photos.filter((p) => p.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        } catch (error) {
            console.error('Failed to delete photo:', error);
            throw error;
        }
    },

    // Clear all photos
    clearAll(): void {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Failed to clear storage:', error);
            throw error;
        }
    },

    // Get a single photo by ID
    getPhoto(id: string): Photo | undefined {
        const photos = this.getAllPhotos();
        return photos.find((p) => p.id === id);
    },
};
