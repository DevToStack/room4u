import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql-wrapper';
import cloudinary from '@/lib/cloudinary';

export async function POST(request, { params }) {
    try {
        const { id } = params;
        const [existingImage] = await query(
            'SELECT * FROM apartment_gallery WHERE id = ?',
            [id]
        );

        if (!existingImage) {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }

        const formData = await request.formData();
        const file = formData.get('file');
        const apartmentId = formData.get('apartmentId');

        if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        if (!file.type.startsWith('image/'))
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload_stream(
            {
                folder: `apartments/${apartmentId}`,
                public_id: `${id}-${Date.now()}`,
                overwrite: true,
            },
            async (error, uploaded) => {
                if (error) throw error;

                await query(
                    `UPDATE apartment_gallery 
                     SET image_url = ?, file_size = ?, mime_type = ? 
                     WHERE id = ?`,
                    [uploaded.secure_url, uploaded.bytes, uploaded.format, id]
                );
            }
        );

        return new Promise((resolve, reject) => {
            const stream = result;
            stream.end(buffer);
            stream.on('finish', () => {
                resolve(NextResponse.json({ success: true }));
            });
            stream.on('error', reject);
        });
    } catch (error) {
        console.error('Error replacing image:', error);
        return NextResponse.json({ error: 'Failed to replace image' }, { status: 500 });
    }
}
