
export type TCustomerContract = {
    id?: string;
    code?: string;
    type: string;
    name: string;
    contractorId: string;
    saleDate: any;
    category: string;
    costCenter: string;
    sellerId: string;
    serviceModuleId: string;
    value: any;
    paymentMethod: string;
    receiptAccount: string;
    paymentCondition: string;

    paymentInstallmentQuantity: number;
    dueDateInstallment: string;
    chargingMethodInstallment: string;

    recurrencePeriod: string;
    recurrence: string;
    endRecurrence: any;

    dueDate: any;
    billingPeriod: string;
    billing: string;
    notes: string;
}

export const ResetCustomerContract: TCustomerContract = {
    id: "",
    code: "",
    type: "Avulsos",
    name: "",
    contractorId: "",
    saleDate: "",
    category: "",
    costCenter: "",
    sellerId: "",
    serviceModuleId: "",
    value: "",
    paymentMethod: "",
    receiptAccount: "",
    paymentCondition: "À Vista",
    
    paymentInstallmentQuantity: 2,
    dueDateInstallment: "",
    chargingMethodInstallment: "",

    recurrencePeriod: "Mensal",
    recurrence: "",
    endRecurrence: "",

    dueDate: "",
    billingPeriod: "Mensal",
    billing: "01",
    notes: ""
}