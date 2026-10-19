export interface Sabor {
  id: number;
  nome: string;
  descricao: string | null;
  ativo: boolean;
}

export interface Produto {
  id: number;
  nome: string;
  descricao: string | null;
  preco: string;
  disponivel: boolean;
  sabor_id: number;
  sabor: string;
}

export interface ProdutoForm {
  nome: string;
  descricao: string;
  preco: string;
  saborId: string;
  disponivel: boolean;
}

export interface ItemPedidoForm {
  produtoId: number;
  quantidade: number;
}

export interface PedidoForm {
  nome: string;
  telefone: string;
  local: string;
  dataEncomenda: string;
}

export interface ItemPedido {
  id: number;
  produtoId: number;
  produto: string;
  sabor: string;
  quantidade: number;
  precoUnitario: string | number;
}

export interface Pedido {
  id: number;

  data_pedido: string;
  data_encomenda: string;

  status: string;
  total: string;

  cliente_id: number;
  cliente_nome: string;
  cliente_telefone: string;
  cliente_local: string | null;

  itens: ItemPedido[];
}

export interface ProducaoSabor {
  sabor_id: number;
  sabor: string;
  quantidade: number;
}

export interface Producao {
  data: string;
  totalGeral: number;
  sabores: ProducaoSabor[];
}

export interface DashboardResumo {
  totalPedidos: number;
  produtosAtivos: number;
  faturamentoTotal: number;
  totalSanduiches: number;
}

export interface DashboardPedido {
  id: number;
  data_encomenda: string;
  status: string;
  total: string | number;
  cliente_nome: string;
  cliente_local: string | null;
  quantidade_itens: number;
}

export interface Dashboard {
  resumo: DashboardResumo;
  proximosPedidos: DashboardPedido[];
}

export interface VendasResumo {
  totalPedidos: number;
  faturamentoTotal: number;
  totalSanduiches: number;
  ticketMedio: number;
}

export interface VendaPorSabor {
  saborId: number;
  sabor: string;
  quantidade: number;
  valor: number;
}

export interface HistoricoVenda {
  id: number;
  dataPedido: string;
  dataEncomenda: string;
  status: string;
  total: number;
  clienteNome: string;
  clienteLocal: string | null;
  quantidadeItens: number;
}

export interface Vendas {
  resumo: VendasResumo;
  vendasPorSabor: VendaPorSabor[];
  historico: HistoricoVenda[];
}