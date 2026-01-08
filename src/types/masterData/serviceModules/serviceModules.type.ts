export type TServiceModule = {
    id?: string;
    code: string;
    name: string;
    description: string;
    price: any;
    cost: any;
    active: any;
    image: any;
    uri: string;
    type: "" | "B2B" | "B2C" | "B2B e B2C";
}

export const ResetServiceModule: TServiceModule = {
    id: "",
    code: "",
    name: "",
    price: 0,
    cost: 0,
    description: "",
    active: true,
    image: "",
    uri: "",
    type: ""
}