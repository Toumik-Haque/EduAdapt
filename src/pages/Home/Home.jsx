import { Link } from 'react-router-dom'

const roles = [
  {
    icon: "bi-mortarboard-fill",
    title: "Start Learning",
    subtitle: "For every learner",
    text: "Personalized learning journeys that evolve with goals, pace and progress.",
    color: "#7C3AED",
    bg: "#F5F3FF",
  },
  {
    icon: "bi-person-video3",
    title: "Start Teaching",
    subtitle: "For every teacher",
    text: "Create, teach, assess and guide learners with meaningful insights.",
    color: "#8B5CF6",
    bg: "#F5F3FF",
  },
  {
    icon: "bi-building",
    title: "Connect Institutions",
    subtitle: "For connected education",
    text: "Bring learners and teachers together in one intelligent ecosystem.",
    color: "#A855F7",
    bg: "#FAF5FF",
  },
];

const steps = [
  {
    number: "01",
    icon: "bi-book",
    title: "Learn",
    text: "Explore lessons, courses and learning resources.",
  },
  {
    number: "02",
    icon: "bi-clipboard2-check",
    title: "Assess",
    text: "Understand learning through activities and assessments.",
  },
  {
    number: "03",
    icon: "bi-stars",
    title: "Adapt",
    text: "Identify learning needs and determine the next step.",
  },
  {
    number: "04",
    icon: "bi-graph-up-arrow",
    title: "Grow",
    text: "Track progress and continuously improve.",
  },
];

const features = [
  {
    icon: "bi-person-heart",
    title: "Learner-Centered",
    text: "Learning experiences designed around individual needs.",
  },
  {
    icon: "bi-lightning-charge",
    title: "Adaptive Intelligence",
    text: "Learning paths can evolve from activity and assessment insights.",
  },
  {
    icon: "bi-people",
    title: "Connected Ecosystem",
    text: "Learners, teachers and institutions work within one platform.",
  },
];

function Home() {

  return (
    <div className="bg-white text-dark">

      {/* =====================================================
          HERO
      ====================================================== */}
      <section
        className="position-relative overflow-hidden"
        style={{
          background:
            "radial-gradient(circle at 75% 25%, rgba(124,58,237,0.12), transparent 32%), linear-gradient(180deg, #FAF8FF 0%, #FFFFFF 85%)",
        }}
      >
        {/* Decorative grid */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            opacity: 0.35,
            backgroundImage:
              "linear-gradient(rgba(124,58,237,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.035) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
            pointerEvents: "none",
          }}
        />

        {/* Glow */}
        <div
          className="position-absolute rounded-circle"
          style={{
            width: "420px",
            height: "420px",
            right: "-170px",
            top: "-170px",
            background: "rgba(168,85,247,0.10)",
            filter: "blur(15px)",
          }}
        />

        <div className="container position-relative py-5">
          <div
            className="row align-items-center g-5 py-lg-4 mx-0"
          >

            {/* HERO CONTENT */}
            <div className="col-lg-6">

              <div
                className="d-inline-flex align-items-center gap-2 rounded-pill px-3 py-2 mb-4"
                style={{
                  background: "#F5F3FF",
                  color: "#6D28D9",
                  border: "1px solid #E9D5FF",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                }}
              >
                <span
                  className="rounded-circle"
                  style={{
                    width: "7px",
                    height: "7px",
                    background: "#8B5CF6",
                  }}
                />
                Adaptive Education Ecosystem
              </div>

              <h1
                className="fw-bold mb-3"
                style={{
                  fontSize: "clamp(2.5rem, 5vw, 4.35rem)",
                  lineHeight: 1.05,
                  letterSpacing: "-2.5px",
                }}
              >
                Education that
                <span
                  className="d-block"
                  style={{
                    lineHeight: 1.15,
                    paddingBottom: "0.08em",
                    background:
                      "linear-gradient(100deg, #6D28D9, #8B5CF6, #A855F7)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  adapts to every journey.
                </span>
              </h1>

              <p
                className="text-secondary mb-4"
                style={{
                  maxWidth: "560px",
                  fontSize: "1.05rem",
                  lineHeight: 1.75,
                }}
              >
                EduAdapt connects learning, teaching, assessment and
                institutions into one intelligent education ecosystem —
                helping every learner move forward with a clearer path.
              </p>

              <div className="d-flex flex-wrap gap-3">

                <Link
                  to="/register"
                  className="btn text-white px-4 py-3 rounded-3 fw-semibold shadow-sm"
                  style={{
                    background:
                      "linear-gradient(135deg, #6D28D9, #8B5CF6)",
                    border: "none",
                  }}
                >
                  Get Started
                  <i className="bi bi-arrow-right ms-2" />
                </Link>

                <a
                  href="#ecosystem"
                  className="btn bg-white border px-4 py-3 rounded-3 fw-semibold"
                >
                  Explore Ecosystem
                </a>

              </div>

              {/* Hero highlights */}
              <div className="d-flex flex-wrap gap-4 mt-4 pt-2">

                <div className="d-flex align-items-center gap-2">
                  <i
                    className="bi bi-check-circle-fill"
                    style={{ color: "#7C3AED" }}
                  />
                  <span className="small text-secondary">
                    Personalized
                  </span>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <i
                    className="bi bi-check-circle-fill"
                    style={{ color: "#7C3AED" }}
                  />
                  <span className="small text-secondary">
                    Adaptive
                  </span>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <i
                    className="bi bi-check-circle-fill"
                    style={{ color: "#7C3AED" }}
                  />
                  <span className="small text-secondary">
                    Connected
                  </span>
                </div>

              </div>

            </div>


            {/* =================================================
                HERO ECOSYSTEM VISUAL
            ================================================== */}
            <div className="col-lg-6">

              <div
                className="position-relative mx-auto"
                style={{
                  width: "100%",
                  maxWidth: "500px",
                  minHeight: "430px",
                }}
              >

                {/* Central ecosystem */}
                <div
                  className="position-absolute top-50 start-50 translate-middle rounded-circle d-flex flex-column align-items-center justify-content-center text-center"
                  style={{
                    width: "175px",
                    height: "175px",
                    background:
                      "linear-gradient(145deg, #6D28D9, #8B5CF6)",
                    color: "white",
                    boxShadow:
                      "0 25px 60px rgba(109,40,217,0.28)",
                    zIndex: 3,
                  }}
                >
                  <i className="bi bi-stars fs-2 mb-2" />

                  <div className="fw-bold fs-5">
                    EduAdapt
                  </div>

                  <div
                    className="small mt-1"
                    style={{ opacity: 0.82 }}
                  >
                    Smart Education
                  </div>
                </div>


                {/* Connection rings */}
                <div
                  className="position-absolute top-50 start-50 translate-middle rounded-circle"
                  style={{
                    width: "min(250px, 100%)",
                    height: "min(250px, 100%)",
                    border: "1px dashed rgba(124,58,237,0.25)",
                  }}
                />

                <div
                  className="position-absolute top-50 start-50 translate-middle rounded-circle"
                  style={{
                    width: "min(345px)",
                    height: "min(345px)",
                    border: "1px dashed rgba(124,58,237,0.15)",
                  }}
                />


                {/* Learner */}
                <div
                  className="position-absolute bg-white rounded-4 border shadow-sm p-3"
                  style={{
                    left: "0",
                    top: "35px",
                    width: "min(175px, 49%)",
                    zIndex: 4,
                  }}
                >
                  <div className="d-flex align-items-center gap-3">

                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: "44px",
                        height: "44px",
                        background: "#F5F3FF",
                        color: "#7C3AED",
                      }}
                    >
                      <i className="bi bi-mortarboard-fill fs-5" />
                    </div>

                    <div>
                      <div className="fw-bold small">
                        Learners
                      </div>
                      <div
                        className="text-secondary"
                        style={{ fontSize: "11px" }}
                      >
                        Learn & improve
                      </div>
                    </div>

                  </div>
                </div>


                {/* Teacher */}
                <div
                  className="position-absolute bg-white rounded-4 border shadow-sm p-3"
                  style={{
                    right: "0",
                    top: "35px",
                    width: "min(175px, 49%)",
                    zIndex: 4,
                  }}
                >
                  <div className="d-flex align-items-center gap-3">

                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: "44px",
                        height: "44px",
                        background: "#FAF5FF",
                        color: "#8B5CF6",
                      }}
                    >
                      <i className="bi bi-person-video3 fs-5" />
                    </div>

                    <div>
                      <div className="fw-bold small">
                        Teachers
                      </div>
                      <div
                        className="text-secondary"
                        style={{ fontSize: "11px" }}
                      >
                        Teach & guide
                      </div>
                    </div>

                  </div>
                </div>


                {/* Institution */}
                <div
                  className="position-absolute bg-white rounded-4 border shadow-sm p-3"
                  style={{
                    left: "50%",
                    transform: "translateX(-50%)",
                    bottom: "10px",
                    width: "195px",
                    zIndex: 4,
                  }}
                >
                  <div className="d-flex align-items-center gap-3">

                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: "44px",
                        height: "44px",
                        background: "#FAF5FF",
                        color: "#A855F7",
                      }}
                    >
                      <i className="bi bi-building fs-5" />
                    </div>

                    <div>
                      <div className="fw-bold small">
                        Institutions
                      </div>
                      <div
                        className="text-secondary"
                        style={{ fontSize: "11px" }}
                      >
                        Connect & manage
                      </div>
                    </div>

                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>


      {/* =====================================================
          ECOSYSTEM
      ====================================================== */}
      <section className="py-5" id="ecosystem">

        <div className="container py-lg-4">

          <div className="text-center mb-5">

            <div
              className="small fw-bold mb-2"
              style={{
                color: "#7C3AED",
                letterSpacing: "1.5px",
              }}
            >
              ONE EDUCATION ECOSYSTEM
            </div>

            <h2 className="fw-bold mb-3">
              Built for everyone in education
            </h2>

            <p
              className="text-secondary mx-auto"
              style={{
                maxWidth: "650px",
                lineHeight: 1.7,
              }}
            >
              A common platform where individual learning, teaching and
              institutional education can exist together.
            </p>

          </div>


          <div className="row g-4">

            {roles.map((role) => (

              <div className="col-md-4" key={role.title}>

                <Link
                  to="/register"
                  className="text-decoration-none text-dark"
                >

                  <div
                    className="h-100 rounded-4 p-4 border bg-white"
                    style={{
                      transition: "all 0.25s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform =
                        "translateY(-7px)";

                      e.currentTarget.style.boxShadow =
                        "0 18px 45px rgba(109,40,217,0.10)";

                      e.currentTarget.style.borderColor =
                        "#C4B5FD";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform =
                        "translateY(0)";

                      e.currentTarget.style.boxShadow =
                        "none";

                      e.currentTarget.style.borderColor =
                        "#dee2e6";
                    }}
                  >

                    <div
                      className="rounded-4 d-flex align-items-center justify-content-center mb-4"
                      style={{
                        width: "58px",
                        height: "58px",
                        background: role.bg,
                        color: role.color,
                      }}
                    >
                      <i className={`bi ${role.icon} fs-4`} />
                    </div>

                    {/* <div
                      className="small fw-semibold mb-1"
                      style={{ color: role.color }}
                    >
                      {role.subtitle}
                    </div> */}

                    <h4 className="fw-bold mb-2">
                      {role.title}
                    </h4>

                    <p className="text-secondary mb-4">
                      {role.text}
                    </p>

                    <span
                      className="small fw-semibold"
                      style={{ color: role.color }}
                    >
                      Explore
                      <i className="bi bi-arrow-right ms-2" />
                    </span>

                  </div>

                </Link>

              </div>

            ))}

          </div>

        </div>
      </section>


      {/* =====================================================
          ADAPTIVE SECTION
      ====================================================== */}
      <section
        className="py-5"
        style={{
          background:
            "linear-gradient(180deg, #FAF8FF, #F7F3FF)",
        }}
      >

        <div className="container py-lg-4">

          <div className="row align-items-center g-5 mx-0">

            {/* TEXT */}
            <div className="col-lg-5">

              <div
                className="small fw-bold mb-2"
                style={{
                  color: "#7C3AED",
                  letterSpacing: "1.5px",
                }}
              >
                THE ADAPTIVE LOOP
              </div>

              <h2 className="fw-bold mb-3">
                Learning doesn't have to follow
                <span style={{ color: "#7C3AED" }}>
                  {" "}one fixed path.
                </span>
              </h2>

              <p
                className="text-secondary"
                style={{
                  lineHeight: 1.75,
                }}
              >
                EduAdapt uses learning activity and assessment insights
                to help determine what the learner should focus on next.
              </p>

            </div>


            {/* STEPS */}
            <div className="col-lg-7">

              <div className="row g-3">

                {steps.map((step) => (

                  <div className="col-sm-6" key={step.number}>

                    <div
                      className="bg-white border rounded-4 p-4 h-100"
                      style={{
                        transition: "transform 0.2s ease",
                      }}
                    >

                      <div className="d-flex justify-content-between mb-4">

                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center"
                          style={{
                            width: "45px",
                            height: "45px",
                            background: "#F5F3FF",
                            color: "#7C3AED",
                          }}
                        >
                          <i className={`bi ${step.icon}`} />
                        </div>

                        <span
                          className="small fw-bold"
                          style={{
                            color: "#C4B5FD",
                          }}
                        >
                          {step.number}
                        </span>

                      </div>

                      <h5 className="fw-bold">
                        {step.title}
                      </h5>

                      <p className="text-secondary small mb-0">
                        {step.text}
                      </p>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          FEATURES
      ====================================================== */}
      <section className="py-5">

        <div className="container py-lg-4">

          <div className="text-center mb-5">

            <div
              className="small fw-bold mb-2"
              style={{
                color: "#7C3AED",
                letterSpacing: "1.5px",
              }}
            >
              SMART BY DESIGN
            </div>

            <h2 className="fw-bold mb-3">
              Technology that stays simple
            </h2>

            <p
              className="text-secondary mx-auto"
              style={{ maxWidth: "600px" }}
            >
              Powerful intelligence works behind the scenes while the
              experience remains clear and human.
            </p>

          </div>


          <div className="row g-4">

            {features.map((feature) => (

              <div className="col-md-4" key={feature.title}>

                <div className="text-center px-3">

                  <div
                    className="mx-auto mb-3 rounded-4 d-flex align-items-center justify-content-center"
                    style={{
                      width: "62px",
                      height: "62px",
                      background: "#F5F3FF",
                      color: "#7C3AED",
                    }}
                  >
                    <i className={`bi ${feature.icon} fs-4`} />
                  </div>

                  <h5 className="fw-bold">
                    {feature.title}
                  </h5>

                  <p className="text-secondary small mb-0">
                    {feature.text}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>
      </section>


      {/* =====================================================
          FINAL CTA
      ====================================================== */}
      <section className="pb-5">

        <div className="container">

          <div
            className="position-relative overflow-hidden rounded-4 p-4 p-md-5 text-center"
            style={{
              background:
                "linear-gradient(135deg, #4C1D95, #6D28D9 45%, #8B5CF6)",
              color: "white",
            }}
          >

            {/* Decorative circles */}
            <div
              className="position-absolute rounded-circle"
              style={{
                width: "260px",
                height: "260px",
                top: "-160px",
                right: "-80px",
                background: "rgba(255,255,255,0.08)",
              }}
            />

            <div
              className="position-absolute rounded-circle"
              style={{
                width: "200px",
                height: "200px",
                bottom: "-130px",
                left: "-60px",
                background: "rgba(255,255,255,0.06)",
              }}
            />

            <div className="position-relative">

              <i className="bi bi-stars fs-2" />

              <h2 className="fw-bold mt-3 mb-2">
                Start your learning journey.
              </h2>

              <p
                className="mb-4"
                style={{ opacity: 0.88 }}
              >
                Learn. Assess. Adapt. Grow.
              </p>

              <Link
                to="/register"
                className="btn btn-light px-4 py-3 rounded-3 fw-semibold"
              >
                Join EduAdapt
                <i className="bi bi-arrow-right ms-2" />
              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className="border-top py-4">

        <div className="container">

          <div
            className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2"
          >

            <div className="fw-bold">
              <span style={{ color: "#7C3AED" }}>
                Edu
              </span>
              Adapt
            </div>

            <div className="text-secondary small">
              Learn • Teach • Adapt • Grow
            </div>

            <div className="text-secondary small">
              © {new Date().getFullYear()} EduAdapt
            </div>

          </div>

        </div>

      </footer>

    </div>
  );
}

export default Home;
