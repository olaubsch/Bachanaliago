import React, { useEffect, useState } from "react";
import axios from "axios";

const Leaderboard = () => {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);
  
  const fetchLeaderboard = async () => {
    try {
        const response = await axios.get("http://localhost:5000/api/groups/leaderboard");


      console.log("Odpowiedź leaderboard:", response.data); // <-- to dodaj
      if (response.data && Array.isArray(response.data)) {
        setGroups(response.data);
      } else {
        console.error("Leaderboard response is not an array:", response.data);
        setGroups([]);
      }
    } catch (error) {
      console.error("Błąd pobierania leaderboarda", error);
      setGroups([]); // nawet jeśli błąd, ustaw pustą tablicę
    }
  };
  

  return (
    <div>
      <h2>🏆 Leaderboard</h2>
      {groups.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Grupa</th>
              <th>Ukończone Zadania</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group._id}>
                <td>{group.name}</td>
                <td>{group.tasksCompleted ?? 0}</td> {/* Jeśli nie ma - pokaż 0 */}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Brak grup do wyświetlenia.</p>
      )}
    </div>
  );
};

export default Leaderboard;
