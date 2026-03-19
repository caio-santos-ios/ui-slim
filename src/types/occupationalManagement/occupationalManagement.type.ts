export type TOccupationalMicroCheckin = {
  id: string;
  customerId: string;
  recipientId: string;
  recipientName: string;
  department: string;
  role: string;
  dimension: string;
  engagementLevel: number;
  riskClassification: string; // Baixo | Médio | Alto | Crítico
  riskLevel: number;
  safetyPerception: number;
  absenceRisk: number;
  econometerScore: number;
  checkinDate: string;
  period: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type TOccupationalBemVital = {
  id: string;
  customerId: string;
  recipientId: string;
  recipientName: string;
  department: string;
  role: string;
  referenceDate: string;
  igs: number;
  ign: number;
  ies: number;
  ipv: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type TOccupationalPgr = {
  id: string;
  customerId: string;
  customerName: string;
  referenceMonth: number;
  referenceYear: number;
  generatedAt?: string;
  generatedBy: string;
  fileUrl: string;
  fileName: string;
  totalBeneficiaries: number;
  avgEngagement: number;
  avgRisk: number;
  avgSafetyPerception: number;
  avgAbsenceRisk: number;
  avgEconometer: number;
  status: string; // Pendente | Gerado | Enviado
  createdAt: string;
  updatedAt: string;
};
