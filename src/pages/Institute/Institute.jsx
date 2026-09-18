import { useAuth } from '../../context/AuthContext'

function Institute() {
  const { user } = useAuth()

  return (
    <div className="container py-5">
      <h1>Hi, {user?.profile?.instituteName}</h1>

      <p className="text-muted">
        Welcome to your EduAdapt Institute Dashboard.
      </p>
    </div>
  )
}

export default Institute