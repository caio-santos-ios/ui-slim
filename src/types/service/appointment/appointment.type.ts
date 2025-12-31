export type TAppointment = {        
    id?: string;
    beneficiaryUuid: string;
    availabilityUuid: string;
    specialtyUuid: string;
    approveAdditionalPayment: boolean;
}

export const ResetAppointment: TAppointment = {
    id: "",
    beneficiaryUuid: "",
    availabilityUuid: "",
    specialtyUuid: "",
    approveAdditionalPayment: true
}