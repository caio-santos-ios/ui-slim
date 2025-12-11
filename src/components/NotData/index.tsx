"use client";

import "./style.css";
import { useAtom } from "jotai";
import { GrNext, GrPrevious } from "react-icons/gr";
import { paginationAtom } from "@/jotai/global/pagination.jotai";
import { TPagination } from "@/types/global/pagination.type";
import Image from "next/image";

export const NotData = () => {
    const [pagination] = useAtom<TPagination<any>>(paginationAtom);   

    return (
        <>
            {
                pagination.data.length == 0 &&
                <div className="h-full hidden lg:flex flex-col items-center justify-center text-sm text-gray-600">
                    <Image
                        src="/assets/images/notData.png"
                        alt="Logo"
                        width={400}
                        height={150}
                    />
                    <h1 className="text-xl font-bold">Nenhum registro encontrado</h1>
                </div>
            }
        </>
    )
}