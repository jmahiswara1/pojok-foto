'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/auth';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

function AuthSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    useEffect(() => {
        if (error) {
            router.push(`/login?error=${error}`);
            return;
        }

        if (token) {
            const fetchUser = async () => {
                try {
                    const response = await fetch('http://localhost:5000/api/auth/me', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const user = await response.json();
                        auth.setSession(token, user);
                        // Hard reload to ensure navbar updates
                        window.location.href = '/';
                    } else {
                        router.push('/login?error=fetch_user_failed');
                    }
                } catch (e) {
                    router.push('/login?error=auth_exception');
                }
            };

            fetchUser();
        } else {
            router.push('/login');
        }
    }, [token, error, router]);

    return <LoadingSpinner fullScreen text="Finalizing login..." />;
}

export default function AuthSuccessPage() {
    return (
        <Suspense fallback={<LoadingSpinner fullScreen />}>
            <AuthSuccessContent />
        </Suspense>
    );
}
