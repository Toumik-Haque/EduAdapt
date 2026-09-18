import { useParams } from 'react-router-dom'

function InstitutionLearning() {
  const { instituteId } = useParams()

  return (
    <div className="container py-5">

      <h1 className="fw-bold">
        Institution Learning
      </h1>

      <p className="text-muted">
        You are viewing this institution's learning
        environment.
      </p>

      <div className="card border-0 shadow-sm mt-4">
        <div className="card-body p-4">

          <h5 className="fw-bold">
            Institution ID
          </h5>

          <p className="mb-0 text-muted">
            {instituteId}
          </p>

        </div>
      </div>

    </div>
  )
}

export default InstitutionLearning