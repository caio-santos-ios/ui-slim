import { ResetAddress, TAddress } from "../address/address.type";

export type TCustomerContractor = {
    id?: string;
    type: "B2C" | "B2B";
    document: string;
    rg: string;
    corporateName: string;
    tradeName: string;
    phone: string;
    email: string;
    whatsapp: string;
    effectiveDate: any;
    address: TAddress;
    notes: string;
    origin: string;
    sellerId: string;
    typePlan: string;
    dateOfBirth: any;
    gender: string;
}

export const ResetCustomerContractor = {
    id: "",
    type: "B2C",
    document: "",
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
    dateOfBirth: null
}