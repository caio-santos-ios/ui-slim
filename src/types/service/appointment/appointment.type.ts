export type TAppointment = {        
    id?: string;
    beneficiaryUuid: string;
    availabilityUuid: string;
    specialtyUuid: string;
    ProfessionalName: string;
    approveAdditionalPayment: boolean;
}

export const ResetAppointment: TAppointment = {
    id: "",
    beneficiaryUuid: "",
    availabilityUuid: "",
    specialtyUuid: "",
    approveAdditionalPayment: true,
    ProfessionalName: "",
}

export type TAppointmentSearch = {        
    beneficiaryUuid: string;
    status: string;
}

export const ResetAppointmentSearch: TAppointmentSearch = {
    beneficiaryUuid: "",
    status: "",
}