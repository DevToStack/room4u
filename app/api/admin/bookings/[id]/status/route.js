import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql-wrapper';
import { emailService } from '@/lib/emailService';
import { verifyAdmin } from '@/lib/adminAuth';
import { documentSchemas } from '@/lib/validationSchemas';
import { createNotification } from '@/lib/notification-service';
import { use } from 'react';

// ✅ Cookie parser
function parseCookies(cookieHeader) {
    if (!cookieHeader) return {};
    return Object.fromEntries(
        cookieHeader.split(';').map(c => {
            const [k, v] = c.trim().split('=');
            return [k, decodeURIComponent(v)];
        })
    );
}

// Helper function to validate document data against schema
function validateDocumentData(documentType, documentData) {
    const schema = documentSchemas[documentType];
    if (!schema) {
        return { isValid: false, message: `Invalid document type: ${documentType}` };
    }

    const missingFields = [];
    for (const field of schema.required) {
        if (!documentData[field] || documentData[field].trim() === '') {
            missingFields.push(field);
        }
    }

    if (missingFields.length > 0) {
        return {
            isValid: false,
            message: `Missing required fields for ${documentType}: ${missingFields.join(', ')}`
        };
    }

    return { isValid: true };
}

export async function PUT(request, { params }) {
    try {
        const cookieHeader = request.headers.get('cookie');
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        const adminCheck = verifyAdmin(token);
        if (adminCheck.error) {
            return NextResponse.json({ error: adminCheck.error }, { status: 401 });
        }

        const { id } = await params;
        const { status, admin_notes, document_data } = await request.json();

        // Validate status
        const validStatuses = ['pending', 'confirmed', 'cancelled', 'expired', "ongoing"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
        }

        // Get current booking
        const currentBookings = await query(
            `SELECT b.*, u.email as user_email, u.name as user_name, a.title as apartment_title
             FROM bookings b
             LEFT JOIN users u ON b.user_id = u.id
             LEFT JOIN apartments a ON b.apartment_id = a.id
             WHERE b.id = ?`,
            [id]
        );

        if (!currentBookings.length) {
            return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
        }

        const currentBooking = currentBookings[0];
        const adminId = adminCheck.adminId;


        const user = query(
            `SELECT name FROM users WHERE id = ?`,
            [adminId]
        );

        // Update status
        let expiresAt = currentBooking.expires_at;
        if (status === 'confirmed' && currentBooking.status === 'pending') expiresAt = null;

        await query(`UPDATE bookings SET status = ?, expires_at = ? WHERE id = ?`, [status, expiresAt, id]);

        // Process document data when status is confirmed
        if (status === 'confirmed' && document_data) {
            try {
                const { document_type, ...documentInfo } = document_data;

                // Validate document type
                if (!documentSchemas[document_type]) {
                    return NextResponse.json({
                        success: false,
                        message: `Invalid document type. Must be one of: ${Object.keys(documentSchemas).join(', ')}`
                    }, { status: 400 });
                }

                // Validate document data against schema
                const validation = validateDocumentData(document_type, documentInfo);
                if (!validation.isValid) {
                    return NextResponse.json({
                        success: false,
                        message: validation.message
                    }, { status: 400 });
                }

                // Check if document already exists for this user
                const existingDocs = await query(
                    `SELECT id FROM user_documents 
                     WHERE user_id = ? AND document_type = ? AND status = 'approved'`,
                    [currentBooking.user_id, document_type]
                );

                if (existingDocs.length > 0) {
                    // Update existing approved document
                    await query(
                        `UPDATE user_documents 
                         SET document_data = ?, reviewer_id = ?, updated_at = CURRENT_TIMESTAMP
                         WHERE user_id = ? AND document_type = ? AND status = 'approved'`,
                        [JSON.stringify(documentInfo), adminId, currentBooking.user_id, document_type]
                    );
                } else {
                    // Insert new document with approved status
                    await query(
                        `INSERT INTO user_documents 
                         (user_id, document_type, document_data, status, reviewer_id, review_message) 
                         VALUES (?, ?, ?, 'approved', ?, ?)`,
                        [
                            currentBooking.user_id,
                            document_type,
                            JSON.stringify(documentInfo),
                            adminId,
                            'Auto-approved during booking confirmation'
                        ]
                    );
                }

                // Also update any pending documents of the same type to avoid duplicates
                await query(
                    `UPDATE user_documents 
                     SET status = 'approved', 
                         reviewer_id = ?, 
                         review_message = 'Auto-approved during booking confirmation',
                         document_data = ?,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE user_id = ? AND document_type = ? AND status = 'pending'`,
                    [adminId, JSON.stringify(documentInfo), currentBooking.user_id, document_type]
                );

                // Create notification for document approval
                await createNotification({
                    type: 'booking',
                    title: 'Document Approved',
                    content: `The user ${user.name} has been approved booking during booking confirmation.`,
                    userId: adminId,
                    bookingId: id,
                    meta: {
                        status: 'done',
                    },
                    level: 'info'
                });

            } catch (docError) {
                console.error('❌ Error processing document data:', docError);
                // Continue with booking confirmation even if document processing fails
                // but log the error
                console.log('Booking confirmed but document processing failed:', docError.message);
            }
        }

        // Send emails
        if (status === 'confirmed' && currentBooking.status === 'pending') {
            await emailService.sendBookingConfirmation({
                to: currentBooking.user_email,
                userName: currentBooking.user_name,
                apartmentTitle: currentBooking.apartment_title,
                bookingId: id,
                startDate: currentBooking.start_date,
                endDate: currentBooking.end_date,
                nextSteps: 'Please proceed with the payment to secure your booking.',
            });
        } else if (status === 'cancelled') {
            // Create notification for document approval
            await createNotification({
                type: 'booking',
                title: 'Booking Cancelled',
                content: `The user ${user.name} has been cancelled booking during booking confirmation.`,
                userId: adminId,
                bookingId: id,
                meta: {
                    status: 'done',
                },
                level: 'info'
            });

            await emailService.sendBookingCancellation({
                to: currentBooking.user_email,
                userName: currentBooking.user_name,
                apartmentTitle: currentBooking.apartment_title,
                bookingId: id,
                adminNotes: admin_notes,
            });
        }

        // Return updated booking with document info
        const updatedBookings = await query(
            `SELECT b.*, u.email as user_email, u.name as user_name, a.title as apartment_title,
                    ud.document_type, ud.status as doc_status
             FROM bookings b
             LEFT JOIN users u ON b.user_id = u.id
             LEFT JOIN apartments a ON b.apartment_id = a.id
             LEFT JOIN user_documents ud ON b.user_id = ud.user_id AND ud.status = 'approved'
             WHERE b.id = ?`,
            [id]
        );

        return NextResponse.json({
            success: true,
            message: `Booking ${status} successfully`,
            data: updatedBookings[0],
        });

    } catch (error) {
        console.error('❌ Error updating booking status:', error);
        return NextResponse.json({ success: false, message: 'Error updating booking status' }, { status: 500 });
    }
}