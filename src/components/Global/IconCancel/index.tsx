"use client";

import { FiXCircle } from "react-icons/fi";

type TProp = { obj: any; getObj: (obj: any) => void; }

export const IconCancel = ({ obj, getObj }: TProp) => (
    <button
        onClick={() => getObj(obj)}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] bg-[var(--surface-bg)] hover:bg-orange-50 hover:text-orange-500 border border-[var(--surface-border)] hover:border-orange-200 transition-all"
        style={{ padding: 0, minWidth: "2rem" }}
        title="Cancelar"
    >
        <FiXCircle size={13} />
    </button>
);
