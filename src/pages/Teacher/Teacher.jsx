import { useAuth } from '../../context/AuthContext'

function Teacher() {
  const { user } = useAuth()

  return (
    <div className="container py-5">
      <h1>Hi, {user?.profile?.fullName}</h1>

      <p className="text-muted">
        Welcome to your EduAdapt Teacher Dashboard.
      </p>
    </div>
  )
}

export default Teacher