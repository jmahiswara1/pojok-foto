'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="hw-screen bg-[#FAFAFA] flex flex-col">
            <main className="flex-grow flex items-center justify-center p-4 mt-20">
                <div className="bg-white border-3 border-black brutal-shadow p-8 md:p-12 max-w-lg w-full text-center">
                    <h1 className="text-8xl md:text-9xl font-black mb-4 select-none">404</h1>
                    <div className="h-1 bg-black w-full mb-6"></div>
                    <h2 className="text-2xl md:text-3xl font-black uppercase mb-4">Page Not Found</h2>
                    <p className="text-neutral-600 font-bold mb-8">
                        The page you are looking for has been moved, deleted, or possibly never existed.
                    </p>
                    <br />
                    <Link href="/">
                        <Button variant="black" className="w-full py-4 text-lg">
                            <Home className="w-5 h-5 mr-2" />
                            BACK TO HOME
                        </Button>
                    </Link>
                </div>
            </main>
        </div>
    );
}
