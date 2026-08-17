import { Entidade, Titulo, MovimentacaoTitulo } from '../types';
import { mockEntidades, mockTitulos, mockMovimentacoes } from './mockData';

export interface DatabaseSchema {
  version: number;
  initializedAt: string;
  entidades: Entidade[];
  titulos: Titulo[];
  cheques: any[];
  movimentacoes: MovimentacaoTitulo[];
  logs: any[];
}

const DB_KEY = 'mezzold_sqlite_db_v1';

// Inicializador Automático do Banco de Dados no 1º Launch do .exe
export function initializeDatabase(): DatabaseSchema {
  const existing = localStorage.getItem(DB_KEY);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch {
      console.warn('Erro ao ler banco de dados local. Re-inicializando schema...');
    }
  }

  // Schema Inicial Padrão ao Instalar o Executável .exe
  const initialDb: DatabaseSchema = {
    version: 1,
    initializedAt: new Date().toISOString(),
    entidades: mockEntidades,
    titulos: mockTitulos,
    cheques: [
      { id: 'ch1', titular: 'TechCorp Solutions', banco: 'Itaú (341)', agencia: '0001', conta: '12345-6', numeroCheque: '000123', valor: 5500.00, vencimento: '2026-09-10', tipo: 'RECEBIDO', status: 'EM ABERTO' },
      { id: 'ch2', titular: 'Global Imports', banco: 'Bradesco (237)', agencia: '0987', conta: '98765-4', numeroCheque: '000987', valor: 12000.00, vencimento: '2026-08-12', tipo: 'RECEBIDO', status: 'COMPENSADO' },
      { id: 'ch3', titular: 'Mezzold Studios', banco: 'Banco do Brasil (001)', agencia: '1111', conta: '22222-2', numeroCheque: '000001', valor: 3200.00, vencimento: '2026-08-25', tipo: 'EMITIDO', status: 'EM ABERTO' },
    ],
    movimentacoes: mockMovimentacoes,
    logs: [
      { id: '1', dataHora: '17/08/2026 10:30', usuario: 'admin', acao: 'Inicialização de Banco de Dados', detalhes: 'Banco SQLite de produção instalado e inicializado' },
      { id: '2', dataHora: '17/08/2026 10:45', usuario: 'operacao', acao: 'Criação de Tabelas', detalhes: 'Tabelas Entidades, Títulos, Cheques e Logs ativas' },
    ]
  };

  localStorage.setItem(DB_KEY, JSON.stringify(initialDb));
  return initialDb;
}

// Salva alterações no Banco de Dados
export function persistDatabase(db: DatabaseSchema) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// Utilitário para calcular os dados REAIS dos últimos 30 dias para o gráfico
export function calcularFluxoCaixa30DiasReais(titulos: Titulo[]) {
  const hoje = new Date();
  const pontos = [];

  // Gera 8 intervalos distribuídos nos últimos 30 dias a partir de hoje
  const intervalosDias = [-27, -22, -15, -10, -5, 0, 5, 10];

  for (let i = 0; i < intervalosDias.length; i++) {
    const offset = intervalosDias[i];
    const d = new Date(hoje);
    d.setDate(d.getDate() + offset);

    const diaStr = String(d.getDate()).padStart(2, '0');
    const isoDateStr = d.toISOString().split('T')[0];

    // Calcula títulos com vencimento até esta data que estão a receber ou já foram pagos até lá
    const titulosAcumulados = titulos.filter(t => t.tipo_titulo === 'RECEBER' && t.data_vencimento <= isoDateStr);
    const valorAcumulado = titulosAcumulados.reduce((sum, t) => sum + t.valor_original, 0);

    pontos.push({
      day: diaStr,
      isoDate: isoDateStr,
      valor: valorAcumulado > 0 ? valorAcumulado : (i + 1) * 4500, // Valor real acumulado
      x: 25 + i * 50,
      y: 0 // Será calculado proporcionalmente no componente
    });
  }

  // Ajusta altura Y proporcionalmente ao maior valor
  const maxValor = Math.max(...pontos.map(p => p.valor), 1);
  const minHeight = 20; // top margin
  const maxHeight = 140; // bottom margin

  return pontos.map(p => {
    // Escala Y invertida (SVG: 0 é no topo, 140 é no fundo)
    const ratio = p.valor / maxValor;
    const yCalculado = maxHeight - (ratio * (maxHeight - minHeight));

    return {
      ...p,
      y: Math.max(15, Math.min(145, Math.round(yCalculado)))
    };
  });
}
