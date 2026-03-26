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
    serviceModuleIds: any[];
    notes: string;
    contractorId: string;
    bond: string;
    subTotal: any;
    total: any;
    discount: any;
    discountPercentage: any;
    effectiveDate: any | null;
    age: any;
    branch: string;
    department: string;
    function: string;
    registration: string;
    cno: string;
    cat: "yes" | "no",
    catNumber: string;
    catDate: any;
    catCID: string;
    bondId: string;
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
    serviceModuleIds: [],
    notes: "",
    contractorId: "",
    bond: "",
    discount: 0,
    discountPercentage: 0,
    subTotal: 0,
    total: 0,
    effectiveDate: "",
    age: "",
    branch: "",
    department: "",
    registration: "",
    cno: "",
    function: "",
    cat: "no",
    catNumber: "",
    catCID: "",
    catDate: null,
    bondId: ""
}

export type TRecipientSearch = {        
    gte$effectiveDate: any;
    lte$effectiveDate: any;
}

export const ResetRecipientSearch: TRecipientSearch = {
    gte$effectiveDate: "",
    lte$effectiveDate: ""
}