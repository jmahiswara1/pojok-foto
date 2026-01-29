'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    Camera,
    Trash2,
    Download,
    Edit,
    ImageOff,
    X,
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { BrutalCard as Card } from '@/components/ui/Card';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import { useRef } from 'react';

// Reuse utility functions to ensure consistent rendering
const getFilterCSS = (type: string): string => {
    switch (type) {
        case 'GRAYSCALE': return 'grayscale(100%)';
        case 'SEPIA': return 'sepia(100%)';
        case 'BRIGHTNESS': return 'brightness(1.2)';
        case 'CONTRAST': return 'contrast(1.3)';
        case 'BLUR': return 'blur(2px)';
        default: return 'none';
    }
};

const getClipPath = (shape: string): string => {
    switch (shape) {
        case 'CIRCLE': return 'circle(50%)';
        case 'HEART': return 'path("M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z")';
        case 'ROUNDED_SQUARE': return 'inset(0 round 20%)';
        default: return 'none';
    }
};

interface Project {
    id: string;
    createdAt: string;
    backgroundColor: string;
    backgroundPatternUrl: string | null;
    filterType: 'NONE' | 'GRAYSCALE' | 'SEPIA' | 'BRIGHTNESS' | 'CONTRAST';
    photoShape: 'SQUARE' | 'CIRCLE' | 'HEART' | 'ROUNDED_SQUARE';
    frameLayout: {
        aspectRatio: string;
        holesConfig: any[];
    };
    frameAsset: {
        url: string;
    } | null;
    projectPhotos: {
        photoUrl: string;
        slotIndex: number;
    }[];
}

export default function GalleryPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [dataReady, setDataReady] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const token = auth.getToken();
        if (!token) {
            router.push('/login');
            return;
        }
        fetchProjects();
    }, [router]);

    const fetchProjects = async () => {
        try {
            const token = auth.getToken();
            const API_URL = process.env.NEXT_PUBLIC_API_URL;
            const res = await fetch(`${API_URL}/photo-projects`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setProjects(data.data);
            }
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            setDataReady(true);
        }
    };

    // ... (rest of component) ...

    const handleDeleteClick = (e: React.MouseEvent, projectId: string) => {
        e.stopPropagation();
        setProjectToDelete(projectId);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!projectToDelete) return;

        try {
            const token = auth.getToken();
            const API_URL = process.env.NEXT_PUBLIC_API_URL;
            const res = await fetch(`${API_URL}/photo-projects/${projectToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setProjects(prev => prev.filter(p => p.id !== projectToDelete));
                setShowDeleteModal(false);
                setProjectToDelete(null);
                // Also close the main modal if the deleted project was open
                if (selectedProject?.id === projectToDelete) {
                    setSelectedProject(null);
                }
            } else {
                alert('Failed to delete project');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Error deleting project');
        }
    };

    const handleDownload = async (project: Project) => {
        if (previewRef.current) {
            try {
                // Use the ref content directly
                const dataUrl = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 2 });
                saveAs(dataUrl, `pojok-foto-${project.createdAt}.png`);
            } catch (err) {
                console.error('Download failed', err);
                alert('Failed to download image');
            }
        }
    };

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(new Date(dateString));
    };

    const ProjectPreview = ({ project, highQuality = false }: { project: Project, highQuality?: boolean }) => {
        const { frameLayout, backgroundColor, backgroundPatternUrl, projectPhotos, frameAsset, filterType, photoShape } = project;
        const [w, h] = frameLayout.aspectRatio.split(':').map(Number);

        return (
            <div
                className={`relative w-full bg-white shadow-sm pointer-events-none ${highQuality ? '' : 'overflow-hidden'}`}
                style={{
                    aspectRatio: `${w}/${h}`,
                }}
            >
                {/* Layer 1: Background */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundColor: backgroundColor || '#FFFFFF',
                        ...(backgroundPatternUrl && {
                            backgroundImage: `url(${backgroundPatternUrl})`,
                            backgroundSize: 'cover'
                        })
                    }}
                />

                {/* Layer 2: Photos */}
                {frameLayout.holesConfig.map((hole: any, idx: number) => {
                    const photo = projectPhotos.find(p => p.slotIndex === idx);
                    return (
                        <div
                            key={idx}
                            className="absolute overflow-hidden"
                            style={{
                                top: `${hole.top}%`,
                                left: `${hole.left}%`,
                                width: `${hole.width}%`,
                                height: `${hole.height}%`,
                            }}
                        >
                            {photo && (
                                <div
                                    className="relative w-full h-full"
                                    style={{
                                        filter: getFilterCSS(filterType),
                                        clipPath: photoShape === 'ROUNDED_SQUARE' ? 'inset(0 round 5%)' : getClipPath(photoShape),
                                    }}
                                >
                                    <Image
                                        src={photo.photoUrl}
                                        alt={`Photo ${idx}`}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Layer 3: Overlay */}
                {frameAsset && (
                    <div className="absolute inset-0">
                        <Image
                            src={frameAsset.url}
                            alt="frame"
                            fill
                            className="object-contain"
                            unoptimized
                        />
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <LoadingScreen
                fullScreen
                finished={dataReady}
                onComplete={() => setLoading(false)}
            />
        );
    }

    return (
        <div className="min-h-[calc(100vh-88px)] bg-[#FAFAFA]">
            {/* Header */}
            <div className="brutal-container py-8">
                <div className="mb-8 flex justify-between items-end">
                    <h2 className="text-4xl font-black border-b-3 border-black pb-2 inline-block">
                        My Gallery <span className="text-[#B8B8B8] ml-2 text-2xl align-middle">({projects.length})</span>
                    </h2>
                    <Button onClick={() => router.push('/camera')} variant="black" className="hidden sm:flex">
                        <Camera className="w-5 h-5 mr-2" />
                        New Photo
                    </Button>
                </div>

                {projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border-3 border-dashed border-[#DEDEDE] rounded-lg">
                        <ImageOff className="w-24 h-24 text-[#DEDEDE] mx-auto mb-4" />
                        <h2 className="text-2xl font-black uppercase mb-3">No Projects Yet</h2>
                        <Button onClick={() => router.push('/camera')} variant="black">
                            <Camera className="w-5 h-5" />
                            Start Camera
                        </Button>
                    </div>
                ) : (
                    // Masonry Grid
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                className="break-inside-avoid"
                            >
                                <Card
                                    hover
                                    className="group relative"
                                    padding="none"
                                >
                                    <div
                                        className="w-full bg-gray-100 cursor-pointer border-b-3 border-black relative"
                                        onClick={() => setSelectedProject(project)}
                                    >
                                        <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => handleDeleteClick(e, project.id)}
                                                className="bg-white p-2 border-2 border-black rounded-full hover:bg-red-50 hover:text-red-600 transition-colors brutal-shadow-sm"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="transform transition-transform duration-300 group-hover:scale-[1.02]">
                                            <ProjectPreview project={project} />
                                        </div>
                                    </div>

                                    <div className="p-3 flex items-center justify-between bg-white">
                                        <span className="text-xs font-bold text-[#B8B8B8] uppercase">
                                            {formatDate(project.createdAt as string)}
                                        </span>
                                        <span className="text-xs font-bold bg-black text-white px-2 py-1 rounded-sm">
                                            {project.frameLayout.aspectRatio}
                                        </span>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Custom Full Screen Modal */}
            {selectedProject && (
                <div
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm p-4"
                    onClick={() => setSelectedProject(null)}
                >
                    {/* Close Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProject(null);
                        }}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 z-50 p-2"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <div
                        className="relative w-full h-full flex flex-col items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Image Container - This ensures visibility */}
                        <div
                            className="relative flex-shrink-0 bg-white"
                            style={{
                                height: '70vh',
                                aspectRatio: selectedProject.frameLayout.aspectRatio.replace(':', '/'),
                            }}
                        >
                            <div
                                className="w-full h-full shadow-2xl"
                                ref={previewRef}
                            >
                                <ProjectPreview project={selectedProject} highQuality />
                            </div>
                        </div>

                        {/* Bottom Actions Bar */}
                        <div className="mt-8 flex gap-4 shrink-0">
                            <Button
                                onClick={() => router.push(`/editor?projectId=${selectedProject.id}`)}
                                variant="white"
                                className="bg-white/10 text-white border-white hover:bg-white hover:text-black"
                            >
                                <Edit className="w-5 h-5 mr-2" />
                                Edit
                            </Button>
                            <Button
                                onClick={() => handleDownload(selectedProject)}
                                variant="white"
                                className="bg-white/10 text-white border-white hover:bg-white hover:text-black"
                            >
                                <Download className="w-5 h-5 mr-2" />
                                Download
                            </Button>
                            <Button
                                onClick={(e) => handleDeleteClick(e, selectedProject.id)}
                                variant="white"
                                className="bg-white/10 text-white border-white hover:bg-red-600 hover:border-red-600 hover:text-white"
                            >
                                <Trash2 className="w-5 h-5 mr-2" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Project?"
                size="sm"
            >
                <div className="space-y-6">
                    <p className="text-lg font-medium">
                        Are you sure you want to delete this project?<br />
                        <span className="text-[#B8B8B8] text-sm">This action cannot be undone.</span>
                    </p>
                    <div className="flex gap-4">
                        <Button
                            onClick={() => setShowDeleteModal(false)}
                            variant="white"
                            fullWidth
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteConfirm}
                            variant="black"
                            fullWidth
                            className="bg-black hover:bg-red-600 hover:border-red-600"
                        >
                            Yes, Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
