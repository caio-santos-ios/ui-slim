export type TMenuRoutine = {
    isOpen?: boolean;
    authorized?: boolean;
    code: string;
    subMenu: TMenuRoutine[];
    description: string;
    icon: string;
    link: string;
    padding: string;
    permissions?: {
        create: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
    }
}