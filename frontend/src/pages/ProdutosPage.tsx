import {
  useEffect,
  useState
} from "react";

import type {
  FormEvent
} from "react";

import {
  Eye,
  EyeOff,
  PackagePlus,
  Pencil
} from "lucide-react";

import AdminHeader from "../components/AdminHeader";
import { apiRequest } from "../services/api";

import type {
  Produto,
  ProdutoForm,
  Sabor
} from "../types";

const formularioInicial: ProdutoForm = {
  nome: "",
  descricao: "",
  preco: "",
  saborId: "",
  disponivel: true
};

export default function ProdutosPage() {
  const [produtos, setProdutos] =
    useState<Produto[]>([]);

  const [sabores, setSabores] =
    useState<Sabor[]>([]);

  const [form, setForm] =
    useState<ProdutoForm>(
      formularioInicial
    );

  const [
    produtoEditando,
    setProdutoEditando
  ] = useState<number | null>(
    null
  );

  const [
    carregando,
    setCarregando
  ] = useState(true);

  const [
    salvando,
    setSalvando
  ] = useState(false);

  const [erro, setErro] =
    useState("");

  const [sucesso, setSucesso] =
    useState("");

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");

      const [
        produtosData,
        saboresData
      ] = await Promise.all([
        apiRequest("/produtos"),
        apiRequest("/sabores")
      ]);

      setProdutos(
        produtosData
      );

      setSabores(
        saboresData
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao carregar os dados."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarDados();
  }, []);

  function atualizarCampo(
    campo: keyof ProdutoForm,
    valor: string | boolean
  ) {
    setForm(
      (anterior) => ({
        ...anterior,
        [campo]: valor
      })
    );
  }

  function limparFormulario() {
    setForm(
      formularioInicial
    );

    setProdutoEditando(
      null
    );

    setErro("");
  }

  function editarProduto(
    produto: Produto
  ) {
    setProdutoEditando(
      produto.id
    );

    setForm({
      nome:
        produto.nome,

      descricao:
        produto.descricao || "",

      preco:
        produto.preco,

      saborId:
        String(
          produto.sabor_id
        ),

      disponivel:
        produto.disponivel
    });

    setErro("");
    setSucesso("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  async function salvarProduto(
    event: FormEvent
  ) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    if (
      !form.nome.trim()
    ) {
      setErro(
        "Informe o nome do produto."
      );

      return;
    }

    if (
      !form.preco ||
      Number(form.preco) < 0
    ) {
      setErro(
        "Informe um preço válido."
      );

      return;
    }

    if (
      !form.saborId
    ) {
      setErro(
        "Selecione um sabor."
      );

      return;
    }

    try {
      setSalvando(true);

      const body = {
        nome:
          form.nome.trim(),

        descricao:
          form.descricao.trim(),

        preco:
          Number(
            form.preco
          ),

        saborId:
          Number(
            form.saborId
          ),

        disponivel:
          form.disponivel
      };

      if (
        produtoEditando
      ) {
        await apiRequest(
          `/produtos/${produtoEditando}`,
          {
            method: "PUT",

            body:
              JSON.stringify(
                body
              )
          }
        );

        setSucesso(
          "Produto atualizado com sucesso."
        );
      } else {
        await apiRequest(
          "/produtos",
          {
            method: "POST",

            body:
              JSON.stringify(
                body
              )
          }
        );

        setSucesso(
          "Produto cadastrado com sucesso."
        );
      }

      limparFormulario();

      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao salvar produto."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function alterarDisponibilidade(
    produto: Produto
  ) {
    try {
      setErro("");
      setSucesso("");

      await apiRequest(
        `/produtos/${produto.id}/disponibilidade`,
        {
          method: "PATCH",

          body:
            JSON.stringify({
              disponivel:
                !produto.disponivel
            })
        }
      );

      setSucesso(
        produto.disponivel
          ? "Produto marcado como indisponível."
          : "Produto disponibilizado com sucesso."
      );

      await carregarDados();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao alterar disponibilidade."
      );
    }
  }

  function formatarMoeda(
    valor: string | number
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

  const produtosAtivos =
    produtos.filter(
      (produto) =>
        produto.disponivel
    ).length;

  return (
    <main className="page admin-page">
      <AdminHeader />

      <div className="admin-content">
        <header className="products-page-heading">
          <span className="products-overline">
            Cardápio
          </span>

          <h1>
            Produtos
          </h1>

          <p>
            Cadastre os sanduíches,
            atualize preços e controle
            quais produtos estão
            disponíveis para novos
            pedidos.
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

        <section className="products-stats">
          <div>
            <span>
              Cadastrados
            </span>

            <strong>
              {produtos.length}
            </strong>

            <small>
              produtos no sistema
            </small>
          </div>

          <div>
            <span>
              Disponíveis
            </span>

            <strong>
              {produtosAtivos}
            </strong>

            <small>
              aparecem no cardápio
            </small>
          </div>

          <div>
            <span>
              Indisponíveis
            </span>

            <strong>
              {produtos.length -
                produtosAtivos}
            </strong>

            <small>
              ocultos para novos pedidos
            </small>
          </div>
        </section>

        <div className="products-admin-layout">
          <section className="product-form-panel">
            <div className="product-form-heading">
              <div className="product-form-icon">
                {produtoEditando ? (
                  <Pencil
                    size={20}
                  />
                ) : (
                  <PackagePlus
                    size={20}
                  />
                )}
              </div>

              <div>
                <span>
                  {produtoEditando
                    ? "Edição"
                    : "Cadastro"}
                </span>

                <h2>
                  {produtoEditando
                    ? "Editar produto"
                    : "Novo produto"}
                </h2>

                <p>
                  {produtoEditando
                    ? "Atualize as informações do produto selecionado."
                    : "Preencha as informações para adicionar um item ao cardápio."}
                </p>
              </div>
            </div>

            <form
              className="products-form"
              onSubmit={
                salvarProduto
              }
            >
              <div className="field">
                <label htmlFor="nome">
                  Nome do produto *
                </label>

                <input
                  id="nome"
                  type="text"
                  value={
                    form.nome
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "nome",
                      event.target
                        .value
                    )
                  }
                  placeholder="Ex.: Sanduíche Natural de Frango"
                />
              </div>

              <div className="products-form-row">
                <div className="field">
                  <label htmlFor="sabor">
                    Sabor *
                  </label>

                  <select
                    id="sabor"
                    value={
                      form.saborId
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "saborId",
                        event.target
                          .value
                      )
                    }
                  >
                    <option value="">
                      Selecione um sabor
                    </option>

                    {sabores.map(
                      (sabor) => (
                        <option
                          key={
                            sabor.id
                          }
                          value={
                            sabor.id
                          }
                        >
                          {
                            sabor.nome
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="preco">
                    Preço *
                  </label>

                  <input
                    id="preco"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.preco
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "preco",
                        event.target
                          .value
                      )
                    }
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="descricao">
                  Descrição
                </label>

                <textarea
                  id="descricao"
                  rows={4}
                  value={
                    form.descricao
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "descricao",
                      event.target
                        .value
                    )
                  }
                  placeholder="Ex.: Sanduíche natural com recheio de frango..."
                />
              </div>

              <label className="product-availability-check">
                <input
                  type="checkbox"
                  checked={
                    form.disponivel
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "disponivel",
                      event.target
                        .checked
                    )
                  }
                />

                <div>
                  <strong>
                    Produto disponível
                  </strong>

                  <span>
                    Quando marcado, o
                    produto aparece no
                    cardápio de encomendas.
                  </span>
                </div>
              </label>

              <div className="product-form-actions">
                {produtoEditando && (
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={
                      limparFormulario
                    }
                  >
                    Cancelar edição
                  </button>
                )}

                <button
                  type="submit"
                  className="button-primary"
                  disabled={
                    salvando
                  }
                >
                  {salvando
                    ? "Salvando..."
                    : produtoEditando
                      ? "Salvar alterações"
                      : "Cadastrar produto"}
                </button>
              </div>
            </form>
          </section>

          <section className="products-list-panel">
            <div className="products-list-heading">
              <div>
                <span>
                  Cardápio atual
                </span>

                <h2>
                  Produtos cadastrados
                </h2>

                <p>
                  Produtos registrados
                  no sistema e seu status
                  atual.
                </p>
              </div>

              <strong>
                {produtos.length}
              </strong>
            </div>

            {carregando ? (
              <div className="customer-loading">
                Carregando produtos...
              </div>
            ) : produtos.length ===
              0 ? (
              <div className="customer-empty">
                Nenhum produto cadastrado.
              </div>
            ) : (
              <div className="products-list">
                {produtos.map(
                  (produto) => (
                    <article
                      key={
                        produto.id
                      }
                      className={`admin-product-item ${
                        produto.disponivel
                          ? ""
                          : "unavailable"
                      }`}
                    >
                      <div className="admin-product-main">
                        <div className="admin-product-flavor">
                          {
                            produto.sabor
                          }
                        </div>

                        <div>
                          <h3>
                            {
                              produto.nome
                            }
                          </h3>

                          <p>
                            {produto.descricao ||
                              "Sem descrição cadastrada."}
                          </p>

                          <div className="admin-product-meta">
                            <strong>
                              {formatarMoeda(
                                produto.preco
                              )}
                            </strong>

                            <span
                              className={
                                produto.disponivel
                                  ? "product-availability available"
                                  : "product-availability unavailable"
                              }
                            >
                              {produto.disponivel
                                ? "Disponível"
                                : "Indisponível"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="admin-product-actions">
                        <button
                          type="button"
                          className="product-action-button"
                          onClick={() =>
                            editarProduto(
                              produto
                            )
                          }
                        >
                          <Pencil
                            size={17}
                          />

                          Editar
                        </button>

                        <button
                          type="button"
                          className="product-action-button"
                          onClick={() =>
                            alterarDisponibilidade(
                              produto
                            )
                          }
                        >
                          {produto.disponivel ? (
                            <EyeOff
                              size={17}
                            />
                          ) : (
                            <Eye
                              size={17}
                            />
                          )}

                          {produto.disponivel
                            ? "Indisponibilizar"
                            : "Disponibilizar"}
                        </button>
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}