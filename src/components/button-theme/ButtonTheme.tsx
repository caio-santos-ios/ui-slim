"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

export const ButtonTheme = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;
    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors"
            style={{ padding: 0, height: "auto", background: "transparent", border: "none", boxShadow: "none", fontSize: "1rem" }}
        >
            {theme === "dark" ? <FiSun size={17} /> : <FiMoon size={17} />}
        </button>
    );
};
