import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  PackageCheck,
  Search,
  ShoppingBag
} from "lucide-react";

import AdminHeader from "../components/AdminHeader";
import { apiRequest } from "../services/api";

import type {
  Pedido
} from "../types";

type StatusPedido =
  | "RECEBIDO"
  | "EM_PREPARO"
  | "PRONTO"
  | "CONCLUIDO"
  | "CANCELADO";

const statusDisponiveis: {
  valor: StatusPedido;
  nome: string;
}[] = [
  {
    valor: "RECEBIDO",
    nome: "Recebido"
  },
  {
    valor: "EM_PREPARO",
    nome: "Em preparo"
  },
  {
    valor: "PRONTO",
    nome: "Pronto"
  },
  {
    valor: "CONCLUIDO",
    nome: "Concluído"
  },
  {
    valor: "CANCELADO",
    nome: "Cancelado"
  }
];

export default function PedidosPage() {
  const [pedidos, setPedidos] =
    useState<Pedido[]>([]);

  const [dataFiltro, setDataFiltro] =
    useState("");

  const [busca, setBusca] =
    useState("");

  const [carregando, setCarregando] =
    useState(true);

  const [
    atualizandoId,
    setAtualizandoId
  ] = useState<number | null>(null);

  const [
    statusSelecionado,
    setStatusSelecionado
  ] = useState<
    Record<number, StatusPedido>
  >({});

  const [erro, setErro] =
    useState("");

  const [sucesso, setSucesso] =
    useState("");

  async function carregarPedidos(
    data?: string
  ) {
    try {
      setCarregando(true);
      setErro("");

      const endpoint = data
        ? `/pedidos?data=${data}`
        : "/pedidos";

      const resultado =
        await apiRequest(endpoint);

      const pedidosRecebidos =
        resultado as Pedido[];

      setPedidos(
        pedidosRecebidos
      );

      const novosStatus:
        Record<number, StatusPedido> =
        {};

      pedidosRecebidos.forEach(
        (pedido) => {
          novosStatus[pedido.id] =
            pedido.status as StatusPedido;
        }
      );

      setStatusSelecionado(
        novosStatus
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao carregar pedidos."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarPedidos();
  }, []);

  function filtrarPorData() {
    setSucesso("");

    void carregarPedidos(
      dataFiltro || undefined
    );
  }

  function limparFiltros() {
    setDataFiltro("");
    setBusca("");
    setSucesso("");

    void carregarPedidos();
  }

  async function atualizarStatus(
    pedidoId: number
  ) {
    const novoStatus =
      statusSelecionado[pedidoId];

    if (!novoStatus) {
      setErro(
        "Selecione um status válido."
      );

      return;
    }

    try {
      setAtualizandoId(
        pedidoId
      );

      setErro("");
      setSucesso("");

      await apiRequest(
        `/pedidos/${pedidoId}/status`,
        {
          method: "PATCH",

          body:
            JSON.stringify({
              status: novoStatus
            })
        }
      );

      setPedidos(
        (pedidosAtuais) =>
          pedidosAtuais.map(
            (pedido) =>
              pedido.id === pedidoId
                ? {
                    ...pedido,
                    status:
                      novoStatus
                  }
                : pedido
          )
      );

      setSucesso(
        `Status do pedido #${pedidoId} atualizado para "${formatarStatus(
          novoStatus
        )}".`
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar status do pedido."
      );
    } finally {
      setAtualizandoId(
        null
      );
    }
  }

  function formatarData(
    data: string
  ) {
    return new Date(
      `${data.substring(
        0,
        10
      )}T00:00:00`
    ).toLocaleDateString(
      "pt-BR"
    );
  }

  function formatarStatus(
    status: string
  ) {
    const statusMap:
      Record<string, string> = {
        RECEBIDO: "Recebido",
        EM_PREPARO: "Em preparo",
        PRONTO: "Pronto",
        CONCLUIDO: "Concluído",
        CANCELADO: "Cancelado"
      };

    return (
      statusMap[status] ||
      status
    );
  }

  function classeStatus(
    status: string
  ) {
    const classes:
      Record<string, string> = {
        RECEBIDO:
          "status status-received",

        EM_PREPARO:
          "status status-preparing",

        PRONTO:
          "status status-ready",

        CONCLUIDO:
          "status status-completed",

        CANCELADO:
          "status status-cancelled"
      };

    return (
      classes[status] ||
      "status"
    );
  }

  function formatarMoeda(
    valor: number
  ) {
    return valor.toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL"
      }
    );
  }

  /*
   * FILTRO POR CLIENTE / LOCAL / TELEFONE
   */
  const pedidosFiltrados =
    useMemo(() => {
      const termo =
        busca
          .trim()
          .toLowerCase();

      if (!termo) {
        return pedidos;
      }

      return pedidos.filter(
        (pedido) => {
          const nome =
            pedido.cliente_nome
              ?.toLowerCase() ||
            "";

          const local =
            pedido.cliente_local
              ?.toLowerCase() ||
            "";

          const telefone =
            pedido.cliente_telefone
              ?.toLowerCase() ||
            "";

          return (
            nome.includes(termo) ||
            local.includes(termo) ||
            telefone.includes(termo)
          );
        }
      );
    }, [
      pedidos,
      busca
    ]);

  const resumo =
    useMemo(() => {
      return {
        total:
          pedidosFiltrados.length,

        recebidos:
          pedidosFiltrados.filter(
            (pedido) =>
              pedido.status ===
              "RECEBIDO"
          ).length,

        emPreparo:
          pedidosFiltrados.filter(
            (pedido) =>
              pedido.status ===
              "EM_PREPARO"
          ).length,

        prontos:
          pedidosFiltrados.filter(
            (pedido) =>
              pedido.status ===
              "PRONTO"
          ).length
      };
    }, [
      pedidosFiltrados
    ]);

  return (
    <main className="page admin-page">
      <AdminHeader />

      <div className="admin-content">
        <header className="orders-page-heading">
          <span className="orders-overline">
            Pedidos
          </span>

          <h1>
            Pedidos recebidos
          </h1>

          <p>
            Consulte as encomendas,
            encontre pedidos por cliente
            ou local e acompanhe o
            andamento de cada pedido.
          </p>
        </header>

        {erro && (
          <div className="alert alert-error">
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="alert alert-success">
            {sucesso}
          </div>
        )}

        <section className="orders-summary-grid">
          <article className="orders-summary-card">
            <div className="orders-summary-icon">
              <ShoppingBag size={20} />
            </div>

            <div>
              <span>
                Pedidos
              </span>

              <strong>
                {resumo.total}
              </strong>

              <small>
                na consulta atual
              </small>
            </div>
          </article>

          <article className="orders-summary-card">
            <div className="orders-summary-icon">
              <Clock3 size={20} />
            </div>

            <div>
              <span>
                Recebidos
              </span>

              <strong>
                {resumo.recebidos}
              </strong>

              <small>
                aguardando produção
              </small>
            </div>
          </article>

          <article className="orders-summary-card">
            <div className="orders-summary-icon">
              <PackageCheck size={20} />
            </div>

            <div>
              <span>
                Em preparo
              </span>

              <strong>
                {resumo.emPreparo}
              </strong>

              <small>
                em andamento
              </small>
            </div>
          </article>

          <article className="orders-summary-card">
            <div className="orders-summary-icon">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <span>
                Prontos
              </span>

              <strong>
                {resumo.prontos}
              </strong>

              <small>
                aguardando finalização
              </small>
            </div>
          </article>
        </section>

        <section className="orders-filter-panel">
          <div className="orders-filter-intro">
            <div className="orders-filter-icon">
              <Search size={20} />
            </div>

            <div>
              <strong>
                Consultar pedidos
              </strong>

              <span>
                Pesquise por cliente,
                local ou data.
              </span>
            </div>
          </div>

          <div className="orders-filter-actions">
            <div className="field orders-search-field">
              <label htmlFor="buscaPedido">
                Cliente ou local
              </label>

              <input
                id="buscaPedido"
                type="text"
                value={busca}
                onChange={(event) =>
                  setBusca(
                    event.target.value
                  )
                }
                placeholder="Ex.: Ana, Vitória..."
              />
            </div>

            <div className="field">
              <label htmlFor="dataFiltro">
                Data da encomenda
              </label>

              <input
                id="dataFiltro"
                type="date"
                value={
                  dataFiltro
                }
                onChange={(event) =>
                  setDataFiltro(
                    event.target
                      .value
                  )
                }
              />
            </div>

            <button
              type="button"
              className="button-primary"
              onClick={
                filtrarPorData
              }
              disabled={
                carregando
              }
            >
              <CalendarDays
                size={17}
              />

              Filtrar data
            </button>

            <button
              type="button"
              className="button-secondary"
              onClick={
                limparFiltros
              }
              disabled={
                carregando
              }
            >
              Limpar
            </button>
          </div>
        </section>

        <section className="orders-content-panel">
          <div className="orders-list-heading">
            <div>
              <span>
                Encomendas
              </span>

              <h2>
                Pedidos encontrados
              </h2>

              <p>
                {pedidosFiltrados.length}{" "}
                pedido(s) nesta consulta.
              </p>
            </div>
          </div>

          {carregando ? (
            <section className="premium-loading">
              <div className="loading-orb" />

              <strong>
                Carregando pedidos
              </strong>

              <span>
                Aguarde um momento.
              </span>
            </section>
          ) : pedidosFiltrados.length ===
            0 ? (
            <div className="orders-empty">
              <ShoppingBag size={26} />

              <strong>
                Nenhum pedido encontrado
              </strong>

              <span>
                Não existem pedidos
                para os critérios
                informados.
              </span>
            </div>
          ) : (
            <div className="orders-modern-list">
              {pedidosFiltrados.map(
                (pedido) => (
                  <article
                    key={
                      pedido.id
                    }
                    className="order-modern-card"
                  >
                    <div className="order-modern-top">
                      <div className="order-modern-identification">
                        <div className="order-modern-number">
                          #{pedido.id}
                        </div>

                        <div>
                          <h3>
                            {
                              pedido.cliente_nome
                            }
                          </h3>

                          <span>
                            {
                              pedido.cliente_telefone
                            }
                          </span>

                          {pedido.cliente_local && (
                            <span>
                              {
                                pedido.cliente_local
                              }
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="order-modern-meta">
                        <div>
                          <span>
                            Data da encomenda
                          </span>

                          <strong>
                            {formatarData(
                              pedido.data_encomenda
                            )}
                          </strong>
                        </div>

                        <span
                          className={
                            classeStatus(
                              pedido.status
                            )
                          }
                        >
                          {formatarStatus(
                            pedido.status
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="order-modern-items">
                      {pedido.itens.map(
                        (item) => (
                          <div
                            key={
                              item.id
                            }
                            className="order-modern-item"
                          >
                            <div>
                              <strong>
                                {
                                  item.produto
                                }
                              </strong>

                              <span>
                                {
                                  item.sabor
                                }
                              </span>
                            </div>

                            <div className="order-modern-item-qty">
                              <span>
                                Quantidade
                              </span>

                              <strong>
                                {
                                  item.quantidade
                                }
                              </strong>
                            </div>

                            <div className="order-modern-item-price">
                              <span>
                                Subtotal
                              </span>

                              <strong>
                                {formatarMoeda(
                                  Number(
                                    item.precoUnitario
                                  ) *
                                    item.quantidade
                                )}
                              </strong>
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    <div className="order-modern-bottom">
                      <div className="order-status-control">
                        <div>
                          <span>
                            Andamento
                          </span>

                          <strong>
                            Atualizar status
                          </strong>
                        </div>

                        <select
                          value={
                            statusSelecionado[
                              pedido.id
                            ] ||
                            pedido.status
                          }
                          onChange={(event) =>
                            setStatusSelecionado(
                              (
                                statusAtuais
                              ) => ({
                                ...statusAtuais,

                                [pedido.id]:
                                  event
                                    .target
                                    .value as StatusPedido
                              })
                            )
                          }
                          disabled={
                            atualizandoId ===
                            pedido.id
                          }
                        >
                          {statusDisponiveis.map(
                            (status) => (
                              <option
                                key={
                                  status.valor
                                }
                                value={
                                  status.valor
                                }
                              >
                                {
                                  status.nome
                                }
                              </option>
                            )
                          )}
                        </select>

                        <button
                          type="button"
                          className="button-primary"
                          onClick={() =>
                            atualizarStatus(
                              pedido.id
                            )
                          }
                          disabled={
                            atualizandoId ===
                              pedido.id ||
                            statusSelecionado[
                              pedido.id
                            ] ===
                              pedido.status
                          }
                        >
                          {atualizandoId ===
                          pedido.id
                            ? "Atualizando..."
                            : "Salvar status"}
                        </button>
                      </div>

                      <div className="order-modern-total">
                        <span>
                          Total do pedido
                        </span>

                        <strong>
                          {formatarMoeda(
                            Number(
                              pedido.total
                            )
                          )}
                        </strong>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}