import { atom } from "jotai";

export const userLoggerAtom = atom<boolean>(false);
export const sincAtom = atom<boolean>(false);
export const user = atom<any>({})