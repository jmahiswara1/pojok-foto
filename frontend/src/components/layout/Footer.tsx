'use client';

import Link from 'next/link';
import { Camera, Github, Instagram, Mail, ArrowUpRight } from 'lucide-react';

export function Footer() {
    const currentYear = new Date().getFullYear();

    const navLinks = [
        { label: 'Home', href: '/' },
        { label: 'Camera', href: '/layout-selection' },
        { label: 'Gallery', href: '/gallery' },
        { label: 'Editor', href: '/layout-selection' },
        { label: 'Profile', href: '/profile' },
    ];

    const socialLinks = [
        { icon: <Github className="w-6 h-6" />, href: 'https://github.com/jmahiswara1', label: 'GitHub' },
        { icon: <Mail className="w-6 h-6" />, href: 'mailto:[gadangjatumahiswara@gmail.com]', label: 'Email' },
        { icon: <Instagram className="w-6 h-6" />, href: 'https://www.instagram.com/j.mahiswara_/', label: 'Instagram' },
    ];

    return (
        <footer className="pt-20 pb-10 px-4 max-w-[1400px] mx-auto">
            <div className="flex flex-col gap-6">

                {/* Top Row */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Brand Box */}
                    <div className="lg:col-span-1 bg-white border-3 border-black shadow-[6px_6px_0px_0px_#000] p-8 min-h-[200px] flex flex-col justify-between group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_#000] transition-all">
                        <Camera className="w-12 h-12 stroke-[2.5px]" />
                        <div>
                            <h2 className="text-4xl font-black uppercase leading-none mb-1">PJK</h2>
                            <h2 className="text-4xl font-black uppercase leading-none">FOTO</h2>
                        </div>
                    </div>

                    {/* Slogan Box */}
                    <div className="lg:col-span-3 bg-[#FAFAFA] border-3 border-black shadow-[6px_6px_0px_0px_#000] p-8 md:p-12 flex items-center justify-center text-center hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_#000] transition-all">
                        <h3 className="text-xl md:text-3xl lg:text-4xl font-bold leading-tight max-w-3xl">
                            TURNING YOUR <span className="bg-black text-white px-2 py-1 mx-1">MOMENTS</span> INTO
                            TIMELESS <span className="underline decoration-4 underline-offset-4 decoration-black">MEMORIES</span>.
                        </h3>
                    </div>
                </div>

                {/* Middle Row */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Contact / Action Box */}
                    <Link href="/layout-selection" className="lg:col-span-3 block group">
                        <div className="bg-white border-3 border-black shadow-[6px_6px_0px_0px_#000] p-8 h-full flex items-center justify-between hover:bg-black hover:text-white transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <span className="text-xl md:text-2xl font-black uppercase tracking-wider">Start Creating Now</span>
                                <div className="hidden md:block w-12 h-[3px] bg-current"></div>
                            </div>
                            <ArrowUpRight className="w-10 h-10 md:w-16 md:h-16 group-hover:rotate-45 transition-transform duration-300" />
                        </div>
                    </Link>

                    {/* Socials Box */}
                    <div className="lg:col-span-1 bg-white border-3 border-black shadow-[6px_6px_0px_0px_#000] p-8 flex items-center justify-center gap-6 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_#000] transition-all">
                        {socialLinks.map((social) => (
                            <a
                                key={social.label}
                                href={social.href}
                                aria-label={social.label}
                                className="p-3 border-2 border-transparent hover:border-black hover:bg-black hover:text-white transition-all rounded-full"
                            >
                                {social.icon}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Bottom Row - Navigation */}
                <div className="bg-white border-3 border-black shadow-[6px_6px_0px_0px_#000] py-6 px-4 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_#000] transition-all">
                    <ul className="flex flex-wrap justify-between items-center gap-4 md:gap-8 max-w-6xl mx-auto">
                        {navLinks.map((link) => (
                            <li key={link.label} className="flex-grow text-center">
                                <Link
                                    href={link.href}
                                    className="text-sm md:text-lg font-bold uppercase tracking-widest hover:bg-black hover:text-white px-4 py-2 transition-colors inline-block w-full md:w-auto"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Copyright Row */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-wider text-neutral-500 px-2">
                    <p>© {currentYear} POJOKFOTO LLC</p>
                    <div className="flex gap-6">
                        <Link href="/error" className="hover:text-black">Privacy Policy</Link>
                        <Link href="/error" className="hover:text-black">Terms & Conditions</Link>
                    </div>
                </div>

            </div>
        </footer>
    );
}
