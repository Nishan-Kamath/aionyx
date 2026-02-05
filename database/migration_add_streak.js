const pool = require('../config/db');

async function migrate() {
    try {
        console.log('Starting migration: Adding streak columns to students table...');

        await pool.query(`
            ALTER TABLE students 
            ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS last_solved_date TIMESTAMP;
        `);

        console.log('Migration successful: streak columns added.');
    } catch (err) {
        console.error('Migration failed:', err);
        const fs = require('fs');
        fs.writeFileSync('detailed_error.log', err.toString() + '\n' + err.stack);
    } finally {
        pool.end();
    }
}

migrate();
