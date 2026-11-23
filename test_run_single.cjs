/**
 * EduAdapt Standalone Comprehensive Test Runner Server
 * 
 * Runs independently on a dedicated test port (default: 5050)
 * Pre-seeded with:
 *  - 3 Institutions (Apex Institute of Technology, Horizon Academy, Crestview University)
 *  - 16 Teachers (Specialized across CS, Math, Physics, Design)
 *  - 50 Students (Enrolled across batches with progress logs)
 *  - Active Batches, Course Materials, and Community Posts
 * 
 * Provides an internal API + graceful shutdown endpoint (/api/test-environment/shutdown)
 */

// Resolve Express & Cors from backend/node_modules if running from root
let express, cors
try {
  express = require('express')
  cors = require('cors')
} catch (e) {
  express = require('./backend/node_modules/express')
  cors = require('./backend/node_modules/cors')
}

const http = require('http')

const app = express()
app.use(cors())
app.use(express.json())

const TEST_PORT = process.env.TEST_PORT || 5050

// ================= SEED DATA =================

// 3 Institutions
const institutions = [
  {
    _id: 'inst-001',
    name: 'Apex Institute of Technology',
    email: 'contact@apextech.edu',
    accountType: 'institute',
    type: 'College / University',
    location: 'Bangalore, India',
    studentsCount: 22,
    teachersCount: 7,
    batches: ['Batch 2026-CS-A', 'Batch 2026-AI-B']
  },
  {
    _id: 'inst-002',
    name: 'Horizon Academy of Science & Design',
    email: 'admin@horizonacademy.org',
    accountType: 'institute',
    type: 'Specialized Academy',
    location: 'Mumbai, India',
    studentsCount: 18,
    teachersCount: 5,
    batches: ['Batch 2025-Design-X', 'Batch 2026-Science-Alpha']
  },
  {
    _id: 'inst-003',
    name: 'Crestview Open University',
    email: 'registrar@crestview.edu',
    accountType: 'institute',
    type: 'University',
    location: 'New Delhi, India',
    studentsCount: 10,
    teachersCount: 4,
    batches: ['Batch 2026-Eng-Delta']
  }
]

// 16 Teachers
const teacherNames = [
  { name: 'Dr. Alok Verma', subject: 'Data Structures & Algorithms', instId: 'inst-001' },
  { name: 'Prof. Priya Sharma', subject: 'Machine Learning & AI', instId: 'inst-001' },
  { name: 'Dr. Rajesh Nair', subject: 'Operating Systems', instId: 'inst-001' },
  { name: 'Anita Deshmukh', subject: 'Computer Networks', instId: 'inst-001' },
  { name: 'Kavita Rao', subject: 'Database Management Systems', instId: 'inst-001' },
  { name: 'Siddharth Sen', subject: 'Cybersecurity Principles', instId: 'inst-001' },
  { name: 'Vikram Joshi', subject: 'Cloud Computing & DevOps', instId: 'inst-001' },

  { name: 'Dr. Sneha Roy', subject: 'UI/UX Design & Human Factors', instId: 'inst-002' },
  { name: 'Prof. Rohan Kulkarni', subject: 'Product Engineering', instId: 'inst-002' },
  { name: 'Meera Iyer', subject: 'Digital Prototyping', instId: 'inst-002' },
  { name: 'Aditya Mehta', subject: 'Applied Robotics', instId: 'inst-002' },
  { name: 'Pooja Kapoor', subject: 'Visual Arts & Media', instId: 'inst-002' },

  { name: 'Dr. Suresh Menon', subject: 'Advanced Mathematics', instId: 'inst-003' },
  { name: 'Dr. Tarun Saxena', subject: 'Quantum Mechanics', instId: 'inst-003' },
  { name: 'Dr. Neha Agarwal', subject: 'Discrete Systems', instId: 'inst-003' },
  { name: 'Prof. Manoj Pillai', subject: 'Statistics & Probability', instId: 'inst-003' }
]

const teachers = teacherNames.map((t, idx) => ({
  _id: `teacher-${String(idx + 1).padStart(3, '0')}`,
  name: t.name,
  email: `teacher.${idx + 1}@eduadapt.test`,
  accountType: 'teacher',
  subject: t.subject,
  institutionId: t.instId,
  status: 'approved',
  rating: 4.8
}))

// 50 Students
const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Advaith', 'Kabir', 'Dhruv', 'Rohan', 'Aryan', 'Kian', 'Aanya', 'Diya', 'Saanvi', 'Ananya', 'Kiara', 'Pari', 'Myra', 'Ira', 'Riya', 'Aadhya', 'Avani', 'Prisha', 'Anvi', 'Navya', 'Isha', 'Siya', 'Shanaya', 'Sara', 'Aditi', 'Mira', 'Samarth', 'Yash', 'Rishi', 'Karan', 'Tanvi', 'Jhanvi', 'Rhea', 'Kavya', 'Gauri', 'Mehak']

const students = firstNames.map((name, idx) => {
  const instId = idx < 22 ? 'inst-001' : idx < 40 ? 'inst-002' : 'inst-003'
  return {
    _id: `student-${String(idx + 1).padStart(3, '0')}`,
    name: `${name} Patel`,
    email: `student.${idx + 1}@eduadapt.test`,
    accountType: 'learner',
    institutionId: instId,
    enrolledBatch: instId === 'inst-001' ? 'Batch 2026-CS-A' : instId === 'inst-002' ? 'Batch 2025-Design-X' : 'Batch 2026-Eng-Delta',
    progress: Math.floor(Math.random() * 55) + 40,
    status: 'active'
  }
})

// ================= TEST API ENDPOINTS =================

// Overall Test System Status & Metrics
app.get('/api/test-environment/summary', (req, res) => {
  res.json({
    success: true,
    environment: 'EDUADAPT_STANDALONE_TEST_RUN',
    port: TEST_PORT,
    activeCounts: {
      institutions: institutions.length, // 3
      teachers: teachers.length,         // 16
      students: students.length          // 50
    },
    institutions,
    teachers,
    students
  })
})

// Institutions list
app.get('/api/test-environment/institutions', (req, res) => {
  res.json({ success: true, institutions })
})

// Teachers list
app.get('/api/test-environment/teachers', (req, res) => {
  res.json({ success: true, teachers })
})

// Students list
app.get('/api/test-environment/students', (req, res) => {
  res.json({ success: true, students })
})

// Quick Switch Account Session (Simulates Login into Any of the 69 Users)
app.post('/api/test-environment/switch-user', (req, res) => {
  const { userId } = req.body
  const user = [...institutions, ...teachers, ...students].find((u) => u._id === userId)
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found in test pool' })
  }
  res.json({
    success: true,
    token: `test-bearer-token-${user._id}`,
    user: {
      userId: user._id,
      name: user.name,
      email: user.email,
      accountType: user.accountType
    }
  })
})

// Graceful Exit / Stop Test Server
let serverInstance = null

const handleShutdown = (req, res) => {
  res.json({
    success: true,
    message: 'Test run stopped. Shutting down test server...'
  })
  console.log('\n[EduAdapt Test] Exit request received. Stopping test server...')
  setTimeout(() => {
    if (serverInstance) {
      serverInstance.close(() => {
        console.log('[EduAdapt Test] Test server terminated gracefully.')
        process.exit(0)
      })
    }
  }, 200)
}

// Support both POST and GET for browser address bar or fetch calls
app.post('/api/test-environment/shutdown', handleShutdown)
app.get('/api/test-environment/shutdown', handleShutdown)

// Start Server on Separate Port
serverInstance = app.listen(TEST_PORT, () => {
  console.log('========================================================')
  console.log(`🚀 EduAdapt Single-File Test Environment Active!`)
  console.log(`📡 Port: ${TEST_PORT} (Separate Dedicated Test Port)`)
  console.log(`🏛️  Institutions: 3`)
  console.log(`👨‍🏫 Teachers: 16`)
  console.log(`🎓 Students: 50`)
  console.log(`🛑 Shutdown endpoint: http://localhost:${TEST_PORT}/api/test-environment/shutdown`)
  console.log('========================================================')
})
