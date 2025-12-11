"use client";

import "./style.css";

type TProp = {
    theme?: string;
    styleClassBtn?: string;
    text: string;
    isLoading?: boolean;
    click?: () => void
}


export const Button = ({isLoading, text, click, theme = "primary", styleClassBtn}: TProp) => {

    return (
        <button onClick={click} className={`slim-btn slim-btn-${theme} ${styleClassBtn}`} disabled={isLoading}>
            {isLoading ? <div className={`spinner slim-btn-spinner-${theme}`}></div> : text}
        </button>
    )
}