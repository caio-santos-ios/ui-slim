"use client";

import { FiTrash2 } from "react-icons/fi";

type TProp = { obj: any; getObj: (obj: any) => void; }

export const IconDelete = ({ obj, getObj }: TProp) => (
    <button
        onClick={() => getObj(obj)}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] bg-[var(--surface-bg)] hover:bg-red-50 hover:text-red-500 border border-[var(--surface-border)] hover:border-red-200 dark:hover:bg-red-900/20 transition-all"
        style={{ padding: 0, minWidth: "2rem" }}
        title="Excluir"
    >
        <FiTrash2 size={13} />
    </button>
);
