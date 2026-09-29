// Só o que NÃO existe no backend fica aqui (cartão e microcrédito são protótipo de tela).
// Usuário, saldo e extrato vêm da API.

export const card = {
  holder: "MARCOS SILVA",
  number: "5412 •••• •••• 8830",
  brand: "Mastercard",
  type: "Pré-pago · Débito · Crédito",
  expiry: "08/29",
  blocked: false,
};

export const creditOffer = {
  approved: 3500,
  used: 2000,
  rate: "2,3% a.m.",
  nextInstallment: "06/10/2026",
  installmentValue: 187.4,
};
