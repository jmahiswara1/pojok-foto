import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { BrutalCard as Card } from '@/components/ui/Card';

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

export interface Project {
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

export const ProjectPreview = ({ project, highQuality = false }: { project: Project, highQuality?: boolean }) => {
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

interface AlbumCardProps {
    project: Project;
    onClick: (project: Project) => void;
    onDelete: (e: React.MouseEvent, projectId: string) => void;
}

export function AlbumCard({ project, onClick, onDelete }: AlbumCardProps) {
    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        }).format(new Date(dateString));
    };

    return (
        <div className="break-inside-avoid">
            <Card
                hover
                className="group relative"
                padding="none"
            >
                <div
                    className="w-full bg-gray-100 cursor-pointer border-b-3 border-black relative"
                    onClick={() => onClick(project)}
                >
                    <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => onDelete(e, project.id)}
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
                    <span className="text-sm font-black text-[#B8B8B8] uppercase">
                        {formatDate(project.createdAt as string)}
                    </span>
                    <span className="text-xs font-bold bg-black text-white px-2 py-1 rounded-sm border border-black shadow-[2px_2px_0px_0px_#B8B8B8]">
                        {project.frameLayout.aspectRatio}
                    </span>
                </div>
            </Card>
        </div>
    );
}
