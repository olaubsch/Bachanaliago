import { useEffect, useState } from "react";
import styles from "../components/modules/Header.module.css"
import CustomButton from "../components/ui/CustomButton.jsx";

export default function ThemeToggle({ variant = "button" }) {
    const [currentTheme, setCurrentTheme] = useState("light");

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark" || savedTheme === "light") {
            document.documentElement.setAttribute("data-theme", savedTheme);
            setCurrentTheme(savedTheme);  // Set the current theme state
        }
    }, []);

    const switchTheme = () => {
        const html = document.documentElement;
        const nextTheme = currentTheme === "dark" ? "light" : "dark";
        html.setAttribute("data-theme", nextTheme);
        localStorage.setItem("theme", nextTheme);
        setCurrentTheme(nextTheme);
    };

    const handleClick = (e) => {
        if (!document.startViewTransition) {
            switchTheme();
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        document.documentElement.style.setProperty("--x", `${x}px`);
        document.documentElement.style.setProperty("--y", `${y}px`);

        document.startViewTransition(() => switchTheme());
    };

    if (variant === "emoji") {
        return (
            <button
                onClick={handleClick}
                style={{
                    background: "none",
                    border: "none",
                    fontSize: "2rem"
                }}
                aria-label="Toggle Theme"
            >
                {currentTheme === "dark" ? "🌛" : "🌞"}
            </button>
        );
    }

    return (
        <CustomButton
            onClick={handleClick}
            className={styles.button}
        >
            {currentTheme === "dark" ? "dark_mode" : "light_mode"}
        </CustomButton>
    );
}
