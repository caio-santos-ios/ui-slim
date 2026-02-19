"use client";

import "./style.css";
import { useAtom } from "jotai";
import { modalAtom } from "@/jotai/global/modal.jotai";
import { ReactNode } from "react";
import { IoClose } from "react-icons/io5";

const WIDTH_MAP: Record<string, string> = {
    sm:   "max-w-lg",
    md:   "max-w-2xl",
    lg:   "max-w-4xl",
    xl:   "max-w-6xl",
    full: "max-w-7xl",
};

type TProp = {
    title: string;
    children: ReactNode;
    width?: string;
    heigth?: number;
}

export const Modal = ({ title, children, width = "md" }: TProp) => {
    const [isOpenModal, setIsOpenModal] = useAtom(modalAtom);
    const maxW = WIDTH_MAP[width] ?? `max-w-${width}`;

    if (!isOpenModal) return null;

    return (
        <div
            className="fixed inset-0 z-[999] flex items-start justify-center pt-14 px-4 pb-6 overflow-y-auto"
            style={{ background: "rgba(0,15,35,.65)", backdropFilter: "blur(5px)" }}
        >
            <div
                className={`w-full ${maxW} rounded-2xl overflow-hidden shadow-2xl`}
                style={{
                    background: "var(--surface-card)",
                    border: "1px solid var(--surface-border)",
                    animation: "modal-slide-in .25s cubic-bezier(.34,1.56,.64,1)",
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-6 h-14"
                    style={{
                        background: "linear-gradient(135deg, var(--primary-color-light) 0%, var(--primary-color) 100%)",
                        borderBottom: "2px solid var(--accent-color)",
                    }}
                >
                    <h2 className="text-sm font-bold text-white">{title}</h2>
                    <span
                        onClick={() => setIsOpenModal(false)}
                        className="flex items-center justify-center w-8 h-8 rounded-lg transition-all cursor-pointer"
                        style={{ background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.7)" }}
                    >
                        <IoClose size={18} />
                    </span>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(100dvh - 16rem)" }}>
                    {children}
                </div>
            </div>
        </div>
    );
};
