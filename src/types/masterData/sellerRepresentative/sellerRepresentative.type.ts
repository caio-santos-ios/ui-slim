import { TAddress } from "../address/address.type";
import { TContact } from "../contact/contact.type";
import { TSeller } from "../seller/seller.type";

export type TSellerRepresentative = {
    id?: string;
    cnpj: string;
    tradeName: string;
    corporateName: string;
    address: TAddress;
    phone: string;
    email: string;
    whatsapp: string;
    effectiveDate: any;
    contact: TContact;
    seller: TSeller;
    responsible: TResponsible;
    bank: TDataBank;
    notes: string;
}

export type TResponsible = {
    name: string;
    cpf: string;
    rg: string;
    address: TAddress;
    dateOfBirth?: string | null;
    gender: string;
    phone: string;
    whatsapp: string;
    email: string;
    notes: string;
}

export type TDataBank = {
    bank: string;
    agency: string;
    account: string;
    type: string;
    pixKey: string;
    pixType: string;
}

export const ResetSellerRepresentative: TSellerRepresentative = {
    id: "",
    cnpj: "",
    corporateName: "",
    tradeName: "",
    address: {
        city: "",
        complement: "",
        neighborhood: "",
        number: "",
        parent: "",
        parentId: "",
        state: "",
        street: "",
        zipCode: ""

    },
    phone: "",        
    whatsapp: "",
    email: "",
    effectiveDate: "",
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
    contact: {
        name: "",
        phone: "",
        whatsapp: "",
        email: "",
        department: "",
        position: "",
        parent: "",
        parentId: "",
    },
    seller: {
        id: "",
        type: "external",
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
        effectiveDate: ""
    },
    bank: {
        bank: "Conta Corrente",
        agency: "",
        account: "",
        type: "",
        pixKey: "",
        pixType: "",
    },
    notes: ""
};