import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  BarChart3,
  CalendarRange,
  CircleDollarSign,
  PackageCheck,
  ReceiptText,
  ShoppingBag
} from "lucide-react";

import AdminHeader from "../components/AdminHeader";
import { apiRequest } from "../services/api";

import type {
  Vendas
} from "../types";

export default function VendasPage() {
  const [dataInicial, setDataInicial] =
    useState("");

  const [dataFinal, setDataFinal] =
    useState("");

  const [vendas, setVendas] =
    useState<Vendas | null>(null);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState("");

  async function buscarVendas(
    inicio: string,
    fim: string
  ) {
    try {
      setCarregando(true);
      setErro("");

      const parametros =
        new URLSearchParams();

      if (inicio) {
        parametros.set(
          "dataInicial",
          inicio
        );
      }

      if (fim) {
        parametros.set(
          "dataFinal",
          fim
        );
      }

      const query =
        parametros.toString();

      const resultado =
        await apiRequest(
          query
            ? `/vendas?${query}`
            : "/vendas"
        );

      setVendas(resultado);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao carregar vendas."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void buscarVendas("", "");
  }, []);

  function consultar() {
    if (
      dataInicial &&
      dataFinal &&
      dataInicial > dataFinal
    ) {
      setErro(
        "A data inicial não pode ser maior que a data final."
      );

      return;
    }

    void buscarVendas(
      dataInicial,
      dataFinal
    );
  }

  function limparFiltros() {
    setDataInicial("");
    setDataFinal("");
    setErro("");

    void buscarVendas("", "");
  }

  function formatarMoeda(
    valor: number
  ) {
    return Number(valor).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL"
      }
    );
  }

  function formatarData(
    data: string
  ) {
    const somenteData =
      data.substring(0, 10);

    return new Date(
      `${somenteData}T00:00:00`
    ).toLocaleDateString("pt-BR");
  }

  function formatarDataHora(
    data: string
  ) {
    return new Date(
      data
    ).toLocaleString(
      "pt-BR",
      {
        dateStyle: "short",
        timeStyle: "short"
      }
    );
  }

  function formatarStatus(
    status: string
  ) {
    const nomes:
      Record<string, string> = {
        RECEBIDO: "Recebido",
        EM_PREPARO: "Em preparo",
        PRONTO: "Pronto",
        CONCLUIDO: "Concluído",
        CANCELADO: "Cancelado"
      };

    return nomes[status] || status;
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

    return classes[status] || "status";
  }

  const maiorQuantidade =
    useMemo(() => {
      if (
        !vendas ||
        vendas.vendasPorSabor.length === 0
      ) {
        return 1;
      }

      return Math.max(
        ...vendas.vendasPorSabor.map(
          (item) => item.quantidade
        )
      );
    }, [vendas]);

  const saborMaisVendido =
    vendas?.vendasPorSabor?.[0];

  const periodoTexto =
    dataInicial || dataFinal
      ? "Filtro aplicado"
      : "Todos os registros";

  return (
    <main className="page admin-page">
      <AdminHeader />

      <div className="admin-content">
        <section className="sales-hero">
          <div className="sales-hero-content">
            <div className="sales-kicker">
              Vendas
            </div>

            <h1>
              Vendas e histórico
            </h1>

            <p>
              Consulte o faturamento, os
              pedidos realizados e os sabores
              mais vendidos.
            </p>
          </div>

          <div className="sales-hero-badge">
            <BarChart3 size={21} />

            <div>
              <span>
                Período
              </span>

              <strong>
                {periodoTexto}
              </strong>
            </div>
          </div>
        </section>

        {erro && (
          <div className="alert alert-error">
            {erro}
          </div>
        )}

        <section className="sales-filter-panel">
          <div className="sales-filter-title">
            <div className="sales-icon-box">
              <CalendarRange size={20} />
            </div>

            <div>
              <strong>
                Filtrar período
              </strong>

              <span>
                Consulte as vendas por
                intervalo de datas.
              </span>
            </div>
          </div>

          <div className="sales-filter-fields">
            <div className="field">
              <label htmlFor="dataInicial">
                Data inicial
              </label>

              <input
                id="dataInicial"
                type="date"
                value={dataInicial}
                onChange={(event) =>
                  setDataInicial(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="field">
              <label htmlFor="dataFinal">
                Data final
              </label>

              <input
                id="dataFinal"
                type="date"
                value={dataFinal}
                onChange={(event) =>
                  setDataFinal(
                    event.target.value
                  )
                }
              />
            </div>

            <button
              type="button"
              className="button-primary sales-filter-button"
              onClick={consultar}
              disabled={carregando}
            >
              {carregando
                ? "Consultando..."
                : "Consultar"}
            </button>

            <button
              type="button"
              className="button-secondary"
              onClick={limparFiltros}
              disabled={carregando}
            >
              Limpar
            </button>
          </div>
        </section>

        {carregando ? (
          <section className="premium-loading">
            <div className="loading-orb" />

            <strong>
              Carregando informações
            </strong>

            <span>
              Aguarde um momento.
            </span>
          </section>
        ) : vendas ? (
          <>
            <section className="premium-kpi-grid">
              <article className="premium-kpi premium-kpi-featured">
                <div className="premium-kpi-icon">
                  <CircleDollarSign
                    size={22}
                  />
                </div>

                <span>
                  Faturamento
                </span>

                <strong>
                  {formatarMoeda(
                    vendas.resumo
                      .faturamentoTotal
                  )}
                </strong>

                <small>
                  Pedidos não cancelados
                </small>
              </article>

              <article className="premium-kpi">
                <div className="premium-kpi-icon">
                  <ShoppingBag size={22} />
                </div>

                <span>
                  Pedidos
                </span>

                <strong>
                  {
                    vendas.resumo
                      .totalPedidos
                  }
                </strong>

                <small>
                  Vendas válidas
                </small>
              </article>

              <article className="premium-kpi">
                <div className="premium-kpi-icon">
                  <PackageCheck size={22} />
                </div>

                <span>
                  Sanduíches
                </span>

                <strong>
                  {
                    vendas.resumo
                      .totalSanduiches
                  }
                </strong>

                <small>
                  Unidades vendidas
                </small>
              </article>

              <article className="premium-kpi">
                <div className="premium-kpi-icon">
                  <ReceiptText size={22} />
                </div>

                <span>
                  Ticket médio
                </span>

                <strong>
                  {formatarMoeda(
                    vendas.resumo
                      .ticketMedio
                  )}
                </strong>

                <small>
                  Média por pedido
                </small>
              </article>
            </section>

            <section className="sales-insights-grid">
              <article className="premium-panel flavor-panel">
                <div className="premium-panel-header">
                  <div>
                    <span className="premium-eyebrow">
                      Vendas
                    </span>

                    <h2>
                      Vendas por sabor
                    </h2>

                    <p>
                      Quantidade e valor
                      vendido por sabor.
                    </p>
                  </div>

                  <div className="premium-panel-icon">
                    <BarChart3 size={21} />
                  </div>
                </div>

                {vendas.vendasPorSabor
                  .length === 0 ? (
                  <div className="empty-state">
                    Nenhuma venda encontrada
                    para o período.
                  </div>
                ) : (
                  <div className="flavor-ranking">
                    {vendas.vendasPorSabor.map(
                      (item, index) => {
                        const percentual =
                          Math.max(
                            8,
                            (
                              item.quantidade /
                              maiorQuantidade
                            ) * 100
                          );

                        return (
                          <div
                            key={item.saborId}
                            className="flavor-ranking-item"
                          >
                            <div className="flavor-ranking-top">
                              <div className="flavor-name">
                                <span className="flavor-position">
                                  {index + 1}
                                </span>

                                <strong>
                                  {item.sabor}
                                </strong>
                              </div>

                              <div className="flavor-values">
                                <strong>
                                  {
                                    item.quantidade
                                  }
                                </strong>

                                <span>
                                  {formatarMoeda(
                                    item.valor
                                  )}
                                </span>
                              </div>
                            </div>

                            <div className="flavor-bar">
                              <div
                                className="flavor-bar-fill"
                                style={{
                                  width:
                                    `${percentual}%`
                                }}
                              />
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </article>

              <article className="premium-panel highlight-panel">
                <span className="premium-eyebrow">
                  Destaque
                </span>

                <h2>
                  Mais vendido
                </h2>

                {saborMaisVendido ? (
                  <>
                    <strong className="highlight-name">
                      {
                        saborMaisVendido.sabor
                      }
                    </strong>

                    <p>
                      Sabor com maior número de
                      unidades vendidas no
                      período selecionado.
                    </p>

                    <div className="highlight-data">
                      <div>
                        <span>
                          Unidades
                        </span>

                        <strong>
                          {
                            saborMaisVendido
                              .quantidade
                          }
                        </strong>
                      </div>

                      <div>
                        <span>
                          Valor vendido
                        </span>

                        <strong>
                          {formatarMoeda(
                            saborMaisVendido
                              .valor
                          )}
                        </strong>
                      </div>
                    </div>
                  </>
                ) : (
                  <p>
                    Ainda não existem vendas
                    neste período.
                  </p>
                )}
              </article>
            </section>

            <section className="premium-panel history-panel">
              <div className="premium-panel-header">
                <div>
                  <span className="premium-eyebrow">
                    Histórico
                  </span>

                  <h2>
                    Pedidos registrados
                  </h2>

                  <p>
                    Consulte os pedidos
                    registrados no sistema.
                  </p>
                </div>

                <div className="history-count">
                  {
                    vendas.historico.length
                  }

                  <span>
                    pedidos
                  </span>
                </div>
              </div>

              {vendas.historico.length === 0 ? (
                <div className="empty-state">
                  Nenhum pedido encontrado.
                </div>
              ) : (
                <div className="table-wrapper premium-table-wrapper">
                  <table className="premium-table">
                    <thead>
                      <tr>
                        <th>
                          Pedido
                        </th>

                        <th>
                          Cliente
                        </th>

                        <th>
                          Realizado
                        </th>

                        <th>
                          Encomenda
                        </th>

                        <th>
                          Itens
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          Total
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {vendas.historico.map(
                        (pedido) => (
                          <tr
                            key={pedido.id}
                          >
                            <td>
                              <span className="premium-order-number">
                                #{pedido.id}
                              </span>
                            </td>

                            <td>
                              <div className="premium-client">
                                <div className="premium-client-avatar">
                                  {pedido.clienteNome
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>

                                <div>
                                  <strong>
                                    {
                                      pedido.clienteNome
                                    }
                                  </strong>

                                  {pedido.clienteLocal && (
                                    <span>
                                      {
                                        pedido.clienteLocal
                                      }
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td>
                              {formatarDataHora(
                                pedido.dataPedido
                              )}
                            </td>

                            <td>
                              {formatarData(
                                pedido.dataEncomenda
                              )}
                            </td>

                            <td>
                              {
                                pedido.quantidadeItens
                              }
                            </td>

                            <td>
                              <span
                                className={classeStatus(
                                  pedido.status
                                )}
                              >
                                {formatarStatus(
                                  pedido.status
                                )}
                              </span>
                            </td>

                            <td>
                              <strong className="premium-total">
                                {formatarMoeda(
                                  pedido.total
                                )}
                              </strong>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}