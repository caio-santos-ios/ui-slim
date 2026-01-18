"use client";

import "./style.css";
import { paginationAtom } from "@/jotai/global/pagination.jotai";
import { TPagination } from "@/types/global/pagination.type";
import { useAtom } from "jotai";
import React, { ReactNode, useEffect } from "react";

export type Column = {
  key: string;
  title: string;
  sortable?: boolean;
  render?: (row: any) => React.ReactNode; 
  className?: string;
};

type TPropos = {
  columns: any[];
  isAction?: boolean;
  children: ReactNode;
  isActive?: boolean;
};

export default function DataTable({columns, children, isAction = true, isActive = true}: TPropos) {
    const [pagination] = useAtom(paginationAtom);     
    
    return (
        <>
            {

                pagination.data.length > 0 && isActive &&
                <div className={`slim-container-table w-full max-h-[calc(100dvh-(var(--height-header)+7rem))]`}>
                    <table className="min-w-full divide-y">
                        <thead className="slim-table-thead">
                            <tr>
                                {columns.map((col) => {
                                    return (
                                    <th key={col.key} scope="col" className={`px-4 py-3 text-left text-sm font-bold tracking-wider`}>
                                        {col.title}
                                    </th>
                                    );
                                })}
                                {isAction && (
                                    <th scope="col" className="px-4 py-3 text-center text-sm font-bold tracking-wider">
                                        Ações
                                    </th>
                                )}
                            </tr>
                        </thead>

                        <tbody className="slim-body-table divide-y">{children}</tbody>
                    </table>
                </div>
            }
        </>
    );
}