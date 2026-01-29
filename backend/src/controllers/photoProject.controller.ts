import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/photo-projects
 * Create new photo project
 */
export const createPhotoProject = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }

        const {
            frameLayoutId,
            frameAssetId,
            backgroundColor,
            backgroundPatternUrl,
            filterType,
            filterIntensity,
            photoShape,
            metadata,
        } = req.body;

        const photoProject = await prisma.photoProject.create({
            data: {
                userId,
                frameLayoutId,
                frameAssetId: frameAssetId || null,
                backgroundColor: backgroundColor || null,
                backgroundPatternUrl: backgroundPatternUrl || null,
                filterType: filterType || 'NONE',
                filterIntensity: filterIntensity || 1.0,
                photoShape: photoShape || 'SQUARE',
                metadata: metadata || {},
                projectPhotos: {
                    create: (req.body.photos || []).map((photo: any, index: number) => ({
                        photoUrl: photo.url,
                        slotIndex: index, // Assuming order matches slot index for now
                        cropData: photo.cropData || null,
                        transformData: photo.transformData || null,
                    })),
                },
            },
            include: {
                frameLayout: true,
                frameAsset: true,
                projectPhotos: true,
            },
        });

        res.status(201).json({
            success: true,
            data: photoProject,
        });
    } catch (error) {
        console.error('Error creating photo project:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create photo project',
        });
    }
};

/**
 * GET /api/photo-projects/:id
 * Get specific photo project
 */
export const getPhotoProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id;

        const photoProject = await prisma.photoProject.findUnique({
            where: { id },
            include: {
                frameLayout: true,
                frameAsset: true,
                projectPhotos: {
                    orderBy: { slotIndex: 'asc' },
                },
                projectStickers: {
                    include: {
                        stickerAsset: true,
                    },
                },
                projectTexts: true,
            },
        });

        if (!photoProject) {
            return res.status(404).json({
                success: false,
                message: 'Photo project not found',
            });
        }

        // Check ownership
        if (photoProject.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden',
            });
        }

        res.json({
            success: true,
            data: photoProject,
        });
    } catch (error) {
        console.error('Error fetching photo project:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch photo project',
        });
    }
};

/**
 * PUT /api/photo-projects/:id
 * Update photo project
 */
export const updatePhotoProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id;

        // Check ownership
        const existing = await prisma.photoProject.findUnique({
            where: { id },
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Photo project not found',
            });
        }

        if (existing.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden',
            });
        }

        const {
            frameAssetId,
            backgroundColor,
            backgroundPatternUrl,
            filterType,
            filterIntensity,
            photoShape,
            metadata,
        } = req.body;

        const photoProject = await prisma.photoProject.update({
            where: { id },
            data: {
                ...(frameAssetId !== undefined && { frameAssetId }),
                ...(backgroundColor !== undefined && { backgroundColor }),
                ...(backgroundPatternUrl !== undefined && { backgroundPatternUrl }),
                ...(filterType !== undefined && { filterType }),
                ...(filterIntensity !== undefined && { filterIntensity }),
                ...(photoShape !== undefined && { photoShape }),
                ...(metadata !== undefined && { metadata }),
            },
            include: {
                frameLayout: true,
                frameAsset: true,
                projectPhotos: true,
            },
        });

        res.json({
            success: true,
            data: photoProject,
        });
    } catch (error) {
        console.error('Error updating photo project:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update photo project',
        });
    }
};

/**
 * POST /api/photo-projects/:id/photos
 * Add photo to project
 */
export const addProjectPhoto = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { photoUrl, slotIndex, cropData, transformData } = req.body;

        const projectPhoto = await prisma.projectPhoto.create({
            data: {
                projectId: id,
                photoUrl,
                slotIndex,
                cropData: cropData || null,
                transformData: transformData || null,
            },
        });

        res.status(201).json({
            success: true,
            data: projectPhoto,
        });
    } catch (error) {
        console.error('Error adding project photo:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add photo to project',
        });
    }
};

/**
 * POST /api/photo-projects/:id/stickers
 * Add sticker to project
 */
export const addProjectSticker = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { stickerAssetId, position } = req.body;

        const projectSticker = await prisma.projectSticker.create({
            data: {
                projectId: id,
                stickerAssetId,
                position,
            },
            include: {
                stickerAsset: true,
            },
        });

        res.status(201).json({
            success: true,
            data: projectSticker,
        });
    } catch (error) {
        console.error('Error adding project sticker:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add sticker to project',
        });
    }
};

/**
 * POST /api/photo-projects/:id/texts
 * Add text to project
 */
export const addProjectText = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { content, position, style } = req.body;

        const projectText = await prisma.projectText.create({
            data: {
                projectId: id,
                content,
                position,
                style: style || null,
            },
        });

        res.status(201).json({
            success: true,
            data: projectText,
        });
    } catch (error) {
        console.error('Error adding project text:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add text to project',
        });
    }
};

/**
 * DELETE /api/photo-projects/:id
 * Delete photo project
 */
export const deletePhotoProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id;

        // Check ownership
        const existing = await prisma.photoProject.findUnique({
            where: { id },
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Photo project not found',
            });
        }

        if (existing.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden',
            });
        }

        await prisma.photoProject.delete({
            where: { id },
        });

        res.json({
            success: true,
            message: 'Photo project deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting photo project:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete photo project',
        });
    }
};

/**
 * GET /api/photo-projects
 * Get user's photo projects
 */
export const getUserPhotoProjects = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }

        const photoProjects = await prisma.photoProject.findMany({
            where: { userId },
            include: {
                frameLayout: true,
                projectPhotos: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json({
            success: true,
            data: photoProjects,
        });
    } catch (error) {
        console.error('Error fetching photo projects:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch photo projects',
        });
    }
};
