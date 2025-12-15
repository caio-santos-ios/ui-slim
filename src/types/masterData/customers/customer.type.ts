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
    contractId: ""
}

type TContract = {
    id?: string;
    code?: string;
    type: string;
    name: string;
    saleDate: any;
    category: string;
    costCenter: string;
    sellerId: string;
    value: any;
    paymentMethod: string;
    receiptAccount: string;
    paymentCondition: string;

    paymentInstallmentQuantity: number;
    dueDateInstallment: string;
    chargingMethodInstallment: string;

    typeRecurrence: string;
    recurrence: string;
    endRecurrence: any;

    dueDate: any;
    billingPeriod: string;
    billing: string;
    notes: string;
}

export const ResetContract: TContract = {
    id: "",
    code: "",
    type: "",
    name: "",
    saleDate: "",
    category: "",
    costCenter: "",
    sellerId: "",
    value: "",
    paymentMethod: "",
    receiptAccount: "",
    paymentCondition: "",
    
    paymentInstallmentQuantity: 0,
    dueDateInstallment: "",
    chargingMethodInstallment: "",

    typeRecurrence: "",
    recurrence: "",
    endRecurrence: "",

    dueDate: "",
    billingPeriod: "",
    billing: "",
    notes: ""
}