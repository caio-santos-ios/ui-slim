import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

/**
 * Desktop sidebar: true = expandido (260px), false = colapsado (icon-only 72px)
 * Persiste no localStorage com a chave "sidebar-expanded"
 */
export const sidebarAtom = atomWithStorage<boolean>("sidebar-expanded", true);