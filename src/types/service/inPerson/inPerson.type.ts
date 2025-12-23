export type TInPerson = {        
    id?: string;
    recipientId: string;
    accreditedNetworkId: string;
    serviceModuleId: string;
    procedureId: string;
    date: any;
    hour: string;
    responsiblePayment: string;
    status: string;
}

export const ResetInPerson: TInPerson = {
    id: "",
    recipientId: "",
    accreditedNetworkId: "",
    serviceModuleId: "",
    procedureId: "",
    date: "",
    hour: "",
    responsiblePayment: "Pasbem",
    status: ""
}