import styles from "../modules/Header.module.css";
import ThemeToggle from "../../utils/ThemeToggle.jsx";
import React, { useEffect, useState } from "react";
import CustomButton from "../ui/CustomButton.jsx";
import { useLanguage } from "../../utils/LanguageContext.jsx";

const UserSettingsPopup = ({
  handleLogout,
  handleQuitGroup,
  handleDeleteGroup,
  isOwner,
  setShowMainUserPopup,
}) => {
  const [storedOwnerId, setStoredOwnerId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const { language, toggleLanguage } = useLanguage();

  useEffect(() => {
    const id = localStorage.getItem("ownerId");
    const storedUser = localStorage.getItem("currentUser");
    setStoredOwnerId(id);
    setCurrentUser(storedUser ? JSON.parse(storedUser)._id : null);
  }, []);

  const isLocalOwner = currentUser === storedOwnerId;

  return (
    <>
      <div className={styles.actions_user}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "0.5rem",
          }}
        >
          <div className={styles.wrapper}>
            <h1 className={styles.title}>{language === "pl" ? "Ustawienia" : "Settings"}</h1>

              <div style={{display: "flex", gap: "0.5rem"}}>
                  <div className={styles.iconWrapper}>
                      <ThemeToggle variant="button"/>
                  </div>
                  <div className={styles.iconWrapper}>
                      <button
                          onClick={() => {
                              toggleLanguage()
                          }}
                      >
                          {language.toUpperCase()}
                      </button>
                  </div>
              </div>
          </div>
            <CustomButton onClick={handleLogout}>Wyloguj</CustomButton>
            <CustomButton onClick={handleQuitGroup}>Quit Group</CustomButton>
            {isLocalOwner && (
                <CustomButton variant={"warning"} onClick={handleDeleteGroup}>
                    Delete Group
                </CustomButton>
            )}
        </div>
      </div>
        <CustomButton onClick={() => setShowMainUserPopup(false)}>
            Zamknij
        </CustomButton>
    </>
  );
};

export default UserSettingsPopup;