import { TMenuRoutine } from "@/types/global/menu.type";

export type TPermissionRoutine = {
  read:   boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
};

export type TProfileRoutine = {
  code:        string;
  description: string;
  permissions: TPermissionRoutine;
};

export type TProfileModule = {
  code:        string;
  description: string;
  routines:    TProfileRoutine[];
};

export type TPermissionProfile = {
  id:          string;
  name:        string;
  description: string;
  modules:     TProfileModule[];
  createdAt:   string;
  updatedAt:   string;
};
