export type TBillingItem = {
    item: string;
    start: string;
    end: string;
    deliveryDate: string;
    billingDate: string
}

export const ResteBillingItem: TBillingItem = {
    item: "",
    start: "",
    end: "",
    deliveryDate: "",
    billingDate: ""
}

export type TBilling = {
    id?: string;
    name: string;
    description: string;
    items: TBillingItem[];
    item: TBillingItem
}

export const ResteBilling: TBilling = {
    id: "",
    name: "",
    description: "",
    items: [],
    item: ResteBillingItem
}