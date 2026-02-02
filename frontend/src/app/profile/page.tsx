'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User as UserIcon, Lock, Mail } from 'lucide-react';
import { auth, type User } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/Modal';
import Link from 'next/link';
import { ImageCropper } from '@/components/shared/ImageCropper';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
    });
    const [hasPassword, setHasPassword] = useState(false);
    // Password Modal State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    // Image Upload State
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [avatarError, setAvatarError] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            const token = auth.getToken();
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                // Fetch fresh user data from backend
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const userData = await response.json();
                    // Update localStorage with fresh data
                    auth.setSession(token, userData);
                    setUser(userData);
                    setFormData({
                        name: userData.name || '',
                        username: userData.username || '',
                        email: userData.email || '',
                    });
                    setHasPassword(userData.hasPassword || false);
                } else {
                    router.push('/login');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                router.push('/login');
            }
        };

        fetchUserData();
    }, [router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setAvatarError('Image size exceeds 5MB limit.');
                return;
            }
            setAvatarError('');
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setSelectedImage(reader.result as string);
                setShowCropper(true);
            });
            reader.readAsDataURL(file);
        }
        // Reset input value so same file can be selected again if needed
        e.target.value = '';
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        if (!user) return;

        setShowCropper(false);
        const formData = new FormData();
        formData.append('avatar', croppedBlob, 'avatar.jpg');

        try {
            const token = auth.getToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                // Update local user state
                auth.setSession(token!, data.user);
                setUser(data.user);
                // Force reload to update navbar avatar
                window.location.reload();
            } else {
                setAvatarError('Failed to upload avatar.');
            }
        } catch (error) {
            setAvatarError('Error uploading avatar.');
        }
    };

    const handleSave = () => {
        if (user) {
            auth.updateUser({
                name: formData.name,
                username: formData.username
            });
            // Force reload to update navbar or trigger an event if we had a context
            window.location.reload();
        }
    };

    const handlePasswordAction = () => {
        setPasswordError('');
        setPasswordSuccess('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordModal(true);
    };

    const handlePasswordSubmit = async () => {
        setPasswordError('');
        setPasswordSuccess('');

        if (!newPassword) {
            setPasswordError('Please enter a password');
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return;
        }

        if (hasPassword) {
            // User has password - send email verification
            try {
                const token = auth.getToken();
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/request-change-password`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    setPasswordSuccess(data.message);
                    setTimeout(() => {
                        setShowPasswordModal(false);
                    }, 3000);
                } else {
                    setPasswordError(data.message || 'Failed to send verification email');
                }
            } catch (error) {
                setPasswordError('Error sending verification email');
            }
        } else {
            // User doesn't have password (Google OAuth) - set directly
            if (newPassword !== confirmPassword) {
                setPasswordError('Passwords do not match');
                return;
            }

            try {
                const token = auth.getToken();
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/set-password`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ newPassword })
                });

                const data = await response.json();

                if (response.ok) {
                    setPasswordSuccess(data.message);
                    setHasPassword(true);
                    // Update user in localStorage
                    if (user) {
                        auth.updateUser({ hasPassword: true });
                    }
                    setTimeout(() => {
                        setShowPasswordModal(false);
                    }, 2000);
                } else {
                    setPasswordError(data.message || 'Failed to set password');
                }
            } catch (error) {
                setPasswordError('Error setting password');
            }
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-[calc(100vh-88px)] bg-[#FAFAFA] py-12 px-4">
            {showCropper && selectedImage && (
                <ImageCropper
                    imageSrc={selectedImage}
                    onCancel={() => setShowCropper(false)}
                    onCropComplete={handleCropComplete}
                />
            )}

            <div className="brutal-container max-w-2xl mx-auto space-y-8">
                {/* Header with Back Button */}
                <div className="flex items-center gap-4">
                    <Button variant="white" onClick={() => router.push('/')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-4xl font-black uppercase">My Profile</h1>
                </div>

                <div className="grid gap-8">
                    {/* Profile Card */}
                    <Card className="border-3 border-black shadow-[8px_8px_0px_0px_#000]">
                        <CardHeader className="border-b-3 border-black bg-white">
                            <CardTitle className="flex items-center gap-4 text-2xl font-black">
                                <UserIcon className="w-6 h-6" />
                                Personal Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8 bg-white">
                            {/* Avatar Section */}
                            <div className="flex items-center gap-6">
                                <Avatar className="w-24 h-24 border-3 border-black shadow-[4px_4px_0px_0px_#000]">
                                    <AvatarImage src={user.profilePic} />
                                    <AvatarFallback className="font-black text-2xl border-2 border-black">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-2">
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg, image/gif"
                                        className="hidden"
                                        id="avatar-upload"
                                        onChange={handleFileChange}
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => document.getElementById('avatar-upload')?.click()}
                                    >
                                        Change Avatar
                                    </Button>
                                    <p className="text-xs font-bold text-neutral-500 uppercase">
                                        JPG or PNG. Max size 5MB
                                    </p>
                                    {avatarError && <p className="text-xs font-bold text-red-500">{avatarError}</p>}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="fullname">Full Name</Label>
                                    <Input
                                        id="fullname"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] focus-visible:shadow-none transition-all"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] focus-visible:shadow-none transition-all"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            value={formData.email}
                                            disabled
                                            className="font-bold border-2 border-black bg-neutral-100 text-neutral-500"
                                        />
                                        <Lock className="w-4 h-4 absolute right-3 top-3 text-neutral-400" />
                                    </div>
                                    <p className="text-xs font-bold text-neutral-500">
                                        Email cannot be changed. Contact support for assistance.
                                    </p>
                                </div>

                                <Button
                                    className="w-full mt-4"
                                    size="lg"
                                    variant="black"
                                    onClick={handleSave}
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Card */}
                    <Card className="border-3 border-black shadow-[8px_8px_0px_0px_#000]">
                        <CardHeader className="border-b-3 border-black bg-white">
                            <CardTitle className="flex items-center gap-4 text-2xl font-black">
                                <Lock className="w-6 h-6" />
                                Security
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 bg-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-lg">Password</p>
                                    <p className="text-neutral-600 font-medium">
                                        {hasPassword ? 'You have set a password' : 'You have not set a password yet'}
                                    </p>
                                </div>
                                <Button variant="outline" onClick={handlePasswordAction}>
                                    {hasPassword ? 'Change Password' : 'Set Password'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Password Modal */}
            <Modal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                title={hasPassword ? 'Change Password' : 'Set Your Password'}
                size="sm"
            >
                <div className="space-y-6">
                    {hasPassword ? (
                        <div className="space-y-4">
                            <div className="bg-gray-50 border-2 border-gray-400 p-4 rounded-lg">
                                <p className="font-bold text-sm text-black">
                                    Security Verification Required
                                </p>
                                <p className="text-sm text-black mt-2">
                                    For your security, we'll send a verification link to your email.
                                    Click the link to set a new password.
                                </p>
                            </div>

                            {passwordError && (
                                <div className="bg-red-50 border-2 border-red-400 p-4 rounded-lg">
                                    <p className="font-bold text-sm text-red-800">{passwordError}</p>
                                </div>
                            )}

                            {passwordSuccess && (
                                <div className="bg-green-50 border-2 border-green-400 p-4 rounded-lg">
                                    <p className="font-bold text-sm text-green-800">{passwordSuccess}</p>
                                </div>
                            )}

                            <Button
                                className="w-full"
                                variant="black"
                                onClick={handlePasswordSubmit}
                            >
                                Send Verification Email
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-gray-50 border-2 border-gray-400 p-4 rounded-lg">
                                <p className="font-bold text-sm text-black">
                                    Set Your Password
                                </p>
                                <p className="text-sm text-black mt-2">
                                    You logged in with Google. Set a password to enable email login.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="font-bold border-2 border-black"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    className="font-bold border-2 border-black"
                                />
                            </div>

                            {passwordError && (
                                <div className="bg-red-50 border-2 border-red-400 p-4 rounded-lg">
                                    <p className="font-bold text-sm text-red-800">{passwordError}</p>
                                </div>
                            )}

                            {passwordSuccess && (
                                <div className="bg-green-50 border-2 border-green-400 p-4 rounded-lg">
                                    <p className="font-bold text-sm text-green-800">{passwordSuccess}</p>
                                </div>
                            )}

                            <Button
                                className="w-full"
                                variant="black"
                                onClick={handlePasswordSubmit}
                            >
                                Set Password
                            </Button>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
