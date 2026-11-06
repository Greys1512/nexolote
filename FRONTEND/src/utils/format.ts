export function formatearFecha(fecha: string | null | undefined): string {
  if (!fecha) return 'No definida';
  return new Date(fecha).toLocaleDateString('es-CO', { timeZone: 'UTC' });
}

export function formatearMoneda(valor: number | string | null | undefined): string {
  if (valor === null || valor === undefined) return 'No definido';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(valor));
}
