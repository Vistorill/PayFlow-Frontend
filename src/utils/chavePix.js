import { formatarCpf, isCpfValido, somenteDigitos } from "./cpf";

// Mesmos tipos e regras de src/common/utils/chave-pix.ts do backend.
// Aqui é só UX (máscara + erro antes de enviar); quem decide é o backend.

export function formatarTelefone(valor) {
  const d = somenteDigitos(valor).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function isTelefoneValido(valor) {
  const d = somenteDigitos(valor);
  return (d.length === 10 || d.length === 11) && !d.startsWith("0");
}

const isEmailValido = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

// Instituições para Pix externo (só exibição — não há integração real).
export const BANCOS = [
  "Banco do Brasil",
  "Bradesco",
  "C6 Bank",
  "Caixa",
  "Inter",
  "Itaú",
  "Mercado Pago",
  "Nubank",
  "PicPay",
  "Santander",
  "Outro banco",
];

export const TIPOS_CHAVE = [
  {
    id: "CPF",
    label: "CPF",
    placeholder: "000.000.000-00",
    inputMode: "numeric",
    formatar: formatarCpf,
    validar: isCpfValido,
    erro: "CPF inválido — confira os dígitos.",
  },
  {
    id: "EMAIL",
    label: "E-mail",
    placeholder: "nome@email.com",
    inputMode: "email",
    formatar: (v) => v.trimStart(),
    validar: isEmailValido,
    erro: "E-mail inválido.",
  },
  {
    id: "TELEFONE",
    label: "Celular",
    placeholder: "(11) 98888-1111",
    inputMode: "tel",
    formatar: formatarTelefone,
    validar: isTelefoneValido,
    erro: "Celular inválido — informe DDD + número.",
  },
];
