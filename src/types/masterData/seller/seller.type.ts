import { TAddress } from "../address/address.type";

export type TSeller = {
    id?: string;
    type: "internal" | "external";
    name: "";
    email: "";
    phone: "";
    cpf: "";
    address: TAddress;
    notes: "";
}