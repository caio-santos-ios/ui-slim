export type TInPerson = {        
    id?: string;
    recipientId: string;
    accreditedNetworkId: string;
    serviceModuleId: string;
    procedureIds: string[];
    date: any;
    hour: string;
    responsiblePayment: string;
    status: string;
    value: any;
}

export const ResetInPerson: TInPerson = {
    id: "",
    recipientId: "",
    accreditedNetworkId: "",
    serviceModuleId: "",
    procedureIds: [],
    date: "",
    hour: "",
    responsiblePayment: "Pasbem",
    status: "",
    value: 0
}