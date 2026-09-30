import { Check, Loader2, X, RotateCcw } from "lucide-react";

// Etapas de um Pix para outro banco, do ponto de vista de quem ENVIOU.
// O backend manda só o estado atual (statusSpi); a linha do tempo mostra onde
// ele está no caminho pacs.008 -> pacs.002.
const ETAPAS_ENVIO = [
  { id: "CRIADO", titulo: "Pix aceito", sub: "Valor reservado da sua conta" },
  { id: "ENVIADO", titulo: "Enviado ao banco de destino", sub: "Mensagem pacs.008 no SPI" },
  { id: "FIM", titulo: "Resposta do banco", sub: "Mensagem pacs.002" },
];

const ORDEM = { CRIADO: 0, ENVIADO: 1, RECONCILIANDO: 1, LIQUIDADO: 2, REJEITADO: 2, DEVOLVIDO_PARCIAL: 2, DEVOLVIDO: 2 };

export default function LinhaDoTempoSpi({ statusSpi }) {
  const atual = ORDEM[statusSpi] ?? 0;
  const rejeitado = statusSpi === "REJEITADO";
  const reconciliando = statusSpi === "RECONCILIANDO";

  function textoFim() {
    if (rejeitado) return { titulo: "Recusado pelo banco de destino", sub: "O valor voltou para sua conta" };
    if (statusSpi === "DEVOLVIDO" || statusSpi === "DEVOLVIDO_PARCIAL")
      return { titulo: "Concluído e depois devolvido", sub: "O recebedor devolveu o valor (pacs.004)" };
    if (atual === 2) return { titulo: "Concluído", sub: "Dinheiro na conta do recebedor" };
    if (reconciliando) return { titulo: "Confirmando com o banco", sub: "Sem resposta a tempo; consultando o SPI" };
    return ETAPAS_ENVIO[2];
  }

  return (
    <ol className="space-y-0">
      {ETAPAS_ENVIO.map((etapa, i) => {
        const e = i === 2 ? textoFim() : etapa;
        const feito = i < atual || (i === 2 && atual === 2);
        const emCurso = i === atual && atual < 2;
        const erro = i === 2 && rejeitado;
        const devolvido = i === 2 && (statusSpi === "DEVOLVIDO" || statusSpi === "DEVOLVIDO_PARCIAL");
        return (
          <li key={etapa.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`h-6 w-6 rounded-full flex items-center justify-center border text-[11px] ${
                  erro
                    ? "bg-red-500/15 border-red-500/40 text-red-400"
                    : devolvido
                      ? "bg-sky-500/15 border-sky-500/40 text-sky-300"
                      : feito
                        ? "bg-mint-400/15 border-mint-400/40 text-mint-400"
                        : emCurso
                          ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                          : "border-base-600 text-ink-700"
                }`}
              >
                {erro ? (
                  <X size={13} />
                ) : devolvido ? (
                  <RotateCcw size={12} />
                ) : feito ? (
                  <Check size={13} />
                ) : emCurso ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  i + 1
                )}
              </span>
              {i < ETAPAS_ENVIO.length - 1 && (
                <span className={`w-px flex-1 min-h-4 ${i < atual ? "bg-mint-400/40" : "bg-base-700"}`} />
              )}
            </div>
            <div className="pb-4">
              <p className={`text-sm ${feito || emCurso || erro ? "text-ink-100" : "text-ink-500"}`}>{e.titulo}</p>
              <p className="text-xs text-ink-500">{e.sub}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
