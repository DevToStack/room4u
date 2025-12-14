import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql-wrapper';
import cloudinary from '@/lib/cloudinary';
import { parseCookies } from '@/lib/cookies';
import { verifyAdmin } from '@/lib/adminAuth';

export async function POST(request, { params }) {
    try {
        const { id } = params;

        // ===== AUTH =====
        const cookieHeader = request.headers.get('cookie');
        const cookies = parseCookies(cookieHeader);
        const token = cookies?.token;

        const adminCheck = await verifyAdmin(token);
        if (adminCheck?.error || adminCheck.decoded?.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // ===== CHECK IMAGE =====
        const [existingImage] = await query(
            'SELECT * FROM apartment_gallery WHERE id = ?',
            [id]
        );

        if (!existingImage) {
            return NextResponse.json({ message: 'Image not found' }, { status: 404 });
        }

        // ===== FORM DATA =====
        const formData = await request.formData();
        const file = formData.get('file');
        const apartmentId = formData.get('apartmentId');

        if (!file) {
            return NextResponse.json({ message: 'No file provided' }, { status: 400 });
        }

        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ message: 'Invalid file type' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // ===== CLOUDINARY UPLOAD (PROMISE-WRAPPED) =====
        const uploaded = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: `apartments/${apartmentId}`,
                    public_id: `gallery_${id}`,
                    overwrite: true,
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );

            stream.end(buffer);
        });

        // ===== DB UPDATE =====
        await query(
            `UPDATE apartment_gallery
             SET image_url = ?, file_size = ?, mime_type = ?
             WHERE id = ?`,
            [uploaded.secure_url, uploaded.bytes, uploaded.format, id]
        );

        // ===== RETURN UPDATED IMAGE =====
        const [updatedImage] = await query(
            'SELECT * FROM apartment_gallery WHERE id = ?',
            [id]
        );

        return NextResponse.json({
            success: true,
            image: updatedImage
        });

    } catch (error) {
        console.error('Error replacing image:', error);
        return NextResponse.json(
            { message: 'Failed to replace image' },
            { status: 500 }
        );
    }
}
