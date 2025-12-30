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
    subTotal: any;
    total: any;
    discount: any;
    discountPercentage: any;
}

export const ResetCustomerRecipient: TRecipient = {
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
    contractorId: "",
    bond: "",
    discount: 0,
    discountPercentage: 0,
    subTotal: 0,
    total: 0
}