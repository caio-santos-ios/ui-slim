"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FiSun } from "react-icons/fi";
import { FiMoon } from "react-icons/fi";

export const ButtonTheme = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <button className="text-3xl" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme == "dark" ? <FiSun /> : <FiMoon />}
        </button>
    )
}