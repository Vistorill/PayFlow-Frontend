// Vocabulário do Pix entre instituições (SPI / ISO 20022) para a tela.
// O backend manda os códigos; aqui só traduzimos para o usuário.

export const currency = (v) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const dataHora = (iso) =>
  new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

// statusSpi -> rótulo e cor. "final" = o Pix não muda mais de estado por si.
export const STATUS_SPI = {
  CRIADO: { label: "Aguardando envio", cls: "text-amber-300 bg-amber-500/10 border-amber-500/30" },
  ENVIADO: { label: "Enviado ao banco de destino", cls: "text-amber-300 bg-amber-500/10 border-amber-500/30" },
  RECONCILIANDO: { label: "Confirmando com o banco", cls: "text-amber-300 bg-amber-500/10 border-amber-500/30" },
  LIQUIDADO: { label: "Liquidado", cls: "text-mint-400 bg-mint-400/10 border-mint-400/20", final: true },
  RECEBIDO: { label: "Recebido", cls: "text-mint-400 bg-mint-400/10 border-mint-400/20", final: true },
  REJEITADO: { label: "Recusado e estornado", cls: "text-red-400 bg-red-500/10 border-red-500/20", final: true },
  DEVOLVIDO_PARCIAL: { label: "Devolvido em parte", cls: "text-sky-300 bg-sky-500/10 border-sky-500/30", final: true },
  DEVOLVIDO: { label: "Devolvido", cls: "text-sky-300 bg-sky-500/10 border-sky-500/30", final: true },
};

export const STATUS_DEVOLUCAO = {
  SOLICITADA: { label: "Solicitada", cls: "text-amber-300 bg-amber-500/10 border-amber-500/30" },
  ENVIADA: { label: "Enviada", cls: "text-amber-300 bg-amber-500/10 border-amber-500/30" },
  LIQUIDADA: { label: "Concluída", cls: "text-mint-400 bg-mint-400/10 border-mint-400/20" },
  REJEITADA: { label: "Recusada", cls: "text-red-400 bg-red-500/10 border-red-500/20" },
};

// Códigos de motivo do pacs.002 RJCT (simplificados; tabela oficial no manual do SPI).
const MOTIVOS_REJEICAO = {
  AB03: "O banco de destino não respondeu a tempo",
  AB09: "Erro no banco de destino",
  AC03: "Conta do recebedor inválida",
  AC06: "Conta do recebedor bloqueada",
  AC07: "Conta do recebedor encerrada",
  AG03: "Operação não suportada pelo banco de destino",
  AM02: "Valor não permitido",
  BE01: "Dados do recebedor não conferem",
};

export function descricaoMotivo(codigo) {
  if (!codigo) return null;
  return MOTIVOS_REJEICAO[codigo] ? `${MOTIVOS_REJEICAO[codigo]} (${codigo})` : `Código ${codigo}`;
}

// Motivos de devolução (pacs.004).
export const MOTIVOS_DEVOLUCAO = [
  { id: "MD06", label: "Pedido do pagador" },
  { id: "SL02", label: "Pedido do recebedor (ex.: venda cancelada)" },
  { id: "BE08", label: "Erro nos dados do pagamento" },
  { id: "FR01", label: "Suspeita de fraude" },
];

export const rotuloMotivoDevolucao = (id) =>
  MOTIVOS_DEVOLUCAO.find((m) => m.id === id)?.label ?? id;

// Pix que ainda pode ser devolvido (mesma regra do backend; o backend decide).
export const aceitaDevolucao = (statusSpi) =>
  statusSpi === "RECEBIDO" || statusSpi === "DEVOLVIDO_PARCIAL";

// Eventos que um webhook pode assinar.
export const EVENTOS_WEBHOOK = [
  { id: "pix.payment.sent", label: "Pix enviado ao banco de destino" },
  { id: "pix.payment.settled", label: "Pix concluído" },
  { id: "pix.payment.rejected", label: "Pix recusado" },
  { id: "pix.payment.timeout", label: "Pix em confirmação (sem resposta)" },
  { id: "pix.payment.received", label: "Pix recebido" },
  { id: "pix.return.requested", label: "Devolução solicitada" },
  { id: "pix.return.sent", label: "Devolução enviada" },
  { id: "pix.return.settled", label: "Devolução concluída" },
  { id: "pix.return.rejected", label: "Devolução recusada" },
  { id: "pix.return.received", label: "Devolução recebida" },
];
