import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import MapElement from "./MapElement";
import styles from "./modules/UserPanel.module.css";
import { motion } from "framer-motion";
import QrScanner from "./QrScanner.jsx";
import "./UserPanel.css";

function UserPanel() {
  const [nickname, setNickname] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [groupCreated, setGroupCreated] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [groupUsers, setGroupUsers] = useState([]);
  const colors = ['#ee6055', '#60d394', '#aaf683', '#ffd97d', '#ff9b85', '#8093f1'];

  const handleLogin = async () => {
    try {
      await axios.post("/api/users/login", { nickname, groupCode });

      const res = await axios.get(`/api/groups/${groupCode.toUpperCase()}`);
      setGroupName(res.data.name);
      setGroupUsers(groupUsersMock);

      setIsLoggedIn(true);
      fetchTasks();
    } catch (err) {
      console.error(err);
      if (
        err.response &&
        err.response.data.error === "Grupa pełna (max 5 osób)"
      ) {
        alert("Grupa jest pełna! Max 5 osób.");
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
    console.log("Wysyłam:", { name: newGroupName });

    if (!newGroupName.trim()) {
      alert("Podaj nazwę grupy!");
      return;
    }
    try {
      const res = await axios.post("/api/groups", { name: newGroupName });
      setGroupCreated(res.data);
    } catch (err) {
      console.error(err);
      alert("Błąd tworzenia grupy");
    }
  };

  const groupUsersMock = [
    {
      _id: "user1",
      nickname: "Alice",
      role: "admin",
    },
    {
      _id: "user2",
      nickname: "Bob",
      role: "member",
    },
    {
      _id: "user3",
      nickname: "Charlie",
      role: "member",
    },
    {
      _id: "user4",
      nickname: "Dave",
      role: "member",
    },
    {
      _id: "user5",
      nickname: "Eve",
      role: "member",
    },
  ];

  const userColors = useMemo(() => {
    const colorMap = {};
    groupUsers.forEach((user) => {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      colorMap[user._id] = randomColor;
    });
    return colorMap;
  }, [groupUsers]);

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
                      style={{backgroundColor: userColors[user._id]}}
                  >
                    {user.nickname.slice(0, 2).toUpperCase()}
                  </div>
              ))}
            </div>


            <MapElement tasks={tasks}/>

            <h3>Lista Tasków:</h3>
            <div className="task-list">
              {tasks.map((task) => (
                  <div key={task._id} className="task-list-element">
                    <div
                        onClick={() => toggleTask(task._id)}
                        style={{cursor: 'pointer', fontWeight: 'bold', padding: '8px', borderBottom: '1px solid #ccc'}}
                    >
                      {task.name}
                    </div>

                    {expandedTaskId === task._id && (
                        <div className={`task-info ${expandedTaskId === task._id ? 'expanded' : ''}`}
                             style={{padding: '8px', backgroundColor: '#f9f9f9'}}>
                          <div>{task.description}</div>
                          <div>Location: ({task.location.lat}, {task.location.lng})</div>
                          <QrScanner onScanSuccess={handleScanResult}/>
                        </div>
                    )}
                  </div>
              ))}
            </div>
          </div>
      )}
    </div>
  );
}

export default UserPanel;
