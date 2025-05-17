import styles from "../modules/Header.module.css";
import React, {useEffect, useState} from "react";
import CustomButton from "../ui/CustomButton.jsx";

const FriendListPopup = ({
                             groupUsers,
                             isOwner,
                             ownerId,
                             groupCode,
                             handleTransferOwnership,
                             handleShareGroupCode,
                             handleRemoveUser,
                             setShowPopup,
                             otherUsers
}) => {
    const [storedOwnerId, setStoredOwnerId] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const id = localStorage.getItem("ownerId");
        const storedUser = localStorage.getItem("currentUser");
        setStoredOwnerId(id);
        setCurrentUser(storedUser ? JSON.parse(storedUser)._id : null);
    }, []);

    const isLocalOwner = currentUser === storedOwnerId;

    return (
        <>
            <div>
                <h1>Członkowie</h1>
                {otherUsers.length === 0 ? (
                    <p>Brak znajomych</p>
                ) : (
                    <div className={styles.userList}>
                        {groupUsers
                            .filter(user => user && user._id && user.nickname) // Ensure user is valid
                            .map((user) => (
                                <div key={user._id} className={styles.userCard}>
                                    <h2>{user.nickname}
                                        {user._id === storedOwnerId && (
                                            <span style={{marginLeft: "0.5rem"}}>👑</span>
                                        )}</h2>
                                    {isLocalOwner && user._id !== storedOwnerId && (
                                        <div className={styles.actions}>
                                            <button
                                                className={styles.ownerButton}
                                                onClick={() => handleTransferOwnership(user._id)}
                                            >
                                                <h1>👑</h1>
                                            </button>
                                            <button className={styles.delButton}
                                                    onClick={() => handleRemoveUser(user._id)}>
                                                <h1>🗑</h1>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>

                )}
            </div>
            <div style={{display: "flex", flexDirection: "column", textAlign: "center", gap: "1rem"}}>
                <div
                    onClick={handleShareGroupCode}
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "0.5rem"
                    }}>
                    <span style={{fontSize: "2rem"}}>📤</span>
                    <button
                        className={styles.codeButton}
                    >
                        {groupCode}
                    </button>
                </div>

                <CustomButton onClick={() => setShowPopup(false)}>Zamknij</CustomButton>
            </div>
        </>
    )
}

export default FriendListPopup;