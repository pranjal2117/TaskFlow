
import { useState, useEffect } from "react";
import {
  Plus,
  LayoutDashboard,
  ListTodo,
  CheckCircle2,
  Clock,
  Trash2,
  Search,
  CalendarDays
} from "lucide-react";
import "./App.css";

const API_URL = "http://localhost:8080/api/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch tasks from Java backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Could not load tasks");
        }

        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError("Unable to connect to the server. Check whether Java is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const completed = tasks.filter(task => task.completed).length;
  const pending = tasks.length - completed;

  // Add task through Java API
  const addTask = async (e) => {
    e.preventDefault();

    if (!newTask.trim()) return;

    try {
      setError("");

      const taskData = {
        title: newTask.trim(),
        category: "Personal",
        priority: "Medium",
        completed: false
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        throw new Error("Could not create task");
      }

      const savedTask = await response.json();

      setTasks(previousTasks => [...previousTasks, savedTask]);
      setNewTask("");

    } catch (err) {
      setError(err.message);
    }
  };

  // Update task through Java API
  const toggleTask = async (task) => {
    try {
      setError("");

      const updatedTask = {
        ...task,
        completed: !task.completed
      };

      const response = await fetch(`${API_URL}/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedTask)
      });

      if (!response.ok) {
        throw new Error("Could not update task");
      }

      const savedTask = await response.json();

      setTasks(previousTasks =>
        previousTasks.map(item =>
          item.id === task.id ? savedTask : item
        )
      );

    } catch (err) {
      setError(err.message);
    }
  };

  // Delete task through Java API
  const deleteTask = async (id) => {
    try {
      setError("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Could not delete task");
      }

      setTasks(previousTasks =>
        previousTasks.filter(task => task.id !== id)
      );

    } catch (err) {
      setError(err.message);
    }
  };

  // Search and filter
  const filteredTasks = tasks.filter(task => {
    const matchesFilter =
      filter === "All" ||
      (filter === "Completed" && task.completed) ||
      (filter === "Pending" && !task.completed);

    return matchesFilter &&
      task.title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="app">

      <aside className="sidebar">
        <h2 className="logo">
          Task<span>Flow.</span>
        </h2>

        <p className="menu-label">MENU</p>

        <div className="nav-item active">
          <LayoutDashboard size={18} />
          Dashboard
        </div>

        <div className="nav-item">
          <ListTodo size={18} />
          My Tasks
        </div>

        <div className="nav-item">
          <CalendarDays size={18} />
          Calendar
        </div>

        <div className="sidebar-bottom">
          <p>Stay organized.</p>
          <small>One task at a time.</small>
        </div>
      </aside>

      <main className="main">

        <header className="topbar">
          <div>
            <p className="date">
              <CalendarDays size={15} />
              YOUR PRODUCTIVITY SPACE
            </p>

            <h1>My Dashboard</h1>
            <p className="subtitle">
              Let's make today productive.
            </p>
          </div>

          <div className="avatar">C</div>
        </header>

        <section className="stats">

          <div className="stat-card">
            <div className="stat-icon purple">
              <ListTodo />
            </div>
            <p>Total Tasks</p>
            <h2>{tasks.length}</h2>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <CheckCircle2 />
            </div>
            <p>Completed</p>
            <h2>{completed}</h2>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">
              <Clock />
            </div>
            <p>Pending</p>
            <h2>{pending}</h2>
          </div>

        </section>

        <section className="task-section">

          <div className="section-heading">
            <div>
              <h2>My Tasks</h2>
              <p>Manage your daily activities</p>
            </div>
          </div>

          <form className="add-form" onSubmit={addTask}>

            <input
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              placeholder="What needs to be done?"
            />

            <button type="submit" disabled={loading}>
              <Plus size={18} />
              Add Task
            </button>

          </form>

          {error && (
            <p style={{ color: "#d9534f", marginBottom: "15px" }}>
              {error}
            </p>
          )}

          <div className="task-toolbar">

            <div className="filters">
              {["All", "Pending", "Completed"].map(item => (
                <button
                  key={item}
                  className={
                    filter === item
                      ? "filter active-filter"
                      : "filter"
                  }
                  onClick={() => setFilter(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="search-box">
              <Search size={17} />

              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tasks..."
              />
            </div>

          </div>

          <div className="task-list">

            {loading ? (
              <p className="empty">Loading tasks from server...</p>
            ) : filteredTasks.length === 0 ? (
              <p className="empty">
                No tasks found. Add a new task!
              </p>
            ) : (
              filteredTasks.map(task => (

                <div className="task-row" key={task.id}>

                  <button
                    className={
                      task.completed
                        ? "check checked"
                        : "check"
                    }
                    onClick={() => toggleTask(task)}
                    type="button"
                  >
                    {task.completed && (
                      <CheckCircle2 size={19} />
                    )}
                  </button>

                  <div className="task-info">
                    <p
                      className={
                        task.completed
                          ? "task-title done"
                          : "task-title"
                      }
                    >
                      {task.title}
                    </p>

                    <span>{task.category}</span>
                  </div>

                  <span
                    className={`priority ${task.priority.toLowerCase()}`}
                  >
                    {task.priority}
                  </span>

                  <button
                    className="delete-btn"
                    onClick={() => deleteTask(task.id)}
                    type="button"
                    aria-label="Delete task"
                  >
                    <Trash2 size={17} />
                  </button>

                </div>

              ))
            )}

          </div>

        </section>

      </main>
    </div>
  );
}

export default App;
