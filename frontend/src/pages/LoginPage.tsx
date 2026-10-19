import {
  useState
} from "react";

import type {
  FormEvent
} from "react";

import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail
} from "lucide-react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  apiRequest
} from "../services/api";

export default function LoginPage() {
  const navigate =
    useNavigate();

  const [email, setEmail] =
    useState("");

  const [senha, setSenha] =
    useState("");

  const [
    mostrarSenha,
    setMostrarSenha
  ] = useState(false);

  const [
    carregando,
    setCarregando
  ] = useState(false);

  const [erro, setErro] =
    useState("");

  async function entrar(
    event: FormEvent
  ) {
    event.preventDefault();

    setErro("");

    if (!email.trim()) {
      setErro(
        "Informe o e-mail."
      );

      return;
    }

    if (!senha.trim()) {
      setErro(
        "Informe a senha."
      );

      return;
    }

    try {
      setCarregando(true);

      const resultado =
        await apiRequest(
          "/auth/login",
          {
            method: "POST",

            body:
              JSON.stringify({
                email:
                  email.trim(),

                senha
              })
          }
        );

      localStorage.setItem(
        "dgc_admin_token",
        resultado.token
      );

      navigate(
        "/admin",
        {
          replace: true
        }
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível entrar."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand-side">
        <div className="login-brand-content">
          <div className="login-brand">
            <div className="login-brand-mark">
              DG
            </div>

            <div>
              <strong>
                Delícias com
                <br />
                Gosto do Céu
              </strong>

              <span>
                Gestão de encomendas
              </span>
            </div>
          </div>

          <div className="login-brand-message">
            <span>
              Área administrativa
            </span>

            <h1>
              Organize seus pedidos
              em um só lugar.
            </h1>

            <p>
              Consulte encomendas,
              organize a produção,
              mantenha o cardápio
              atualizado e acompanhe
              as vendas do negócio.
            </p>
          </div>

          <div className="login-brand-footer">
            <span>
              Delícias com Gosto do Céu
            </span>

            <span>
              Sistema de gestão
            </span>
          </div>
        </div>
      </section>

      <section className="login-form-side">
        <div className="login-form-container">
          <div className="login-mobile-brand">
            <div className="login-brand-mark">
              DG
            </div>

            <div>
              <strong>
                Delícias com
                Gosto do Céu
              </strong>

              <span>
                Área administrativa
              </span>
            </div>
          </div>

          <div className="login-heading">
            <span>
              Acesso restrito
            </span>

            <h2>
              Entrar
            </h2>

            <p>
              Informe seus dados para
              acessar o painel
              administrativo.
            </p>
          </div>

          {erro && (
            <div className="login-error">
              {erro}
            </div>
          )}

          <form
            className="login-form"
            onSubmit={entrar}
          >
            <div className="login-field">
              <label htmlFor="email">
                E-mail
              </label>

              <div className="login-input-wrapper">
                <Mail
                  size={19}
                />

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target
                        .value
                    )
                  }
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="senha">
                Senha
              </label>

              <div className="login-input-wrapper">
                <LockKeyhole
                  size={19}
                />

                <input
                  id="senha"
                  type={
                    mostrarSenha
                      ? "text"
                      : "password"
                  }
                  autoComplete="current-password"
                  value={senha}
                  onChange={(event) =>
                    setSenha(
                      event.target
                        .value
                    )
                  }
                  placeholder="Digite sua senha"
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() =>
                    setMostrarSenha(
                      (valor) =>
                        !valor
                    )
                  }
                  aria-label={
                    mostrarSenha
                      ? "Ocultar senha"
                      : "Mostrar senha"
                  }
                >
                  {mostrarSenha ? (
                    <EyeOff
                      size={18}
                    />
                  ) : (
                    <Eye
                      size={18}
                    />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={
                carregando
              }
            >
              {carregando
                ? "Entrando..."
                : "Entrar no sistema"}
            </button>
          </form>

          <div className="login-separator">
            <span>
              ou
            </span>
          </div>

          <Link
            to="/pedido"
            className="login-client-link"
          >
            Voltar para a área de
            encomendas
          </Link>

          <p className="login-access-note">
            Esta área é destinada
            somente à administração
            da Delícias com Gosto do Céu.
          </p>
        </div>
      </section>
    </main>
  );
}