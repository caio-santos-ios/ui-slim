export type TTradingTable = {
    id?: string;
    name: string;
    item: string;
    serviceModuleId: string;
    procedureId: string;
    subTotal: any;
    discount: any;
    discountPercentage: any;
    total: any;
    items: TTradingTableItem[]
}

export const ResetTradingTable: TTradingTable = {
    id: "",
    name: "",
    item: "",
    serviceModuleId: "",
    procedureId: "",
    subTotal: 0,
    discount: 0,
    discountPercentage: 0,
    total: 0,
    items: []
}

export type TTradingTableItem = {
    item: string;
    serviceModuleId: string;
    procedureId: string;
    subTotal: any;
    discount: any;
    discountPercentage: any;
    total: any;
}

export const ResetTradingTableItem: TTradingTableItem = {
    item: "",
    serviceModuleId: "",
    procedureId: "",
    subTotal: 0,
    discount: 0,
    discountPercentage: 0,
    total: 0
}