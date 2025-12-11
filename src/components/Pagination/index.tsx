"use client";

import "./style.css";
import { useAtom } from "jotai";
import { GrNext, GrPrevious } from "react-icons/gr";
import { paginationAtom } from "@/jotai/global/pagination.jotai";
import { TPagination } from "@/types/global/pagination.type";

export const Pagination = () => {
    const [pagination] = useAtom(paginationAtom);   

    return (
        <>
            {
                pagination.data.length > 0 &&
                <div className="px-4 py-3 bg-gray-50 flex items-center justify-between text-sm text-gray-600">
                    <div>
                        Mostrando <span className="font-semibold">{pagination.totalPages}</span> de <span className="font-semibold">{pagination.data?.length}</span> 
                    </div>
                    <div className="inline-flex items-center gap-2">
                        <GrPrevious />
                            <span className="font-semibold px-2 py-1 rounded border hover:bg-gray-100">{pagination.currentPage}</span>
                        <GrNext />
                    </div>
                </div>
            }
        </>
    )
}