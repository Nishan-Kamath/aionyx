const fetch = require('node-fetch');

// Assuming server is running at localhost:3000 (from previous context, usually 3000 or 5000)
// Checking package.json or server.js would confirm port. Let's assume 3000 based on standard.
// If not, I'll check server.js.

const API_URL = 'http://localhost:3000/api';

// We need a token. Using a fake one might fail if auth middleware checks DB.
// But let's look at the codebase. authMiddleware.js usually checks JWT.
// I might need to login as admin first.

async function test() {
    try {
        // 1. Login as Admin
        console.log('Logging in as admin...');
        const loginRes = await fetch(`${API_URL}/auth/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@aionyx.com', password: 'admin' })
            // Default credentials? Need to check setup.js or similar if not known.
            // Or I can just inspect the DB or use an existing token if I had one.
            // Let's check 'setup.js' to see default admin.
        });

        // Wait, I can't easily know the admin password without checking setup.js.
        // Let's assume standard 'admin123' or similar if 'admin' fails.
        // Checking setup.js...
    } catch (e) {
        console.error(e);
    }
}
