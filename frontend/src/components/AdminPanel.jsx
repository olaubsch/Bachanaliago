import {useRef, useState} from "react";
import TaskForm from "./TaskForm";
import axios from "axios";
import styles from "./modules/AdminPanel.module.css";
import CustomButton from "./ui/CustomButton.jsx";

function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef();

  const fetchTasks = async () => {
    try {
      const res = await axios.get("/api/tasks");
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
      await axios.delete(`/api/tasks/${id}`);
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleExternalSubmit = async () => {
    if (formRef.current) {
      const success = await formRef.current.submit();
      if (success) {
        setShowForm(false);
      }
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
            <div className={styles.zigzagContainer}></div>
            <div className={styles.contentContainer}>
              <div className={styles.headerControls}>
                <h2>{showForm ? "Dodaj Taska" : "Lista Tasków"}</h2>
                <div style={{display: "flex", gap: "0.5rem"}}>
                  <CustomButton variant={showForm ? "outline" : "default"} onClick={() => setShowForm((prev) => !prev)}>
                    {showForm ? "Anuluj" : "Dodaj"}
                  </CustomButton>
                  {showForm && (
                      <CustomButton onClick={handleExternalSubmit}>
                        Dodaj
                      </CustomButton>
                  )}
                </div>
              </div>
              {showForm ? (
                  <div
                      className={`${styles.taskForm} ${showForm ? styles.show : styles.hide}`}
                  >
                    <TaskForm ref={formRef} onTaskAdded={fetchTasks}/>
                  </div>
              ) : (
                  <div
                      className={`${styles.adminTaskList} ${!showForm ? styles.show : styles.hide}`}
                  >
                    {tasks.map((task) => (
                        <div key={task._id} className={styles.adminTaskCard}>
                          <div className={styles.taskHeader}>
                            <strong>{task.name}</strong>
                          </div>
                          <div className={styles.taskDetails}>
                            <p>{task.description}</p>
                            <p>{task.location.lat}, {task.location.lng}</p>
                            <p>Punkty: {task.score}</p>
                            <p>Typ: {task.type}</p>
                            {task.type === "qr" && <p>QR ID: {task._id}</p>}
                            <CustomButton
                                width={"fit-content"}
                                className={styles.button}
                                onClick={() => handleDelete(task._id)}
                            >
                              Usuń
                            </CustomButton>
                          </div>
                        </div>
                    ))}
                  </div>
              )}
            </div>
          </div>
      )}
    </div>
  );
}

export default AdminPanel;