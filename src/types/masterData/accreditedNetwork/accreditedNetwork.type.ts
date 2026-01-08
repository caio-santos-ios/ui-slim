import { TAddress } from "../address/address.type";

export type TAccreditedNetwork = {
    id?: string;
    cnpj: string;
    tradeName: string;
    corporateName: string;
    phone: string;
    whatsapp: string;
    email: string;
    notes: string;
    serviceModuleId: string;
    billingId: string;
    effectiveDate?: any;
    consumptionLimit: any;
    tradingTable: string;
    address: TAddress;
    responsible: TResponsible;
    active: boolean;
}

export const ResetAccreditedNetwork: TAccreditedNetwork = {
    id: "",
    cnpj: "",
    tradeName: "",
    corporateName: "",
    phone: "",
    whatsapp: "",
    email: "",
    notes: "",
    serviceModuleId: "",
    billingId: "",
    effectiveDate: "",
    consumptionLimit: 0,
    tradingTable: "",
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
    active: true
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