export const maskDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        // hour: "2-digit",
        // minute: "2-digit",
        // second: "2-digit",
    });
}

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