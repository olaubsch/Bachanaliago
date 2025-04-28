import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import MapElement from "./MapElement";
import styles from "./modules/UserPanel.module.css";
import { motion } from "framer-motion";
import QrScanner from "./QrScanner.jsx";
import "./UserPanel.css";
import Leaderboard from "./LeaderBoard";

function UserPanel() {
  const [nickname, setNickname] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [ownerNickname, setOwnerNickname] = useState("");
  const [groupCreated, setGroupCreated] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [groupUsers, setGroupUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const colors = [
    "#ee6055",
    "#60d394",
    "#aaf683",
    "#ffd97d",
    "#ff9b85",
    "#8093f1",
  ];

  const userColors = useMemo(() => {
    const colorMap = {};
    groupUsers.forEach((user) => {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      colorMap[user._id] = randomColor;
    });
    return colorMap;
  }, [groupUsers]);

  useEffect(() => {
    const storedNickname = localStorage.getItem('nickname');
    const storedGroupCode = localStorage.getItem('groupCode');
    if (storedNickname && storedGroupCode) {
      setNickname(storedNickname);
      setGroupCode(storedGroupCode);
      setIsLoggedIn(true);
      fetchTasks();
  
      // Fetch group data
      axios.get(`/api/groups/${storedGroupCode.toUpperCase()}`)
        .then(res => {
          setGroupName(res.data.name);
          setGroupUsers(res.data.users);
          setIsOwner(res.data.owner.nickname === storedNickname);
        })
        .catch(err => console.error(err));
  
      // Fetch current user data
      axios.post("/api/users/login", { nickname: storedNickname, groupCode: storedGroupCode })
        .then(res => {
          setCurrentUser(res.data); // Restore currentUser
        })
        .catch(err => {
          console.error(err);
          alert("Failed to restore user session");
        });
    }
  }, []);

  const handleLogin = async () => {
    try {
      const res = await axios.post("/api/users/login", { nickname, groupCode });
      setCurrentUser(res.data);
      const groupRes = await axios.get(`/api/groups/${groupCode.toUpperCase()}`);
      setGroupName(groupRes.data.name);
      setGroupUsers(groupRes.data.users);
      setIsOwner(groupRes.data.owner._id === res.data._id);
      setIsLoggedIn(true);
      fetchTasks();
      localStorage.setItem('nickname', nickname);
      localStorage.setItem('groupCode', groupCode);
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

  const handleLogout = () => {
    localStorage.removeItem('nickname');
    localStorage.removeItem('groupCode');
    setIsLoggedIn(false);
    setNickname('');
    setGroupCode('');
    setGroupName('');
    setGroupUsers([]);
    setTasks([]);
    setCurrentUser(null);
    setIsOwner(false);
  };

  const handleQuitGroup = async () => {
    if (window.confirm("Are you sure you want to quit the group? This action cannot be undone.")) {
      try {
        await axios.delete("/api/users/quit", { data: { nickname, groupCode } });
        handleLogout();
      } catch (err) {
        console.error(err);
        alert("Error quitting from group");
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
      const res = await axios.post("/api/groups", { name: newGroupName, ownerNickname });
      const { group, user } = res.data;
      setGroupCreated(group);
      setNickname(ownerNickname);
      setGroupCode(group.code);
      setGroupName(group.name);
      setCurrentUser(user);
      setIsOwner(true);
      setIsLoggedIn(true);
      localStorage.setItem('nickname', ownerNickname);
      localStorage.setItem('groupCode', group.code);
      fetchTasks();
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

  const handleRemoveUser = async (userId) => {
    if (window.confirm("Are you sure you want to remove this user?")) {
      try {
        await axios.post("/api/groups/removeUser", { groupCode, requesterNickname: nickname, userIdToRemove: userId });
        setGroupUsers(groupUsers.filter(user => user._id !== userId));
      } catch (err) {
        console.error(err);
        alert("Error removing user");
      }
    }
  };

  const handleTransferOwnership = async (newOwnerId) => {
    if (window.confirm("Are you sure you want to transfer ownership?")) {
      try {
        await axios.post("/api/groups/transferOwnership", { groupCode, requesterNickname: nickname, newOwnerId });
        setIsOwner(false);
      } catch (err) {
        console.error(err);
        alert("Error transferring ownership");
      }
    }
  };

  const handleDeleteGroup = async () => {
    if (window.confirm("Are you sure you want to delete the group? This action cannot be undone.")) {
      try {
        await axios.post("/api/groups/deleteGroup", { groupCode, requesterNickname: nickname });
        handleLogout();
      } catch (err) {
        console.error(err);
        alert("Error deleting group");
      }
    }
  };

  const handleScanResult = (result) => {
    console.log("Otrzymano wynik skanowania w komponencie nadrzędnym:", result);
    alert(`Zeskanowano: ${result}`);
  };

  const toggleTask = (taskId) => {
    setExpandedTaskId((prevId) => (prevId === taskId ? null : taskId));
  };

  return (
    <div className={styles.loginContainer}>
      {!isLoggedIn ? (
        <div className={styles.loginForm}>
          <h2>Logowanie Gracza</h2>
          <input
            type="text"
            placeholder="Nick"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <input
            type="text"
            placeholder="Kod Grupy"
            value={groupCode}
            onChange={(e) => setGroupCode(e.target.value)}
          />
          <button onClick={handleLogin}>Zaloguj</button>

          <h3>Lub stwórz nową grupę</h3>
          <input
            type="text"
            placeholder="Nazwa Grupy"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Twój Nick"
            value={ownerNickname}
            onChange={(e) => setOwnerNickname(e.target.value)}
          />
          <button onClick={handleCreateGroup}>Stwórz Grupę</button>

          {groupCreated && (
            <p>
              Utworzono grupę: {groupCreated.name} (Kod: {groupCreated.code})
            </p>
          )}
        </div>
      ) : (
        <div>
          <h2>Witaj, {nickname}!</h2>
          <p>
            Grupa: {groupName} (Kod: {groupCode})
          </p>
          <div className="user-list">
            {groupUsers.map((user) => (
              <div
                className="user-icon"
                key={user._id}
                style={{ backgroundColor: userColors[user._id] }}
              >
                {user.nickname.slice(0, 2).toUpperCase()}
              </div>
            ))}
          </div>

          
          <MapElement tasks={tasks} />
          <h3>Lista Tasków:</h3>
          <div className={styles.taskList}>
            {tasks.map((task) => (
              <motion.div
                key={task._id}
                className={styles.taskCard}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <div
                  onClick={() => toggleTask(task._id)}
                  className={styles.taskHeader}
                >
                  {task.name}
                </div>

                {expandedTaskId === task._id && (
                  <div className={styles.taskDetails}>
                    <div>{task.description}</div>
                    <div>
                      Location: ({task.location.lat}, {task.location.lng})
                    </div>

                    <div className={styles.taskMap}>
                      <MapElement tasks={[task]} />
                    </div>

                    <QrScanner onScanSuccess={handleScanResult} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <h3>Członkowie grupy:</h3>
          <ul>
            {groupUsers
              .filter(user => user && user._id && user.nickname) // Ensure user is valid
              .map((user) => (
                <li key={user._id}>
                  {user.nickname}
                  {isOwner && user._id !== currentUser?._id && (
                    <>
                      <button onClick={() => handleRemoveUser(user._id)}>Remove</button>
                      <button onClick={() => handleTransferOwnership(user._id)}>Transfer Ownership</button>
                    </>
                  )}
                </li>
              ))}
          </ul>

          <button onClick={handleLogout}>Wyloguj</button>
          <button onClick={handleQuitGroup}>Quit Group</button>
          {isOwner && (
            <button onClick={handleDeleteGroup}>Delete Group</button>
          )}
          <Leaderboard />

        </div>
      )}
    </div>
  );
}

export default UserPanel;