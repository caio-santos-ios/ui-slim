"use client";

import "./style.css";

type TProp = {
    theme?: string;
    styleClassBtn?: string;
    text: string;
    isLoading?: boolean;
    click?: () => void,
    type?: "button" | "submit" | "reset" | undefined;
}


export const Button = ({isLoading, text, click, theme = "primary", styleClassBtn, type = "button"}: TProp) => {

    return (
        <button type={type} onClick={click} className={`slim-btn slim-btn-${theme} ${styleClassBtn}`} disabled={isLoading}>
            {isLoading ? <div className={`spinner slim-btn-spinner-${theme}`}></div> : text}
        </button>
    )
}