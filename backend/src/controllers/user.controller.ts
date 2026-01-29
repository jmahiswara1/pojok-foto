import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/database';

interface AuthRequest extends Request {
    user?: any;
}

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const { name, profilePic } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { name, profilePic },
        });

        res.json({ message: 'Profile updated', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error });
    }
};

export const updatePassword = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const { newPassword, oldPassword } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // If user has a password, verify old password
        if (user.password) {
            if (!oldPassword) {
                return res.status(400).json({ message: "Old password required" });
            }
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Incorrect old password" });
            }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating password', error });
    }
};

export const updateAvatar = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const userId = req.user.id;
        // Construct full URL
        const profilePic = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { profilePic },
        });

        res.json({ message: 'Avatar updated', user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating avatar', error });
    }
};
