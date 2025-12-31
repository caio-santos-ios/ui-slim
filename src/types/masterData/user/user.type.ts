export type TUser = {
    id?: string;
    name: string;
    email: string;
    modules: any[],
    module: string;
    subModule: string;
    permission: {
        read: boolean;
        create: boolean;
        update: boolean;
        delete: boolean;
    },
    admin: boolean;
    blocked: boolean;
    password: string;
    effectiveDate: any;
}

export type TUserPhoto = {
    id?: string;
    image: any;
}

export const ResetUser: TUser = {
    id: "",
    name: "",
    email: "",
    modules: [],
    module: "",
    subModule: "",
    permission: {
        read: false,
        create: false,
        update: false,
        delete: false,
    },
    admin: false,
    blocked: false,
    password: "",
    effectiveDate: ""
}