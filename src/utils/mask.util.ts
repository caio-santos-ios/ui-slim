export const maskDate = (dateString: string, isTime: boolean = false) => {
  if (!dateString) return "";

  const [datePart, timePart] = dateString.split("T");
  const [year, month, day] = datePart.split("-");

  let hours = 0;
  let minutes = 0;

  if (timePart) {
    const [h, m] = timePart.split(":");
    hours = parseInt(h);
    minutes = parseInt(m);
  }

  const date = new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    hours,
    minutes
  );

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(isTime && { hour: "2-digit", minute: "2-digit" }), 
  });
};

export const maskPhone = (event: React.ChangeEvent<HTMLInputElement>) => {
  let value = event.target.value.replace(/\D/g, '');

  value = value.slice(0, 11);

  if (value.length > 10) {
    value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  } 

  else {
    value = value.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }

  event.target.value = value;
}

export const maskCPF = (event: React.ChangeEvent<HTMLInputElement>) => {
  let value = event.target.value.replace(/\D/g, ""); 

  value = value.slice(0, 11)

  value = value.replace(/^(\d{3})(\d)/, "$1.$2");
  value = value.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");

  value = value.replace(/(\d{3})(\d{2})$/, "$1-$2");

  event.target.value = value;
};

export const maskCNPJ = (event: React.ChangeEvent<HTMLInputElement>) => {
  let value = event.target.value.replace(/\D/g, ""); 
  
  value = value.slice(0, 14);

  value = value.replace(/^(\d{2})(\d)/, "$1.$2"); 
  value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
  value = value.replace(/\.(\d{3})(\d)/, ".$1/$2"); 
  value = value.replace(/(\d{4})(\d{2})$/, "$1-$2"); 

  event.target.value = value;
};

export const maskZipCode = (event: React.ChangeEvent<HTMLInputElement>) => {
  let value = event.target.value.replace(/\D/g, "");

  value = value.slice(0, 8);

  value = value.replace(/^(\d{5})(\d)/, "$1-$2");

  event.target.value = value;
};

export const maskMoney = (event: React.ChangeEvent<HTMLInputElement>) => {
  let value = event.target.value.replace(/\D/g, "");

  value = value.slice(0, 15);

  if (!value) {
    event.target.value = "";
    return;
  }

  const cents = (parseInt(value, 10) / 100).toFixed(2);

  const formatted = cents
    .replace(".", ",")                
    .replace(/\B(?=(\d{3})+(?!\d))/g, "."); 

  event.target.value = formatted;
};

export const maskAgency = (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  let value = event.target.value.replace(/\D/g, '');

  value = value.slice(0, 5);

  if (value.length > 4) {
    value = value.replace(/^(\d{4})(\d)$/, '$1-$2');
  }

  event.target.value = value;
};

export const maskAccount = (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  let value = event.target.value.replace(/\D/g, '');

  value = value.slice(0, 13);

  if (value.length > 5) {
    value = value.replace(/^(\d{5,12})(\d)$/, '$1-$2');
  }

  event.target.value = value;
};

// FORMATED //
export const formattedMoney = (value: string) => {
  if (!value) return "0,00";
  
  value = value.slice(0, 15);
  console.log(parseFloat(value))
  const cents = (parseInt(value, 10) / 100).toFixed(2);

  return cents
    .replace(".", ",")                
    .replace(/\B(?=(\d{3})+(?!\d))/g, "."); 
};

export const formattedCPF = (value: string): string => {
  if (!value) return "";

  const onlyDigits = value.replace(/\D/g, "");

  return onlyDigits
    .replace(/(\d{3})(\d)/, "$1.$2")       
    .replace(/(\d{3})(\d)/, "$1.$2")       
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2") 
    .substring(0, 14);                     
};