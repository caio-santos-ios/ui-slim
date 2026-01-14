export type TForwarding = {        
    id?: string;
    beneficiaryUuid: string;
    availabilityUuid: string;
    specialtyUuid: string;
    beneficiaryMedicalReferralUuid: string;
    approveAdditionalPayment: boolean;
}

export const ResetForwarding: TForwarding = {
    id: "",
    beneficiaryUuid: "",
    availabilityUuid: "",
    specialtyUuid: "",
    beneficiaryMedicalReferralUuid: "",
    approveAdditionalPayment: true
}

export type TForwardingSearch = {        
    beneficiaryUuid: string;
    status: string;
}

export const ResetForwardingSearch: TForwardingSearch = {
    beneficiaryUuid: "",
    status: "",
}