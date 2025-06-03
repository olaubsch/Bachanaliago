import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import MapElement from "./MapElement";
import styles from "./modules/UserPanel.module.css";
import TaskCard from "./TaskCard";
import Header from "./Header.jsx";
import useAuth from "../utils/useLogout.jsx";
import { useLocation } from "react-router-dom";
import ThemeToggle from "../utils/ThemeToggle.jsx";
import CustomButton from "./ui/CustomButton.jsx";
import { io } from "socket.io-client";
import { showAlert } from "./ui/alert.jsx";
import CustomInput from "./ui/CustomInput.jsx";
import TaskList from "./TaskList.jsx";
import Slots from "./Slots";
import { useLanguage } from "../utils/LanguageContext";
import { useTranslation } from 'react-i18next';
import LanguageToggle from "./ui/LanguageToggle.jsx";
import KonamiPage from "./KonamiPage.jsx"; // Import the new KonamiPage component

const socket = io("http://localhost:5000");

function UserPanel() {
  const [nickname, setNickname] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
  const [hasPlayedSlots, setHasPlayedSlots] = useState(false); // Added state for hasPlayedSlots
  const taskListRef = useRef();
  const [showSlots, setShowSlots] = useState(false);
  const [showKonamiPage, setShowKonamiPage] = useState(false); // New state for Konami page
  const [activeViewMap, setActiveViewMap] = useState(true);
  const [badWords, setBadWords] = useState([]);
  const [position, setPosition] = useState(null);
  const { language, toggleLanguage } = useLanguage();
  const { t } = useTranslation();

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
    if (position !== null) {
      setActiveViewMap(true);
    }
  }, [position]);

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
    setIsLoading(true);
    try {
      await Promise.all([fetchTasks(), fetchSubmissions(code)]);
    } catch (err) {
      console.error("Error fetching tasks or submissions:", err);
      showAlert("Failed to fetch tasks or submissions");
    }
    try {
      const groupRes = await axios.get(`/api/groups/${code.toUpperCase()}`);
      setGroupName(groupRes.data.name);
      setGroupUsers(groupRes.data.users);
      setIsOwner(groupRes.data.owner.nickname === nickname);
      setOwnerId(groupRes.data.owner._id);
      setGroupScore(groupRes.data.score);
      setHasPlayedSlots(groupRes.data.hasPlayedSlots); // Set hasPlayedSlots from group data
      localStorage.setItem("ownerId", groupRes.data.owner._id);
    } catch (err) {
      console.error("Error fetching group:", err);
      showAlert("Error fetching group data. Logging out.");
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`/api/tasks?lang=${language}`);
      setTasks(res.data);
      console.log("res: ", res.data);
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

  useEffect(() => {
    fetch("/api/bannedWords")
      .then((res) => res.json())
      .then((data) => setBadWords(data))
      .catch((err) => console.error("Błąd ładowania słownika:", err));
  }, []);

   const containsBannedWords = (text) => {
   if (!text) return false;

  // usuń spacje, znaki specjalne i zamień na małe litery
  const cleanedText = text.toLowerCase().replace(/[\s\W_]+/g, "");

  return badWords.some((word) => {
    const cleanedWord = word.toLowerCase().replace(/[\s\W_]+/g, "");
    const regex = new RegExp(cleanedWord, "i");
    return regex.test(cleanedText);
  });
};

  const handleLogin = async () => {
    if (containsBannedWords(nickname)) {
      showAlert("Nick zawiera niedozwolone słowa!");
      return;
    }

    try {
      const res = await axios.post("/api/users/login", { nickname, groupCode });
      setCurrentUser(res.data);
      localStorage.setItem("currentUser", JSON.stringify(res.data));
      const groupRes = await axios.get(
        `/api/groups/${groupCode.toUpperCase()}`
      );
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
      if (
        err.response &&
        err.response.data.error === "Grupa pełna (max 5 osób)"
      ) {
        showAlert("Grupa jest pełna! Max 5 osób.");
      } else if (
        err.response &&
        err.response.data.error === "Nick already taken in this group"
      ) {
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

    if (
      containsBannedWords(newGroupName) ||
      containsBannedWords(ownerNickname)
    ) {
      showAlert("Nick lub nazwa grupy zawiera niedozwolone słowa!");
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
      if (
        err.response &&
        err.response.data.error === "Nick already taken in this group"
      ) {
        showAlert("Ten nick jest już zajęty w tej grupie!");
      } else {
        showAlert(
          "Błąd tworzenia grupy: " +
            (err.response?.data?.error || "Nieznany błąd")
        );
      }
    }
  };

  const handleClearPosition = () => {
    setPosition(null);
  };

  return (
    <div className={styles.UserPanelContainer}>
      {!isLoggedIn ? (
        <div className={styles.loginContainer}>
          <div className={styles.themeAndLanguage}>
            <LanguageToggle/>
            <div className={styles.themeIconWrapper}>
              <ThemeToggle />
            </div>
          </div>
          <div className={styles.zigzagContainer}></div>
          <div className={styles.loginForm}>
            <div className={styles.personLoginForm}>
              <div className={styles.textStack}>
                <h1 className={styles.textStroke}>{t('joinGame')}</h1>
                <h1 className={styles.textFill}>{t('joinGame')}</h1>
              </div>
              <CustomInput
                className={styles.input}
                type="text"
                placeholder={t('groupCode')}
                value={groupCode || ""}
                onChange={(e) => setGroupCode(e.target.value)}
              />
              <CustomInput
                className={styles.input}
                type="text"
                placeholder={t('yourNickname')}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              <CustomButton className={styles.button} onClick={handleLogin}>
                {t('join')}
              </CustomButton>
            </div>
            {!inviteCode && (
              <div className={styles.groupLoginForm}>
                <div className={styles.textStack}>
                  <h1 className={styles.textStroke}>{t('orCreateNewGroup')}</h1>
                  <h1 className={styles.textFill}>{t('orCreateNewGroup')}</h1>
                </div>
                <CustomInput
                  className={styles.input}
                  type="text"
                  placeholder={t('groupName')}
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
                <CustomInput
                  className={styles.input}
                  type="text"
                  placeholder={t('yourNicknameLeader')}
                  value={ownerNickname}
                  onChange={(e) => setOwnerNickname(e.target.value)}
                />
                <CustomButton
                  className={styles.button}
                  onClick={handleCreateGroup}
                >
                  {t('createGroup')}
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
                setShowKonamiPage={setShowKonamiPage} // Pass setShowKonamiPage to Header
                hasPlayedSlots={hasPlayedSlots} // Pass hasPlayedSlots to Header
            />
              <div
                  onTouchStart={() => setActiveViewMap(true)}
                  style={{
                      height: activeViewMap ? '250px' : '75px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      transition: 'height 0.3s ease-in-out',
                  }}>
                  <MapElement
                      tasks={tasks}
                      position={position ? [position.lat, position.lng] : undefined}
                      onClearPosition={handleClearPosition}
                  />
              </div>
              <div onTouchStart={() => setActiveViewMap(false)}>
                  <TaskList
                      tasks={tasks}
                      submissions={submissions}
                      groupCode={groupCode}
                      isLoading={isLoading}
                      fetchSubmissions={() => fetchSubmissions(groupCode)}
                      setPosition={setPosition}
                  />
              </div>
              {showKonamiPage && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "white",
                zIndex: 1000,
                overflow: "auto",
              }}
            >
              <KonamiPage
                onCodeEntered={() => {
                  if (!hasPlayedSlots) { // Check hasPlayedSlots before showing slots
                    setShowSlots(true);
                    setShowKonamiPage(false);
                  } else {
                    showAlert("Your group has already played the slots.");
                    setShowKonamiPage(false);
                  }
                }}
                onClose={() => setShowKonamiPage(false)}
              />
            </div>
          )}
          {showSlots && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "white",
                zIndex: 1000,
                overflow: "auto",
              }}
            >
              <button onClick={() => setShowSlots(false)}>{t('close')}</button>
              <Slots
                groupScore={groupScore}
                groupCode={groupCode}
                onSpinComplete={(newScore) => {
                  setGroupScore(newScore);
                  setShowSlots(false);
                  fetchData(groupCode); // Refresh data after spin
                }}
                hasPlayedSlots={hasPlayedSlots} // Pass hasPlayedSlots to Slots
              />
            </div>
          )}
          </div>
      )}
    </div>
  );
}

export default UserPanel;