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