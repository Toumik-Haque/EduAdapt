import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from '../components/Navbar/Navbar'
import Home from '../pages/Home/Home'
import Register from '../pages/Register/Register'
import Login from '../pages/Login/Login'

import Learner from '../pages/Learner/Learner'
import IndividualLearning from '../pages/IndividualLearning/IndividualLearning'
import InstitutionLearning from '../pages/InstitutionLearning/InstitutionLearning'
import JoinInstitution from '../pages/JoinInstitution/JoinInstitution'

import Teacher from '../pages/Teacher/Teacher'
import Institute from '../pages/Institute/Institute'

import ProtectedRoute from './ProtectedRoute'
import PublicOnlyRoute from './PublicOnlyRoute'

function AppRoutes() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/learner"
          element={
            <ProtectedRoute allowedAccountType="learner">
              <Learner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learner/individual"
          element={
            <ProtectedRoute allowedAccountType="learner">
              <IndividualLearning />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learner/institute/:instituteId"
          element={
            <ProtectedRoute allowedAccountType="learner">
              <InstitutionLearning />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learner/institution"
          element={
            <ProtectedRoute allowedAccountType="learner">
              <JoinInstitution />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedAccountType="teacher">
              <Teacher />
            </ProtectedRoute>
          }
        />

        <Route
          path="/institute"
          element={
            <ProtectedRoute allowedAccountType="institute">
              <Institute />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  )
}

export default AppRoutes