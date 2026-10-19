import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  ShoppingBag
} from "lucide-react";

import {
  Link
} from "react-router-dom";

import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";

export default function HomePage() {
  return (
    <main className="public-page">
      <PublicHeader />

      <section className="home-hero">
        <div className="home-hero-content">
          <span className="home-overline">
            Sanduíches naturais por encomenda
          </span>

          <h1>
            Sabor feito com cuidado para a sua encomenda.
          </h1>

          <p>
            Escolha seus sanduíches, informe a quantidade e
            agende sua encomenda de forma simples.
          </p>

          <div className="home-hero-actions">
            <Link
              to="/pedido"
              className="home-primary-button"
            >
              Fazer encomenda

              <ArrowRight size={18} />
            </Link>

            <a
              href="#como-funciona"
              className="home-secondary-link"
            >
              Como funciona
            </a>
          </div>

          <div className="home-hero-note">
            <Clock3 size={17} />

            <span>
              Pedidos devem ser feitos com pelo menos um dia
              de antecedência.
            </span>
          </div>
        </div>

        <div className="home-hero-card">
          <div className="home-hero-card-top">
            <ShoppingBag size={22} />

            <span>
              Sua encomenda
            </span>
          </div>

          <h2>
            Escolha os sabores que você mais gosta.
          </h2>

          <p>
            Veja os produtos disponíveis, escolha as
            quantidades e finalize seu pedido pelo próprio
            site.
          </p>

          <div className="home-example-order">
            <div>
              <span>
                Frango
              </span>

              <strong>
                Sanduíche natural
              </strong>
            </div>

            <span>
              2 un.
            </span>
          </div>

          <div className="home-example-order">
            <div>
              <span>
                Atum
              </span>

              <strong>
                Sanduíche natural
              </strong>
            </div>

            <span>
              1 un.
            </span>
          </div>

          <Link
            to="/pedido"
            className="home-card-link"
          >
            Ver cardápio

            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="home-intro">
        <div>
          <span>
            Delícias com Gosto do Céu
          </span>

          <h2>
            Encomendar ficou mais simples.
          </h2>
        </div>

        <p>
          O pedido é registrado diretamente no sistema,
          ajudando a organizar as encomendas e a produção de
          cada dia.
        </p>
      </section>

      <section
        id="como-funciona"
        className="home-how"
      >
        <div className="home-section-heading">
          <span>
            Como funciona
          </span>

          <h2>
            Faça seu pedido em poucos passos.
          </h2>
        </div>

        <div className="home-steps">
          <article className="home-step">
            <span className="home-step-number">
              01
            </span>

            <ShoppingBag size={24} />

            <h3>
              Escolha
            </h3>

            <p>
              Veja os sanduíches disponíveis e escolha a
              quantidade de cada sabor.
            </p>
          </article>

          <article className="home-step">
            <span className="home-step-number">
              02
            </span>

            <CalendarDays size={24} />

            <h3>
              Agende
            </h3>

            <p>
              Informe seus dados e escolha a data da
              encomenda.
            </p>
          </article>

          <article className="home-step">
            <span className="home-step-number">
              03
            </span>

            <Check size={24} />

            <h3>
              Confirme
            </h3>

            <p>
              Confira o resumo e confirme o pedido. Ele será
              registrado automaticamente.
            </p>
          </article>
        </div>
      </section>

      <section className="home-order-section">
        <div>
          <span>
            Faça sua encomenda
          </span>

          <h2>
            Já sabe o que quer pedir?
          </h2>

          <p>
            Acesse o cardápio, escolha seus produtos e
            finalize sua encomenda.
          </p>
        </div>

        <Link
          to="/pedido"
          className="home-primary-button"
        >
          Ver cardápio

          <ArrowRight size={18} />
        </Link>
      </section>

      <PublicFooter />
    </main>
  );
}