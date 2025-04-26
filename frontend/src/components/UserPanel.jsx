import { useState, useEffect } from "react";
import axios from "axios";

function UserPanel() {
  const [nickname, setNickname] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [groupCreated, setGroupCreated] = useState(null);
  const [groupName, setGroupName] = useState("");

  const handleLogin = async () => {
    try {
      await axios.post("/api/users/login", { nickname, groupCode });

      const res = await axios.get(`/api/groups/${groupCode.toUpperCase()}`);
      setGroupName(res.data.name);

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

  return (
    <div>
      {!isLoggedIn ? (
        <div>
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
          <h3>Lista Tasków:</h3>
          <ul>
            {tasks.map((task) => (
              <li key={task._id}>
                {task.name} - {task.description} ({task.location.lat},{" "}
                {task.location.lng})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default UserPanel;
