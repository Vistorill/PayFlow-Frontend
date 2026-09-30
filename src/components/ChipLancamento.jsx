// Etiqueta curta na linha do extrato quando o lançamento não é um Pix comum já
// concluído: aguardando o banco de destino, recusado, estorno ou devolução.
export default function ChipLancamento({ lancamento: l }) {
  let chip = null;
  if (l.tipoTransacao === "ESTORNO") chip = { label: "Estorno", cls: "text-sky-300 border-sky-500/30 bg-sky-500/10" };
  else if (l.tipoTransacao === "DEVOLUCAO") chip = { label: "Devolução", cls: "text-sky-300 border-sky-500/30 bg-sky-500/10" };
  else if (l.statusSpi === "REJEITADO") chip = { label: "Recusado", cls: "text-red-400 border-red-500/20 bg-red-500/10" };
  else if (l.statusTransacao === "PENDENTE")
    chip = { label: "Em processamento", cls: "text-amber-300 border-amber-500/30 bg-amber-500/10" };
  else if (l.statusSpi === "DEVOLVIDO" || l.statusSpi === "DEVOLVIDO_PARCIAL")
    chip = { label: l.statusSpi === "DEVOLVIDO" ? "Devolvido" : "Devolvido em parte", cls: "text-sky-300 border-sky-500/30 bg-sky-500/10" };

  if (!chip) return null;
  return <span className={`ml-2 align-middle text-[10px] px-1.5 py-0.5 rounded-full border whitespace-nowrap ${chip.cls}`}>{chip.label}</span>;
}
