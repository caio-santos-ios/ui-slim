export type TPlan = {
    id?: string;
    name: string;
    price: any;
    type: "B2B" | "B2C" | "B2B e B2C";
    description: string;
    serviceModuleId: string;
    active: boolean
}