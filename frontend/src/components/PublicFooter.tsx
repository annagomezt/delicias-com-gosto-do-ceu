import {
  Link
} from "react-router-dom";

export default function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="public-footer-brand">
        <div className="public-brand-mark">
          DG
        </div>

        <div>
          <strong>
            Delícias com Gosto do Céu
          </strong>

          <span>
            Sanduíches naturais por encomenda.
          </span>
        </div>
      </div>

      <div className="public-footer-links">
        <Link to="/">
          Início
        </Link>

        <Link to="/pedido">
          Fazer encomenda
        </Link>

        <Link to="/admin/login">
          Administração
        </Link>
      </div>
    </footer>
  );
}