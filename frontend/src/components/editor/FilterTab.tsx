type FilterType = 'NONE' | 'GRAYSCALE' | 'SEPIA' | 'BRIGHTNESS' | 'CONTRAST' | 'BLUR';
type PhotoShape = 'SQUARE' | 'CIRCLE' | 'HEART' | 'ROUNDED_SQUARE';

interface FilterTabProps {
    filterType: FilterType;
    setFilterType: (filter: FilterType) => void;
    photoShape: PhotoShape;
    setPhotoShape: (shape: PhotoShape) => void;
}

export function FilterTab({ filterType, setFilterType, photoShape, setPhotoShape }: FilterTabProps) {
    const filters: FilterType[] = ['NONE', 'GRAYSCALE', 'SEPIA', 'BRIGHTNESS', 'CONTRAST'];
    const shapes: PhotoShape[] = ['SQUARE', 'CIRCLE', 'ROUNDED_SQUARE'];

    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm font-black uppercase text-[#B8B8B8] mb-3">Filter Effect</p>
                <div className="grid grid-cols-2 gap-3">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setFilterType(filter)}
                            className={`p-3 border-3 transition-all ${filterType === filter
                                ? 'border-black bg-black text-white brutal-shadow-sm translate-y-[-2px] translate-x-[-2px]'
                                : 'border-black bg-white hover:bg-gray-100'
                                }`}
                        >
                            <div className="font-bold text-sm uppercase">{filter}</div>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <p className="text-sm font-black uppercase text-[#B8B8B8] mb-3">Photo Shape</p>
                <div className="grid grid-cols-2 gap-3">
                    {shapes.map((shape) => (
                        <button
                            key={shape}
                            onClick={() => setPhotoShape(shape)}
                            className={`p-3 border-3 transition-all ${photoShape === shape
                                ? 'border-black bg-black text-white brutal-shadow-sm translate-y-[-2px] translate-x-[-2px]'
                                : 'border-black bg-white hover:bg-gray-100'
                                }`}
                        >
                            <div className="font-bold text-sm uppercase">{shape.replace('_', ' ')}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
