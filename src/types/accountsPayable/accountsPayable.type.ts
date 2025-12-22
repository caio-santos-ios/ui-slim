export type TAccountsPayable = {
    id?: string;
    code: string;
    referenceCode: string;
    supplierId: string;
    costCenter: string;
    category: string;
    typeOfPeriodicity: string;
    quantityOfPeriodicity: string;
    paymentMethod: string;
    
    value: any;
    lowValue: any;
    fines: any;
    fees: any;
    balance: any;

    lowDate: any;
    dueDate: any;
    
    billingPeriod: string;
    billing: string;
    notes: string;
}

export const ResetAccountsPayable = {
    id: "",
    code: "",
    referenceCode: "",
    supplierId: "",
    costCenter: "",
    category: "",
    typeOfPeriodicity: "",
    quantityOfPeriodicity: "",
    paymentMethod: "",
    value: "",
    lowValue: "",
    fines: "",
    fees: "",
    lowDate: "",
    dueDate: "",
    
    billingPeriod: "Mensal",
    billing: "01",
    notes: ""
}