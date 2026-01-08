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

export type TInPersonSearch = {        
    recipientId: string;
    accreditedNetworkId: string;
    serviceModuleId: string;
    gte$date: any;
    lte$date: any;
    status: string;
}

export const ResetInPersonSearch: TInPersonSearch = {
    recipientId: "",
    accreditedNetworkId: "",
    serviceModuleId: "",
    gte$date: "",
    lte$date: "",
    status: "",
}