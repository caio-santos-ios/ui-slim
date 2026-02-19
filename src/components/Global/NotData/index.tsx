"use client";

import "./style.css";
import { useAtom } from "jotai";
import { paginationAtom } from "@/jotai/global/pagination.jotai";
import Image from "next/image";

export const NotData = () => {
    const [pagination] = useAtom(paginationAtom);
    return (
        <>
            {pagination.data.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <Image src="/assets/images/notData.png" alt="Sem dados" width={180} height={120} className="opacity-60 mb-5" />
                    <h2 className="text-base font-bold text-[var(--text-primary)] mb-1">Nenhum registro encontrado</h2>
                    <p className="text-sm text-[var(--text-muted)] max-w-xs">Tente ajustar os filtros ou adicionar novos registros.</p>
                </div>
            )}
        </>
    );
};
