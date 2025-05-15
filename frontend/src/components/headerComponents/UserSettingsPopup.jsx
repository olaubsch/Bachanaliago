import styles from "../modules/Header.module.css";
import ThemeToggle from "../../utils/ThemeToggle.jsx";
import React from "react";
import CustomButton from "../ui/CustomButton.jsx";

const UserSettingsPopup = ({
                               handleLogout,
                               handleQuitGroup,
                               handleDeleteGroup,
                               isOwner,
                               setShowMainUserPopup
}) => {
    return (
        <>
            <div className={styles.actions_user}>
                <h1>Ustawienia</h1>
                <div style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    gap: "0.5rem"
                }}>
                    <div style={{flex: 1}}>
                        <ThemeToggle variant="button"/>
                    </div>
                    <div style={{flex: 1}}>
                        <CustomButton>
                            language
                        </CustomButton>
                    </div>
                </div>
                <CustomButton
                    onClick={handleLogout}>
                    Wyloguj
                </CustomButton>
                <CustomButton
                    onClick={handleQuitGroup}>
                    Quit Group
                </CustomButton>
                {isOwner && (
                    <CustomButton
                        variant={"warning"}
                        onClick={handleDeleteGroup}>
                        Delete Group
                    </CustomButton>
                )}
            </div>
            <CustomButton
                onClick={() => setShowMainUserPopup(false)}>
                Zamknij
            </CustomButton>
        </>
    )
}

export default UserSettingsPopup;