import styles from "../modules/Header.module.css";
import ThemeToggle from "../../utils/ThemeToggle.jsx";
import React, { useEffect, useState } from "react";
import CustomButton from "../ui/CustomButton.jsx";
import { useTranslation } from "react-i18next";
import LanguageToggle from "../ui/LanguageToggle.jsx";

const UserSettingsPopup = ({
  handleLogout,
  handleQuitGroup,
  handleDeleteGroup,
  setShowMainUserPopup,
  setShowKonamiPage, // Add new prop
  hasPlayedSlots, // Added hasPlayedSlots prop
}) => {
  const [storedOwnerId, setStoredOwnerId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const { t } = useTranslation();

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
            <h1 className={styles.title}>{t('settings')}</h1>

              <div style={{display: "flex", gap: "0.5rem"}}>
                  <div className={styles.iconWrapper}>
                      <ThemeToggle variant="button"/>
                  </div>
                  <div className={styles.iconWrapper}>
                      <LanguageToggle/>
                  </div>
              </div>
          </div>
            <CustomButton onClick={handleLogout}>{t('logout')}</CustomButton>
            <CustomButton onClick={handleQuitGroup}>{t('quitGroup')}</CustomButton>
            {isLocalOwner && (
                <CustomButton variant={"warning"} onClick={handleDeleteGroup}>
                    {t('deleteGroup')}
                </CustomButton>
            )}
        </div>
        {/* Hidden button for Konami code page */}
        <div
          style={{ height: 100, marginTop: "3.5rem" }}
          onClick={() => {
            if (!hasPlayedSlots) {
              setShowKonamiPage(true);
              setShowMainUserPopup(false);
            }
          }}
        >
        </div>
      </div>
        <CustomButton onClick={() => setShowMainUserPopup(false)}>
            {t('close')}
        </CustomButton>
    </>
  );
};

export default UserSettingsPopup;