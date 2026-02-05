import {supabase} from '../config/supabase';

export interface UploadResult {
    success: boolean;
    data?: string;
    error?: {
        message: string;
        statusCode: number;
        details?: any;
    };
}

export const uploadToSupabase = async (
    file: Express.Multer.File,
    folder: 'parties' | 'candidates'
): Promise<UploadResult> => {
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;

    const {data, error} = await supabase.storage
        .from('election-assets')
        .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            cacheControl: '3600',
        });

    if (error) {
        return {
            success: false,
            error: {
                message: 'File upload failed',
                statusCode: 500,
                details: error,
            },
        };
    }

    const {data: publicData} = supabase.storage
        .from('election-assets')
        .getPublicUrl(fileName);

    return {
        success: true,
        data: publicData.publicUrl,
    };
};
