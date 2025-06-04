import React, { useEffect, useState } from "react";
import styles from "./modules/LeaderBoard.module.css";
import axios from "axios";
import { useTranslation } from 'react-i18next';


const Leaderboard = () => {
  const [groups, setGroups] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    fetchLeaderboard();
  }, []);
  
  const fetchLeaderboard = async () => {
    try {
        const response = await axios.get("/api/groups/leaderboard");


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

  const mockGroups = [
    { _id: "1", name: "Zespół Alfa", tasksCompleted: 12 },
    { _id: "2", name: "Zespół Beta", tasksCompleted: 8 },
    { _id: "3", name: "Zespół Gamma", tasksCompleted: 5 },
    { _id: "4", name: "Zespół Gówno", tasksCompleted: 2 },
  ];


  return (
      <div>
        <h1>{t('leaderboard')}</h1>
        {groups.length > 0 ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0.75rem" }}>
                <h2>{t('groupName')}</h2>
                <h2>{t('points')}</h2>
              </div>
              <div style={{maxHeight: "45vh", overflowY: "auto"}}>
                {groups
                    .slice()
                    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
                    .map((group, index) => {
                      const score = group.score ?? 0;
                      const medals = ["🥇", "🥈", "🥉"];
                      const medal = score > 0 ? medals[index] || "🏅" : "";

                      return (
                          <div className={styles.row} key={group._id}
                               style={{display: "flex", justifyContent: "space-between"}}>
                            <h3 style={{flex: 1}}>{medal} {group.name}</h3>
                            <h3>{score}</h3>
                          </div>
                      );
                    })}
              </div>
            </div>
        ) : (
            <p>{t('noGroupsToDisplay')}</p>
        )}
      </div>
  );

};

export default Leaderboard;
