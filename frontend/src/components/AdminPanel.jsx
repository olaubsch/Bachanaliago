import { useRef, useState } from "react";
import TaskForm from "./TaskForm";
import axios from "axios";
import styles from "./modules/AdminPanel.module.css";
import CustomButton from "./ui/CustomButton.jsx";
import VerificationView from "./VerificationView.jsx";
import ThemeToggle from "../utils/ThemeToggle.jsx";
import { showAlert } from "./ui/alert.jsx";
import CustomInput from "./ui/CustomInput.jsx";
import { useLanguage } from "../utils/LanguageContext.jsx";

function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [groupCreationEnabled, setGroupCreationEnabled] = useState(true);
  const { language } = useLanguage();
  const formRef = useRef();

  const fetchTasks = async () => {
    try {
      const res = await axios.get("/api/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post("/api/admin/login", { password });
      if (res.status === 200) {
        setIsLoggedIn(true);
        fetchTasks();
        try {
          const settingRes = await axios.get("/api/groups/settings/groupCreationEnabled");
          setGroupCreationEnabled(settingRes.data.enabled);
        } catch (err) {
          console.error("Error fetching settings", err);
        }
      }
    } catch (err) {
      showAlert("Złe hasło");
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

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleExternalSubmit = async () => {
    if (formRef.current) {
      const success = await formRef.current.submit(editingTask);
      if (success) {
        setShowForm(false);
        setEditingTask(null);
      }
    }
  };

  const handleEnableGroupCreation = async () => {
    try {
      await axios.post("/api/groups/settings/enableGroupCreation");
      setGroupCreationEnabled(true);
      showAlert("Group creation enabled");
    } catch (err) {
      showAlert("Error enabling group creation");
    }
  };

  const handleDisableGroupCreation = async () => {
    try {
      await axios.post("/api/groups/settings/disableGroupCreation");
      setGroupCreationEnabled(false);
      showAlert("Group creation disabled");
    } catch (err) {
      showAlert("Error disabling group creation");
    }
  };

  const handleKillswitchClick = () => {
    if (window.confirm("Are you sure you want to delete the entire database and disable the app?")) {
      if (window.confirm("This action cannot be undone. Confirm?")) {
        const password = prompt("Enter admin password:");
        if (password) {
          axios.post("/api/admin/killswitch", { password })
            .then(() => showAlert("Database deleted and app disabled"))
            .catch(() => showAlert("Error performing killswitch"));
        }
      }
    }
  };

  const handleEnableApp = () => {
    if (window.confirm("Are you sure you want to enable the app?")) {
      const password = prompt("Enter admin password:");
      if (password) {
        axios.post("/api/admin/enableApp", { password })
          .then(() => showAlert("App enabled"))
          .catch(() => showAlert("Error enabling app"));
      }
    }
  };

  const handleDisableApp = () => {
    if (window.confirm("Are you sure you want to disable the app?")) {
      const password = prompt("Enter admin password:");
      if (password) {
        axios.post("/api/admin/disableApp", { password })
          .then(() => showAlert("App disabled"))
          .catch(() => showAlert("Error disabling app"));
      }
    }
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.zigzagContainer}></div>
      <div className={styles.themeAndLanguage}>
        <ThemeToggle variant={"emoji"} />
      </div>
      {!isLoggedIn ? (
          <div className={styles.adminForm}>
            <h2>Admin Login</h2>
            <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLogin();
                }}
                style={{display: "flex", gap: 10}}
            >
              <div style={{display: "flex", gap: 10}}>
                <CustomInput
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
            </form>
          </div>
      ) : (
          <div className={styles.adminPanel}>
            <div className={styles.leftColumn}>
              <div className={styles.adminForm}>
                <h2 className={styles.taskHeader}>Panel Admina</h2>
                <div className={styles.contentContainer}>
                  <div className={styles.headerControls}>
                    <h2>{showForm ? editingTask ? "Edytowanie Taska" : "Dodaj Taska" : "Lista Tasków"}</h2>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <CustomButton
                        variant={showForm ? "outline" : "default"}
                        onClick={() => {
                          setShowForm((prev) => {
                            const newState = !prev;
                            if (!newState) {
                              setEditingTask(null);
                            }
                            return newState;
                          });
                        }}
                    >
                      {showForm ? "Anuluj" : "Dodaj"}
                    </CustomButton>

                    {showForm && (
                      <CustomButton onClick={handleExternalSubmit}>
                        {editingTask ? "Zapisz" : "Dodaj"}
                      </CustomButton>
                    )}
                  </div>
                </div>
                {showForm ? (
                  <div
                    className={`${styles.taskForm} ${
                      showForm ? styles.show : styles.hide
                    }`}
                  >
                    <TaskForm
                        ref={formRef}
                        onTaskAdded={fetchTasks}
                        task={editingTask}
                    />
                  </div>
                ) : (
                  <div
                    className={`${styles.adminTaskList} ${
                      !showForm ? styles.show : styles.hide
                    }`}
                  >
                    {tasks.map((task) => (
                      <div key={task._id} className={styles.adminTaskCard}>
                        <div className={styles.taskHeader}>
                          <strong>{task.name[language]}</strong>
                        </div>
                        <div className={styles.taskDetails}>
                          <p>{task.description[language]}</p>
                          <p>
                            {task.location.lat}, {task.location.lng}
                          </p>
                          <p>Punkty: {task.score}</p>
                          <p>Typ: {task.type}</p>
                          {task.type === "qr" && <p>QR ID: {task._id}</p>}
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                            }}
                          >
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <CustomButton
                                  width={"fit-content"}
                                  variant={"outline"}
                                  onClick={() => handleDelete(task._id)}
                              >
                                Usuń
                              </CustomButton>
                              <CustomButton
                                  width={"fit-content"}
                                  onClick={() => handleEdit(task)}
                              >
                                Edytuj
                              </CustomButton>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className={styles.settingsSection}>
                  <h3>Group Creation Settings</h3>
                  <p>Current status: {groupCreationEnabled ? "Enabled" : "Disabled"}</p>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <CustomButton onClick={handleEnableGroupCreation}>Enable</CustomButton>
                    <CustomButton onClick={handleDisableGroupCreation}>Disable</CustomButton>
                  </div>
                </div>
                <div className={styles.settingsSection}>
                  <h3>App Control</h3>
                  <CustomButton onClick={handleEnableApp}>
                    Enable App
                  </CustomButton>
                  <CustomButton onClick={handleDisableApp}>
                    Disable App
                  </CustomButton>
                </div>
                <div className={styles.settingsSection}>
                  <h3>Killswitch</h3>
                  <p>Warning: This will delete the entire database and disable the app.</p>
                  <CustomButton onClick={handleKillswitchClick}>
                    Delete Database and Disable App
                  </CustomButton>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.rightColumn}>
            <VerificationView />
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;