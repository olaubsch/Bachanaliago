import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import MapElement from "./MapElement";
import styles from "./modules/UserPanel.module.css";
import { motion } from "framer-motion";
import QrScanner from "./QrScanner.jsx";
//import "./UserPanel.css";
import DeleteIcon from "../assets/trash-svgrepo-com.svg";
import CrownIcon from "../assets/crown-svgrepo-com.svg";
import PlusIcon from "../assets/plus-svgrepo-com.svg";
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
  const [groupScore, setGroupScore] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [showMainUserPopup, setShowMainUserPopup] = useState(false);

  const colors = [
    "#ee6055",
    "#acd8aa",
    "#aaf683",
    "#ffd97d",
    "#ff9b85",
    "#f48498",
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

  const handleScanResult = async (result, expectedTaskId) => {
    console.log("Otrzymano wynik skanowania:", result," : ", expectedTaskId);

    if (result !== expectedTaskId) {
      alert("Ten kod QR nie pasuje do tego zadania!");
      return;
    }

    try {
      // Pobierz zadanie
      const taskRes = await axios.get(`/api/tasks/${result}`);
      const task = taskRes.data;

      console.log("Znaleziono zadanie:", task);

      console.log("Wysyłam do grupy:", groupCode, "taskId:", task.id, "punkty:", task.score);

      const groupRes = await axios.get(`/api/groups/${groupCode}`);
      const group = groupRes.data;

      console.log("Znaleziono grupę:", group);

      // Dodaj punkty do grupy
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

  const otherUsers = groupUsers.filter(user => user.nickname !== nickname);

  const handleShareGroupCode = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Group Code',
          text: `Join my group with this code: ${groupCode}`,
        });
      } else {
        await navigator.clipboard.writeText(groupCode);
        alert('Group code copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
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
          <div className={styles.header_color}>
            <div className={styles.header}>
              <h2 className={styles.group_name}>
                {groupName}
              </h2>
              <div className={styles.user_list}>
                {/* FRIENDS section */}
                <div
                    style={{display: "flex", cursor: "pointer"}}
                    onClick={() => setShowPopup(true)}
                >
                  {otherUsers.map((user) => (
                      <div
                          className={styles.user_icon}
                          key={user._id}
                          style={{backgroundColor: userColors[user._id]}}
                      >
                        {user.nickname.slice(0, 2).toUpperCase()}
                      </div>
                  ))}
                  <div className={styles.user_icon_add}>
                    <img src={PlusIcon} alt="Add User" className={styles.icon}/>
                  </div>
                </div>

                {/* Main user */}
                <div
                    className={styles.user_icon_main}
                    onClick={() => setShowMainUserPopup(true)}>
                  {nickname.slice(0, 2).toUpperCase()}
                </div>

                {/* Pop-up */}
                {showPopup && (
                    <div className={styles.popup_overlay} onClick={() => setShowPopup(false)}>
                      <div className={styles.popup_content} onClick={(e) => e.stopPropagation()}>
                        <div>
                          <h1>Członkowie grupy</h1>
                          {otherUsers.length === 0 ? (
                              <p>Brak znajomych</p>
                          ) : (
                              <div className={styles.userList}>
                                {groupUsers
                                    .filter(user => user && user._id && user.nickname) // Ensure user is valid
                                    .map((user) => (
                                        <div key={user._id} className={styles.userCard}>
                                          <h2>{user.nickname}</h2>
                                          {isOwner && user._id !== currentUser?._id && (
                                              <div className={styles.actions}>
                                                <button
                                                    className={styles.ownerButton}
                                                    onClick={() => handleTransferOwnership(user._id)}
                                                >
                                                  <img src={CrownIcon} alt="Remove User" className={styles.icon}/>
                                                </button>
                                                <button className={styles.delButton}
                                                        onClick={() => handleRemoveUser(user._id)}>
                                                  <img src={DeleteIcon} alt="Remove User" className={styles.icon}/>
                                                </button>
                                              </div>
                                          )}
                                        </div>
                                    ))}
                              </div>

                          )}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", textAlign: "center", gap: "1rem" }}>
                          <button
                              className={styles.codeButton}
                              onClick={handleShareGroupCode}
                          >
                            {groupCode}
                          </button>

                          <button className={styles.button} onClick={() => setShowPopup(false)}>Zamknij</button>
                        </div>
                      </div>
                    </div>
                )}

                {showMainUserPopup && (
                    <div className={styles.popup_overlay} onClick={() => setShowMainUserPopup(false)}>
                      <div className={styles.popup_content} onClick={(e) => e.stopPropagation()}>
                        <div>
                          <h1>Twoje informacje</h1>
                          <p><strong>Nick:</strong> {nickname}</p>
                          <p><strong>Kod grupy:</strong> {groupCode}</p>
                          <p><strong>Właściciel:</strong> {isOwner ? "Tak" : "Nie"}</p>
                        </div>

                        <div className={styles.actions_user}>
                          <div className={styles.actions_user} style={{marginBottom: '1rem'}}>
                            <button className={styles.button} onClick={handleLogout}>Wyloguj</button>
                            <button
                                className={styles.button}
                                style={{ background: '#ee6055' }}
                                onClick={handleQuitGroup}>
                              Quit Group
                            </button>
                            {isOwner && (
                                <button
                                    className={styles.button}
                                    style={{ background: '#ee6055' }}
                                    onClick={handleDeleteGroup}>
                                  Delete Group
                                </button>
                            )}
                          </div>

                          <button className={styles.button} onClick={() => setShowMainUserPopup(false)}>
                            Zamknij
                          </button>
                        </div>
                      </div>
                    </div>
                )}
              </div>
            </div>

            <MapElement tasks={tasks} className={styles.MapElement}/>
          </div>

          <h3>Lista Tasków:</h3>
          <div className={styles.taskList}>
            {tasks.map((task) => (
                <motion.div
                    key={task._id}
                    className={styles.taskCard}
                    initial={{opacity: 0, y: 50}}
                    whileInView={{opacity: 1, y: 0}}
                    viewport={{once: true}}
                    transition={{duration: 0.4}}
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
                          <MapElement tasks={[task]}/>
                        </div>

                        <QrScanner taskId={task.qrcode} onScanSuccess={handleScanResult}/>
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
          <Leaderboard />
        </div>
      )}
    </div>
  );
}

export default UserPanel;