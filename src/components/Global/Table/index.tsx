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
                <div className={`slim-container-table w-full`}>
                    <div className="min-w-full divide-y divide-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 slim-table-thead">
                                <tr>
                                    {columns.map((col) => {
                                        return (
                                        <th key={col.key} scope="col" className={`px-4 py-3 text-left text-sm font-bold text-gray-500 tracking-wider`}>
                                            {col.title}
                                        </th>
                                        );
                                    })}
                                    {isAction && (
                                        <th scope="col" className="px-4 py-3 text-center text-sm font-bold text-gray-500 tracking-wider">
                                            Ações
                                        </th>
                                    )}
                                </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-100">{children}</tbody>
                        </table>
                    </div>
                </div>
            }
        </>
    );
}