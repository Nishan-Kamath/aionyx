const pool = require('./config/db');

async function checkColumns() {
    try {
        // Query to check if columns exist in information_schema
        const res = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'students' 
            AND column_name IN ('current_streak', 'last_solved_date');
        `);

        console.log('Found columns:', res.rows.map(r => r.column_name));

        if (res.rows.length === 2) {
            console.log('✅ Verification Passed: Both columns exist.');
        } else {
            console.log('❌ Verification Failed: Missing columns.');
        }
    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        pool.end();
    }
}

checkColumns();
