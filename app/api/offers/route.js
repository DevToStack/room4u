import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAdmin } from '@/lib/adminAuth';
import { parseCookies } from '@/lib/cookies';
import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

// GET all offers
export async function GET(request) {
    try {
        const [offers] = await pool.query(
            'SELECT * FROM offers WHERE is_active = TRUE ORDER BY created_at DESC'
        );
        return NextResponse.json({ success: true, offers });
    } catch (error) {
        console.error('Error fetching offers:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST create new offer
export async function POST(request) {
    try {
        const cookieHeader = request.headers.get("cookie");
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        // 🔒 Admin validation
        const adminCheck = verifyAdmin(token);
        if (adminCheck.error) {
            return NextResponse.json({ error: adminCheck.error }, { status: 401 });
        }

        const body = await request.json();
        const {
            title,
            description,
            discount_percentage,
            apartment_ids,
            valid_from,
            valid_until
        } = body;

        // Validate required fields
        if (!title || !discount_percentage || !valid_from || !valid_until) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Insert offer
        const [result] = await pool.query(
            `INSERT INTO offers (
                title, description, discount_percentage, 
                apartment_ids, valid_from, valid_until, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
            [
                title,
                description || null,
                discount_percentage,
                apartment_ids ? JSON.stringify(apartment_ids) : null,
                valid_from,
                valid_until
            ]
        );

        return NextResponse.json({
            success: true,
            message: 'Offer created successfully',
            offerId: result.insertId
        });

    } catch (error) {
        console.error('Error creating offer:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT update offer
export async function PUT(request) {
    try {
        const cookieHeader = request.headers.get("cookie");
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        // 🔒 Admin validation
        const adminCheck = verifyAdmin(token);
        if (adminCheck.error) {
            return NextResponse.json({ error: adminCheck.error }, { status: 401 });
        }

        const body = await request.json();
        const {
            id,
            title,
            description,
            discount_percentage,
            apartment_ids,
            valid_from,
            valid_until
        } = body;

        // Validate required fields
        if (!id || !title || !discount_percentage || !valid_from || !valid_until) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Update offer
        const [result] = await pool.query(
            `UPDATE offers SET 
                title = ?, 
                description = ?, 
                discount_percentage = ?, 
                apartment_ids = ?, 
                valid_from = ?, 
                valid_until = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND is_active = TRUE`,
            [
                title,
                description || null,
                discount_percentage,
                apartment_ids ? JSON.stringify(apartment_ids) : null,
                valid_from,
                valid_until,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { success: false, error: 'Offer not found or already deleted' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Offer updated successfully'
        });

    } catch (error) {
        console.error('Error updating offer:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST send email for an offer
export async function PATCH(request) {
    try {
        const cookieHeader = request.headers.get("cookie");
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        // 🔒 Admin validation
        const adminCheck = verifyAdmin(token);
        if (adminCheck.error) {
            return NextResponse.json({ error: adminCheck.error }, { status: 401 });
        }

        const body = await request.json();
        const { offerId } = body;

        if (!offerId) {
            return NextResponse.json(
                { success: false, error: 'Offer ID is required' },
                { status: 400 }
            );
        }

        // Fetch offer details
        const [offers] = await pool.query(
            'SELECT * FROM offers WHERE id = ? AND is_active = TRUE',
            [offerId]
        );

        if (offers.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Offer not found' },
                { status: 404 }
            );
        }

        const offer = offers[0];

        // Fetch all users who should receive the email
        const [users] = await pool.query(
            'SELECT id, email, name FROM users WHERE email IS NOT NULL'
        );

        if (users.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No users to send emails to',
                sentCount: 0
            });
        }

        // Format dates
        const validFrom = new Date(offer.valid_from).toLocaleDateString();
        const validUntil = new Date(offer.valid_until).toLocaleDateString();

        // Prepare email content
        const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Special Offer: ${offer.title}</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .discount-badge { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; font-size: 18px; font-weight: bold; margin: 15px 0; }
                    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
                    .validity { background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196F3; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🎁 Special Offer!</h1>
                    <p>${offer.title}</p>
                </div>
                <div class="content">
                    <h2>${offer.title}</h2>
                    
                    <div class="discount-badge">
                        ${offer.discount_percentage}% OFF
                    </div>
                    
                    ${offer.description ? `<p>${offer.description}</p>` : ''}
                    
                    <div class="validity">
                        <p><strong>📅 Valid From:</strong> ${validFrom}</p>
                        <p><strong>⏰ Valid Until:</strong> ${validUntil}</p>
                    </div>
                    
                    <p>Don't miss out on this amazing opportunity! Book now and enjoy your stay with special discounts.</p>
                    
                    <a href="${process.env.FRONTEND_URL || 'https://yourapp.com'}" class="button">
                        Book Now & Claim Offer
                    </a>
                    
                    <div class="footer">
                        <p>This is an automated email from ${process.env.APP_NAME || 'Apartment Booking System'}. Please do not reply to this email.</p>
                        <p>If you wish to unsubscribe from promotional emails, please update your account settings.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const emailText = `
            Special Offer: ${offer.title}
            
            ${offer.discount_percentage}% OFF
            
            ${offer.description ? offer.description : ''}
            
            📅 Valid From: ${validFrom}
            ⏰ Valid Until: ${validUntil}
            
            Don't miss out on this amazing opportunity! Book now and enjoy your stay with special discounts.
            
            Book Now: ${process.env.FRONTEND_URL || 'https://yourapp.com'}
            
            ---
            This is an automated email from ${process.env.APP_NAME || 'Apartment Booking System'}.
            If you wish to unsubscribe from promotional emails, please update your account settings.
        `;

        // Send emails to all users
        let sentCount = 0;
        const failedEmails = [];

        for (const user of users) {
            try {
                await transporter.sendMail({
                    from: process.env.MAIL_USER,
                    to: user.email,
                    subject: `🎁 Special Offer: ${offer.title} - ${offer.discount_percentage}% OFF`,
                    text: emailText,
                    html: emailHtml,
                });
                sentCount++;

                // Add a small delay to prevent overwhelming the SMTP server
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error(`Failed to send email to ${user.email}:`, error);
                failedEmails.push(user.email);
            }
        }

        // Update offer's last_sent_at timestamp
        await pool.query(
            'UPDATE offers SET last_sent_at = CURRENT_TIMESTAMP WHERE id = ?',
            [offerId]
        );

        const response = {
            success: true,
            message: `Emails sent successfully to ${sentCount} users`,
            sentCount,
            failedCount: failedEmails.length,
            failedEmails: failedEmails.length > 0 ? failedEmails : undefined
        };

        if (failedEmails.length > 0) {
            response.warning = `Failed to send emails to ${failedEmails.length} users`;
        }

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error sending emails:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to send emails', details: error.message },
            { status: 500 }
        );
    }
}