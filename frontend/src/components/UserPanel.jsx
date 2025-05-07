import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import MapElement from "./MapElement";
import styles from "./modules/UserPanel.module.css";
import zigzag from "../assets/zigzag.svg"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import TaskCard from "./TaskCard";
import Header from "./Header.jsx"
import useAuth from "../utils/useLogout.jsx";

function UserPanel() {
  const [nickname, setNickname] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [ownerNickname, setOwnerNickname] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [groupCreated, setGroupCreated] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [groupUsers, setGroupUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [backgroundText, setBackgroundText] = useState("");
  const [groupScore, setGroupScore] = useState(0);
  const taskListRef = useRef();
  const { scrollY } = useScroll({ container: taskListRef });

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

  useEffect(() => {
    const storedNickname = localStorage.getItem("nickname");
    const storedGroupCode = localStorage.getItem("groupCode");
    if (storedNickname && storedGroupCode) {
      setNickname(storedNickname);
      setGroupCode(storedGroupCode);
      setIsLoggedIn(true);
      fetchTasks();
      axios
        .get(`/api/groups/${storedGroupCode.toUpperCase()}`)
        .then((res) => {
          setGroupName(res.data.name);
          setGroupUsers(res.data.users);
          setIsOwner(res.data.owner.nickname === storedNickname);
          setOwnerId(res.data.owner._id);
        })
        .catch((err) => console.error(err));
      axios
        .post("/api/users/login", {
          nickname: storedNickname,
          groupCode: storedGroupCode,
        })
        .then((res) => {
          setCurrentUser(res.data);
        })
        .catch((err) => {
          console.error(err);
          alert("Failed to restore user session");
        });
    }
  }, []);

  const handleLogin = async () => {
    try {
      const res = await axios.post("/api/users/login", { nickname, groupCode });
      setCurrentUser(res.data);
      const groupRes = await axios.get(
        `/api/groups/${groupCode.toUpperCase()}`
      );
      setGroupName(groupRes.data.name);
      setGroupUsers(groupRes.data.users);
      setIsOwner(groupRes.data.owner._id === res.data._id);
      setIsLoggedIn(true);
      fetchTasks();
      localStorage.setItem("nickname", nickname);
      localStorage.setItem("groupCode", groupCode);
    } catch (err) {
      console.error(err);
      if (
        err.response &&
        err.response.data.error === "Grupa pełna (max 5 osób)"
      ) {
        alert("Grupa jest pełna! Max 5 osób.");
      } else if (
        err.response &&
        err.response.data.error === "Nick already taken in this group"
      ) {
        alert("Ten nick jest już zajęty w tej grupie!");
      } else {
        alert("Nie udało się zalogować");
      }
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
      fetchTasks();
      const groupRes = await axios.get(`/api/groups/${group.code}`);
      setGroupUsers(groupRes.data.users);
    } catch (err) {
      console.error(err);
      if (
        err.response &&
        err.response.data.error === "Nick already taken in this group"
      ) {
        alert("Ten nick jest już zajęty w tej grupie!");
      } else {
        alert(
          "Błąd tworzenia grupy: " +
            (err.response?.data?.error || "Nieznany błąd")
        );
      }
    }
  };

  const handleScanResult = async (result, expectedTaskId) => {
    console.log("Otrzymano wynik skanowania:", result, " : ", expectedTaskId);
    if (result !== expectedTaskId) {
      alert("Ten kod QR nie pasuje do tego zadania!");
      return;
    }
    try {
      const taskRes = await axios.get(`/api/tasks/${result}`);
      const task = taskRes.data;
      console.log("Znaleziono zadanie:", task);
      console.log(
        "Wysyłam do grupy:",
        groupCode,
        "taskId:",
        task.id,
        "punkty:",
        task.score
      );
      const groupRes = await axios.get(`/api/groups/${groupCode}`);
      const group = groupRes.data;
      console.log("Znaleziono grupę:", group);
      await axios.post(`/api/groups/${groupCode}/score`, {
        points: task.score,
        taskId: task.id,
      });
      alert(`Dodano ${task.score} punktów za zadanie: ${task.name}`);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 404) {
        alert("Kod QR nie jest powiązany z żadnym zadaniem!");
      } else if (err.response && err.response.status === 400) {
        alert("To zadanie zostało już wykonane!");
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
            <div className={styles.zigzagContainer}></div>
            <div className={styles.loginForm}>
              <div className={styles.personLoginForm}>
                <div className={styles.textStack}>
                  <h1 className={styles.textStroke}>Dołącz do Gry</h1>
                  <h1 className={styles.textFill}>Dołącz do Gry</h1>
                </div>
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Kod Grupy"
                    value={groupCode}
                    onChange={(e) => setGroupCode(e.target.value)}
                />
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Twój Nick"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                />
                <button className={styles.button}
                        onClick={handleLogin}>
                  Dołącz
                </button>
              </div>
              <div className={styles.groupLoginForm}>
                <div className={styles.textStack}>
                  <h1 className={styles.textStroke}>Lub stwórz nową grupę</h1>
                  <h1 className={styles.textFill}>Lub stwórz nową grupę</h1>
                </div>
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Nazwa Grupy"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                />
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Twój Nick (Lider)"
                    value={ownerNickname}
                    onChange={(e) => setOwnerNickname(e.target.value)}
                />
                <button className={styles.button}
                        onClick={handleCreateGroup}>
                  Stwórz Grupę
                </button>
              </div>
            </div>
            {groupCreated && (
                <p>
                  Utworzono grupę: {groupCreated.name} (Kod: {groupCreated.code})
                </p>
            )}
          </div>
      ) : (
          <div>
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

            <MapElement tasks={tasks}/>

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
                  />
              ))}
            </div>
          </div>
      )}
    </div>
  );
}

export default UserPanel;