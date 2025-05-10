import { useState, useEffect, useRef } from "react";
import axios from "axios";
import MapElement from "./MapElement";
import styles from "./modules/UserPanel.module.css";
import TaskCard from "./TaskCard";
import Header from "./Header.jsx";
import useAuth from "../utils/useLogout.jsx";
import { useLocation } from "react-router-dom";
import ThemeToggle from "../utils/ThemeToggle.jsx";

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
  const [groupCreated, setGroupCreated] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [groupUsers, setGroupUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
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
      setIsLoading(false); // No stored data, stop loading
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
    } catch (err) {
      console.error(err);
      alert("Failed to fetch data");
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

  const handleLogin = async () => {
    try {
      const res = await axios.post("/api/users/login", { nickname, groupCode });
      setCurrentUser(res.data);
      const groupRes = await axios.get(`/api/groups/${groupCode.toUpperCase()}`);
      setGroupName(groupRes.data.name);
      setGroupUsers(groupRes.data.users);
      setIsOwner(groupRes.data.owner._id === res.data._id);
      setIsLoggedIn(true);
      fetchData(groupCode);
      localStorage.setItem("nickname", nickname);
      localStorage.setItem("groupCode", groupCode);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data.error === "Grupa pełna (max 5 osób)") {
        alert("Grupa jest pełna! Max 5 osób.");
      } else if (err.response && err.response.data.error === "Nick already taken in this group") {
        alert("Ten nick jest już zajęty w tej grupie!");
      } else {
        alert("Nie udało się zalogować");
      }
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !ownerNickname.trim()) {
      alert("Podaj nazwę grupy i swój nick!");
      return;
    }
    try {
      const res = await axios.post("/api/groups", {
        name: newGroupName,
        ownerNickname,
      });
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
      fetchData(group.code);
      const groupRes = await axios.get(`/api/groups/${group.code}`);
      setGroupUsers(groupRes.data.users);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data.error === "Nick already taken in this group") {
        alert("Ten nick jest już zajęty w tej grupie!");
      } else {
        alert("Błąd tworzenia grupy: " + (err.response?.data?.error || "Nieznany błąd"));
      }
    }
  };

  const handleScanResult = async (scannedCode, taskId) => {
    try {
      const res = await axios.post(`/api/submissions/${taskId}/submit`, {
        groupCode,
        submissionData: scannedCode,
      });
      alert(res.data.message);
      fetchSubmissions(groupCode);
    } catch (err) {
      console.error(err);
      if (err.response) {
        alert(err.response.data.error);
      } else {
        alert("Błąd przy przetwarzaniu kodu QR");
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
          <h2>Login</h2>
          <input
            type="text"
            placeholder="Nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <input
            type="text"
            placeholder="Group Code"
            value={groupCode}
            onChange={(e) => setGroupCode(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
          <h2>Create Group</h2>
          <input
            type="text"
            placeholder="Group Name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Your Nickname"
            value={ownerNickname}
            onChange={(e) => setOwnerNickname(e.target.value)}
          />
          <button onClick={handleCreateGroup}>Create Group</button>
        </div>
      ) : (
        <div className={styles.appContainer}>
          <Header
            groupUsers={groupUsers}
            currentUser={currentUser}
            isOwner={isOwner}
            ownerId={ownerId}
            nickname={nickname}
            groupName={groupName}
            groupCode={groupCode}
            logout={logout}
          />
          <MapElement tasks={tasks} />
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
                  submission={submissions.find((sub) => sub.task._id === task._id)}
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