export type TAttachment = {
    id?: string;
    type: string;
    uri: string;
    file: any;
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
}