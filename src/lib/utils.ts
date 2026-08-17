import { Titulo } from '../types';

export function calcularSaldoDevedor(titulo: Titulo, dataAtual: string = '2026-08-14'): number {
  if (titulo.status === 'PAGO') return 0;

  let saldo = titulo.valor_original - titulo.valor_pago;

  // Lógica de cálculo de juros/multa para títulos vencidos há mais de 30 dias
  const vencimento = new Date(titulo.data_vencimento);
  const hoje = new Date(dataAtual);

  if (hoje > vencimento) {
    const diffTime = Math.abs(hoje.getTime() - vencimento.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 30) {
      const mesesAtraso = Math.floor(diffDays / 30);
      const multa = titulo.valor_original * 0.02; // 2% de multa sobre o valor original
      const juros = titulo.valor_original * (0.01 * mesesAtraso); // 1% de juros ao mês
      saldo += multa + juros;
    }
  }

  return saldo;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function parseInputNumber(val: string): number {
  if (!val) return NaN;
  const cleanVal = val.trim();
  if (cleanVal.includes('.') && !cleanVal.includes(',')) {
    if (/\.\d{1,2}$/.test(cleanVal)) {
      return parseFloat(cleanVal);
    }
  }
  return parseFloat(cleanVal.replace(/\./g, '').replace(',', '.'));
}

export function formatDateBR(dateString: string): string {
  const [year, month, day] = dateString.split('-');
  if (!day) return dateString; // fallback
  return `${day}/${month}/${year}`;
}

export function isTituloVencido(titulo: Titulo): boolean {
  if (titulo.status === 'PAGO') return false;
  if (titulo.status === 'VENCIDO') return true;
  const venc = new Date(titulo.data_vencimento);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return venc < hoje;
}
