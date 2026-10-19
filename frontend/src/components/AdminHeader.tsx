import {
  BarChart3,
  ChefHat,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Package,
  Sparkles
} from "lucide-react";

import {
  NavLink,
  useNavigate
} from "react-router-dom";

export default function AdminHeader() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem(
      "dgc_admin_token"
    );

    navigate(
      "/admin/login",
      {
        replace: true
      }
    );
  }

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <div className="admin-brand-mark">
          <span>DG</span>
        </div>

        <div className="admin-brand-text">
          <strong>
            Delícias com
            <br />
            Gosto do Céu
          </strong>

          <span>
            Painel de gestão
          </span>
        </div>
      </div>

      <div className="admin-sidebar-label">
        Navegação
      </div>

      <nav className="admin-sidebar-nav">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            isActive
              ? "admin-nav-item active"
              : "admin-nav-item"
          }
        >
          <LayoutDashboard size={19} />

          <span>
            Visão geral
          </span>
        </NavLink>

        <NavLink
          to="/admin/pedidos"
          className={({ isActive }) =>
            isActive
              ? "admin-nav-item active"
              : "admin-nav-item"
          }
        >
          <ClipboardList size={19} />

          <span>
            Pedidos
          </span>
        </NavLink>

        <NavLink
          to="/admin/producao"
          className={({ isActive }) =>
            isActive
              ? "admin-nav-item active"
              : "admin-nav-item"
          }
        >
          <ChefHat size={19} />

          <span>
            Produção
          </span>
        </NavLink>

        <NavLink
          to="/admin/vendas"
          className={({ isActive }) =>
            isActive
              ? "admin-nav-item active"
              : "admin-nav-item"
          }
        >
          <BarChart3 size={19} />

          <span>
            Vendas
          </span>
        </NavLink>

        <NavLink
          to="/admin/produtos"
          className={({ isActive }) =>
            isActive
              ? "admin-nav-item active"
              : "admin-nav-item"
          }
        >
          <Package size={19} />

          <span>
            Produtos
          </span>
        </NavLink>
      </nav>

      <div className="admin-sidebar-bottom">
        <div className="admin-user-card">
          <div className="admin-avatar">
            A
          </div>

          <div>
            <strong>
              Administradora
            </strong>

            <span>
              <Sparkles size={12} />
              Gestão
            </span>
          </div>
        </div>

        <button
          type="button"
          className="admin-logout"
          onClick={logout}
        >
          <LogOut size={18} />

          <span>
            Sair
          </span>
        </button>
      </div>
    </aside>
  );
}