'use client';

import Link from "next/link"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/Button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/Card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { auth } from '@/lib/auth';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        setError('');
        try {
            await auth.login(email, password);
            window.location.href = '/'; // Force reload to update navbar state
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative h-[calc(100vh-88px)] bg-[#FAFAFA] flex items-center justify-center p-4 overflow-hidden">
            <Card className="w-full max-w-md border-3 border-black shadow-[8px_8px_0px_0px_#000]">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-black">Login</CardTitle>
                    <CardDescription className="text-base text-neutral-600 font-bold">
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    {error && (
                        <div className="bg-red-100 border-2 border-red-600 text-red-600 p-3 text-sm font-bold">
                            {error}
                        </div>
                    )}
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link href="#" className="text-sm font-bold text-neutral-500 hover:text-black hover:underline">
                                Forgot your password?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            placeholder="your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button
                        onClick={handleLogin}
                        className="w-full bg-[#3B82F6] text-white hover:bg-[#2563EB] border-2 border-black shadow-[4px_4px_0px_0px_#000]"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full bg-white text-black border-2 border-black shadow-[4px_4px_0px_0px_#000]"
                        onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
                    >
                        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                        </svg>
                        Login with Google
                    </Button>

                    <p className="mt-4 text-center text-sm font-bold text-neutral-600">
                        Don't have an account?{" "}
                        <Link href="/register" className="underline hover:text-black">
                            Sign up
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
