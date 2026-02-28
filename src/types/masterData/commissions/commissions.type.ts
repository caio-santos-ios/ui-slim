export type TCommissions = {
    id?: string;
    escalation: "yes" | "no";
    ruleName: string;
    description: string;
    startPeriod: any;
    endPeriod: any;
    numberOfLives: number;
    condition: "%" | "R$";
    conditionValue: number;
    recurrence: "yes" | "no";
}

export const ResetCommissions: TCommissions = {
    id: "",
    escalation: 'yes',
    ruleName: "",
    description: "",
    startPeriod: "",
    endPeriod: "",
    numberOfLives: 0,
    condition: "%",
    conditionValue: 0,
    recurrence: "yes"
}