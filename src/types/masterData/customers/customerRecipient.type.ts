import { ResetAddress, TAddress } from "../address/address.type";

export type TRecipient = {
    id?: string;
    name: string;
    cpf: string;
    rg: string;
    address: TAddress;
    dateOfBirth?: any;
    gender: string;
    phone: string;
    whatsapp: string;
    email: string;
    planId: string;
    notes: string;
    contractorId: string;
    bond: string;
}

export const ResetCustomerRecipient = {
    id: "",
    name: "",
    cpf: "",
    rg: "",
    address: ResetAddress,
    dateOfBirth: null,
    gender: "",
    phone: "",
    whatsapp: "",
    email: "",
    planId: "",
    notes: "",
    contractId: "",
    bond: ""
}