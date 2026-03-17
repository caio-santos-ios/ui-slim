export type TB2BBeneficiaryData = {
  name: string;
  cpf: string;
  dateOfBirth?: string;
  gender: string;
  email: string;
  phone: string;
  whatsapp: string;
  department: string;
  role: string;
  planId: string;
  programId: string;
};

export type TB2BMassMovement = {
  id: string;
  customerId: string;
  customerName: string;
  type: string; // Inclusao | Exclusao | UpgradePrograma | DowngradePrograma
  status: string; // Pendente | Processado | Erro
  programId: string;
  programName: string;
  notes: string;
  processedAt?: string;
  processedBy: string;
  beneficiary?: TB2BBeneficiaryData;
  fileUrl: string;
  fileName: string;
  createdAt: string;
  updatedAt: string;
};

export type TB2BInvoiceItem = {
  description: string;
  recipientName: string;
  recipientCpf: string;
  planName: string;
  amount: number;
};

export type TB2BInvoice = {
  id: string;
  customerId: string;
  customerName: string;
  referenceMonth: number;
  referenceYear: number;
  cycleStart: string;
  cycleEnd: string;
  status: string; // Aberta | Fechada | Paga | Cancelada
  totalAmount: number;
  beneficiaryCount: number;
  dueDate?: string;
  paidAt?: string;
  items: TB2BInvoiceItem[];
  createdAt: string;
  updatedAt: string;
};

export type TB2BAttachment = {
  id: string;
  customerId: string;
  customerName: string;
  name: string;
  fileUrl: string;
  fileName: string;
  fileType: string; // Excel | PDF | JPEG
  fileSize: number;
  required: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
};
