import { TAddress } from "../address/address.type";

export type TProfessional = {
    id?: string;
    name: string;
    email: string;
    phone: string;
    cpf: string;
    address: TAddress;
    type: string;        
    specialty: string;       
    registration: string;     
    number: string;
    effectiveDate: any;
}

export const ResetProfessional: TProfessional = {
    id: "",
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
    type: "",        
    specialty: "",       
    registration: "",     
    number: "",
    effectiveDate: ""
}