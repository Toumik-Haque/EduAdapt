import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ScrollToTop from '../components/ScrollToTop/ScrollToTop'

import Navbar from '../components/Navbar/Navbar'
import DashboardLayout from '../components/DashboardLayout/DashboardLayout'
import Home from '../pages/Home/Home'
import Register from '../pages/Auth/Register'
import Login from '../pages/Auth/Login'
import ForgotPassword from '../pages/Auth/ForgotPassword'
import InstitutePublicProfile from '../pages/InstitutePublic/InstitutePublicProfile'
import UserPublicProfile from '../pages/UserPublic/UserPublicProfile'

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
import ManageBatches from '../pages/Institute/ManageBatches'
import ManageTeachers from '../pages/Institute/ManageTeachers'
import ManageStudents from '../pages/Institute/ManageStudents'
import BatchDetails from '../pages/Institute/BatchDetails'
import Community from '../pages/Community/Community'

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

        {/* Learner Dashboard Routes */}
        <Route
          path="/learner"
          element={
            <ProtectedRoute allowedAccountType="learner">
              <DashboardLayout>
                <Learner />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/learner/profile"
          element={
            <ProtectedRoute allowedAccountType="learner">
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/learner/individual"
          element={
            <ProtectedRoute allowedAccountType="learner">
              <DashboardLayout>
                <IndividualLearning />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/learner/institute/:instituteId"
          element={
            <ProtectedRoute allowedAccountType="learner">
              <DashboardLayout>
                <InstitutionLearning />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/learner/institutions"
          element={
            <ProtectedRoute allowedAccountType="learner">
              <DashboardLayout>
                <JoinInstitution />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Teacher Dashboard Routes */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedAccountType="teacher">
              <DashboardLayout>
                <Teacher />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/profile"
          element={
            <ProtectedRoute allowedAccountType="teacher">
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/individual"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <DashboardLayout>
                <TeacherIndividual />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/institute/:instituteId"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <DashboardLayout>
                <TeacherInstitution />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/join-institute"
          element={
            <ProtectedRoute allowedAccountType="teacher">
              <DashboardLayout>
                <JoinInstitution />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Institute Dashboard Routes */}
        <Route
          path="/institute"
          element={
            <ProtectedRoute allowedAccountType="institute">
              <DashboardLayout>
                <Institute />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/institute/batches"
          element={
            <ProtectedRoute allowedAccountType="institute">
              <DashboardLayout>
                <ManageBatches />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/institute/batches/:batchId"
          element={
            <ProtectedRoute allowedAccountType="institute">
              <DashboardLayout>
                <BatchDetails />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/institute/teachers"
          element={
            <ProtectedRoute allowedAccountType="institute">
              <DashboardLayout>
                <ManageTeachers />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/institute/students"
          element={
            <ProtectedRoute allowedAccountType="institute">
              <DashboardLayout>
                <ManageStudents />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/institute/profile"
          element={
            <ProtectedRoute allowedRoles={['institute']}>
              <DashboardLayout>
                <InstituteProfileEdit />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Public Institution Profile (Username-first with legacy fallback) */}
        <Route
          path="/institute/:username"
          element={<InstitutePublicProfile />}
        />
        <Route
          path="/institutions/:instituteId"
          element={<InstitutePublicProfile />}
        />

        {/* Public Teacher Profile (by username, with legacy fallback) */}
        <Route
          path="/teacher/:username"
          element={<UserPublicProfile />}
        />
        <Route
          path="/users/:userId"
          element={<UserPublicProfile />}
        />

        {/* Global Community & Social Learning Feed */}
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Community />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* Legacy /test-logo redirect */}
        <Route path="/test-logo" element={<Navigate to="/" replace />} />

        {/* 404 Catch-All Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
