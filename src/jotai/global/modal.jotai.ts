import { atom } from "jotai";

export const modalAtom = atom<boolean>(false);
export const modalGenericTableAtom = atom<boolean>(false);
export const tableGenericTableAtom = atom<string>("");