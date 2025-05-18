import { useState, useEffect, useRef } from "react";
import axios from "axios";
import MapElement from "./MapElement";
import styles from "./modules/UserPanel.module.css";
import TaskCard from "./TaskCard";
import Header from "./Header.jsx";
import useAuth from "../utils/useLogout.jsx";
import { useLocation } from "react-router-dom";
import ThemeToggle from "../utils/ThemeToggle.jsx";
import CustomButton from "./ui/CustomButton.jsx";
import {io} from "socket.io-client";
import {showAlert} from "./ui/alert.jsx";
import CustomInput from "./ui/CustomInput.jsx";

const socket = io('http://localhost:5000');

function UserPanel() {
  const [nickname, setNickname] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const [newGroupName, setNewGroupName] = useState("");
  const [ownerNickname, setOwnerNickname] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [groupCreated, setGroupCreated] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [groupUsers, setGroupUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [groupScore, setGroupScore] = useState(0);
  const taskListRef = useRef();

  const { logout } = useAuth({
    setIsLoggedIn,
    setNickname,
    setGroupCode,
    setGroupName,
    setGroupUsers,
    setTasks,
    setCurrentUser,
    setIsOwner,
  });

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const inviteCode = params.get("code");

  useEffect(() => {
    const storedNickname = localStorage.getItem("nickname");
    const storedGroupCode = localStorage.getItem("groupCode");

    if (inviteCode) {
      setGroupCode(inviteCode);
    }

    if (storedNickname && storedGroupCode) {
      setNickname(storedNickname);
      setGroupCode(storedGroupCode);
      setIsLoggedIn(true);
      fetchData(storedGroupCode);
    } else {
      setIsLoading(false);
    }
  }, [inviteCode]);

  const fetchData = async (code) => {
    setIsLoading(true); // Start loading
    try {
      await Promise.all([fetchTasks(), fetchSubmissions(code)]);
      const groupRes = await axios.get(`/api/groups/${code.toUpperCase()}`);
      setGroupName(groupRes.data.name);
      setGroupUsers(groupRes.data.users);
      setIsOwner(groupRes.data.owner.nickname === nickname);
      setOwnerId(groupRes.data.owner._id);
      setGroupScore(groupRes.data.score);
      localStorage.setItem("ownerId", groupRes.data.owner._id);
    } catch (err) {
      console.error(err);
      showAlert("Failed to fetch data");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get("/api/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubmissions = async (code) => {
    try {
      const res = await axios.get(`/api/submissions/group/${code}`);
      setSubmissions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (groupCode) {
      socket.emit("joinGroup", groupCode.toUpperCase());
    }

    socket.on("refreshData", () => {
      fetchData(groupCode);
    });

    socket.on("refreshTasks", () => {
      fetchData(groupCode);
      fetchSubmissions(groupCode);
    });

    return () => {
      socket.off("refreshData");
      socket.off("refreshTasks");
    };
  }, [groupCode]);

  const handleLogin = async () => {
    try {
      const res = await axios.post("/api/users/login", { nickname, groupCode });
      setCurrentUser(res.data);
      localStorage.setItem("currentUser", JSON.stringify(res.data));
      const groupRes = await axios.get(`/api/groups/${groupCode.toUpperCase()}`);
      setGroupName(groupRes.data.name);
      setGroupUsers(groupRes.data.users);
      setIsOwner(groupRes.data.owner._id === res.data._id);
      setIsLoggedIn(true);
      fetchData(groupCode);
      localStorage.setItem("nickname", nickname);
      localStorage.setItem("groupCode", groupCode);

      socket.emit("userJoined", groupCode.toUpperCase());
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data.error === "Grupa pełna (max 5 osób)") {
        showAlert("Grupa jest pełna! Max 5 osób.");
      } else if (err.response && err.response.data.error === "Nick already taken in this group") {
        showAlert("Ten nick jest już zajęty w tej grupie!");
      } else {
        showAlert("Nie udało się zalogować");
      }
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !ownerNickname.trim()) {
      showAlert("Podaj nazwę grupy i swój nick!");
      return;
    }
    try {
      const res = await axios.post("/api/groups", {
        name: newGroupName,
        ownerNickname,
      });
      setCurrentUser(res.data.user);
      localStorage.setItem("currentUser", JSON.stringify(res.data.user));
      const { group, user } = res.data;
      setGroupCreated(group);
      setNickname(ownerNickname);
      setGroupCode(group.code);
      setGroupName(group.name);
      setCurrentUser(user);
      setIsOwner(true);
      setIsLoggedIn(true);
      localStorage.setItem("nickname", ownerNickname);
      localStorage.setItem("groupCode", group.code);
      localStorage.setItem("ownerId", group.owner._id);
      fetchData(group.code);
      const groupRes = await axios.get(`/api/groups/${group.code}`);
      setGroupUsers(groupRes.data.users);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data.error === "Nick already taken in this group") {
        showAlert("Ten nick jest już zajęty w tej grupie!");
      } else {
        showAlert("Błąd tworzenia grupy: " + (err.response?.data?.error || "Nieznany błąd"));
      }
    }
  };

  const handleScanResult = async (scannedCode, taskId) => {
    try {
      const res = await axios.post(`/api/submissions/${taskId}/submit`, {
        groupCode,
        submissionData: scannedCode,
      });
      showAlert(res.data.message);
      fetchSubmissions(groupCode);
    } catch (err) {
      console.error(err);
      if (err.response) {
        showAlert(err.response.data.error);
      } else {
        showAlert("Błąd przy przetwarzaniu kodu QR");
      }
    }
  };

  const toggleTask = (taskId) => {
    setExpandedTaskId((prevId) => (prevId === taskId ? null : taskId));
  };

  return (
    <div className={styles.UserPanelContainer}>
      {!isLoggedIn ? (
          <div className={styles.loginContainer}>
            <div className={styles.themeAndLanguage}>
              🇵🇱
              <ThemeToggle variant="emoji"/>
            </div>
            <div className={styles.zigzagContainer}></div>
            <div className={styles.loginForm}>
              <div className={styles.personLoginForm}>
                <div className={styles.textStack}>
                  <h1 className={styles.textStroke}>Dołącz do Gry</h1>
                  <h1 className={styles.textFill}>Dołącz do Gry</h1>
                </div>
                <CustomInput
                    className={styles.input}
                    type="text"
                    placeholder="Kod Grupy"
                    value={groupCode || ""}
                    onChange={(e) => setGroupCode(e.target.value)}
                />
                <CustomInput
                    className={styles.input}
                    type="text"
                    placeholder="Twój Nick"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                />
                <CustomButton className={styles.button}
                        onClick={handleLogin}>
                  Dołącz
                </CustomButton>
              </div>
              {!inviteCode && (
                  <div className={styles.groupLoginForm}>
                    <div className={styles.textStack}>
                      <h1 className={styles.textStroke}>Lub stwórz nową grupę</h1>
                      <h1 className={styles.textFill}>Lub stwórz nową grupę</h1>
                    </div>
                    <CustomInput
                        className={styles.input}
                        type="text"
                        placeholder="Nazwa Grupy"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                    />
                    <CustomInput
                        className={styles.input}
                        type="text"
                        placeholder="Twój Nick (Lider)"
                        value={ownerNickname}
                        onChange={(e) => setOwnerNickname(e.target.value)}
                    />
                    <CustomButton className={styles.button}
                            onClick={handleCreateGroup}>
                      Stwórz Grupę
                    </CustomButton>
                  </div>
              )}
            </div>
          </div>
      ) : (
          <div className={styles.appContainer}>
            <Header
                groupUsers={groupUsers}
                setGroupUsers={setGroupUsers}
                currentUser={currentUser}
                isOwner={isOwner}
                setIsOwner={setIsOwner}
                ownerId={ownerId}
                nickname={nickname}
                groupName={groupName}
                groupCode={groupCode}
                logout={logout}
                groupScore={groupScore}
                onUserUpdate={() => fetchData(groupCode)}
            />
            <MapElement tasks={tasks}/>
            {isLoading ? (
                <div>Loading tasks...</div>
            ) : (
                <div className={styles.taskList} ref={taskListRef}>
                  {tasks.map((task, index) => (
                      <TaskCard
                          key={task._id}
                          task={task}
                          index={index}
                          containerRef={taskListRef}
                          expandedTaskId={expandedTaskId}
                          toggleTask={toggleTask}
                          handleScanResult={handleScanResult}
                          submission={submissions.find((sub) => sub.task?._id === task._id)}
                          groupCode={groupCode}
                          fetchSubmissions={() => fetchSubmissions(groupCode)}
                      />
                  ))}
                </div>
            )}
          </div>
      )}
    </div>
  );
}

export default UserPanel;