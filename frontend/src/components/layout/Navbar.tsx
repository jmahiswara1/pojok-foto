'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { LogIn, Menu, X, User as UserIcon, Image as ImageIcon, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth, type User } from '@/lib/auth';

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setUser(auth.getUser());
    }, []);

    const handleLogout = () => {
        auth.logout();
        setUser(null);
        window.location.href = '/';
    };

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/layout-selection', label: 'Camera' },
        { href: '/gallery', label: 'Gallery' },
    ];

    if (!mounted) return (
        <nav className="brutal-navbar h-[88px] flex items-center">
            <div className="brutal-container w-full">
                {/* Skeleton or static navbar to prevent hydration mismatch */}
            </div>
        </nav>
    );

    return (
        <nav className="brutal-navbar h-[88px] flex items-center z-50 relative bg-white">
            <div className="brutal-container w-full">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black tracking-tighter leading-none">POJOK</span>
                            <span className="text-3xl font-black tracking-tighter leading-none text-white" style={{ WebkitTextStroke: '1px black' }}>FOTO</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-bold uppercase tracking-wide hover:bg-black hover:text-white px-4 py-2 transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Auth Section */}
                    <div className="hidden md:block">
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger className="outline-none focus:outline-none">
                                    <Avatar className="h-10 w-10 border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer">
                                        <AvatarImage src={user.profilePic} alt={user.username} />
                                        <AvatarFallback className="font-black text-black">
                                            {user.username?.charAt(0).toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 border-3 border-black bg-white rounded-none mt-2" align="end">
                                    <DropdownMenuLabel className="font-black">My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-black" />
                                    <DropdownMenuGroup>
                                        <Link href="/profile">
                                            <DropdownMenuItem className="cursor-pointer font-bold focus:bg-black focus:text-white rounded-none">
                                                <UserIcon className="mr-2 h-4 w-4" />
                                                <span>Profile</span>
                                            </DropdownMenuItem>
                                        </Link>
                                        <Link href="/gallery">
                                            <DropdownMenuItem className="cursor-pointer font-bold focus:bg-black focus:text-white rounded-none">
                                                <ImageIcon className="mr-2 h-4 w-4" />
                                                <span>Gallery</span>
                                            </DropdownMenuItem>
                                        </Link>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator className="bg-black" />
                                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer font-bold text-red-600 focus:bg-red-600 focus:text-white rounded-none">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button variant="black" asChild>
                                <Link href="/login">
                                    <LogIn className="w-4 h-4" />
                                    Login
                                </Link>
                            </Button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden brutal-button p-2"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-[88px] left-0 w-full bg-white border-b-3 border-black p-4 shadow-lg z-50">
                        <div className="flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-lg font-bold uppercase tracking-wide hover:text-[#B8B8B8] transition-colors py-2"
                                >
                                    {link.label}
                                </Link>
                            ))}

                            {user ? (
                                <>
                                    <div className="h-px bg-black w-full my-2"></div>
                                    <Link
                                        href="/profile"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-lg font-bold uppercase tracking-wide hover:text-[#B8B8B8] transition-colors py-2 flex items-center gap-2"
                                    >
                                        <UserIcon className="w-5 h-5" /> Profile
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="text-lg font-bold uppercase tracking-wide text-red-600 hover:text-red-400 text-left transition-colors py-2 flex items-center gap-2"
                                    >
                                        <LogOut className="w-5 h-5" /> Logout
                                    </button>
                                </>
                            ) : (
                                <Button
                                    variant="black"
                                    fullWidth
                                    asChild
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <Link href="/login">
                                        <LogIn className="w-4 h-4" />
                                        Login
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
