export type TGenericTable = {
    id?: string;
    table: string;
    code: string;
    description: string;
    createdAt: string;
    active: boolean;
    items: any[]
}

export const ResetGenericTable = {
    id: "",
    table: "",
    code: "",
    description: "",
    createdAt: "",
    active: true,
    items: []
}