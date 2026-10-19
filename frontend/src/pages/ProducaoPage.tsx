import {
  useState
} from "react";

import {
  CalendarDays,
  ChefHat,
  Sandwich
} from "lucide-react";

import AdminHeader from "../components/AdminHeader";
import { apiRequest } from "../services/api";

import type {
  Producao
} from "../types";

export default function ProducaoPage() {
  const [data, setData] =
    useState("");

  const [producao, setProducao] =
    useState<Producao | null>(null);

  const [carregando, setCarregando] =
    useState(false);

  const [erro, setErro] =
    useState("");

  async function consultarProducao() {
    setErro("");

    if (!data) {
      setErro(
        "Selecione uma data para consultar."
      );

      return;
    }

    try {
      setCarregando(true);

      const resultado =
        await apiRequest(
          `/producao?data=${data}`
        );

      setProducao(resultado);
    } catch (error) {
      setProducao(null);

      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao consultar produção."
      );
    } finally {
      setCarregando(false);
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

  return (
    <main className="page admin-page">
      <AdminHeader />

      <div className="admin-content">
        <header className="production-page-heading">
          <span className="production-overline">
            Produção
          </span>

          <h1>
            Produção por sabor
          </h1>

          <p>
            Consulte quanto precisa ser
            preparado de cada sabor para
            uma data de encomenda.
          </p>
        </header>

        {erro && (
          <div className="alert alert-error">
            {erro}
          </div>
        )}

        <section className="production-search">
          <div className="production-search-intro">
            <div className="production-search-icon">
              <CalendarDays
                size={20}
              />
            </div>

            <div>
              <strong>
                Data da produção
              </strong>

              <span>
                Escolha o dia que deseja
                organizar.
              </span>
            </div>
          </div>

          <div className="production-search-actions">
            <div className="field">
              <label htmlFor="dataProducao">
                Data da encomenda
              </label>

              <input
                id="dataProducao"
                type="date"
                value={data}
                onChange={(event) =>
                  setData(
                    event.target.value
                  )
                }
              />
            </div>

            <button
              type="button"
              className="button-primary"
              onClick={
                consultarProducao
              }
              disabled={
                carregando
              }
            >
              {carregando
                ? "Consultando..."
                : "Consultar"}
            </button>
          </div>
        </section>

        {carregando && (
          <section className="premium-loading">
            <div className="loading-orb" />

            <strong>
              Consultando produção
            </strong>

            <span>
              Aguarde um momento.
            </span>
          </section>
        )}

        {!carregando &&
          producao && (
          <>
            <section className="production-summary-grid">
              <article className="production-summary-card">
                <div className="production-summary-icon">
                  <Sandwich
                    size={20}
                  />
                </div>

                <div>
                  <span>
                    Total a produzir
                  </span>

                  <strong>
                    {
                      producao.totalGeral
                    }
                  </strong>

                  <small>
                    sanduíche(s)
                  </small>
                </div>
              </article>

              <article className="production-summary-card">
                <div className="production-summary-icon">
                  <ChefHat
                    size={20}
                  />
                </div>

                <div>
                  <span>
                    Sabores
                  </span>

                  <strong>
                    {
                      producao.sabores
                        .length
                    }
                  </strong>

                  <small>
                    sabor(es) na produção
                  </small>
                </div>
              </article>

              <article className="production-summary-card production-date-card">
                <div className="production-summary-icon">
                  <CalendarDays
                    size={20}
                  />
                </div>

                <div>
                  <span>
                    Data selecionada
                  </span>

                  <strong>
                    {formatarData(
                      producao.data
                    )}
                  </strong>

                  <small>
                    data da encomenda
                  </small>
                </div>
              </article>
            </section>

            <section className="production-sheet">
              <div className="production-sheet-heading">
                <div>
                  <span>
                    Organização do dia
                  </span>

                  <h2>
                    Quantidade por sabor
                  </h2>

                  <p>
                    Use esta relação como
                    apoio para separar a
                    produção.
                  </p>
                </div>

                <div className="production-sheet-total">
                  <span>
                    Total
                  </span>

                  <strong>
                    {
                      producao.totalGeral
                    }
                  </strong>

                  <small>
                    unidades
                  </small>
                </div>
              </div>

              {producao.sabores.length ===
              0 ? (
                <div className="production-empty">
                  <ChefHat
                    size={25}
                  />

                  <strong>
                    Nenhuma produção para
                    esta data
                  </strong>

                  <span>
                    Não há pedidos válidos
                    registrados para o dia
                    selecionado.
                  </span>
                </div>
              ) : (
                <div className="production-flavor-list">
                  {producao.sabores.map(
                    (
                      item,
                      index
                    ) => (
                      <article
                        key={
                          item.sabor_id
                        }
                        className="production-flavor-row"
                      >
                        <div className="production-flavor-number">
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </div>

                        <div className="production-flavor-name">
                          <span>
                            Sabor
                          </span>

                          <strong>
                            {
                              item.sabor
                            }
                          </strong>
                        </div>

                        <div className="production-flavor-quantity">
                          <span>
                            Preparar
                          </span>

                          <div>
                            <strong>
                              {
                                item.quantidade
                              }
                            </strong>

                            <small>
                              unidade(s)
                            </small>
                          </div>
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
            </section>

            <p className="production-footnote">
              Pedidos cancelados não são
              considerados nesta produção.
            </p>
          </>
        )}
      </div>
    </main>
  );
}