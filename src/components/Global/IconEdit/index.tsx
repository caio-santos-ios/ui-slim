"use client";

import { FiEdit2 } from "react-icons/fi";

type TProp = { action: string; obj: any; getObj: (action: "create" | "edit", obj: any) => void; }

export const IconEdit = ({ action, obj, getObj }: TProp) => (
    <button
        onClick={() => getObj("edit", obj)}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] bg-[var(--surface-bg)] hover:bg-[var(--primary-color)] hover:text-white border border-[var(--surface-border)] hover:border-[var(--primary-color)] transition-all"
        style={{ padding: 0, minWidth: "2rem" }}
        title="Editar"
    >
        <FiEdit2 size={13} />
    </button>
);
