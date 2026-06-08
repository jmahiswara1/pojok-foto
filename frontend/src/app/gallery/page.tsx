'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Trash2, Download, Edit, X } from 'lucide-react';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import { AlbumCard, Project, ProjectPreview } from '@/components/gallery/AlbumCard';
import { EmptyState } from '@/components/gallery/EmptyState';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';

export default function GalleryPage() {
    const router = useRouter();
    const { toast } = useToast();
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
                if (selectedProject?.id === projectToDelete) {
                    setSelectedProject(null);
                }
            } else {
                toast('Error', 'Failed to delete project', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast('Error', 'Error deleting project', 'error');
        }
    };

    const handleDownload = async (project: Project) => {
        if (previewRef.current) {
            try {
                const dataUrl = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 2 });
                saveAs(dataUrl, `pojok-foto-${project.createdAt}.png`);
            } catch (err) {
                console.error('Download failed', err);
                toast('Error', 'Failed to download image', 'error');
            }
        }
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
                    <EmptyState onAction={() => router.push('/camera')} />
                ) : (
                    <GalleryGrid>
                        {projects.map((project) => (
                            <AlbumCard 
                                key={project.id}
                                project={project}
                                onClick={setSelectedProject}
                                onDelete={handleDeleteClick}
                            />
                        ))}
                    </GalleryGrid>
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
                        {/* Image Container */}
                        <div
                            className="relative flex-shrink-0 bg-white"
                            style={{
                                height: '70vh',
                                aspectRatio: selectedProject.frameLayout.aspectRatio.replace(':', '/'),
                            }}
                        >
                            <div
                                className="w-full h-full shadow-[12px_12px_0px_0px_#B8B8B8]"
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
                                className="bg-white text-black border-2 border-black hover:bg-black hover:text-white transition-colors brutal-shadow-sm"
                            >
                                <Edit className="w-5 h-5 mr-2" />
                                Edit
                            </Button>
                            <Button
                                onClick={() => handleDownload(selectedProject)}
                                variant="white"
                                className="bg-white text-black border-2 border-black hover:bg-black hover:text-white transition-colors brutal-shadow-sm"
                            >
                                <Download className="w-5 h-5 mr-2" />
                                Download
                            </Button>
                            <Button
                                onClick={(e) => handleDeleteClick(e, selectedProject.id)}
                                variant="white"
                                className="bg-white text-black border-2 border-black hover:bg-red-600 hover:border-red-600 hover:text-white transition-colors brutal-shadow-sm"
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
