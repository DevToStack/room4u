// lib/mysql-wrapper.js
import pool from './db.js';

export async function query(sql, values = []) {
    try {
        const [results] = await pool.execute(sql, values);
        return results;
    } catch (err) {
        console.error("❌ Database query error:", err.sqlMessage || err.message);
        throw err;
    }
}