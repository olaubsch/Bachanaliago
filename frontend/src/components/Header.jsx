import React from "react";
import styles from "./modules/Header.module.css";
import { useMemo, useState, useEffect } from "react";
import axios from "axios";
import Leaderboard from "./LeaderBoard.jsx";
import { io } from "socket.io-client";
import { assignUserColors } from "../utils/colorUtils.jsx";
import UserIcons from "./headerComponents/UserIcons.jsx";
import FriendListPopup from "./headerComponents/FriendListPopup.jsx";
import UserSettingsPopup from "./headerComponents/UserSettingsPopup.jsx";
import { showAlert } from "./ui/alert.jsx";

const socket = io("/", {
  path: "/socket.io",
  transports: ["websocket", "polling"],
  secure: true,
  withCredentials: false,
});

function Header({
  groupUsers,
  setGroupUsers,
  isOwner,
  setIsOwner,
  ownerId,
  setOwnerId,
  currentUser,
  nickname,
  groupName,
  groupCode,
  logout,
  groupScore,
  onUserUpdate,
}) {
  const [showPopup, setShowPopup] = useState(false);
  const [showLeaderBoardPopup, setShowLeaderBoardPopup] = useState(false);
  const [showMainUserPopup, setShowMainUserPopup] = useState(false);

  const userColors = useMemo(() => assignUserColors(groupUsers), [groupUsers]);
  const otherUsers = groupUsers.filter((user) => user.nickname !== nickname);
  const handleLogout = logout;

  const handleRemoveUser = async (userId) => {
    if (window.confirm("Are you sure you want to remove this user?")) {
      try {
        await axios.post("/api/groups/removeUser", {
          groupCode,
          requesterNickname: nickname,
          userIdToRemove: userId,
        });
        socket.emit("userRemoved", { groupCode, userId: userId });

        setGroupUsers(groupUsers.filter((user) => user._id !== userId));
      } catch (err) {
        console.error(err);
        showAlert("Error removing user");
      }
    }
  };

  useEffect(() => {
    if (!socket || !groupCode || !currentUser) return;

    const upperCode = groupCode.toUpperCase();

    socket.emit("joinGroup", upperCode);

    socket.on("userRemoved", ({ groupCode: eventCode, userId }) => {
      if (eventCode.toUpperCase() !== upperCode) return;

      if (userId === currentUser._id) {
        showAlert("You have been removed from the group.");
        handleLogout();
      } else {
        onUserUpdate();
      }
    });

    return () => {
      socket.off("userRemoved");
      onUserUpdate();
    };
  }, [socket, groupCode, currentUser]);

  const handleTransferOwnership = async (newOwnerId) => {
    if (window.confirm("Are you sure you want to transfer ownership?")) {
      try {
        await axios.post("/api/groups/transferOwnership", {
          groupCode,
          requesterNickname: nickname,
          newOwnerId,
        });
        localStorage.setItem("ownerId", newOwnerId);
        setOwnerId(newOwnerId);
        setIsOwner(false);
        socket.emit("ownershipTransferred", { groupCode, newOwnerId });
      } catch (err) {
        console.error(err);
        showAlert("Error transferring ownership");
      }
    }
  };

  useEffect(() => {
    if (!socket || !groupCode || !currentUser) return;

    const upperCode = groupCode.toUpperCase();

    socket.emit("joinGroup", upperCode);

    socket.on("ownershipTransferred", ({ groupCode: eventCode, ownerId }) => {
      if (eventCode.toUpperCase() !== upperCode) return;
      console.log("WORKS");
      onUserUpdate();
    });

    return () => {
      socket.off("ownershipTransferred");
      onUserUpdate();
    };
  }, [socket, groupCode, currentUser]);

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
        socket.emit("groupDeleted", { groupCode });

        handleLogout();
      } catch (err) {
        console.error(err);
        showAlert("Error deleting group");
      }
    }
  };

  useEffect(() => {
    if (!socket || !groupCode || !currentUser) return;

    const upperCode = groupCode.toUpperCase();
    socket.emit("joinGroup", upperCode);

    socket.on("forceLogout", () => {
      showAlert("Group has been deleted. You have been logged out.");
      handleLogout();
    });

    return () => {
      socket.off("forceLogout");
    };
  }, [socket, groupCode, currentUser]);

  const handleShareGroupCode = async () => {
    const shareableLink = `${window.location.origin}/?code=${groupCode}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Dołącz do mojej grupy",
          text: `Kliknij, aby dołączyć do mojej grupy:`,
          url: shareableLink,
        });
      } else {
        await navigator.clipboard.writeText(shareableLink);
        showAlert("Link do grupy skopiowany do schowka!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

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
        socket.emit("userQuit", { groupCode });

        handleLogout();
      } catch (err) {
        console.error(err);
        showAlert("Error quitting from group");
      }
    }
  };

  return (
    <div className={styles.header}>
      {/* Friends */}
      <div
        style={{ display: "flex", cursor: "pointer" }}
        onClick={() => setShowPopup(true)}
      >
        <UserIcons users={otherUsers} userColors={userColors} />
      </div>

      {/* Group name & score */}
      <div
        className={styles.group_name_center}
        onClick={() => setShowLeaderBoardPopup(true)}
      >
        <h2 className={styles.group_name}>{groupName}</h2>
        <h3>⭐ {groupScore} ⭐</h3>
      </div>

      {/* Main user */}
      <div
        className={styles.user_icon_main}
        onClick={() => setShowMainUserPopup(true)}
      >
        {nickname.slice(0, 2).toUpperCase()}
      </div>

      {/* Friend List Pop-up */}
      {showPopup && (
        <div
          className={styles.popup_overlay}
          onClick={() => setShowPopup(false)}
        >
          <div
            className={styles.popup_content}
            onClick={(e) => e.stopPropagation()}
          >
            <FriendListPopup
              groupUsers={groupUsers}
              isOwner={isOwner}
              ownerId={ownerId}
              currentUser={currentUser}
              groupCode={groupCode}
              handleTransferOwnership={handleTransferOwnership}
              handleShareGroupCode={handleShareGroupCode}
              handleRemoveUser={handleRemoveUser}
              setShowPopup={setShowPopup}
              otherUsers={otherUsers}
            />
          </div>
        </div>
      )}

      {/* Leader Board Pop-up */}
      {showLeaderBoardPopup && (
        <div
          className={styles.popup_overlay}
          onClick={() => setShowLeaderBoardPopup(false)}
        >
          <div
            className={styles.popup_content}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.actions_user}>
              <Leaderboard />
            </div>
            <button
              className={styles.button}
              onClick={() => setShowLeaderBoardPopup(false)}
            >
              {language === "pl" ? "Zamknij" : "Close"}
            </button>
          </div>
        </div>
      )}
      {/* Current User Pop-up */}
      {showMainUserPopup && (
        <div
          className={styles.popup_overlay}
          onClick={() => setShowMainUserPopup(false)}
        >
          <div
            className={styles.popup_content}
            onClick={(e) => e.stopPropagation()}
          >
            <UserSettingsPopup
              isOwner={isOwner}
              handleLogout={handleLogout}
              handleQuitGroup={handleQuitGroup}
              handleDeleteGroup={handleDeleteGroup}
              setShowMainUserPopup={setShowMainUserPopup}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Header;
