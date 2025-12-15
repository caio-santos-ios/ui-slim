export type TContact = {
    id?: string;
    name: string;
    phone: string;
    whatsapp: string;
    email: string;
    department: string;
    position: string;
    parent: string;
    parentId: string;
    attributes?: string;
}

export const ResetContact: TContact = {
    id: '',
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    department: '',
    position: '',
    parent: '',
    parentId: '',
    attributes: ''
}