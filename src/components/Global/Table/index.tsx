"use client";

import "./style.css";
import { paginationAtom } from "@/jotai/global/pagination.jotai";
import { useAtom } from "jotai";
import React, { ReactNode } from "react";

export type Column = {
    key: string;
    title: string;
    sortable?: boolean;
    render?: (row: any) => React.ReactNode;
    className?: string;
};
type TPropos = { columns: any[]; isAction?: boolean; children: ReactNode; isActive?: boolean; classContainer?: string ; };

export default function DataTable({ columns, children, isAction = true, isActive = true, classContainer = "max-h-[calc(100dvh-(var(--height-header)+12rem))]" }: TPropos) {
    const [pagination] = useAtom(paginationAtom);
    return (
        <>
            {pagination.data.length > 0 && isActive && (
                <div className={`slim-container-table w-full ${classContainer}`}>
                    <table className="min-w-full slim-table">
                        <thead className="slim-table-thead">
                            <tr>
                                {columns.map((col) => (
                                    <th key={col.key} scope="col" className="px-4 py-3 text-left text-[.6875rem] font-bold tracking-widest uppercase text-[var(--text-muted)]">
                                        {col.title}
                                    </th>
                                ))}
                                {isAction && (
                                    <th scope="col" className="px-4 py-3 text-center text-[.6875rem] font-bold tracking-widest uppercase text-[var(--text-muted)]">
                                        Ações
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="slim-body-table">{children}</tbody>
                    </table>
                </div>
            )}
        </>
    );
}
