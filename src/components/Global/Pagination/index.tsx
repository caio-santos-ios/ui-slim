"use client";

import "./style.css";
import { useAtom } from "jotai";
import { GrNext, GrPrevious } from "react-icons/gr";
import { paginationAtom } from "@/jotai/global/pagination.jotai";
import { useState } from "react";

type TProp = {
    passPage: () => void;
}

export const Pagination = ({passPage}: TProp) => {
    const [pagination, setPagination] = useAtom(paginationAtom);   
    const [currentPage, setCurrentPage] = useState<number>(1);
    const totalPages = Math.ceil(pagination.totalPages / pagination.sizePage);

    const page = (currentPage?: number) => {
        if(currentPage) {
            console.log(pagination.currentPage)
            console.log(currentPage)
            setCurrentPage(currentPage);
            setPagination({
                currentPage,
                data: pagination.data,
                sizePage: pagination.sizePage,
                totalPages: pagination.totalPages
            });

            passPage();
        };
    };

    return (
        <>
            {
                pagination.data.length > 0 &&
                <div className="px-4 py-3 bg-gray-50 flex items-center justify-between text-sm text-gray-600">
                    <div>
                        Mostrando <span className="font-semibold">{pagination.totalPages}</span> de <span className="font-semibold">{pagination.data?.length}</span> 
                    </div>
                    <div className="inline-flex items-center gap-2">
                        {/* <GrPrevious onClick={() => passPage('previous')} />                         */}
                            {
                                Array.from({length: totalPages}, (_, index) => {
                                    return <span onClick={() => page(index + 1)} key={index} className={`cursor-pointer font-semibold px-2 py-1 rounded border ${currentPage == index + 1 ? 'bg-blue-400 text-white' : ''}`}>{index + 1}</span>
                                })
                            }
                        {/* <GrNext onClick={() => passPage('next')} /> */}
                    </div>
                </div>
            }
        </>
    )
}