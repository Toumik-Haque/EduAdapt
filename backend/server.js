const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')

dotenv.config()

const app = express()

// Connect to MongoDB
connectDB().then(() => {
  const { backfillUsernames } = require('./utils/backfillUsernames')
  backfillUsernames()
})

const User = require('./models/User')
const InstituteProfile = require('./models/InstituteProfile')
const TeacherProfile = require('./models/TeacherProfile')
const LearnerProfile = require('./models/LearnerProfile')

const authRoutes = require('./routes/authRoutes')
const membershipRoutes = require('./routes/membershipRoutes')
const batchRoutes = require('./routes/batchRoutes')
const subjectRoutes = require('./routes/subjectRoutes')
const materialRoutes = require('./routes/materialRoutes')
const individualCourseRoutes = require('./routes/individualCourseRoutes')
const announcementRoutes = require('./routes/announcementRoutes')
const communityRoutes = require('./routes/communityRoutes')
const notificationRoutes = require('./routes/notificationRoutes')

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/membership', membershipRoutes)
app.use('/api/batches', batchRoutes)
app.use('/api/subjects', subjectRoutes)
app.use('/api/materials', materialRoutes)
app.use('/api/individual-courses', individualCourseRoutes)
app.use('/api/announcements', announcementRoutes)
app.use('/api/community', communityRoutes)
app.use('/api/notifications', notificationRoutes)

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'EduAdapt backend is running!'
  })
})

// Server port
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`EduAdapt backend running on http://localhost:${PORT}`)
})