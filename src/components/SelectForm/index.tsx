"use client";

import "./style.css";
import { ReactNode } from "react";

type TProp = {
    title: string;
    name: string;
    children: ReactNode;
    type?: string;
    styleClass?: string;
}

export const SelectForm = ({title, name, children, styleClass, type = "text", ...rest}: TProp) => {

    return (
        <div className={`flex flex-col ${styleClass}`}>
            <label className="label" htmlFor={name}>{title}</label>
            <select className="select" {...rest} name={name} id={name}>
                {children}
            </select>
        </div>
    )
}