export type TCommissions = {
    id?: string;
    type: "internal" | "external";
    ruleName: string;
    description: string;
    notes: string;

    typeModality: string;
    valueModality: any;
    percentageModality: any;
    startNumberModality: any;
    endNumberModality: any;
    startPeriod: any;
    endPeriod: any;
    liquidation: string;
    referenceCriteria: string;
    paymentDate: string;

    campaign: TCampaign;

    isAgency: boolean;
    agency: TAgency;

    isRecurrence: boolean;
    recurrence: TRecurrence;
}

type TCampaign = {
    startPeriod: any;
    endPeriod: any;
    paymentDate: any;
    typeModality: string;
    valueModality: any;
    percentageModality: any;
    startNumberModality: any;
    endNumberModality: any;
    liquidation: string;
    referenceCriteria: string;
}

type TAgency = {
    accession: boolean;
    value: any;
    percentage: any;
    liquidation: string;
    installment: TInstallment;
}

type TRecurrence = {
    percentage: any;
    value: any;
    startMonthlyPayment: string;
    accession: boolean;
    valueAccession: any;
    percentageAccession: any;
    liquidation: string;
    installment: TInstallment;
}

type TInstallment = {
    startMonthlyPayment: string;
    quantityInstallments: number;
    periodicity: boolean;
    listInstallment: any[];
}

export const ResetCommissions: TCommissions = {
    id: "",
    type: 'external',
    ruleName: "",
    description: "",
    notes: "",

    typeModality: "Volume de Vendas",
    valueModality: "",
    percentageModality: "",
    startNumberModality: "",
    endNumberModality: "",
    startPeriod: "",
    endPeriod: "",
    liquidation: "",
    referenceCriteria: "",
    paymentDate: "",

    campaign: {
        startPeriod: "",
        endPeriod: "",
        paymentDate: "",
        typeModality: "",
        valueModality: "",
        percentageModality: "",
        startNumberModality: "",
        endNumberModality: "",
        liquidation: "",
        referenceCriteria: ""
    },

    isAgency: false,
    agency: {
        accession: false,
        value: "",
        percentage: "",
        liquidation: "",
        installment: {
            startMonthlyPayment: "",
            quantityInstallments: 0,
            periodicity: false,
            listInstallment: []
        }
    },

    isRecurrence: false,
    recurrence: {
        percentage: "",
        value: "",
        startMonthlyPayment: "",
        accession: false,
        valueAccession: "",
        percentageAccession: "",
        liquidation: "",
        installment: {
            startMonthlyPayment: "",
            quantityInstallments: 0,
            periodicity: false,
            listInstallment: []
        }
    }
}