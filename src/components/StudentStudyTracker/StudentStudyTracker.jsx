import { useState, useEffect } from 'react'

function StudentStudyTracker() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('eduadapt_student_tasks')
      return saved
        ? JSON.parse(saved)
        : [
            { id: 1, text: 'Review Chapter 3 Lecture Slides', done: false, priority: 'High' },
            { id: 2, text: 'Submit Computer Networks Problem Set', done: true, priority: 'Medium' },
            { id: 3, text: 'Complete Weekly Knowledge Check', done: false, priority: 'Low' }
          ]
    } catch {
      return []
    }
  })

  const [newTaskText, setNewTaskText] = useState('')
  const [priority, setPriority] = useState('Medium')

  useEffect(() => {
    localStorage.setItem('eduadapt_student_tasks', JSON.stringify(tasks))
  }, [tasks])

  const toggleTask = (id) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id))
  }

  const addTask = (e) => {
    e.preventDefault()
    if (!newTaskText.trim()) return
    const newTask = {
      id: Date.now(),
      text: newTaskText.trim(),
      done: false,
      priority
    }
    setTasks([newTask, ...tasks])
    setNewTaskText('')
  }

  const completedCount = tasks.filter((t) => t.done).length
  const completionPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  return (
    <div className="card-premium p-4 mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-success bg-success-subtle"
            style={{ width: '36px', height: '36px' }}
          >
            <i className="bi bi-check2-circle fs-5"></i>
          </div>
          <div>
            <h6 className="fw-bold mb-0 text-dark">Personal Study Tracker & Tasks</h6>
            <span className="text-muted small">Stay disciplined with your daily learning targets</span>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="small text-muted">{completedCount}/{tasks.length} Completed</span>
          <div className="badge bg-success-subtle text-success">{completionPercent}%</div>
        </div>
      </div>

      <div className="progress mb-3" style={{ height: '6px' }}>
        <div
          className="progress-bar bg-success"
          role="progressbar"
          style={{ width: `${completionPercent}%` }}
        ></div>
      </div>

      <form onSubmit={addTask} className="d-flex gap-2 mb-3">
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="Add a new study goal or homework item..."
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
        />
        <select
          className="form-select form-select-sm"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          style={{ width: '110px' }}
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <button type="submit" className="btn btn-sm btn-primary rounded-3 text-nowrap px-3">
          Add
        </button>
      </form>

      <div className="d-flex flex-column gap-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className={`p-2 px-3 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer ${
              task.done ? 'bg-light text-muted' : 'bg-white'
            }`}
            style={{ cursor: 'pointer' }}
          >
            <div className="d-flex align-items-center gap-2">
              <i
                className={`bi ${task.done ? 'bi-check-circle-fill text-success' : 'bi-circle text-muted'}`}
              ></i>
              <span className={`small ${task.done ? 'text-decoration-line-through text-muted' : 'fw-medium text-dark'}`}>
                {task.text}
              </span>
            </div>

            <div className="d-flex align-items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <span
                className={`badge ${
                  task.priority === 'High'
                    ? 'bg-danger-subtle text-danger'
                    : task.priority === 'Medium'
                    ? 'bg-warning-subtle text-warning-emphasis'
                    : 'bg-info-subtle text-info-emphasis'
                }`}
                style={{ fontSize: '0.68rem' }}
              >
                {task.priority}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                className="btn btn-sm text-danger border-0 p-0"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StudentStudyTracker
