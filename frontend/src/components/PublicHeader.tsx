import {
  Menu,
  ShoppingBag,
  X
} from "lucide-react";

import {
  useState
} from "react";

import {
  Link,
  NavLink
} from "react-router-dom";

export default function PublicHeader() {
  const [menuAberto, setMenuAberto] =
    useState(false);

  function fecharMenu() {
    setMenuAberto(false);
  }

  return (
    <header className="public-header">
      <div className="public-header-inner">
        <Link
          to="/"
          className="public-brand"
          onClick={fecharMenu}
        >
          <div className="public-brand-mark">
            DG
          </div>

          <div>
            <strong>
              Delícias com
              <br />
              Gosto do Céu
            </strong>

            <span>
              Sanduíches naturais
            </span>
          </div>
        </Link>

        <nav
          className={`public-nav ${
            menuAberto
              ? "open"
              : ""
          }`}
        >
          <NavLink
            to="/"
            end
            onClick={fecharMenu}
          >
            Início
          </NavLink>

          <NavLink
            to="/pedido"
            onClick={fecharMenu}
          >
            Fazer encomenda
          </NavLink>

          <Link
            to="/admin/login"
            className="public-admin-link"
            onClick={fecharMenu}
          >
            Área administrativa
          </Link>
        </nav>

        <div className="public-header-actions">
          <Link
            to="/pedido"
            className="public-order-button"
          >
            <ShoppingBag
              size={17}
            />

            Encomendar
          </Link>

          <button
            type="button"
            className="public-menu-button"
            onClick={() =>
              setMenuAberto(
                (valor) =>
                  !valor
              )
            }
            aria-label="Abrir menu"
          >
            {menuAberto ? (
              <X size={23} />
            ) : (
              <Menu size={23} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}