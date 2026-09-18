const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')

const User = require('./models/User')
const InstituteProfile = require('./models/InstituteProfile')
const TeacherProfile = require('./models/TeacherProfile')
const LearnerProfile = require('./models/LearnerProfile')

const authRoutes = require('./routes/authRoutes')
const membershipRoutes = require('./routes/membershipRoutes')

dotenv.config()

const app = express()

// Connect to MongoDB
connectDB()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/membership', membershipRoutes)

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