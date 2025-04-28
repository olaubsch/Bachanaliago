import { useState } from "react";
import TaskForm from "./TaskForm";
import axios from "axios";

function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = () => {
    if (password === "admin123") {
      setIsLoggedIn(true);
      fetchTasks();
    } else {
      alert("Złe hasło");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`);
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {!isLoggedIn ? (
        <div>
          <h2>Admin Login</h2>
          <input
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Zaloguj</button>
        </div>
      ) : (
        <div>
          <h2>Panel Admina</h2>
          <TaskForm onTaskAdded={fetchTasks} />
          <h3>Lista Tasków</h3>
          <ul>
            {tasks.map((task) => (
              <li key={task._id}>
                {task.name} - {task.description} ({task.location.lat},{" "}
                {task.location.lng}) {task.score} - {task.qrcode}
                <button onClick={() => handleDelete(task._id)}>Usuń</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;