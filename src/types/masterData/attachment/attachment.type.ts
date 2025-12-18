export type TAttachment = {
    id?: string;
    type: string;
    uri: string;
    file: any;
    description: string;
    parentId: string;
    parent: string;
}

export const ResetAttachment: TAttachment = {
    id: "",
    type: "",
    uri: "",
    file: null,
    parentId: "",
    parent: "",
    description: ""
}