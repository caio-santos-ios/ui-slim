import { ResetCustomerRecipient, TRecipient } from "@/types/masterData/customers/customerRecipient.type";
import { atom } from "jotai";

export const recipient = atom<TRecipient>(ResetCustomerRecipient)