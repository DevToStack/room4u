// /api/admin/gallery/[id]/route.js
import { query } from '@/lib/mysql-wrapper';
import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';

/**
 * DELETE - Remove an image
 */
export async function DELETE(request, { params }) {
    try {
        const id = parseInt(params.id, 10);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid image ID' }, { status: 400 });
        }

        // Get image info before deletion
        const [image] = await query(
            'SELECT image_url FROM apartment_gallery WHERE id = ?',
            [id]
        );

        if (!image) {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }

        // Delete from database
        await query('DELETE FROM apartment_gallery WHERE id = ?', [id]);

        // Delete physical file safely
        try {
            const filePath = path.join(process.cwd(), 'public', image.image_url.replace(/^\//, ''));
            await unlink(filePath);
        } catch (fileError) {
            console.warn('Could not delete physical file:', fileError.message);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting image:', error);
        return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
    }
}

/**
 * PATCH - Update image properties (order, primary status, file name)
 */
export async function PATCH(request, { params }) {
    try {
        const id = parseInt(params.id, 10);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid image ID' }, { status: 400 });
        }

        const updates = await request.json();
        const allowedUpdates = ['display_order', 'is_primary', 'image_name'];
        const updateFields = [];
        const updateValues = [];

        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updateFields.push(`${key} = ?`);
                updateValues.push(updates[key]);
            }
        });

        if (updateFields.length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        // If setting as primary, unset other primary images for the same apartment
        if (updates.is_primary === true) {
            const [image] = await query(
                'SELECT apartment_id FROM apartment_gallery WHERE id = ?',
                [id]
            );

            if (image) {
                await query(
                    'UPDATE apartment_gallery SET is_primary = FALSE WHERE apartment_id = ? AND id != ?',
                    [image.apartment_id, id]
                );
            }
        }

        updateValues.push(id);
        await query(
            `UPDATE apartment_gallery SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );

        // Return updated image data
        const [updatedImage] = await query(
            'SELECT * FROM apartment_gallery WHERE id = ?',
            [id]
        );

        return NextResponse.json({ success: true, image: updatedImage });
    } catch (error) {
        console.error('Error updating image:', error);
        return NextResponse.json({ error: 'Failed to update image' }, { status: 500 });
    }
}

/**
 * GET - Get single image details
 */
export async function GET(request, { params }) {
    try {
        const id = parseInt(params.id, 10);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid image ID' }, { status: 400 });
        }

        const [image] = await query(
            'SELECT * FROM apartment_gallery WHERE id = ?',
            [id]
        );

        if (!image) {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }

        return NextResponse.json({ image });
    } catch (error) {
        console.error('Error fetching image:', error);
        return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
    }
}
