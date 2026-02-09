const pool = require('../config/db');

const migrate = async () => {
    try {
        await pool.query(`
            ALTER TABLE questions 
            ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'Medium';
        `);
        console.log('Migration successful: Added difficulty column.');
        process.exit();
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
};
migrate();