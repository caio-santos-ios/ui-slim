export type TPlan = {
    id?: string;
    code: string;
    name: string;
    price: any;
    cost: any;
    type: "" | "B2B" | "B2C" | "B2B e B2C";
    description: string;
    serviceModuleId: string;
    active: any;
    serviceModuleIds: any;
    image: any;
    uri: string;
}

export const ResetPlan: TPlan = {
    id: "",
    code: "",
    name: "",
    price: 0,
    cost: 0,
    type: "",
    description: "",
    serviceModuleId: "",
    active: true,
    serviceModuleIds: "",
    image: "",
    uri: ""
}