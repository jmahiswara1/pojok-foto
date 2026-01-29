import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const BUCKET_NAME = 'pojok-foto-uploads'; // Ensure this bucket exists in Supabase and is public

/**
 * Uploads a file buffer to Supabase Storage
 * @param file The multer file object
 * @param folder Optional folder path within the bucket
 * @returns Public URL of the uploaded file
 */
export const uploadToSupabase = async (file: Express.Multer.File, folder: string = 'avatars'): Promise<string> => {
    try {
        const fileExt = path.extname(file.originalname);
        const fileName = `${folder}/${uuidv4()}${fileExt}`;

        const { data, error } = await supabase
            .storage
            .from(BUCKET_NAME)
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: true
            });

        if (error) {
            throw error;
        }

        const { data: publicData } = supabase
            .storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName);

        return publicData.publicUrl;
    } catch (error) {
        console.error('Supabase Upload Error:', error);
        throw new Error('Failed to upload file to storage');
    }
};
