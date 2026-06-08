'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Camera, ArrowRight, Wand2, Image as ImageIcon, ArrowUpRight } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import Marquee from "@/components/ui/marquee";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ScrollToTop } from '@/components/ui/ScrollToTop';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">


      <main className="flex-grow">
        {/* Hero Section */}
        {/* Hero Section Wrapper */}
        <div className="min-h-[calc(100vh-88px)] flex flex-col">
          <section className="brutal-container flex-grow flex items-center pt-8 pb-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
              {/* Left Content */}
              <div className="space-y-8">
                <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tight">
                  CAPTURE
                  <br />
                  <span className="text-white bg-black px-4 ml-[-1rem] shadow-[8px_8px_0px_0px_#B8B8B8]">REAL</span>
                  <br />
                  MOMENTS
                </h1>

                <p className="text-xl md:text-2xl font-bold text-neutral-600 max-w-md leading-relaxed border-l-4 border-black pl-6">
                  Your personal photo booth studio directly in the browser.
                </p>

                <div className="pt-4">
                  <Link
                    href="/layout-selection"
                    className="group inline-flex items-center gap-3 bg-white text-black text-xl font-bold border-3 border-black px-8 py-4 shadow-[6px_6px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] transition-all"
                  >
                    START NOW
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Right Visual - PJK FOTO Branding */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative w-80 h-80 md:w-96 md:h-96 bg-white border-3 border-black shadow-[12px_12px_0px_0px_#000] p-8 flex flex-col justify-between hover:rotate-2 transition-transform duration-500 cursor-default group">
                  <div className="flex justify-between items-start">
                    <div className="w-20 h-20 bg-black flex items-center justify-center border-2 border-transparent group-hover:bg-white group-hover:border-black transition-colors">
                      <Camera className="w-10 h-10 text-white group-hover:text-black transition-colors" />
                    </div>
                    <div className="w-4 h-4 rounded-full bg-black"></div>
                  </div>

                  <div className="text-right space-y-2">
                    <h2 className="text-7xl md:text-8xl font-black leading-none tracking-tighter">POJOK</h2>
                    <h2 className="text-7xl md:text-8xl font-black leading-none tracking-tighter">FOTO</h2>
                  </div>

                  {/* Decorative corner */}
                  <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-black" />
                  <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-black" />
                </div>
              </div>
            </div>
          </section>

          {/* Marquee Strip */}
          <div className="transform -rotate-1 mb-5 mt-15">
            <Marquee items={["DOWNLOAD", "FRAME", "FILTER", "PHOTOBOOTH", "CAMERA", "EDITOR"]} />
          </div>
        </div>

        {/* Features Section (3 Cards) */}
        <section className="brutal-container py-32">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 mt-10 gap-4">
            <h2 className="text-5xl font-black uppercase">Our Tools</h2>
            <p className="text-lg font-bold border-b-4 border-black pb-1">Everything you need to create.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1: Camera */}
            <Link href="/layout-selection" className="group h-full">
              <div className="h-full bg-white border-3 border-black p-8 shadow-[8px_8px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_#000] transition-all duration-300 flex flex-col">
                <div className="w-16 h-16 bg-[#DEDEDE] border-3 border-black flex items-center justify-center mb-8 group-hover:bg-white transition-colors">
                  <Camera className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-3xl font-black uppercase mb-4 text-black">Camera</h3>
                <p className="font-medium text-neutral-600 mb-8 flex-grow">
                  High-quality capture directly from your browser with zero latency.
                </p>
                <div className="flex items-center gap-2 font-black uppercase tracking-wide group-hover:gap-4 transition-all">
                  Open Camera <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                </div>
              </div>
            </Link>


            {/* Card 2: Gallery */}
            <Link href="/gallery" className="group h-full">
              <div className="h-full bg-white border-3 border-black p-8 shadow-[8px_8px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_#000] transition-all duration-300 flex flex-col">
                <div className="w-16 h-16 bg-[#DEDEDE] border-3 border-black flex items-center justify-center mb-8 group-hover:bg-white transition-colors">
                  <ImageIcon className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-3xl font-black uppercase mb-4 text-black">Gallery</h3>
                <p className="font-medium text-neutral-600 mb-8 flex-grow">
                  Store your sessions locally and download them whenever you want.
                </p>
                <div className="flex items-center gap-2 font-black uppercase tracking-wide group-hover:gap-4 transition-all">
                  View Album <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Card 3: Editor */}
            <Link href="/layout-selection" className="group h-full">
              <div className="h-full bg-white border-3 border-black p-8 shadow-[8px_8px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_#000] transition-all duration-300 flex flex-col">
                <div className="w-16 h-16 bg-[#DEDEDE] border-3 border-black flex items-center justify-center mb-8 group-hover:bg-white transition-colors">
                  <Wand2 className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-3xl font-black uppercase mb-4 text-black">Editor</h3>
                <p className="font-medium text-neutral-600 mb-8 flex-grow">
                  Apply unique neobrutalist frames, filters, and stickers to your shots.
                </p>
                <div className="flex items-center gap-2 font-black uppercase tracking-wide group-hover:gap-4 transition-all">
                  Edit Photo <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </section>

        <div className="h-32 w-full"></div>

        {/* About Section */}
        <section className="brutal-container mt-32 py-32 border-black">
          <div className="mb-10 border-t-3 border-black"></div>
          <div className="grid lg:grid-cols-3 gap-16">
            <div className="lg:col-span-1">
              <h2 className="text-5xl md:text-6xl font-black uppercase sticky top-32 leading-[0.9]">
                WHY <br />PJK<br />
                <span className="text-transparent outline-text-black">FOTO?</span>

              </h2>
            </div>

            <div className="lg:col-span-2 space-y-8 text-lg md:text-xl text-justify font-medium leading-relaxed">
              <p>
                PojokFoto started as a small passion project by <HoverCard openDelay={200}>
                  <HoverCardTrigger asChild>
                    <a href="https://gadangmahiswara.vercel.app" target="_blank" className="relative group inline-block font-black underline decoration-4 underline-offset-4 decoration-black hover:bg-black hover:text-white hover:decoration-white transition-colors cursor-pointer px-1">
                      GADANG MAHISWARA
                    </a>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 bg-white border-3 border-black shadow-[8px_8px_0px_0px_#000] p-2 rotate-2 rounded-none z-[999]" side="top">
                    <a href="https://gadangmahiswara.vercel.app" target="_blank" className="block cursor-pointer">
                      <div className="relative w-full aspect-video h-44 border-2 border-black bg-neutral-200">
                        <Image
                          src="/preview-porto.png"
                          alt="Portfolio Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="block mt-2 text-center text-xs font-bold uppercase tracking-widest bg-black text-white py-1">Visit Portfolio ↗</span>
                    </a>
                  </HoverCardContent>
                </HoverCard>, built from a simple idea. I noticed my girlfriend wanted an easy, aesthetic way to capture our moments together, without the clutter and complexity of typical photo apps.
              </p>
              <p>
                From that thought, PojokFoto was born a no-nonsense virtual photo studio with a bold Neo-Brutalist design. A space where you don’t have to overthink anything—just be yourself, press one button, and capture the moment. Simple, honest, and designed to feel human.
              </p>
              <p>
                For me, this platform is more than just a camera tool, it’s a digital place for your favorite memories. Whether you’re grabbing a quick solo shot or having a chaotic session with friends, I wanted to make sure it felt seamless and fun.
              </p>
            </div>
          </div>
        </section>

      </main>

      <Footer />

      <ScrollToTop />
    </div>
  );
}
