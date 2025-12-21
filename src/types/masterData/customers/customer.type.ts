import { ResetAddress, TAddress } from "../address/address.type";

export type TCustomerContractor = {
    id?: string;
    type: "B2C" | "B2B" | "B2B e B2C";
    document: string;
    rg: string;
    segment: string;
    responsible: TResponsible;
    corporateName: string;
    tradeName: string;
    phone: string;
    email: string;
    whatsapp: string;
    effectiveDate: any | null;
    address: TAddress;
    notes: string;
    origin: string;
    sellerId: string;
    typePlan: string;
    dateOfBirth: any | null;
    gender: string;
    minimumValue: any;
}

export const ResetCustomerContractor: TCustomerContractor = {
    id: "",
    type: "B2C",
    document: "",
    rg: "",
    segment: "",
    gender: "",
    corporateName: "",
    tradeName: "",
    phone: "",
    email: "",
    whatsapp: "",
    effectiveDate: "",
    address: ResetAddress,
    notes: "",   
    origin: "",   
    sellerId: "", 
    typePlan: "", 
    dateOfBirth: null,
    responsible: {
        name: "",
        cpf: "",
        rg: "",
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
        gender: "",
        phone: "",
        whatsapp: "",
        email: "",
        notes: "",
    },
    minimumValue: ""
}

export type TResponsible = {
    name: string;
    cpf: string;
    rg: string;
    address: TAddress;
    dateOfBirth?: any | null;
    gender: string;
    phone: string;
    whatsapp: string;
    email: string;
    notes: string;
}