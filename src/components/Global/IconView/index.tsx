"use client";

import { uriBase } from "@/service/api.service";
import Link from "next/link";
import { BsEye } from "react-icons/bs";

type TProp = { link: string }

export const IconView = ({ link }: TProp) => (
    <Link href={`${uriBase}/${link}`} target="_blank">
        <button
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] bg-[var(--surface-bg)] hover:bg-[var(--primary-color)] hover:text-white border border-[var(--surface-border)] hover:border-[var(--primary-color)] transition-all"
            style={{ padding: 0, minWidth: "2rem" }}
            title="Visualizar"
            >
            <BsEye size={13} />
        </button>
    </Link>
);
