import {
  useEffect,
  useState
} from "react";

import {
  ArrowRight,
  ClipboardList,
  Package,
  Sandwich,
  WalletCards
} from "lucide-react";

import {
  Link
} from "react-router-dom";

import AdminHeader from "../components/AdminHeader";
import { apiRequest } from "../services/api";

import type {
  Dashboard
} from "../types";

export default function DashboardPage() {
  const [dashboard, setDashboard] =
    useState<Dashboard | null>(null);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState("");

  async function carregarDashboard() {
    try {
      setCarregando(true);
      setErro("");

      const resultado =
        await apiRequest(
          "/dashboard"
        );

      setDashboard(resultado);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao carregar o dashboard."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarDashboard();
  }, []);

  function formatarMoeda(
    valor: number
  ) {
    return Number(
      valor
    ).toLocaleString(
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
    ).toLocaleDateString(
      "pt-BR"
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

    return (
      classes[status] ||
      "status"
    );
  }

  return (
    <main className="page admin-page">
      <AdminHeader />

      <div className="admin-content">
        <header className="dashboard-heading">
          <div>
            <span className="dashboard-overline">
              Visão geral
            </span>

            <h1>
              Área administrativa
            </h1>

            <p>
              Acompanhe os pedidos,
              produtos e principais
              números do negócio.
            </p>
          </div>
        </header>

        {erro && (
          <div className="alert alert-error">
            {erro}
          </div>
        )}

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
        ) : dashboard ? (
          <>
            <section className="dashboard-summary-grid">
              <article className="dashboard-summary-card">
                <div className="dashboard-summary-icon">
                  <ClipboardList
                    size={20}
                  />
                </div>

                <div>
                  <span>
                    Pedidos registrados
                  </span>

                  <strong>
                    {
                      dashboard.resumo
                        .totalPedidos
                    }
                  </strong>

                  <small>
                    Pedidos não cancelados
                  </small>
                </div>
              </article>

              <article className="dashboard-summary-card">
                <div className="dashboard-summary-icon">
                  <Sandwich
                    size={20}
                  />
                </div>

                <div>
                  <span>
                    Sanduíches
                  </span>

                  <strong>
                    {
                      dashboard.resumo
                        .totalSanduiches
                    }
                  </strong>

                  <small>
                    Unidades registradas
                  </small>
                </div>
              </article>

              <article className="dashboard-summary-card">
                <div className="dashboard-summary-icon">
                  <WalletCards
                    size={20}
                  />
                </div>

                <div>
                  <span>
                    Faturamento
                  </span>

                  <strong className="dashboard-money">
                    {formatarMoeda(
                      dashboard.resumo
                        .faturamentoTotal
                    )}
                  </strong>

                  <small>
                    Pedidos não cancelados
                  </small>
                </div>
              </article>

              <article className="dashboard-summary-card">
                <div className="dashboard-summary-icon">
                  <Package
                    size={20}
                  />
                </div>

                <div>
                  <span>
                    Produtos disponíveis
                  </span>

                  <strong>
                    {
                      dashboard.resumo
                        .produtosAtivos
                    }
                  </strong>

                  <small>
                    Itens ativos no cardápio
                  </small>
                </div>
              </article>
            </section>

            <div className="dashboard-main-grid">
              <section className="dashboard-orders-panel">
                <div className="dashboard-panel-heading">
                  <div>
                    <span>
                      Pedidos
                    </span>

                    <h2>
                      Próximas encomendas
                    </h2>

                    <p>
                      Pedidos que ainda precisam
                      ser atendidos.
                    </p>
                  </div>

                  <Link
                    to="/admin/pedidos"
                    className="dashboard-text-link"
                  >
                    Ver pedidos

                    <ArrowRight
                      size={15}
                    />
                  </Link>
                </div>

                {dashboard.proximosPedidos
                  .length === 0 ? (
                  <div className="customer-empty">
                    Nenhum pedido pendente
                    no momento.
                  </div>
                ) : (
                  <div className="dashboard-pending-list">
                    {dashboard.proximosPedidos.map(
                      (pedido) => (
                        <article
                          key={pedido.id}
                          className="dashboard-pending-item"
                        >
                          <div className="dashboard-pending-id">
                            #{pedido.id}
                          </div>

                          <div className="dashboard-pending-customer">
                            <strong>
                              {
                                pedido.cliente_nome
                              }
                            </strong>

                            <span>
                              {pedido.cliente_local ||
                                "Local não informado"}
                            </span>
                          </div>

                          <div className="dashboard-pending-data">
                            <span>
                              Encomenda
                            </span>

                            <strong>
                              {formatarData(
                                pedido.data_encomenda
                              )}
                            </strong>
                          </div>

                          <div className="dashboard-pending-data">
                            <span>
                              Quantidade
                            </span>

                            <strong>
                              {
                                pedido.quantidade_itens
                              }{" "}
                              un.
                            </strong>
                          </div>

                          <div className="dashboard-pending-data">
                            <span>
                              Total
                            </span>

                            <strong>
                              {formatarMoeda(
                                Number(
                                  pedido.total
                                )
                              )}
                            </strong>
                          </div>

                          <span
                            className={classeStatus(
                              pedido.status
                            )}
                          >
                            {formatarStatus(
                              pedido.status
                            )}
                          </span>
                        </article>
                      )
                    )}
                  </div>
                )}
              </section>

              <aside className="dashboard-shortcuts">
                <div className="dashboard-panel-heading">
                  <div>
                    <span>
                      Acesso rápido
                    </span>

                    <h2>
                      Atalhos
                    </h2>
                  </div>
                </div>

                <Link
                  to="/admin/pedidos"
                  className="dashboard-shortcut"
                >
                  <div>
                    <strong>
                      Pedidos
                    </strong>

                    <span>
                      Consultar e atualizar
                      encomendas.
                    </span>
                  </div>

                  <ArrowRight
                    size={16}
                  />
                </Link>

                <Link
                  to="/admin/producao"
                  className="dashboard-shortcut"
                >
                  <div>
                    <strong>
                      Produção
                    </strong>

                    <span>
                      Ver quantidades
                      necessárias por sabor.
                    </span>
                  </div>

                  <ArrowRight
                    size={16}
                  />
                </Link>

                <Link
                  to="/admin/vendas"
                  className="dashboard-shortcut"
                >
                  <div>
                    <strong>
                      Vendas
                    </strong>

                    <span>
                      Consultar faturamento
                      e histórico.
                    </span>
                  </div>

                  <ArrowRight
                    size={16}
                  />
                </Link>

                <Link
                  to="/admin/produtos"
                  className="dashboard-shortcut"
                >
                  <div>
                    <strong>
                      Produtos
                    </strong>

                    <span>
                      Atualizar o cardápio
                      disponível.
                    </span>
                  </div>

                  <ArrowRight
                    size={16}
                  />
                </Link>
              </aside>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}