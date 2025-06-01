import React, { useRef, useState } from "react";
import TaskForm from "./TaskForm";
import axios from "axios";
import styles from "./modules/AdminPanel.module.css";
import CustomButton from "./ui/CustomButton.jsx";
import VerificationView from "./VerificationView.jsx";
import ThemeToggle from "../utils/ThemeToggle.jsx";
import { showAlert } from "./ui/alert.jsx";
import CustomInput from "./ui/CustomInput.jsx";
import { useLanguage } from "../utils/LanguageContext.jsx";
import ToggleSwitch from "./ui/ToggleSwitch.jsx";
import GearIcon from "../utils/icons/GearIcon.jsx";
import CloseIcon from "../utils/icons/closeIcon.jsx";
import LanguageToggle from "./ui/LanguageToggle.jsx";

function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [groupCreationEnabled, setGroupCreationEnabled] = useState(true);
  const [appEnabled, setAppEnabled] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
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

  const handleToggleApp = (enable) => {
    if (enable) {
      handleEnableApp();
    } else {
      handleDisableApp();
    }
  };


  return (
    <div className={styles.adminContainer}>
      <div className={styles.zigzagContainer}></div>
      <div className={styles.themeAndLanguage}>
        <ThemeToggle />
        <LanguageToggle />
        {isLoggedIn && (
            <div onClick={() => setShowPopup(true)}
                 style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <GearIcon className={ styles.icon } />
            </div>
        )}
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
                              <h2>{task.name[language]}</h2>
                              <div className={styles.subTitleText}>
                                <p style={{fontWeight: "lighter"}}>Punkty: <span
                                    style={{fontWeight: "bold"}}>{task.score}</span></p>|
                                <p style={{fontWeight: "lighter"}}>Typ: <span
                                    style={{fontWeight: "bold"}}>{task.type}</span></p>
                              </div>
                            </div>
                            <div className={styles.taskDetails}>
                              <p>{task.description[language]}</p>
                              {task.location && task.location.lat != null && task.location.lng != null && (
                                  <p>
                                    {task.location.lat}, {task.location.lng}
                                  </p>
                              )}
                              {task.type === "qr" && <p>QR ID: {task._id}</p>}
                              <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                  }}
                              >
                                <div style={{display: "flex", gap: "0.5rem"}}>
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
                </div>
              </div>
            </div>
            <div className={styles.rightColumn}>
            <VerificationView />
          </div>

            {/* Friend List Pop-up */}
            {showPopup && (
                <div className={styles.popupOverlay} onClick={() => setShowPopup(false)}>
                  <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h1>App Settings</h1>
                      <div
                          style={{ display: "flex", alignItems: "center" }}
                          onClick={() => setShowPopup(false)}>
                        <CloseIcon className={styles.closeIcon} />
                      </div>
                    </div>

                    <div className={styles.settingsSection}>
                      <div className={styles.settInfo}>
                        <h2>Group Creation</h2>
                        <p>Control whether users can create new groups in the application</p>
                      </div>
                      <ToggleSwitch
                          leftLabel="Enable"
                          rightLabel="Disable"
                          isLeftActive={groupCreationEnabled}
                          onToggle={(enabled) => {
                            setGroupCreationEnabled(enabled);
                            enabled ? handleEnableGroupCreation() : handleDisableGroupCreation();
                          }}
                      />
                    </div>

                    <div className={styles.settingsSection}>
                      <div className={styles.settInfo}>
                        <h2>App Control</h2>
                        <p>Enable or disable the entire application functionality</p>
                      </div>

                      <ToggleSwitch
                          leftLabel="Enable"
                          rightLabel="Disable"
                          isLeftActive={appEnabled}
                          onToggle={handleToggleApp}
                      />
                    </div>

                    <div>
                      <div className={styles.settInfo} style={{ marginTop: "1rem" }}>
                        <h2>Killswitch</h2>
                        <p>This action will permanently delete all data and disable the application. This cannot be
                          undone.</p>
                      </div>
                      <CustomButton width={"100%"} variant={"warning"} onClick={handleKillswitchClick}>
                        Delete Database & Disable App
                      </CustomButton>
                    </div>
                  </div>
                </div>
            )}
          </div>
      )}
    </div>
  );
}

export default AdminPanel;