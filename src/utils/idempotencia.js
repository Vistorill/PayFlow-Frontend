// Uma chave por tentativa de transferência, gerada no cliente.
export function novaIdempotencyKey() {
  return `pix-${crypto.randomUUID()}`;
}
