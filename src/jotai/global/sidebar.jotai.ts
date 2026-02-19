import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

/**
 * Desktop sidebar: true = expanded (260px), false = icon-only (72px)
 * Persisted via localStorage key "sidebar-expanded"
 */
export const sidebarAtom = atomWithStorage<boolean>("sidebar-expanded", true);

/**
 * Mobile drawer state (not persisted)
 */
export const sidebarMobileAtom = atom<boolean>(false);
