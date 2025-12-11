import { TContract } from "../contract/contract.type";

export type TAccountsReceivable = {
    id: string;
    contract: string;
    category: string;
    costCenter: string;
    paymentMethod: string;
    createdAt: string;
};

export type TCreateAccountsReceivable = Omit<TAccountsReceivable, "id" | "createdAt">;