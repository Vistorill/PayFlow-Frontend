// Mesma regra de src/common/utils/cpf.ts do backend. Aqui é só para o usuário
// errar antes de bater na API — quem decide de verdade continua sendo o backend.

export function somenteDigitos(valor) {
  return String(valor).replace(/\D/g, "");
}

function calcularDigito(digitos, pesos) {
  const soma = digitos.split("").reduce((total, d, i) => total + Number(d) * pesos[i], 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function isCpfValido(cpf) {
  const d = somenteDigitos(cpf);
  if (d.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(d)) return false;
  if (calcularDigito(d.slice(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2]) !== Number(d[9])) return false;
  if (calcularDigito(d.slice(0, 10), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]) !== Number(d[10])) return false;
  return true;
}

// Máscara progressiva para input: "12345678909" -> "123.456.789-09"
export function formatarCpf(valor) {
  const d = somenteDigitos(valor).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}
