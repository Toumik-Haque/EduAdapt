import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ScrollToTop from '../components/ScrollToTop/ScrollToTop'

import Navbar from '../components/Navbar/Navbar'
import Home from '../pages/Home/Home'
import Register from '../pages/Auth/Register'
import Login from '../pages/Auth/Login'
import ForgotPassword from '../pages/Auth/ForgotPassword'
import InstitutePublicProfile from '../pages/InstitutePublic/InstitutePublicProfile'

import Profile from '../pages/Profile/Profile'

import Learner from '../pages/Learner/Learner'
import IndividualLearning from '../pages/IndividualLearning/IndividualLearning'
import InstitutionLearning from '../pages/InstitutionLearning/InstitutionLearning'
import JoinInstitution from '../pages/JoinInstitution/JoinInstitution'

import Teacher from '../pages/Teacher/Teacher'
import TeacherIndividual from '../pages/TeacherIndividual/TeacherIndividual'
import TeacherInstitution from '../pages/TeacherInstitution/TeacherInstitution'

import Institute from '../pages/Institute/Institute'
import InstituteProfileEdit from '../pages/Institute/InstituteProfileEdit'

import ProtectedRoute from './ProtectedRoute'
import PublicOnlyRoute from './PublicOnlyRoute'

function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />

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
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <ForgotPassword />
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
          path="/learner/profile"
          element={
            <ProtectedRoute allowedAccountType="learner">
              <Profile />
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
          path="/learner/institutions"
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
          path="/teacher/profile"
          element={
            <ProtectedRoute allowedAccountType="teacher">
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/individual"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherIndividual />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/institute/:instituteId"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherInstitution />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/join-institute"
          element={
            <ProtectedRoute allowedAccountType="teacher">
              <JoinInstitution />
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
        {/* <Route
          path="/institute/profile"
          element={
            <ProtectedRoute allowedAccountType="institute">
              <Profile />
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="/institute/profile"
          element={
            <ProtectedRoute allowedRoles={['institute']}>
              <InstituteProfileEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/institutions/:instituteId"
          element={<InstitutePublicProfile />}
        />

      </Routes>

    </BrowserRouter>
  )
}

export default AppRoutes