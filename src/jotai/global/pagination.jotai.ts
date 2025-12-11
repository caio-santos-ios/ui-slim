import { TPagination } from "@/types/global/pagination.type";
import { atom } from "jotai";

// export const paginationAtom = atom<TPagination>({
//     data: [],
//     totalPages: 100,
//     currentPage: 1,
//     sizePage: 10
// });

export const paginationAtom = atom({
    data: [],
    totalPages: 100,
    currentPage: 1,
    sizePage: 10 
})