import { TAddress } from "../address/address.type";

export type TSupplier = {
    id?: string;
    type: "F" | "J" | "F";
    document: string;
    corporateName: string;
    tradeName: string;
    phone: string;
    email: string;
    address: TAddress;
    stateRegistration: string;
    municipalRegistration: string;
    notes: string;
    effectiveDate: any;
}

export const ResetSupplier: TSupplier = {
    id: "",
    type: "F",
    document: "",
    corporateName: "",
    tradeName: "",
    phone: "",
    email: "",
    address: {
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
    stateRegistration: "",
    municipalRegistration: "",
    notes: "",
    effectiveDate: null
}