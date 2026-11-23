import { Link } from 'react-router-dom'

const workspaceRoles = [
  {
    role: "Students & Learners",
    tagline: "Structured & Independent Learning",
    description: "Manage institutional batch subjects, download verified lecture resources, turn in assignments, and track personal growth.",
    icon: "bi-mortarboard",
    color: "var(--brand-700)",
    bg: "var(--brand-50)",
    border: "var(--brand-200)",
    features: ["Enrolled Campus Coursework", "Independent Study Roadmaps", "Interactive Peer Community", "Direct Submission Feedback"],
    link: "/register?role=learner"
  },
  {
    role: "Teachers & Faculty",
    tagline: "Course Authoring & Assessment",
    description: "Create and distribute curriculum to campus cohorts, review submissions, assign grades, and publish freelance masterclasses.",
    icon: "bi-person-video3",
    color: "#0369A1",
    bg: "#F0F9FF",
    border: "#BAE6FD",
    features: ["Campus Batch Allocations", "Freelance Studio with Code Enrollment", "Grading & Written Feedback", "Faculty Broadcast Bulletins"],
    link: "/register?role=teacher"
  },
  {
    role: "Institutions & Colleges",
    tagline: "Unified Academic Administration",
    description: "Orchestrate cohorts, approve student enrollments, assign verified teaching faculty, and manage public organizational branding.",
    icon: "bi-building-check",
    color: "#065F46",
    bg: "#ECFDF5",
    border: "#A7F3D0",
    features: ["Departmental Batch Architecture", "Teacher Credential Verification", "Student Admission Approvals", "Live Campus Notices"],
    link: "/register?role=institute"
  }
];

const pillars = [
  {
    title: "Dual Learning Spaces",
    desc: "Uniquely engineered to support both accredited university coursework and self-directed freelance courses under one account.",
    icon: "bi-layers-half"
  },
  {
    title: "Realtime Academic Feed",
    desc: "A centralized social learning hub where students solve problem sets together and educators answer subject inquiries.",
    icon: "bi-chat-square-quote"
  },
  {
    title: "Granular Assignment Engine",
    desc: "Turn in solutions via cloud links or text notes, view instant status transitions, and receive instructor feedback.",
    icon: "bi-clipboard2-check"
  },
  {
    title: "Campus Notice Bulletins",
    desc: "Targeted announcements pinned by administrators or faculty to keep campus communities informed in real time.",
    icon: "bi-megaphone"
  }
];

function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-5 py-lg-6 border-bottom" style={{ background: '#FAF9FD' }}>
        <div className="container py-3 py-md-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-white border mb-3 small fw-semibold text-secondary">
                <span
                  className="rounded-circle"
                  style={{ width: '8px', height: '8px', backgroundColor: 'var(--brand-700)' }}
                ></span>
                EduAdapt Enterprise Academic Platform
              </div>

              <h1
                className="fw-extrabold text-dark tracking-tight mb-3"
                style={{ fontSize: 'clamp(2.3rem, 4vw, 3.4rem)', lineHeight: 1.15 }}
              >
                The synchronized academic platform for{' '}
                <span style={{ color: 'var(--brand-700)' }}>modern education.</span>
              </h1>

              <p className="lead text-secondary mb-4" style={{ fontSize: '1.05rem', lineHeight: 1.65 }}>
                EduAdapt unites students, certified faculty, and educational institutions into one coherent ecosystem.
                Deliver courses, grade homework, solve doubts collaboratively, and manage campus cohorts without fragmentation.
              </p>

              <div className="d-flex flex-wrap gap-3">
                <Link to="/register" className="btn-brand-solid">
                  <span>Create Account</span>
                  <i className="bi bi-arrow-right"></i>
                </Link>
                <a href="#workspaces" className="btn-brand-outline">
                  <span>Explore Workspaces</span>
                </a>
              </div>
            </div>

            {/* Live System Demonstration Card */}
            <div className="col-lg-5">
              <div className="card-pro p-4 bg-white shadow-sm">
                <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="rounded-circle d-flex align-items-center justify-content-center text-white"
                      style={{ width: '32px', height: '32px', backgroundColor: 'var(--brand-700)' }}
                    >
                      <i className="bi bi-mortarboard-fill small"></i>
                    </span>
                    <div>
                      <div className="fw-bold small text-dark">Active Campus Stream</div>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>Apex Institute of Technology</div>
                    </div>
                  </div>
                  <span className="badge-meta badge-meta-emerald">System Live</span>
                </div>

                <div className="d-flex flex-column gap-3">
                  <div className="p-3 rounded-3 bg-light border">
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="fw-bold text-dark">Computer Science Batch 2026-A</span>
                      <span className="text-muted">45 Students Active</span>
                    </div>
                    <div className="small text-secondary">
                      Course: <strong>Algorithms & Data Structures</strong> (Dr. Alok Verma)
                    </div>
                  </div>

                  <div className="p-3 rounded-3 bg-light border">
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="fw-bold text-dark">Recent Assignment Submission</span>
                      <span className="badge-meta badge-meta-purple">Graded (A)</span>
                    </div>
                    <div className="small text-muted">
                      Assignment #2: Dynamic Programming problem set reviewed with instructor notes.
                    </div>
                  </div>

                  <div className="p-3 rounded-3 bg-light border">
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="fw-bold text-dark">Community Discussion</span>
                      <span className="badge-meta badge-meta-sky">12 Replies</span>
                    </div>
                    <div className="small text-muted">
                      "Implementing Dijkstra's shortest path in Python" &bull; Active in #Algorithms
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Workspaces Section */}
      <section id="workspaces" className="py-5 py-md-6 bg-white border-bottom">
        <div className="container py-3">
          <div className="text-center mb-5" style={{ maxWidth: '860px', margin: '0 auto' }}>
            <span className="badge-meta badge-meta-purple mb-2">Multi-Persona Ecosystem</span>
            <h2
              className="fw-extrabold text-dark mb-2"
              style={{
                fontSize: 'clamp(1.75rem, 3.2vw, 2.5rem)',
                lineHeight: 1.22,
                letterSpacing: '-0.025em'
              }}
            >
              Dedicated workspaces tailored for each role
            </h2>
            <p className="text-secondary" style={{ fontSize: '0.95rem', maxWidth: '640px', margin: '0 auto' }}>
              EduAdapt provides purpose-built tools whether you are learning, instructing, or administering.
            </p>
          </div>

          <div className="row g-4">
            {workspaceRoles.map((role, idx) => (
              <div key={idx} className="col-12 col-md-4">
                <div className="card-pro h-100 p-4 p-xl-4 d-flex flex-column justify-content-between">
                  <div>
                    <div
                      className="rounded-3 d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: '44px', height: '44px', backgroundColor: role.bg, color: role.color }}
                    >
                      <i className={`bi ${role.icon} fs-5`}></i>
                    </div>
                    <h5 className="fw-bold text-dark mb-1">{role.role}</h5>
                    <div className="small fw-semibold mb-2" style={{ color: role.color }}>
                      {role.tagline}
                    </div>
                    <p className="text-secondary small mb-4">{role.description}</p>

                    <div className="p-3 rounded-3 bg-light mb-4">
                      <div className="fw-bold small text-dark mb-2" style={{ fontSize: '0.78rem' }}>
                        Key Capabilities:
                      </div>
                      <ul className="list-unstyled mb-0 d-flex flex-column gap-1 small text-secondary">
                        {role.features.map((f, fi) => (
                          <li key={fi} className="d-flex align-items-center gap-2">
                            <i className="bi bi-check2 text-success"></i>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Link to={role.link} className="btn-brand-outline w-100 small">
                    <span>Enter {role.role.split(' ')[0]} Workspace</span>
                    <i className="bi bi-chevron-right small"></i>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Pillars */}
      <section className="py-5 py-md-6" style={{ background: '#FAF9FD' }}>
        <div className="container py-3">
          <div className="text-center mb-5" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <span className="badge-meta badge-meta-purple mb-2">Platform Capabilities</span>
            <h2 className="fw-extrabold text-dark mb-2">Engineered for academic productivity</h2>
            <p className="text-secondary small">
              Built on dependable workflows, secure authentication, and seamless user experiences.
            </p>
          </div>

          <div className="row g-4">
            {pillars.map((pil, idx) => (
              <div key={idx} className="col-12 col-sm-6 col-lg-3">
                <div className="card-pro h-100 p-4 bg-white">
                  <div
                    className="rounded-2 d-inline-flex align-items-center justify-content-center mb-3"
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: 'var(--brand-50)',
                      color: 'var(--brand-700)',
                    }}
                  >
                    <i className={`bi ${pil.icon} fs-5`}></i>
                  </div>
                  <h6 className="fw-bold text-dark mb-2">{pil.title}</h6>
                  <p className="text-secondary small mb-0">{pil.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-5 bg-white border-top">
        <div className="container text-center py-4">
          <h3 className="fw-bold text-dark mb-2">Join the connected EduAdapt community</h3>
          <p className="text-secondary small mb-4" style={{ maxWidth: '500px', margin: '0 auto' }}>
            Experience streamlined campus management and personalized learning today.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/register" className="btn-brand-solid">
              Register Free
            </Link>
            <Link to="/login" className="btn-brand-outline">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
