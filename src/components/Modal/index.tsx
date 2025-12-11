"use client";

import "./style.css";
import { useAtom } from "jotai";
import { modalAtom } from "@/jotai/global/modal.jotai";
import { ReactNode } from "react";

type TProp = {
    title: string;
    children: ReactNode;
    width?: string;
    heigth?: number;
}

export const Modal = ({title, children, width = "md", heigth = 20}: TProp) => {
    const [isOpenModal] = useAtom(modalAtom);

    return (
        isOpenModal &&
        <div className={`container-modal`}>
            <div className={`modal modal-${width}`}>
                <div className="modal-header">
                    <h1>{title}</h1>
                </div>
                <div className="modal-body">
                    {children}
                </div>                
            </div>
        </div>
    )
}