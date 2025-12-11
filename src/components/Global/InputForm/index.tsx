"use client";

import "./style.css";

type TProp = {
    title: string;
    name: string;
    placeholder: string;
    type?: string;
    styleClass?: string;
    inputStyleClass?: string;
    themeInputStyle?: string
    themeLabelStyle?: string
}

export const InputForm = ({title, name, placeholder, styleClass, inputStyleClass, themeInputStyle = "primary", themeLabelStyle = "primary", type = "text", ...rest}: TProp) => {
    const getInputStyleClass = (theme: string) => {
        switch(theme) {
            case "primary":
                return "slim-input-primary";

            case "secondary":
                return "slim-input-secondary";

            default:
                return theme;
        }
    } 
    
    const getLabelStyleClass = (theme: string) => {
        switch(theme) {
            case "primary":
                return "slim-label-primary";

            case "secondary":
                return "slim-label-secondary";
        }
    } 

    return (
        <div className={`flex flex-col ${styleClass}`}>
            <label className={`label ${getLabelStyleClass(themeLabelStyle)}`} htmlFor={name}>{title}</label>
            <input
                {...rest}               
                name={name}             
                placeholder={placeholder}
                type={type}
                className={`input ${inputStyleClass} ${getInputStyleClass(themeInputStyle)}`}
            />
        </div>
    )
}