export type TAddress = {
    id?: string;
    zipCode: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    complement: string;
    parentId: string;
    parent: string;
}

export const ResetAddress = {
    id: "",
    zipCode: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    complement: "",
    parentId: "",
    parent: "",
}