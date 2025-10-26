import { NextResponse } from 'next/server';
import path from 'path';
import { mkdir, writeFile, unlink } from 'fs/promises';
import { query } from '@/lib/mysql-wrapper';

export async function POST(request, { params }) {
    try {
        const { id } = await params; // ❌ no await

        // Fetch existing image
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

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
        }

        // Generate new filename
        const fileExtension = path.extname(file.name);
        const timestamp = Date.now();
        const fileName = `${id}-${timestamp}${fileExtension}`;

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'apartments', apartmentId);
        await mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, fileName);
        const publicUrl = `/uploads/apartments/${apartmentId}/${fileName}`;

        // Save file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Delete old file if different
        try {
            const oldFilePath = path.join(process.cwd(), 'public', existingImage.image_url.replace(/^\/+/, ''));
            if (oldFilePath !== filePath) {
                await unlink(oldFilePath);
            }
        } catch (err) {
            console.warn('Could not delete old file:', err.message);
        }

        // Update DB
        await query(
            `UPDATE apartment_gallery 
       SET image_url = ?, file_size = ?, mime_type = ? 
       WHERE id = ?`,
            [publicUrl, buffer.length, file.type, id]
        );

        const [updatedImage] = await query(
            'SELECT * FROM apartment_gallery WHERE id = ?',
            [id]
        );

        return NextResponse.json({ success: true, image: updatedImage });
    } catch (error) {
        console.error('Error replacing image:', error);
        return NextResponse.json({ error: 'Failed to replace image' }, { status: 500 });
    }
}
