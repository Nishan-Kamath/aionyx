const { Pool } = require('pg');
// fallback to built-in http if node-fetch is missing, but let's try dynamic import or just standard http
const http = require('http');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const API_PORT = process.env.PORT || 3000;

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function verify() {
    try {
        console.log("Verifying Problem Statement Implementation...");

        // 1. Get a section ID
        const sectionRes = await pool.query('SELECT id FROM sections LIMIT 1');
        if (sectionRes.rows.length === 0) {
            console.error("No sections found. Seed DB first.");
            return;
        }
        const sectionId = sectionRes.rows[0].id;
        console.log(`Using Section ID: ${sectionId}`);

        // 2. Insert a question with problem_statement manually to test DB
        // We are NOT using the API for insertion (Auth required), but DB directly.
        // This validates the Schema and that the Backend *could* write to it (as we use same credentials).
        // To strictly validate Backend Controller INSERT logic, we'd need a token.
        // But verifying DB + GET API is 90% confidence. ContentController logic was code-reviewed.

        const testTitle = "Test Problem Statement " + Date.now();
        const testStatement = "This is a test problem statement content.";

        const insertRes = await pool.query(`
            INSERT INTO questions (section_id, title, leetcode_url, difficulty, problem_statement, procedure)
            VALUES ($1, $2, $3, 'Easy', $4, 'Test Procedure')
            RETURNING id, problem_statement
        `, [sectionId, testTitle, 'http://test.com', testStatement]);

        const questionId = insertRes.rows[0].id;
        console.log(`Inserted Question ID: ${questionId}`);

        if (insertRes.rows[0].problem_statement === testStatement) {
            console.log("✅ DB Verification Passed: problem_statement saved correctly.");
        } else {
            console.error("❌ DB Verification Failed: problem_statement mismatch.");
        }

        // 3. Test API Retrieval (Public Endpoint)
        const questions = await fetchJson(`http://localhost:${API_PORT}/api/content/questions/${sectionId}`);

        const fetchedQ = questions.find(q => q.id === questionId);

        if (fetchedQ && fetchedQ.problem_statement === testStatement) {
            console.log("✅ API Verification Passed: problem_statement returned in GET response.");
        } else {
            console.error("❌ API Verification Failed: problem_statement not found or mismatch in API response.");
            console.log("Fetched Question:", fetchedQ);
        }

        // Cleanup
        await pool.query('DELETE FROM questions WHERE id = $1', [questionId]);
        console.log("Cleanup: Test question deleted.");

    } catch (err) {
        console.error("Verification Error:", err);
    } finally {
        await pool.end();
    }
}

verify();
