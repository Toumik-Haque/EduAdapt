import BatchManagement from '../../components/BatchManagement/BatchManagement'

function ManageBatches() {
  return (
    <div>
      {/* Top Banner */}
      <div className="card-pro p-4 mb-4 bg-white">
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className="badge-meta badge-meta-purple">
            <i className="bi bi-diagram-3-fill"></i> BATCH ADMINISTRATION
          </span>
          <span className="text-muted small">• Cohort & Classroom Architecture</span>
        </div>
        <h2 className="fw-extrabold text-dark tracking-tight mb-1">Manage Batches & Cohorts</h2>
        <p className="text-secondary small mb-0">
          Create new academic sections, view enrolled student capacity, and organize department cohorts.
        </p>
      </div>

      {/* Core Batch Management Module */}
      <BatchManagement />
    </div>
  )
}

export default ManageBatches
