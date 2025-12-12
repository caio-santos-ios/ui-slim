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