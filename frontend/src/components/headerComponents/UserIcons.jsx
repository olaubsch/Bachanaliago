import styles from "../modules/Header.module.css";
import PlusIcon from "./PlusIcon";

const UserIcons = ({ users, userColors, onClick }) => (
    <div style={{ display: "flex", cursor: "pointer" }} onClick={onClick}>
        {users.map((user) => (
            <div
                key={user._id}
                className={styles.user_icon}
                style={{ backgroundColor: userColors[user._id] }}
            >
                {user.nickname.slice(0, 2).toUpperCase()}
            </div>
        ))}
        {users.length < 4 && (
            <div
                className={styles.user_icon_add}
                style={users.length === 0 ? { marginLeft: "unset" } : {}}
            >
                <PlusIcon stroke={"var(--text-header-color)"} />
            </div>
        )}
    </div>
);

export default UserIcons;
