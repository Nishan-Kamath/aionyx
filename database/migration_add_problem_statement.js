const pool = require('../config/db');

async function migrate() {
    try {
        console.log('Starting migration: Adding problem_statement column to questions table...');

        await pool.query(`
            ALTER TABLE questions 
            ADD COLUMN IF NOT EXISTS problem_statement TEXT;
        `);

        console.log('Migration successful: problem_statement column added.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        pool.end();
    }
}

migrate();