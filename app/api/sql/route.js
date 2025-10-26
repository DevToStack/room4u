import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
    let connection;

    try {
        const { query, params = [] } = await request.json();

        if (!query) {
            return NextResponse.json(
                { error: 'SQL query is required' },
                { status: 400 }
            );
        }

        // Security check - prevent destructive operations without proper validation
        const trimmedQuery = query.trim().toLowerCase();
        const destructiveKeywords = ['drop', 'delete', 'truncate', 'alter', 'create', 'insert', 'update'];

        // For safety, you might want to restrict to SELECT queries only in production
        // or implement proper authentication and authorization
        if (process.env.NODE_ENV === 'production') {
            const isDestructive = destructiveKeywords.some(keyword =>
                trimmedQuery.startsWith(keyword)
            );

            if (isDestructive) {
                return NextResponse.json(
                    { error: 'Destructive operations are not allowed in production' },
                    { status: 403 }
                );
            }
        }

        // Get a connection from the pool
        connection = await pool.getConnection();

        // Execute the query
        const [results, fields] = await connection.execute(query, params);

        // Release connection immediately
        connection.release();
        connection = null;

        return NextResponse.json({
            success: true,
            data: results,
            fields: fields?.map(field => ({
                name: field.name,
                type: field.type,
                length: field.columnLength
            })),
            rowCount: results.length || results.affectedRows
        });

    } catch (error) {
        // Ensure connection is released even if there's an error
        if (connection) {
            connection.release();
        }

        console.error('SQL Query Error:', error);

        return NextResponse.json(
            {
                error: 'SQL execution failed',
                message: error.message,
                code: error.code
            },
            { status: 500 }
        );
    }
}