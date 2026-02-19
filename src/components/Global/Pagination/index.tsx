"use client";

import "./style.css";
import { useAtom } from "jotai";
import { paginationAtom } from "@/jotai/global/pagination.jotai";
import { useState } from "react";

type TProp = { passPage: () => void; }

export const Pagination = ({ passPage }: TProp) => {
    const [pagination] = useAtom(paginationAtom);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const totalPages = Math.ceil(pagination.totalPages / pagination.sizePage);

    return (
        <>
            {pagination.data.length > 0 && (
                <div className="px-5 py-3 bg-[var(--surface-bg)] border-t border-[var(--surface-border)] flex items-center justify-between text-sm text-[var(--text-muted)] rounded-b-xl">
                    <p className="text-xs">
                        Mostrando{" "}
                        <span className="font-semibold text-[var(--text-primary)]">{pagination.totalPages}</span> de{" "}
                        <span className="font-semibold text-[var(--text-primary)]">{pagination.data?.length}</span>
                    </p>
                    <div className="inline-flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                                    currentPage === i + 1
                                        ? "text-[var(--primary-color)] shadow-sm font-bold"
                                        : "bg-[var(--surface-card)] text-[var(--text-secondary)] border border-[var(--surface-border)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]"
                                }`}
                                style={{
                                    padding: 0, height: "2rem", minWidth: "2rem",
                                    ...(currentPage === i + 1 ? { background: "var(--accent-color)" } : {})
                                }}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};
