import { useCallback } from "react";

export default function useAuth({
                                    setIsLoggedIn,
                                    setNickname,
                                    setGroupCode,
                                    setGroupName,
                                    setGroupUsers,
                                    setTasks,
                                    setCurrentUser,
                                    setIsOwner,
                                }) {
    const logout = useCallback(() => {
        localStorage.removeItem("nickname");
        localStorage.removeItem("groupCode");

        setIsLoggedIn(false);
        setNickname("");
        setGroupCode("");
        setGroupName("");
        setGroupUsers([]);
        setTasks([]);
        setCurrentUser(null);
        setIsOwner(false);
    }, [
        setIsLoggedIn,
        setNickname,
        setGroupCode,
        setGroupName,
        setGroupUsers,
        setTasks,
        setCurrentUser,
        setIsOwner,
    ]);

    return { logout };
}