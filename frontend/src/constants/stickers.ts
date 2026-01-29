export const STICKER_CATEGORIES = {
    EMOJI: 'emoji',
    SHAPES: 'shapes',
    TEXT: 'text',
    SPECIAL: 'special',
} as const;

export interface StickerItem {
    id: string;
    url: string;
    category: typeof STICKER_CATEGORIES[keyof typeof STICKER_CATEGORIES];
    name: string;
}

export const STICKERS: StickerItem[] = [
    // Emoji
    { id: 'heart', url: '/stickers/heart.png', category: 'emoji', name: '❤️ Heart' },
    { id: 'star', url: '/stickers/star.png', category: 'emoji', name: '⭐ Star' },
    { id: 'smile', url: '/stickers/smile.png', category: 'emoji', name: '😊 Smile' },
    { id: 'cool', url: '/stickers/cool.png', category: 'emoji', name: '😎 Cool' },

    // Shapes
    { id: 'circle', url: '/stickers/circle.png', category: 'shapes', name: 'Circle' },
    { id: 'square', url: '/stickers/square.png', category: 'shapes', name: 'Square' },
    { id: 'triangle', url: '/stickers/triangle.png', category: 'shapes', name: 'Triangle' },

    // Special
    { id: 'birthday', url: '/stickers/birthday.png', category: 'special', name: '🎂 Birthday' },
    { id: 'party', url: '/stickers/party.png', category: 'special', name: '🎉 Party' },
];
