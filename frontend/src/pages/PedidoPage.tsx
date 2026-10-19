import {
  useEffect,
  useMemo,
  useState
} from "react";

import type {
  FormEvent
} from "react";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Minus,
  Plus,
  ShoppingBag
} from "lucide-react";

import PublicFooter from "../components/PublicFooter";
import PublicHeader from "../components/PublicHeader";

import {
  apiRequest
} from "../services/api";

import type {
  ItemPedidoForm,
  PedidoForm,
  Produto
} from "../types";

const dadosIniciais: PedidoForm = {
  nome: "",
  telefone: "",
  local: "",
  dataEncomenda: ""
};

interface PedidoConfirmado {
  id: number;
  nomeCliente: string;
  dataEncomenda: string;
  total: number;
  quantidade: number;
  itens: {
    nome: string;
    sabor: string;
    quantidade: number;
    subtotal: number;
  }[];
}

export default function PedidoPage() {
  const [produtos, setProdutos] =
    useState<Produto[]>([]);

  const [itens, setItens] =
    useState<ItemPedidoForm[]>([]);

  const [dadosCliente, setDadosCliente] =
    useState<PedidoForm>(
      dadosIniciais
    );

  const [carregando, setCarregando] =
    useState(true);

  const [enviando, setEnviando] =
    useState(false);

  const [erro, setErro] =
    useState("");

  const [
    pedidoConfirmado,
    setPedidoConfirmado
  ] = useState<PedidoConfirmado | null>(
    null
  );

  async function carregarProdutos() {
    try {
      setCarregando(true);
      setErro("");

      const data =
        await apiRequest(
          "/produtos"
        );

      const produtosDisponiveis =
        data.filter(
          (produto: Produto) =>
            produto.disponivel
        );

      setProdutos(
        produtosDisponiveis
      );

      setItens(
        produtosDisponiveis.map(
          (produto: Produto) => ({
            produtoId:
              produto.id,

            quantidade: 0
          })
        )
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao carregar os produtos."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarProdutos();
  }, []);

  function alterarQuantidade(
    produtoId: number,
    valor: number
  ) {
    setItens(
      (anteriores) =>
        anteriores.map(
          (item) =>
            item.produtoId ===
            produtoId
              ? {
                  ...item,
                  quantidade:
                    Math.max(
                      0,
                      valor
                    )
                }
              : item
        )
    );
  }

  function atualizarCliente(
    campo: keyof PedidoForm,
    valor: string
  ) {
    setDadosCliente(
      (anterior) => ({
        ...anterior,
        [campo]: valor
      })
    );
  }

  const itensSelecionados =
    useMemo(
      () =>
        itens.filter(
          (item) =>
            item.quantidade > 0
        ),
      [itens]
    );

  const total =
    useMemo(() => {
      return itensSelecionados.reduce(
        (soma, item) => {
          const produto =
            produtos.find(
              (produto) =>
                produto.id ===
                item.produtoId
            );

          if (!produto) {
            return soma;
          }

          return (
            soma +
            Number(
              produto.preco
            ) *
              item.quantidade
          );
        },
        0
      );
    }, [
      itensSelecionados,
      produtos
    ]);

  const totalUnidades =
    useMemo(
      () =>
        itensSelecionados.reduce(
          (soma, item) =>
            soma +
            item.quantidade,
          0
        ),
      [itensSelecionados]
    );

  const dataMinima =
    useMemo(() => {
      const amanha =
        new Date();

      amanha.setDate(
        amanha.getDate() + 1
      );

      const ano =
        amanha.getFullYear();

      const mes =
        String(
          amanha.getMonth() + 1
        ).padStart(
          2,
          "0"
        );

      const dia =
        String(
          amanha.getDate()
        ).padStart(
          2,
          "0"
        );

      return `${ano}-${mes}-${dia}`;
    }, []);

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

  async function confirmarPedido(
    event: FormEvent
  ) {
    event.preventDefault();

    setErro("");

    if (
      !dadosCliente.nome.trim()
    ) {
      setErro(
        "Informe seu nome."
      );

      return;
    }

    if (
      !dadosCliente.telefone.trim()
    ) {
      setErro(
        "Informe seu telefone."
      );

      return;
    }

    if (
      !dadosCliente.dataEncomenda
    ) {
      setErro(
        "Selecione a data da encomenda."
      );

      return;
    }

    if (
      dadosCliente.dataEncomenda <
      dataMinima
    ) {
      setErro(
        "A encomenda deve ser realizada com pelo menos um dia de antecedência."
      );

      return;
    }

    if (
      itensSelecionados.length ===
      0
    ) {
      setErro(
        "Selecione pelo menos um produto."
      );

      return;
    }

    try {
      setEnviando(true);

      /*
       * Guardamos essas informações
       * antes de limpar o formulário.
       */
      const resumoItens =
        itensSelecionados
          .map((item) => {
            const produto =
              produtos.find(
                (produto) =>
                  produto.id ===
                  item.produtoId
              );

            if (!produto) {
              return null;
            }

            return {
              nome:
                produto.nome,

              sabor:
                produto.sabor,

              quantidade:
                item.quantidade,

              subtotal:
                Number(
                  produto.preco
                ) *
                item.quantidade
            };
          })
          .filter(
            (
              item
            ): item is {
              nome: string;
              sabor: string;
              quantidade: number;
              subtotal: number;
            } =>
              item !== null
          );

      const resultado =
        await apiRequest(
          "/pedidos",
          {
            method: "POST",

            body:
              JSON.stringify({
                nome:
                  dadosCliente.nome,

                telefone:
                  dadosCliente.telefone,

                local:
                  dadosCliente.local,

                dataEncomenda:
                  dadosCliente
                    .dataEncomenda,

                itens:
                  itensSelecionados
              })
          }
        );

      setPedidoConfirmado({
        id:
          resultado.pedido.id,

        nomeCliente:
          dadosCliente.nome,

        dataEncomenda:
          dadosCliente
            .dataEncomenda,

        total,

        quantidade:
          totalUnidades,

        itens:
          resumoItens
      });

      setDadosCliente(
        dadosIniciais
      );

      setItens(
        (anteriores) =>
          anteriores.map(
            (item) => ({
              ...item,
              quantidade: 0
            })
          )
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao realizar pedido."
      );
    } finally {
      setEnviando(false);
    }
  }

  function novoPedido() {
    setPedidoConfirmado(
      null
    );

    setErro("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  /*
   * Depois da confirmação,
   * mostramos uma página própria.
   */
  if (pedidoConfirmado) {
    return (
      <main className="public-page">
        <PublicHeader />

        <section className="order-success-page">
          <div className="order-success-card">
            <div className="order-success-icon">
              <CheckCircle2
                size={34}
              />
            </div>

            <span className="order-success-overline">
              Encomenda registrada
            </span>

            <h1>
              Pedido confirmado!
            </h1>

            <p className="order-success-message">
              Obrigada,{" "}
              <strong>
                {
                  pedidoConfirmado.nomeCliente
                }
              </strong>
              . Seu pedido foi registrado
              com sucesso.
            </p>

            <div className="order-success-number">
              <span>
                Número do pedido
              </span>

              <strong>
                #
                {
                  pedidoConfirmado.id
                }
              </strong>
            </div>

            <div className="order-success-details">
              <div>
                <span>
                  Data da encomenda
                </span>

                <strong>
                  {formatarData(
                    pedidoConfirmado
                      .dataEncomenda
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Quantidade
                </span>

                <strong>
                  {
                    pedidoConfirmado
                      .quantidade
                  }{" "}
                  unidade(s)
                </strong>
              </div>

              <div>
                <span>
                  Total
                </span>

                <strong>
                  {formatarMoeda(
                    pedidoConfirmado
                      .total
                  )}
                </strong>
              </div>
            </div>

            <div className="order-success-items">
              <div className="order-success-items-heading">
                <h2>
                  Resumo da encomenda
                </h2>
              </div>

              {pedidoConfirmado.itens.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={
                      `${item.nome}-${index}`
                    }
                    className="order-success-item"
                  >
                    <div>
                      <strong>
                        {
                          item.nome
                        }
                      </strong>

                      <span>
                        {
                          item.sabor
                        }
                      </span>
                    </div>

                    <div className="order-success-item-values">
                      <span>
                        {
                          item.quantidade
                        }{" "}
                        un.
                      </span>

                      <strong>
                        {formatarMoeda(
                          item.subtotal
                        )}
                      </strong>
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="order-success-notice">
              <Clock3
                size={19}
              />

              <p>
                Guarde o número do pedido
                para facilitar a
                identificação da sua
                encomenda.
              </p>
            </div>

            <div className="order-success-actions">
              <button
                type="button"
                className="order-success-new"
                onClick={
                  novoPedido
                }
              >
                Fazer outra encomenda
              </button>

              <a
                href="/"
                className="order-success-home"
              >
                Voltar ao início
              </a>
            </div>
          </div>
        </section>

        <PublicFooter />
      </main>
    );
  }

  return (
    <main className="public-page">
      <PublicHeader />

      <section className="customer-page">
        <section className="customer-hero">
          <div className="customer-hero-text">
            <span>
              Faça sua encomenda
            </span>

            <h1>
              Escolha seus
              sanduíches favoritos.
            </h1>

            <p>
              Monte sua encomenda,
              escolha a quantidade
              de cada sabor e
              informe a data
              desejada.
            </p>
          </div>

          <div className="customer-hero-info">
            <CalendarDays
              size={24}
            />

            <div>
              <strong>
                Planeje sua encomenda
              </strong>

              <span>
                Escolha uma data a
                partir de amanhã.
              </span>
            </div>
          </div>
        </section>

        {erro && (
          <div className="customer-alert customer-alert-error">
            {erro}
          </div>
        )}

        <form
          onSubmit={
            confirmarPedido
          }
          className="customer-order-layout"
        >
          <div className="customer-main-column">
            <section className="customer-section">
              <div className="customer-section-heading">
                <span className="customer-step">
                  1
                </span>

                <div>
                  <h2>
                    Escolha os sabores
                  </h2>

                  <p>
                    Adicione a quantidade
                    desejada de cada
                    sanduíche.
                  </p>
                </div>
              </div>

              {carregando ? (
                <div className="customer-loading">
                  Carregando cardápio...
                </div>
              ) : produtos.length ===
                0 ? (
                <div className="customer-empty">
                  Nenhum produto
                  disponível no momento.
                </div>
              ) : (
                <div className="customer-menu-grid">
                  {produtos.map(
                    (produto) => {
                      const item =
                        itens.find(
                          (item) =>
                            item.produtoId ===
                            produto.id
                        );

                      const quantidade =
                        item?.quantidade ??
                        0;

                      return (
                        <article
                          key={
                            produto.id
                          }
                          className={`customer-product-card ${
                            quantidade > 0
                              ? "selected"
                              : ""
                          }`}
                        >
                          <div className="customer-product-content">
                            <span className="customer-product-flavor">
                              {
                                produto.sabor
                              }
                            </span>

                            <h3>
                              {
                                produto.nome
                              }
                            </h3>

                            <p>
                              {produto.descricao ||
                                "Sanduíche natural preparado sob encomenda."}
                            </p>
                          </div>

                          <div className="customer-product-bottom">
                            <strong className="customer-product-price">
                              {formatarMoeda(
                                Number(
                                  produto.preco
                                )
                              )}
                            </strong>

                            <div className="customer-quantity">
                              <button
                                type="button"
                                aria-label={`Diminuir quantidade de ${produto.nome}`}
                                disabled={
                                  quantidade ===
                                  0
                                }
                                onClick={() =>
                                  alterarQuantidade(
                                    produto.id,
                                    quantidade -
                                      1
                                  )
                                }
                              >
                                <Minus
                                  size={
                                    16
                                  }
                                />
                              </button>

                              <span>
                                {
                                  quantidade
                                }
                              </span>

                              <button
                                type="button"
                                aria-label={`Aumentar quantidade de ${produto.nome}`}
                                onClick={() =>
                                  alterarQuantidade(
                                    produto.id,
                                    quantidade +
                                      1
                                  )
                                }
                              >
                                <Plus
                                  size={
                                    16
                                  }
                                />
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    }
                  )}
                </div>
              )}
            </section>

            <section className="customer-section">
              <div className="customer-section-heading">
                <span className="customer-step">
                  2
                </span>

                <div>
                  <h2>
                    Seus dados
                  </h2>

                  <p>
                    Informe os dados
                    necessários para
                    identificarmos sua
                    encomenda.
                  </p>
                </div>
              </div>

              <div className="customer-form-grid">
                <div className="field">
                  <label htmlFor="clienteNome">
                    Nome *
                  </label>

                  <input
                    id="clienteNome"
                    type="text"
                    autoComplete="name"
                    value={
                      dadosCliente.nome
                    }
                    onChange={(event) =>
                      atualizarCliente(
                        "nome",
                        event.target
                          .value
                      )
                    }
                    placeholder="Seu nome"
                  />
                </div>

                <div className="field">
                  <label htmlFor="telefone">
                    Telefone *
                  </label>

                  <input
                    id="telefone"
                    type="tel"
                    autoComplete="tel"
                    value={
                      dadosCliente
                        .telefone
                    }
                    onChange={(event) =>
                      atualizarCliente(
                        "telefone",
                        event.target
                          .value
                      )
                    }
                    placeholder="(24) 99999-9999"
                  />
                </div>

                <div className="field">
                  <label htmlFor="local">
                    Local
                  </label>

                  <input
                    id="local"
                    type="text"
                    value={
                      dadosCliente.local
                    }
                    onChange={(event) =>
                      atualizarCliente(
                        "local",
                        event.target
                          .value
                      )
                    }
                    placeholder="Empresa, endereço ou referência"
                  />
                </div>

                <div className="field">
                  <label htmlFor="data">
                    Data da encomenda *
                  </label>

                  <input
                    id="data"
                    type="date"
                    min={dataMinima}
                    value={
                      dadosCliente
                        .dataEncomenda
                    }
                    onChange={(event) =>
                      atualizarCliente(
                        "dataEncomenda",
                        event.target
                          .value
                      )
                    }
                  />

                  <small className="customer-field-hint">
                    Escolha uma data a
                    partir de amanhã.
                  </small>
                </div>
              </div>
            </section>
          </div>

          <aside className="customer-summary">
            <div className="customer-summary-title">
              <div className="customer-summary-icon">
                <ShoppingBag
                  size={20}
                />
              </div>

              <div>
                <span>
                  Sua encomenda
                </span>

                <h2>
                  Resumo do pedido
                </h2>
              </div>
            </div>

            {itensSelecionados.length ===
            0 ? (
              <div className="customer-summary-empty">
                <p>
                  Seu pedido ainda
                  está vazio.
                </p>

                <span>
                  Escolha os
                  sanduíches para
                  começar.
                </span>
              </div>
            ) : (
              <div className="customer-summary-items">
                {itensSelecionados.map(
                  (item) => {
                    const produto =
                      produtos.find(
                        (produto) =>
                          produto.id ===
                          item.produtoId
                      );

                    if (!produto) {
                      return null;
                    }

                    const subtotal =
                      Number(
                        produto.preco
                      ) *
                      item.quantidade;

                    return (
                      <div
                        key={
                          item.produtoId
                        }
                        className="customer-summary-item"
                      >
                        <div>
                          <strong>
                            {
                              produto.sabor
                            }
                          </strong>

                          <span>
                            {
                              item.quantidade
                            }{" "}
                            ×{" "}
                            {formatarMoeda(
                              Number(
                                produto.preco
                              )
                            )}
                          </span>
                        </div>

                        <strong>
                          {formatarMoeda(
                            subtotal
                          )}
                        </strong>
                      </div>
                    );
                  }
                )}
              </div>
            )}

            <div className="customer-summary-divider" />

            <div className="customer-summary-units">
              <span>
                Quantidade
              </span>

              <strong>
                {totalUnidades}{" "}
                unidade(s)
              </strong>
            </div>

            <div className="customer-summary-total">
              <span>
                Total
              </span>

              <strong>
                {formatarMoeda(
                  total
                )}
              </strong>
            </div>

            <button
              type="submit"
              className="customer-confirm-button"
              disabled={
                enviando ||
                itensSelecionados
                  .length === 0
              }
            >
              {enviando
                ? "Confirmando..."
                : "Confirmar encomenda"}
            </button>

            <p className="customer-summary-note">
              Confira os produtos,
              quantidades e a data
              antes de confirmar.
            </p>
          </aside>
        </form>
      </section>

      <PublicFooter />
    </main>
  );
}