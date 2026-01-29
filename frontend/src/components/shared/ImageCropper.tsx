'use client'

import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Button } from "@/components/ui/Button"
import { getCroppedImg } from '@/lib/utils'
import { RotateCw, FlipHorizontal, FlipVertical } from 'lucide-react'

// Removed Slider import as it wasn't in the file list earlier, using input type range.

interface ImageCropperProps {
    imageSrc: string
    onCancel: () => void
    onCropComplete: (croppedBlob: Blob) => void
}

export function ImageCropper({ imageSrc, onCancel, onCropComplete }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [rotation, setRotation] = useState(0)
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
    const [flip, setFlip] = useState({ horizontal: false, vertical: false })

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop)
    }

    const onRotationChange = (rotation: number) => {
        setRotation(rotation)
    }

    const onZoomChange = (zoom: number) => {
        setZoom(zoom)
    }

    const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleSave = async () => {
        try {
            const croppedImage = await getCroppedImg(
                imageSrc,
                croppedAreaPixels,
                rotation,
                flip
            )
            if (croppedImage) {
                onCropComplete(croppedImage)
            }
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg w-full max-w-xl border-3 border-black shadow-[8px_8px_0px_0px_#000]">
                <div className="relative h-64 w-full bg-neutral-200 mb-6 border-2 border-black">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        rotation={rotation}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={onCropChange}
                        onRotationChange={onRotationChange}
                        onCropComplete={onCropCompleteHandler}
                        onZoomChange={onZoomChange}
                        transform={[
                            `translate(${crop.x}px, ${crop.y}px)`,
                            `rotateZ(${rotation}deg)`,
                            `rotateY(${flip.horizontal ? 180 : 0}deg)`,
                            `rotateX(${flip.vertical ? 180 : 0}deg)`,
                            `scale(${zoom})`,
                        ].join(' ')}
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex gap-4 items-center">
                        <span className="font-bold w-16">Zoom</span>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full accent-black"
                        />
                    </div>

                    <div className="flex gap-4 items-center">
                        <span className="font-bold w-16">Rotate</span>
                        <input
                            type="range"
                            value={rotation}
                            min={0}
                            max={360}
                            step={1}
                            aria-labelledby="Rotation"
                            onChange={(e) => setRotation(Number(e.target.value))}
                            className="w-full accent-black"
                        />
                    </div>

                    <div className="flex gap-2 justify-center">
                        <Button variant="outline" onClick={() => setRotation((r) => r + 90)}>
                            <RotateCw className="w-4 h-4 mr-2" /> Rotate
                        </Button>
                        <Button variant="outline" onClick={() => setFlip(f => ({ ...f, horizontal: !f.horizontal }))}>
                            <FlipHorizontal className="w-4 h-4 mr-2" /> Flip H
                        </Button>
                        <Button variant="outline" onClick={() => setFlip(f => ({ ...f, vertical: !f.vertical }))}>
                            <FlipVertical className="w-4 h-4 mr-2" /> Flip V
                        </Button>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <Button variant="outline" onClick={onCancel} className="border-2 border-black">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} className="bg-black text-white hover:bg-neutral-800 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
                        Save Avatar
                    </Button>
                </div>
            </div>
        </div>
    )
}
