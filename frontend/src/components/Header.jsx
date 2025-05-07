import React from "react";
import styles from "./modules/Header.module.css";
import PlusIcon from "../assets/plus-svgrepo-com.svg";
import CrownIcon from "../assets/crown-svgrepo-com.svg";
import DeleteIcon from "../assets/trash-svgrepo-com.svg";
import {useMemo, useState} from "react";
import axios from "axios";
import Leaderboard from "./LeaderBoard.jsx";

function Header({
                    groupUsers,
                    isOwner,
                    ownerId,
                    currentUser,
                    nickname,
                    groupName,
                    groupCode,
                    logout
                }) {
    const [showPopup, setShowPopup] = useState(false);
    const [showLeaderBoardPopup, setShowLeaderBoardPopup] = useState(false);
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

    const handleRemoveUser = async (userId) => {
        if (window.confirm("Are you sure you want to remove this user?")) {
            try {
                await axios.post("/api/groups/removeUser", {
                    groupCode,
                    requesterNickname: nickname,
                    userIdToRemove: userId,
                });
                setGroupUsers(groupUsers.filter((user) => user._id !== userId));
            } catch (err) {
                console.error(err);
                alert("Error removing user");
            }
        }
    };

    const handleTransferOwnership = async (newOwnerId) => {
        if (window.confirm("Are you sure you want to transfer ownership?")) {
            try {
                await axios.post("/api/groups/transferOwnership", {
                    groupCode,
                    requesterNickname: nickname,
                    newOwnerId,
                });
                setIsOwner(false);
            } catch (err) {
                console.error(err);
                alert("Error transferring ownership");
            }
        }
    };

    const handleDeleteGroup = async () => {
        if (
            window.confirm(
                "Are you sure you want to delete the group? This action cannot be undone."
            )
        ) {
            try {
                await axios.post("/api/groups/deleteGroup", {
                    groupCode,
                    requesterNickname: nickname,
                });
                handleLogout();
            } catch (err) {
                console.error(err);
                alert("Error deleting group");
            }
        }
    };

    const handleShareGroupCode = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: "Group Code",
                    text: `Join my group with this code: ${groupCode}`,
                });
            } else {
                await navigator.clipboard.writeText(groupCode);
                alert("Group code copied to clipboard!");
            }
        } catch (error) {
            console.error("Error sharing:", error);
        }
    };

    const handleLogout = logout;

    const handleQuitGroup = async () => {
        if (
            window.confirm(
                "Are you sure you want to quit the group? This action cannot be undone."
            )
        ) {
            try {
                await axios.delete("/api/users/quit", {
                    data: { nickname, groupCode },
                });
                handleLogout();
            } catch (err) {
                console.error(err);
                alert("Error quitting from group");
            }
        }
    };

    const otherUsers = groupUsers.filter((user) => user.nickname !== nickname);

    return (
    <div className={styles.header}>
        {/* Friends */}
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

            {otherUsers.length < 4 && (
                <div
                    className={styles.user_icon_add}
                    style={otherUsers.length === 0 ? {marginLeft: "unset"} : {}}
                >
                    <img src={PlusIcon} alt="Add User" className={styles.icon}/>
                </div>
            )}
        </div>

        {/* Group name & score */}
        <div className={styles.group_name_center}
             onClick={() => setShowLeaderBoardPopup(true)}>
            <h2 className={styles.group_name}>
                {groupName}
            </h2>
            <h3>⭐ 2137 ⭐</h3>
        </div>

        {/* Main user */}
        <div
            className={styles.user_icon_main}
            onClick={() => setShowMainUserPopup(true)}>
            {nickname.slice(0, 2).toUpperCase()}
        </div>

        {/* Friend List Pop-up */}
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
                                                        <h1>👑</h1>
                                                    </button>
                                                    <button className={styles.delButton}
                                                            onClick={() => handleRemoveUser(user._id)}>
                                                        <h1>🗑</h1>
                                                    </button>
                                                </div>
                                            )}
                                            { user._id === ownerId && (
                                                <div className={styles.actions}>
                                                    <h1>👑</h1>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>

                        )}
                    </div>
                    <div style={{display: "flex", flexDirection: "column", textAlign: "center", gap: "1rem"}}>
                        <button
                            className={styles.codeButton}
                            onClick={handleShareGroupCode}
                        >
                            🔗 {groupCode} 📤
                        </button>

                        <button className={styles.button} onClick={() => setShowPopup(false)}>Zamknij</button>
                    </div>
                </div>
            </div>
        )}

        {/* Leader Board Pop-up */}
        {showLeaderBoardPopup && (
            <div className={styles.popup_overlay} onClick={() => setShowLeaderBoardPopup(false)}>
                <div className={styles.popup_content} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.actions_user}>
                        <Leaderboard/>
                    </div>
                    <button className={styles.button} onClick={() => setShowLeaderBoardPopup(false)}>
                        Zamknij
                    </button>
                </div>
            </div>
        )}
        {/* Current User Pop-up */}
        {showMainUserPopup && (
            <div className={styles.popup_overlay} onClick={() => setShowMainUserPopup(false)}>
                <div className={styles.popup_content} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.actions_user}>
                        <button className={styles.button} onClick={handleLogout}>Wyloguj</button>
                        <button
                            className={styles.button}
                            style={{background: '#ee6055'}}
                            onClick={handleQuitGroup}>
                            Quit Group
                        </button>
                        {isOwner && (
                            <button
                                className={styles.button}
                                style={{background: '#ee6055'}}
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
        )}
    </div>
    )
}

export default Header;