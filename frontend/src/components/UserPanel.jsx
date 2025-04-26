import { useState, useEffect } from "react";
import axios from "axios";

function UserPanel() {
  const [nickname, setNickname] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tasks, setTasks] = useState([]);

  const handleLogin = async () => {
    try {
      await axios.post("/api/users/login", { nickname, groupCode });
      setIsLoggedIn(true);
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert("Nie udało się zalogować");
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
        </div>
      ) : (
        <div>
          <h2>Witaj, {nickname}!</h2>
          <h3>Lista Tasków:</h3>
          <ul>
            {tasks.map((task) => (
              <li key={task._id}>
                {task.name} - {task.description} ({task.location.lat},{" "}
                {task.location.lng}) - Radius: {task.radius}m
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default UserPanel;
