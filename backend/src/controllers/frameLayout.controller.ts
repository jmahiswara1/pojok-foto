import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/frame-layouts
 * Get all frame layouts
 */
export const getAllFrameLayouts = async (req: Request, res: Response) => {
    try {
        const { premium, categoryId } = req.query;

        const frameLayouts = await prisma.frameLayout.findMany({
            where: {
                ...(premium !== undefined && { isPremium: premium === 'true' }),
                ...(categoryId && { categoryId: parseInt(categoryId as string) }),
            },
            include: {
                category: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json({
            success: true,
            data: frameLayouts,
        });
    } catch (error) {
        console.error('Error fetching frame layouts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch frame layouts',
        });
    }
};

/**
 * GET /api/frame-layouts/:id
 * Get specific frame layout by ID
 */
export const getFrameLayoutById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const frameLayout = await prisma.frameLayout.findUnique({
            where: { id },
            include: {
                category: true,
            },
        });

        if (!frameLayout) {
            return res.status(404).json({
                success: false,
                message: 'Frame layout not found',
            });
        }

        res.json({
            success: true,
            data: frameLayout,
        });
    } catch (error) {
        console.error('Error fetching frame layout:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch frame layout',
        });
    }
};

/**
 * POST /api/frame-layouts
 * Create new frame layout (Admin only)
 */
export const createFrameLayout = async (req: Request, res: Response) => {
    try {
        const {
            name,
            description,
            thumbnailUrl,
            holesConfig,
            photoCount,
            aspectRatio,
            isPremium,
            categoryId,
        } = req.body;

        // Validate holesConfig is valid JSON array
        if (!Array.isArray(holesConfig)) {
            return res.status(400).json({
                success: false,
                message: 'holesConfig must be an array',
            });
        }

        const frameLayout = await prisma.frameLayout.create({
            data: {
                name,
                description,
                thumbnailUrl,
                holesConfig,
                photoCount,
                aspectRatio,
                isPremium: isPremium || false,
                categoryId: categoryId ? parseInt(categoryId) : null,
            },
        });

        res.status(201).json({
            success: true,
            data: frameLayout,
        });
    } catch (error) {
        console.error('Error creating frame layout:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create frame layout',
        });
    }
};

/**
 * GET /api/assets
 * Get assets by type and category
 */
export const getAssets = async (req: Request, res: Response) => {
    try {
        const { type, categoryId, premium } = req.query;

        const assets = await prisma.asset.findMany({
            where: {
                ...(type && { type: type as any }),
                ...(categoryId && { categoryId: parseInt(categoryId as string) }),
                ...(premium !== undefined && { isPremium: premium === 'true' }),
            },
            include: {
                category: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json({
            success: true,
            data: assets,
        });
    } catch (error) {
        console.error('Error fetching assets:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch assets',
        });
    }
};

/**
 * GET /api/categories
 * Get all categories
 */
export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: {
                id: 'asc',
            },
        });

        res.json({
            success: true,
            data: categories,
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
        });
    }
};
