const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://localhost:3000',
    process.env.FRONTEND_TEACHER_URL,
    process.env.STUDENT_FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());

// Healthcheck
app.get('/', (req, res) => {
  res.json({ message: 'Prayukti-vLAB Teacher Express Backend Running', port: PORT });
});

// GET /api/teacher/dashboard
app.get('/api/teacher/dashboard', async (req, res) => {
  try {
    const schedulesCount = await pool.query('SELECT COUNT(*) FROM schedules');
    const announcementsCount = await pool.query('SELECT COUNT(*) FROM announcements');
    const resourcesCount = await pool.query('SELECT COUNT(*) FROM classroom_resources');
    const studentsCount = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'student'");

    const upcomingSchedules = await pool.query(`
      SELECT s.*, sub.title as subject_title 
      FROM schedules s 
      LEFT JOIN subjects sub ON s.subject_id = sub.id 
      ORDER BY s.scheduled_time DESC LIMIT 5
    `);

    const recentAnnouncements = await pool.query(`
      SELECT a.*, sub.title as subject_title 
      FROM announcements a 
      LEFT JOIN subjects sub ON a.subject_id = sub.id 
      ORDER BY a.created_at DESC LIMIT 5
    `);

    res.json({
      stats: {
        totalSchedules: parseInt(schedulesCount.rows[0].count),
        totalAnnouncements: parseInt(announcementsCount.rows[0].count),
        totalResources: parseInt(resourcesCount.rows[0].count),
        totalStudents: parseInt(studentsCount.rows[0].count)
      },
      upcomingSchedules: upcomingSchedules.rows,
      recentAnnouncements: recentAnnouncements.rows
    });
  } catch (err) {
    console.error('Error fetching teacher dashboard data:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/teacher/smart-class (Create Schedule)
app.post('/api/teacher/smart-class', async (req, res) => {
  const { subject_id, teacher_id, class_name, scheduled_time, duration_minutes, room_link, batch, recurring } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO schedules (subject_id, teacher_id, class_name, scheduled_time, duration_minutes, room_link, batch, recurring)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [subject_id, teacher_id, class_name, scheduled_time, duration_minutes || 60, room_link || 'https://meet.google.com/prayukti-vlab', batch || 'CSE-A', recurring || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating smart class schedule:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/teacher/announcement
app.post('/api/teacher/announcement', async (req, res) => {
  const { teacher_id, subject_id, title, content } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO announcements (teacher_id, subject_id, title, content)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [teacher_id, subject_id, title, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating announcement:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/teacher/generate-questions (AI Question Generation Mock/Groq endpoint)
app.post('/api/teacher/generate-questions', async (req, res) => {
  const { resource_title, count = 5, type = 'MCQ', difficulty = 'Medium' } = req.body;

  // Generate structured questions based on resource_title
  const mockQuestions = Array.from({ length: parseInt(count) }).map((_, idx) => ({
    id: `q_${Date.now()}_${idx}`,
    question: `[${difficulty}] Question ${idx + 1} based on ${resource_title || 'attached teaching resource'}: What is the core mechanism of this concept?`,
    options: [
      'Option A: Primary protocol response',
      'Option B: Secondary state handler',
      'Option C: Asynchronous event queue',
      'Option D: Static buffer allocation'
    ],
    correctAnswer: 'Option A: Primary protocol response',
    explanation: `This question evaluates key concepts extracted from ${resource_title || 'the provided material'}.`,
    difficulty: difficulty,
    status: 'DRAFT'
  }));

  res.json({
    resource: resource_title,
    count,
    type,
    difficulty,
    questions: mockQuestions
  });
});

app.listen(PORT, () => {
  console.log(`Teacher Express Backend running on port ${PORT}`);
});
