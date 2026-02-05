const pool = require('../config/db');

// Mark a question as solved
exports.markQuestionSolved = async (req, res) => {
    const { studentId, questionId } = req.body;

    try {
        const check = await pool.query(
            'SELECT * FROM student_progress WHERE student_id = $1 AND question_id = $2',
            [studentId, questionId]
        );

        if (check.rows.length > 0) {
            return res.status(200).json({ message: 'Already marked as solved' });
        }

        // Streak Logic
        const studentRes = await pool.query('SELECT current_streak, last_solved_date FROM students WHERE id = $1', [studentId]);
        const student = studentRes.rows[0];

        let newStreak = student.current_streak || 0;
        const lastDate = student.last_solved_date ? new Date(student.last_solved_date) : null;
        const now = new Date(); // Server time (UTC usually in hosted envs, local here)

        // Normalize to date string YYYY-MM-DD to compare days ignoring time
        const todayStr = now.toISOString().split('T')[0];
        const lastDateStr = lastDate ? lastDate.toISOString().split('T')[0] : null;

        if (lastDateStr !== todayStr) {
            if (lastDateStr) {
                // Check if yesterday
                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                if (lastDateStr === yesterdayStr) {
                    newStreak++;
                } else {
                    newStreak = 1; // Reset if missed a day
                }
            } else {
                newStreak = 1; // First solve ever
            }
        }
        // If todayStr == lastDateStr, streak remains same (already increments once today)

        await pool.query(
            'UPDATE students SET current_streak = $1, last_solved_date = $2 WHERE id = $3',
            [newStreak, now, studentId]
        );

        await pool.query(
            'INSERT INTO student_progress (student_id, question_id) VALUES ($1, $2)',
            [studentId, questionId]
        );

        res.status(201).json({ message: 'Question marked as solved', streak: newStreak });
    } catch (err) {
        console.error('Error marking question solved:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get all solved questions for a student
exports.getSolvedQuestions = async (req, res) => {
    const studentId = req.params.studentId;

    try {
        const result = await pool.query(
            'SELECT question_id, completed_at FROM student_progress WHERE student_id = $1',
            [studentId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching progress:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get Student Stats
exports.getStudentStats = async (req, res) => {
    const studentId = req.params.studentId;
    try {
        const result = await pool.query('SELECT current_streak FROM students WHERE id = $1', [studentId]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Student not found' });

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching stats:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};
