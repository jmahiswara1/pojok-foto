'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Invalid reset link. Please request a new password reset.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!newPassword) {
            setError('Please enter a password');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                setError(data.message || 'Failed to reset password');
            }
        } catch (error) {
            setError('Error resetting password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center py-12 px-4">
            <div className="brutal-container max-w-md w-full space-y-8">
                <div className="flex items-center gap-4">
                    <Link href="/login">
                        <Button variant="white" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Login
                        </Button>
                    </Link>
                </div>

                <Card className="border-3 border-black shadow-[8px_8px_0px_0px_#000]">
                    <CardHeader className="border-b-3 border-black bg-white">
                        <CardTitle className="flex items-center gap-4 text-2xl font-black">
                            <Lock className="w-6 h-6" />
                            Reset Password
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 bg-white">
                        {success ? (
                            <div className="space-y-4">
                                <div className="bg-green-50 border-2 border-green-400 p-4 rounded-lg">
                                    <p className="font-bold text-sm text-green-800">
                                        ✅ Password reset successfully!
                                    </p>
                                    <p className="text-sm text-green-700 mt-2">
                                        Redirecting to login page...
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="bg-blue-50 border-2 border-blue-400 p-4 rounded-lg">
                                    <p className="font-bold text-sm text-blue-800">
                                        🔑 Set Your New Password
                                    </p>
                                    <p className="text-sm text-blue-700 mt-2">
                                        Enter a new password for your account.
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
                                        className="font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] focus-visible:shadow-none transition-all"
                                        disabled={loading || !token}
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
                                        className="font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] focus-visible:shadow-none transition-all"
                                        disabled={loading || !token}
                                    />
                                </div>

                                {error && (
                                    <div className="bg-red-50 border-2 border-red-400 p-4 rounded-lg">
                                        <p className="font-bold text-sm text-red-800">{error}</p>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full"
                                    variant="black"
                                    size="lg"
                                    disabled={loading || !token}
                                >
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
