import TeacherRequests from '../../components/TeacherRequests/TeacherRequests'

function ManageTeachers() {
  return (
    <div>
      {/* Top Banner */}
      <div className="card-pro p-4 mb-4 bg-white">
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className="badge-meta badge-meta-sky">
            <i className="bi bi-person-video3"></i> FACULTY MANAGEMENT
          </span>
          <span className="text-muted small">• Verified Instructors & Staff</span>
        </div>
        <h2 className="fw-extrabold text-dark tracking-tight mb-1">Manage Teachers & Faculty</h2>
        <p className="text-secondary small mb-0">
          Review inbound faculty affiliation requests, verify teacher credentials, and assign instructors to campus batches.
        </p>
      </div>

      {/* Teacher Affiliation Requests & Management */}
      <TeacherRequests />
    </div>
  )
}

export default ManageTeachers
