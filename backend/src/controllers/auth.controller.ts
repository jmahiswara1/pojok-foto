import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name, username } = req.body;

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username: username || undefined }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User or username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                username
            },
        });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

        res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, username: user.username, profilePic: user.profilePic, hasPassword: true } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

        res.json({ token, user: { id: user.id, email: user.email, name: user.name, username: user.username, profilePic: user.profilePic, hasPassword: !!user.password } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const googleCallback = async (req: Request, res: Response) => {
    // User is attached to req.user by passport
    const user = req.user as any;

    if (!user) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);
};

export const getMe = async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (!user) return res.status(401).send();

    // Include hasPassword flag to help frontend determine UI
    const fullUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!fullUser) return res.status(404).json({ message: 'User not found' });

    res.json({
        id: fullUser.id,
        email: fullUser.email,
        name: fullUser.name,
        username: fullUser.username,
        profilePic: fullUser.profilePic,
        hasPassword: !!fullUser.password
    });
};

import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from '../utils/email';

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // For security, do not reveal if user exists
            return res.json({ message: 'If that email exists, a reset link has been sent.' });
        }

        const resetToken = uuidv4();
        // Token valid for 1 hour
        const resetTokenExpiry = new Date(Date.now() + 3600000);

        await prisma.user.update({
            where: { id: user.id },
            data: { resetToken, resetTokenExpiry },
        });

        const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

        const html = `
            <p>You requested a password reset.</p>
            <p>Click this link to reset your password:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>This link is valid for 1 hour.</p>
        `;

        await sendEmail(user.email, 'Password Reset Request', html);

        res.json({ message: 'If that email exists, a reset link has been sent.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;

        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date(),
                },
            },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });

        res.json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Set password for Google OAuth users (no existing password)
export const setPassword = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Only allow setting password if user doesn't have one (Google OAuth users)
        if (user.password) {
            return res.status(400).json({ message: 'Password already set. Use change password instead.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        res.json({ message: 'Password set successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Request password change (sends email verification)
export const requestChangePassword = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.password) {
            return res.status(400).json({ message: 'No password set. Use set password instead.' });
        }

        const resetToken = uuidv4();
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        await prisma.user.update({
            where: { id: user.id },
            data: { resetToken, resetTokenExpiry },
        });

        const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

        const html = `
            <p>Hi ${user.name},</p>
            <p>You requested to change your password.</p>
            <p>Click this link to set a new password:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>This link is valid for 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
        `;

        await sendEmail(user.email, 'Change Password Request', html);

        res.json({ message: 'Verification email sent. Please check your inbox.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
