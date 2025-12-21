export const convertInputStringMoney = (value: string): string => {
  if (value === null || value === undefined || value === "") return "0,00";

  const cleanValue = typeof value === "string" ? value.replace(",", ".") : value;
  const num = Number(cleanValue);

  if (isNaN(num)) return "0,00";

  const truncated = Math.trunc(num * 100) / 100;

  return truncated.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const convertMoneyToNumber = (value: string | number): number => {
  if (value === null || value === undefined || value === "") return 0;

  // Se já for um número (por algum motivo da API), apenas retorna
  if (typeof value === "number") return value;

  // 1. Remove os pontos de milhar (ex: 1.466,66 -> 1466,66)
  // 2. Substitui a vírgula pelo ponto (ex: 1466,66 -> 1466.66)
  const cleanedValue = value
    .replace(/\./g, "") 
    .replace(",", ".");

  const num = parseFloat(cleanedValue);

  return isNaN(num) ? 0 : num;
};

export const convertStringMoney = (value: string): number => {
  if (!value) return 0;

  let numeric = value.replace(/\./g, "");

  numeric = numeric.replace(",", ".");

  return parseFloat(numeric);
};

export const convertNumberMoney = (value: number): string => {
  if (value === null || value === undefined) return "0,00";

  const num = Number(value);

  if (isNaN(num)) return "0,00";

  return num
    .toFixed(2)                   
    .replace(".", ",")             
    .replace(/\B(?=(\d{3})+(?!\d))/g, "."); 
};