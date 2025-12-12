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
}