import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql-wrapper';
import { verifyToken } from '@/lib/jwt';

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

// 🔒 Admin verification middleware
function verifyAdmin(token) {
    const { valid, decoded, error } = verifyToken(token);
    if (!valid || decoded.role !== 'admin') {
        return { error: error || 'Unauthorized' };
    }
    return { admin: decoded };
}

// Helper to process array data for related tables
async function processRelatedData(apartmentId, data, tableName, fields) {
    if (!data || !Array.isArray(data)) return;
    await query(`DELETE FROM ${tableName} WHERE apartment_id = ?`, [apartmentId]);
    for (const item of data) {
        const values = [apartmentId];
        const placeholders = ['?'];
        for (const field of fields) {
            values.push(item[field]);
            placeholders.push('?');
        }
        await query(
            `INSERT INTO ${tableName} (apartment_id, ${fields.join(', ')}) VALUES (${placeholders.join(', ')})`,
            values
        );
    }
}

// Helper to fetch related data
async function fetchRelatedData(apartmentId) {
    const [
        features,
        inclusions,
        rules,
        whyBook,
        policies
    ] = await Promise.all([
        query('SELECT icon, text FROM apartment_features WHERE apartment_id = ?', [apartmentId]),
        query('SELECT icon, text FROM apartment_inclusions WHERE apartment_id = ?', [apartmentId]),
        query('SELECT icon, text FROM apartment_rules WHERE apartment_id = ?', [apartmentId]),
        query('SELECT icon, text FROM apartment_why_book WHERE apartment_id = ?', [apartmentId]),
        query('SELECT cancellation, booking FROM apartment_policies WHERE apartment_id = ?', [apartmentId])
    ]);
    return { features, inclusions, rules, whyBook, policies: policies[0] || null };
}

// ----------------------
// GET - fetch all or single
// ----------------------
export async function GET(req) {
    try {
        const cookieHeader = req.headers.get('cookie');
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        const adminCheck = verifyAdmin(token);
        if (adminCheck.error) {
            return NextResponse.json({ error: adminCheck.error }, { status: 401 });
        }

        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (id) {
            const sql = 'SELECT * FROM apartments WHERE id = ?';
            const results = await query(sql, [id]);
            if (results.length === 0)
                return NextResponse.json({ error: 'Apartment not found' }, { status: 404 });

            const apartment = results[0];
            const relatedData = await fetchRelatedData(id);

            // ✅ Safely handle both string and object types
            if (apartment.location_data) {
                if (typeof apartment.location_data === 'string') {
                    try {
                        apartment.location_data = JSON.parse(apartment.location_data);
                    } catch (err) {
                        console.error('Invalid JSON in location_data:', apartment.location_data);
                        apartment.location_data = null;
                    }
                }
            }

            if (!apartment.location && apartment.location_data) {
                const loc = apartment.location_data;
                apartment.location = [loc.address1, loc.city, loc.state, loc.pincode, loc.country]
                    .filter(Boolean)
                    .join(', ');
            }

            return NextResponse.json({ apartment: { ...apartment, ...relatedData } }, { status: 200 });
        } else {
            const sql = 'SELECT * FROM apartments ORDER BY created_at DESC';
            const results = await query(sql);

            for (const apt of results) {
                if (apt.location_data) {
                    if (typeof apt.location_data === "string") {
                        try {
                            apt.location_data = JSON.parse(apt.location_data);
                        } catch (err) {
                            console.error("Invalid JSON in location_data:", apt.location_data);
                            apt.location_data = null;
                        }
                    }
                }
                
            }

            return NextResponse.json({ apartments: results }, { status: 200 });
        }
    } catch (err) {
        console.error('❌ Admin apartment fetch error:', err);
        return NextResponse.json({ error: 'Failed to fetch apartments' }, { status: 500 });
    }
}

// ----------------------
// POST - create new apartment
// ----------------------
export async function POST(req) {
    try {
        const cookieHeader = req.headers.get('cookie');
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        const adminCheck = verifyAdmin(token);
        if (adminCheck.error)
            return NextResponse.json({ error: adminCheck.error }, { status: 401 });

        const body = await req.json();
        const {
            title,
            description,
            location, // optional legacy
            address1,
            city,
            district,
            state,
            pincode,
            country,
            price_per_night,
            available,
            max_guests,
            features,
            inclusions,
            rules,
            whyBook,
            policies
        } = body;

        if (!title || !description || price_per_night === undefined)
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

        const price = parseFloat(price_per_night);
        if (Number.isNaN(price) || price <= 0)
            return NextResponse.json({ error: 'Invalid price' }, { status: 400 });

        let maxGuests = 1;
        if (max_guests !== undefined) {
            maxGuests = parseInt(max_guests, 10);
            if (Number.isNaN(maxGuests) || maxGuests < 1)
                return NextResponse.json({ error: 'Invalid max_guests' }, { status: 400 });
        }

        const avail =
            available === undefined
                ? 1
                : available === true || available === 'true' || available === 1 || available === '1'
                    ? 1
                    : 0;

        // Build structured and legacy locations
        const locationData = { address1, city, district, state, pincode, country };
        const fullLocation =
            location ||
            [address1, city, district, state, pincode, country].filter(Boolean).join(', ');

        const sql = `
      INSERT INTO apartments
      (title, description, location, location_data, price_per_night, max_guests, image_url, available)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const result = await query(sql, [
            title,
            description,
            fullLocation,
            JSON.stringify(locationData),
            price,
            maxGuests,
            'https://img.com/img.png',
            avail
        ]);

        const apartmentId = result.insertId;

        await Promise.all([
            processRelatedData(apartmentId, features, 'apartment_features', ['icon', 'text']),
            processRelatedData(apartmentId, inclusions, 'apartment_inclusions', ['icon', 'text']),
            processRelatedData(apartmentId, rules, 'apartment_rules', ['icon', 'text']),
            processRelatedData(apartmentId, whyBook, 'apartment_why_book', ['icon', 'text'])
        ]);

        if (policies) {
            await query(
                'INSERT INTO apartment_policies (apartment_id, cancellation, booking) VALUES (?, ?, ?)',
                [apartmentId, policies.cancellation, policies.booking]
            );
        }

        return NextResponse.json(
            { message: 'Apartment created successfully', id: apartmentId },
            { status: 201 }
        );
    } catch (err) {
        console.error('❌ Admin apartment creation error:', err);
        return NextResponse.json({ error: 'Failed to create apartment' }, { status: 500 });
    }
}

// ----------------------
// PUT - update existing apartment
// ----------------------
export async function PUT(req) {
    try {
        const cookieHeader = req.headers.get('cookie');
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        const adminCheck = verifyAdmin(token);
        if (adminCheck.error)
            return NextResponse.json({ error: adminCheck.error }, { status: 401 });

        const body = await req.json();
        const {
            id,
            title,
            description,
            location,
            address1,
            city,
            district,
            state,
            pincode,
            country,
            price_per_night,
            available,
            max_guests,
            features,
            inclusions,
            rules,
            whyBook,
            policies
        } = body;

        if (!id)
            return NextResponse.json({ error: 'Apartment ID is required' }, { status: 400 });

        const check = await query('SELECT id FROM apartments WHERE id = ?', [id]);
        if (check.length === 0)
            return NextResponse.json({ error: 'Apartment not found' }, { status: 404 });

        const price = parseFloat(price_per_night);
        if (Number.isNaN(price) || price <= 0)
            return NextResponse.json({ error: 'Invalid price' }, { status: 400 });

        let maxGuests = 1;
        if (max_guests !== undefined) {
            maxGuests = parseInt(max_guests, 10);
            if (Number.isNaN(maxGuests) || maxGuests < 1)
                return NextResponse.json({ error: 'Invalid max_guests' }, { status: 400 });
        }

        const avail =
            available === undefined
                ? 1
                : available === true || available === 'true' || available === 1 || available === '1'
                    ? 1
                    : 0;

        const locationData = { address1, city, district, state, pincode, country };
        const fullLocation =
            location ||
            [address1, city, district, state, pincode, country].filter(Boolean).join(', ');

        const updateSql = `
      UPDATE apartments
      SET title = ?, description = ?, location = ?, location_data = ?, price_per_night = ?, max_guests = ?, image_url = ?, available = ?
      WHERE id = ?
    `;

        await query(updateSql, [
            title,
            description,
            fullLocation,
            JSON.stringify(locationData),
            price,
            maxGuests,
            'https://example.com/image.jpg',
            avail,
            id
        ]);

        await Promise.all([
            processRelatedData(id, features, 'apartment_features', ['icon', 'text']),
            processRelatedData(id, inclusions, 'apartment_inclusions', ['icon', 'text']),
            processRelatedData(id, rules, 'apartment_rules', ['icon', 'text']),
            processRelatedData(id, whyBook, 'apartment_why_book', ['icon', 'text'])
        ]);

        if (policies) {
            const existingPolicies = await query(
                'SELECT id FROM apartment_policies WHERE apartment_id = ?',
                [id]
            );
            if (existingPolicies.length > 0) {
                await query(
                    'UPDATE apartment_policies SET cancellation = ?, booking = ? WHERE apartment_id = ?',
                    [policies.cancellation, policies.booking, id]
                );
            } else {
                await query(
                    'INSERT INTO apartment_policies (apartment_id, cancellation, booking) VALUES (?, ?, ?)',
                    [id, policies.cancellation, policies.booking]
                );
            }
        }

        return NextResponse.json({ message: 'Apartment updated successfully' }, { status: 200 });
    } catch (err) {
        console.error('❌ Admin apartment update error:', err);
        return NextResponse.json({ error: 'Failed to update apartment' }, { status: 500 });
    }
}

// ----------------------
// DELETE - remove apartment
// ----------------------
export async function DELETE(req) {
    try {
        const cookieHeader = req.headers.get('cookie');
        const cookies = parseCookies(cookieHeader);
        const token = cookies.token;

        const adminCheck = verifyAdmin(token);
        if (adminCheck.error)
            return NextResponse.json({ error: adminCheck.error }, { status: 401 });

        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (!id)
            return NextResponse.json({ error: 'Apartment ID is required' }, { status: 400 });

        const existing = await query('SELECT id FROM apartments WHERE id = ?', [id]);
        if (existing.length === 0)
            return NextResponse.json({ error: 'Apartment not found' }, { status: 404 });

        await query('DELETE FROM apartments WHERE id = ?', [id]);

        return NextResponse.json({ message: 'Apartment deleted successfully' }, { status: 200 });
    } catch (err) {
        console.error('❌ Admin apartment delete error:', err);
        return NextResponse.json({ error: 'Failed to delete apartment' }, { status: 500 });
    }
}
