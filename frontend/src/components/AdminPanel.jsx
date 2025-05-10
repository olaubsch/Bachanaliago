import { useState } from "react";
import TaskForm from "./TaskForm";
import axios from "axios";
import styles from "./modules/AdminPanel.module.css";

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
    <div className={styles.adminContainer}>
      {!isLoggedIn ? (
        <div className={styles.adminForm}>
          <h2>Admin Login</h2>
          <input
            type="password"
            placeholder="Hasło"
            value={password}
            className={styles.input}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className={styles.button} onClick={handleLogin}>
            Zaloguj
          </button>
        </div>
      ) : (
        <div className={styles.adminForm}>
          <h2 className={styles.taskHeader}>Panel Admina</h2>
          <div className={styles.columnsWrapper}>
            <div className={styles.leftColumn}>
              <TaskForm onTaskAdded={fetchTasks} />
            </div>
            <div className={styles.rightColumn}>
              <h3 className={styles.taskHeader}>Lista Tasków</h3>
              <div className={styles.adminTaskList}>
                {tasks.map((task) => (
                  <div key={task._id} className={styles.adminTaskCard}>
                    <div className={styles.taskHeader}>
                      <strong>{task.name}</strong>
                    </div>
                    <div className={styles.taskDetails}>
                      <p>{task.description}</p>
                      <p>
                        {task.location.lat}, {task.location.lng}
                      </p>
                      <p>Punkty: {task.score}</p>
                      <p>Typ: {task.type}</p>
                      {task.type === "qr" && <p>QR ID: {task._id}</p>}
                      <button
                        className={styles.button}
                        onClick={() => handleDelete(task._id)}
                      >
                        Usuń
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;