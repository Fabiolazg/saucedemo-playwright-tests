
export function converterParaCentavos(texto: string): number {
  const valor = texto.match(/\$([\d,]+)\.(\d{2})/);

  if (!valor) {
    throw new Error(`Valor monetário inválido: ${texto}`);
  }

  const parteInteira = Number(valor[1].replace(/,/g, ''));
  const centavos = Number(valor[2]);

  return parteInteira * 100 + centavos;
}