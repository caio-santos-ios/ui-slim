import { TAddress } from "../address/address.type";

export type TSeller = {
    id?: string;
    type: "internal" | "external";
    name: string;
    email: string;
    phone: string;
    cpf: string;
    address: TAddress;
    notes: string;
    parentId: string;
    parent: string;
    effectiveDate: any;
}

export const ResetSeller: TSeller = {
    type: "internal",
    name: "",
    email: "",
    phone: "",
    cpf: "",
    address: {
        id: "",
        zipCode: "",
        street: "",
        number: "",
        neighborhood: "",
        city: "",
        state: "",
        complement: "",
        parentId: "",
        parent: "",
    },
    notes: "",
    parentId: "",
    parent: "",
    id: "",
    effectiveDate: ""
}